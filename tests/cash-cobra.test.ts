import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { runClientCalculation } from '../src/lib/calculate-client';
import { guides } from '../src/lib/guides';
import { comparisonGuides } from '../src/lib/comparison-guides';
import { sharedInputs } from '../src/lib/sharing';
import { calculatorPresetHref } from '../src/lib/preset-links';
import reference from '../docs/financial-clone/evidence/cash-cobra-reference-20261118.json';
import type { Result } from '../src/lib/types';

const run = (id:string,mode:string,patch:Record<string,string|number|undefined>={}) => {
 const c=calculators.find(c=>c.id===id)!;
 return runCalculation(id,mode,{...defaults(c.modes.find(m=>m.id===mode)!),...Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))});
};
const get=(r:Result,label:string)=>{const m=r.metrics.find(x=>x.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<=Math.max(1e-8,Math.abs(b)*1e-12),`${a} != ${b}`);
for(const f of reference.fixtures)test('Independent cash/COBRA arithmetic: '+f.key,()=>{
 const result=run(f.id,f.mode,f.values);
 for(const [label,expected]of Object.entries(f.expected))close(get(result,label),Number(expected));
});

test('Cash model counts fees once and separates ending card balance from upfront costs',()=>{
 const separate=run('cash-advance-fee','cost');
 const financed=run('cash-advance-fee','cost',{fee_treatment:'Finance fees'});
 close(get(separate,'Total cash needed including repayment')-get(separate,'Ending card balance before repayment'),53);
 close(get(financed,'Total cash needed including repayment'),get(financed,'Ending card balance before repayment'));
 for(const result of [separate,financed])close(get(result,'Total modeled cost'),get(result,'Total fees')+get(result,'Estimated interest'));
 assert.ok(get(financed,'Estimated interest')>get(separate,'Estimated interest'));
 const zero=run('cash-advance-fee','cost',{days:0});
 assert.match(zero.metrics.find(m=>m.label==='Simple annualized cost / cash received')!.displayValue!,/Undefined/);
 assert.ok(zero.notes!.some(n=>n.includes('not an installment')));
});

test('Cash comparison changes time only and reproduces selected repayment',()=>{
 const result=run('cash-advance-fee','cost',{days:53,interest_method:'Daily compound'});
 let prior=-1;
 for(const row of result.rows!){assert.equal(row[1],53);assert.ok(Number(row[2])>=prior);prior=Number(row[2]);close(Number(row[3]),53+Number(row[2]));}
 const selected=result.rows!.find(r=>r[0]===53)!;
 close(Number(selected[3]),get(result,'Total modeled cost'));
});

test('Cash rejects invalid days, rates, selections and missing numeric values',()=>{
 for(const patch of [{amount:0},{amount:-1},{fee_rate:101},{apr:-1},{days:1.5},{days:3651},{atm_fee:-1},{amount:''},{amount:'NaN'},{day_basis:'366'},{interest_method:'Unknown'},{fee_treatment:'Unknown'}])assert.throws(()=>run('cash-advance-fee','cost',patch));
});

test('COBRA modes match and cumulative rows reconcile without implying coverage eligibility',()=>{
 const a=run('cobra-cost','contributions'),b=run('cobra-cost','premium');
 assert.deepEqual(a,b);
 assert.equal(get(a,'Estimated monthly amount you pay'),816);
 assert.equal(a.rows!.length,6);
 for(const [index,row]of a.rows!.entries()){assert.equal(row[3],816);assert.equal(row[4],816*(index+1));assert.equal(row[5],616*(index+1));}
 assert.ok(a.notes!.some(n=>n.includes('not a promise')));
 assert.ok(a.notes!.some(n=>n.includes('150%')));
 assert.equal(get(run('cobra-cost','premium',{monthly_subsidy:816}),'Estimated monthly amount you pay'),0);
 assert.ok(get(run('cobra-cost','premium',{monthly_subsidy:700}),'Monthly change from previous employee payment')<0);
});

test('COBRA ordinary-rule worksheet stops for inconsistent premium inputs and excluded fee rates',()=>{
 for(const patch of [{employee_share:0,employer_share:0},{admin_rate:2.01},{monthly_subsidy:817},{months:0},{months:37},{months:2.5},{employee_share:''}])assert.throws(()=>run('cobra-cost','contributions',patch));
 assert.throws(()=>run('cobra-cost','premium',{previous_payment:801}));
 assert.throws(()=>run('cobra-cost','premium',{total_premium:0}));
});

for(const id of ['cash-advance-fee','cobra-cost']) {
 const c=calculators.find(c=>c.id===id)!;
 for(const mode of c.modes)test('Lazy client preserves '+id+'/'+mode.id,async()=>assert.deepEqual(await runClientCalculation(id,c.category,mode.id,defaults(mode)),run(id,mode.id)));
 test('Public examples and article presets restore complete checked inputs: '+id,()=>{
  const examples=guides[id].examples;
  assert.equal(examples.length,4);
  for(const e of examples){
   const keys=c.modes.find(m=>m.id===e.mode)!.fields.map(f=>f.key).sort();
   assert.deepEqual(Object.keys(e.values).sort(),keys);
   const url=new URL(calculatorPresetHref('/'+id+'-calculator',e.mode,e.values),'https://www.calculatorfree.io');
   const restored=sharedInputs(c,'',url.hash)!;
   assert.equal(restored.mode.id,e.mode);assert.deepEqual(restored.values,e.values);
   close(get(run(id,e.mode,e.values),e.expected.label),e.expected.value);
  }
  assert.equal(comparisonGuides[id].presets.length,4);
 });
}
