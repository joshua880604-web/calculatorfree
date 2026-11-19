import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {guides} from '../src/lib/guides';
import {sharedInputs} from '../src/lib/sharing';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {practicalGuideList} from '../src/lib/practical-guides';
import reference from '../docs/financial-clone/evidence/repayment-content-reference-20261119.json';
import content from '../src/lib/repayment-comparison-content.json';
import examples from '../src/lib/repayment-expanded-examples.json';

const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<=1e-6,`${a} != ${b}`);
for(const row of reference.cases)test('Independent repayment example '+row.key,()=>{
 const result=runCalculation(row.calculatorId,row.mode,row.values as unknown as Record<string,string>);
 for(const [label,expected]of Object.entries(row.expected)){
  if(expected===undefined)continue;
  const metric=result.metrics.find(m=>m.label===label);assert.ok(metric,label);near(metric.value,Number(expected));
 }
 const schedule=result.rows!.map(r=>row.calculatorId==='amortization'?[r[0],...r.slice(2)]:r);
 for(const expected of row.selectedScheduleRows){
  const actual=schedule[Number(expected[0])-1];assert.ok(actual);
  for(let i=0;i<expected.length;i++)near(Number(actual[i]),Number(expected[i]));
 }
 near(Number(schedule.at(-1)!.at(-1)),0);
 near(row.totalPaid,Number(row.values.principal)+row.interest);
});

test('Monthly extras and annual extras keep the same original loan and different stated timing',()=>{
 const base=reference.cases.find(r=>r.key==='loan-base')!,monthly=reference.cases.find(r=>r.key==='loan-monthly')!,yearly=reference.cases.find(r=>r.key==='loan-yearly')!;
 assert.equal(monthly.values.extra_monthly,'100');assert.equal(yearly.values.extra_yearly,'1200');assert.equal(yearly.values.extra_yearly_start,'12');
 for(const row of [monthly,yearly])for(const key of ['principal','rate','years','months']as const)assert.equal(row.values[key],base.values[key]);
 assert.equal(base.months,120);assert.equal(monthly.months,107);assert.equal(yearly.months,108);assert.ok(monthly.interest<yearly.interest);
});

test('A fixed extra above the minimum is not mislabeled as a fixed total payment',()=>{
 const extra=reference.cases.find(r=>r.key==='card-extra50')!,fixed=reference.cases.find(r=>r.key==='card-fixed250')!;
 assert.equal(extra.values.extra,'50');assert.equal(fixed.values.payment,'250');assert.equal(extra.firstPayment,fixed.firstPayment);
 assert.equal(extra.months,53);assert.equal(fixed.months,26);assert.ok(extra.interest>fixed.interest);
 assert.equal(extra.calculatorId,'credit-card-minimum-payment');assert.equal(fixed.calculatorId,'credit-card');
 assert.ok(content['credit-card-minimum-payment'].notes.some(n=>n.includes('not an equal-lifetime-budget')));
});

test('All comparison rows restore complete validated inputs and expose reproducible CSV assumptions',()=>{
 for(const [id,table]of Object.entries(content)){
  assert.equal(table.rows.length,4);const keys=new Set();
  const csv=readFileSync(new URL('../public'+table.csvPath,import.meta.url),'utf8');
  for(const row of table.rows){
   assert.ok(!keys.has(row.key));keys.add(row.key);
   const tool=calculators.find(c=>c.id===row.calculatorId)!;const mode=tool.modes.find(m=>m.id===row.mode)!;
   const values=row.values as unknown as Record<string,string>;assert.deepEqual(Object.keys(values).sort(),Object.keys(defaults(mode)).sort());
   const url=new URL(calculatorPresetHref(row.path,row.mode,values),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',url.hash)!;
   assert.equal(restored.mode.id,row.mode);assert.deepEqual(restored.values,values);assert.ok(csv.includes(row.label));assert.ok(csv.includes('#calc=share_version=1'));
   assert.ok(reference.cases.some(c=>c.key===row.key));
  }
  for(const e of examples[id as keyof typeof examples]){
   const actual=runCalculation(id,e.mode,e.values as unknown as Record<string,string>);near(actual.metrics.find(m=>m.label===e.expected.label)!.value,e.expected.value);
   assert.ok(guides[id].examples.some(x=>x.title===e.title));
  }
  assert.equal(practicalGuideList.find(g=>g.path===table.guidePath)!.updatedOn,'2026-11-19');
 }
});
