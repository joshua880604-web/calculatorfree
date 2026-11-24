import test from 'node:test';
import disclaimers from '../src/lib/calculator-disclaimers.json';
import {readFileSync} from 'node:fs';
import {resultExportData} from '../src/lib/result-export';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import reference from '../docs/financial-clone/evidence/expansion-four-reference-20261124.json';
import type {Result} from '../src/lib/types';
const ids=['ebitda','invoice-factoring','average-daily-balance','construction-loan'];
function run(id:string,mode:string,patch:Record<string,unknown>={}){const c=calculators.find(c=>c.id===id)!;const m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});}
const get=(r:Result,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<Math.max(1e-7,Math.abs(b)*1e-12),`${a} != ${b}`);
for(const f of reference.fixtures)test('Original four-tool independent reference: '+f.key,()=>{const r=run(f.id,f.mode,f.values);for(const [label,value]of Object.entries(f.expected))close(get(r,label),Number(value));});
for(const id of ids){
 const c=calculators.find(c=>c.id===id)!;
 for(const m of c.modes)test('Original four-tool lazy client: '+id+'/'+m.id,async()=>assert.deepEqual(await runClientCalculation(id,c.category,m.id,defaults(m)),run(id,m.id)));
 test('Original four-tool task ownership and complete preset inputs: '+id,()=>{
  assert.ok(calculatorCategory(id));assert.equal((disclaimers as Record<string,string>)[id],guides[id].scope);assert.ok(readFileSync(new URL('../public/data/comparison-guides/'+id+'.csv',import.meta.url),'utf8').includes('Expected value'));assert.ok(guides[id].examples.length>=3);
  for(const example of guides[id].examples){const m=c.modes.find(m=>m.id===example.mode)!;assert.deepEqual(Object.keys(example.values).sort(),m.fields.map(f=>f.key).sort());close(get(run(id,m.id,example.values),example.expected.label),example.expected.value);}
  for(const p of comparisonGuides[id].presets){assert.ok(c.modes.some(m=>m.id===p.mode));assert.ok(p.path.includes(id));}
  for(const linked of relatedCalculatorIds[id])assert.ok(relatedCalculatorIds[linked].includes(id));
 });
}
test('EBITDA preserves losses, benefits and nonpositive revenue boundary',()=>{
 for(const revenue of [0,-1])assert.match(run('ebitda','net-income',{revenue}).metrics[1].displayValue!,/Not meaningful/);
 close(get(run('ebitda','operating-income',{operating_income:105000,other_income:5000}),'EBITDA'),140000);
 for(const p of [{net_income:''},{depreciation:-1},{amortization:'Infinity'},{revenue:1e13}])assert.throws(()=>run('ebitda','net-income',p));
});
test('Factoring cash conservation across reserve shortfalls and fee bases',()=>{
 for(const rate of [0,80,99,100])for(const fee_base of ['Invoice face value','Advance amount'])for(const billing of ['Prorated periods','Started periods']){
  const r=run('invoice-factoring','fees',{advance_rate:rate,fee_base,billing});close(get(r,'Advance received today')+get(r,'Signed settlement after fees'),get(r,'Total net proceeds'));close(get(r,'Total net proceeds')+get(r,'Total fees'),10000);
 }
 for(const p of [{invoice:0},{advance_rate:101},{fee_rate:-1},{days:1.5},{interval:0},{days:3661},{billing:'Unknown'},{fee_base:'Unknown'}])assert.throws(()=>run('invoice-factoring','fees',p));
});
test('ADB date and segment coverage, order independence and signed credits',()=>{
 assert.deepEqual(run('average-daily-balance','ledger'),run('average-daily-balance','ledger',{transactions:'2026-11-20, -300\n2026-11-10, 200'}));
 const r=run('average-daily-balance','ledger');close(r.rows!.reduce((s,row)=>s+Number(row[4]),0),get(r,'Balance-days total'));assert.equal(r.rows!.reduce((s,row)=>s+Number(row[2]),0),30);
 for(const p of [{start:'2026-02-30'},{end:'2026-10-31'},{transactions:'2026-12-01, 1'},{transactions:'2026-11-01, NaN'},{transactions:'2026-11-01, 1,000'},{transactions:'2026-11-01, 1\n'.repeat(501)},{day_basis:'366'}])assert.throws(()=>run('average-daily-balance','ledger',p));
 for(const segments of ['500, 29','500, 31','500, 30.5','500, -30','500, 0',''])assert.throws(()=>run('average-daily-balance','segments',{segments}));
});
test('Construction draw ceilings, inclusive days and paid interest conservation',()=>{
 const r=run('construction-loan','draws');close(r.rows!.reduce((s,row)=>s+Number(row[4]),0),get(r,'Total construction interest'));close(get(r,'Ending drawn principal')+get(r,'Undrawn commitment'),200000);assert.equal(r.rows!.reduce((s,row)=>s+Number(row[2]),0),30);
 close(get(run('construction-loan','draws',{commitment:100000}),'Total construction interest'),get(r,'Total construction interest'));
 for(const p of [{commitment:99999},{opening:200001},{draws:'2026-11-01, -1'},{draws:'2026-12-01, 1'},{draws:'2026-11-01, 100001\n2026-11-01, 100000'},{end:'2026-10-31'},{start:'2026-02-30'},{apr:-1},{fees:-1}])assert.throws(()=>run('construction-loan','draws',p));
});

for(const id of ids)test('Original four-tool exports retain limits and metric contracts: '+id,async()=>{
 const c=calculators.find(c=>c.id===id)!;for(const m of c.modes){const v=defaults(m),r=run(id,m.id),data=await resultExportData(id,m,v,r);assert.equal(data.scope,guides[id].scope);assert.ok(data.notes.length>=3);assert.ok(data.copy.interpretation);assert.doesNotMatch(data.copy.interpretation!,/null|undefined|NaN|Infinity/);}
});
