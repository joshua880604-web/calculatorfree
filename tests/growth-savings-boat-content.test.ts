import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators, defaults, routeFor, runCalculation} from '../src/lib/calculators';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs} from '../src/lib/sharing';
import {searchTasks} from '../src/lib/keyword-targets';
import {calculationGuideEntries} from '../src/lib/calculation-guides';
import {guideContentDate} from '../src/lib/editorial-guides';
import cases from '../src/lib/calculation-guide-cases.json';
import tasks from '../src/lib/focused-calculation-tasks.json';
import reference from '../docs/financial-clone/evidence/growth-savings-boat-reference-20261119.json';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);

test('Updated guide metrics and complete inputs match the standalone Decimal reference',()=>{
 for(const row of reference.cases){
  if(row.topic==='conversion'){
   const result=runCalculation(row.calculatorId,row.mode,Object.fromEntries(Object.entries(row.values).map(([k,v])=>[k,String(v)])));
   for(const [label,value]of Object.entries(row.expected))near(result.metrics.find(m=>m.label===label)!.value,Number(value));
  }else{
   const table=cases[row.topic as 'compound'|'boat'|'savinggoal'];const publicCase=table.find(c=>c.label===row.label)!;
   assert.ok(publicCase);assert.deepEqual(publicCase.values,row.values);
   for(const [label,value]of Object.entries(row.expected))near((publicCase.metrics as Record<string,number>)[label],Number(value));
  }
 }
});

test('Daily compounding preserves monthly deposits and separates nominal rates from equal yield',()=>{
 const base=cases.compound[1],daily=cases.compound[4],equalYield=cases.compound[5],inflation=cases.compound[6];
 assert.equal(base.values.compound,'Monthly');assert.equal(daily.values.compound,'Daily');assert.equal(daily.values.monthly,base.values.monthly);
 assert.equal(daily.values.rate,base.values.rate);assert.ok(daily.metrics['Ending balance']>base.metrics['Ending balance']);
 assert.ok(Number(equalYield.values.rate)<Number(base.values.rate));near(equalYield.metrics['Ending balance'],base.metrics['Ending balance']);
 near(inflation.metrics['Ending balance'],base.metrics['Ending balance']);assert.ok(inflation.metrics['Inflation-adjusted balance']<base.metrics['Ending balance']);
});

test('A larger down payment increases upfront cash and reduces principal under the same purchase and rate',()=>{
 const base=cases.boat[0],larger=cases.boat[5];
 for(const k of ['price','rate','years','tax','fees','finance']as const)assert.equal(larger.values[k],base.values[k]);
 near(larger.metrics['Upfront cash']-base.metrics['Upfront cash'],10000);
 near((base.metrics['Total payments']-base.metrics['Total interest'])-(larger.metrics['Total payments']-larger.metrics['Total interest']),10000);
 assert.ok(larger.metrics['Total interest']<base.metrics['Total interest']);
});

test('Savings comparisons distinguish a fixed deadline from a fixed monthly budget',()=>{
 const five=cases.savinggoal[1],three=cases.savinggoal[6],monthly300=cases.savinggoal[4],monthly400=cases.savinggoal[7];
 assert.equal(five.mode,'goal-contribution');assert.equal(three.values.years,'3');
 assert.ok(three.metrics['Required monthly deposit']!>five.metrics['Required monthly deposit']!);
 assert.equal(monthly400.mode,'goal-time');assert.equal(monthly400.values.monthly,'400');assert.equal(monthly300.values.monthly,'300');
 assert.ok(monthly400.metrics['Months to savings goal']!<monthly300.metrics['Months to savings goal']!);
 const current=monthly400.metrics['Months to savings goal']!;const tool=calculators.find(c=>c.id==='savings')!;const mode=tool.modes.find(m=>m.id==='accumulation')!;
 const v={...defaults(mode),...monthly400.values,years:'0',months:String(current-1)};
 assert.ok(runCalculation('savings','accumulation',v).metrics.find(m=>m.label==='Ending balance')!.value<20000);
});

test('All nine task links restore every input, the intended mode and the promised frequency',()=>{
 let count=0;
 for(const [id,entries]of Object.entries(tasks)){
  assert.deepEqual(searchTasks[id],entries);
  for(const entry of entries){
   const tool=calculators.find(c=>c.id===id)!;const mode=tool.modes.find(m=>m.id===entry.mode)!;
   const values=Object.fromEntries(Object.entries(entry.values).map(([k,v])=>[k,String(v)]));assert.deepEqual(Object.keys(values).sort(),Object.keys(defaults(mode)).sort());
   const href=new URL(calculatorPresetHref(routeFor(id),entry.mode,values),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',href.hash)!;
   assert.equal(restored.mode.id,entry.mode);assert.deepEqual(restored.values,values);runCalculation(id,entry.mode,restored.values);count++;
  }
 }
 assert.equal(count,9);assert.equal(tasks['compound-interest'][1].values.compound,'Daily');
 assert.equal(tasks['compound-interest'][0].values.compound,'Monthly');assert.equal(tasks['boat-loan'][1].mode,'price');
});

test('Existing guide publication dates are retained and every updated comparison has complete CSV assumptions',()=>{
 for(const [topic,published]of [['compound','2026-10-31'],['boat','2026-11-01'],['savinggoal','2026-11-01']]as const){
  const guide=calculationGuideEntries[topic];assert.equal(guide.publishedOn,published);assert.equal(guideContentDate(guide),'2026-11-19');
  const csv=readFileSync(new URL(`../public/data/calculation-guides/${topic}-cases.csv`,import.meta.url),'utf8');
  assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('Restore inputs'));assert.ok(csv.includes('#calc=share_version=1'));
  for(const row of cases[topic])assert.ok(csv.includes(row.label));
 }
 assert.equal(calculationGuideEntries.compound.linksUpdatedOn,'2026-11-16');
});
