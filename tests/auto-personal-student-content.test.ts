import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {calculationGuideEntries} from '../src/lib/calculation-guides';
import tasks from '../src/lib/focused-calculation-tasks.json';
import cases from '../src/lib/calculation-guide-cases.json';
import content from '../src/lib/calculation-guide-content.json';
import reference from '../docs/financial-clone/evidence/auto-personal-student-reference-20261119.json';
const values=(v:object)=>Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]));
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);
for(const row of reference.cases)test('Independent auto / personal / student scenario: '+row.label,()=>{
 const result=runCalculation(row.calculatorId,row.mode,values(row.values));
 for(const [label,expected]of Object.entries(row.expected)){const metric=result.metrics.find(m=>m.label===label);assert.ok(metric,label);near(metric.value,Number(expected));}
 for(const selected of row.selectedRows)for(let i=0;i<selected.length;i++)near(Number(result.rows![Number(selected[0])-1][i]),Number(selected[i]));
});
test('Nine task presets and nineteen scenarios restore complete executable inputs',()=>{
 let count=0,scenarioCount=0;
 for(const[id,topic]of [['auto-loan','auto'],['personal-loan','personal'],['student-loan','student']]as const){
  const tool=calculators.find(c=>c.id===id)!;
  for(const task of tasks[id]){
   const mode=tool.modes.find(m=>m.id===task.mode)!,v=values(task.values);assert.deepEqual(Object.keys(v).sort(),Object.keys(defaults(mode)).sort());
   const url=new URL(calculatorPresetHref(routeFor(id),task.mode,v),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',url.hash)!;assert.equal(restored.mode.id,mode.id);assert.deepEqual(restored.values,v);runCalculation(id,mode.id,v);count++;
  }
  const csv=readFileSync(new URL('../public/data/calculation-guides/'+topic+'-cases.csv',import.meta.url),'utf8');assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('#calc=share_version=1'));
  for(const row of cases[topic]){const mode=tool.modes.find(m=>m.id===row.mode)!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());assert.equal(row.display.length,content[topic].columns.length-1);assert.ok(csv.includes(row.label));scenarioCount++;}
 }
 assert.equal(count,9);assert.equal(scenarioCount,19);
});
test('Upfront fee net cash and recurring insurance retain distinct schedule meanings',()=>{
 const rows=cases.personal,deducted=rows[1].metrics,upfront=rows[4].metrics,insured=rows[5].metrics;
 near(deducted['Net proceeds after fees'],upfront['Net proceeds after fees']);near(deducted['Nominal APR including insurance'],upfront['Nominal APR including insurance']);near(insured['Total interest'],deducted['Total interest']);near(insured['Payment including insurance']-insured['Payment per period'],20);
 assert.ok(insured['Nominal APR including insurance']>deducted['Nominal APR including insurance']);assert.ok(content.personal.reviewNotes.some(n=>n.includes('Do not add it again')));
});
test('Manual trade tax changes do not erase debt; reverse price respects its payment budget',()=>{
 const trade=cases.auto[3],noCredit=cases.auto[5],budget=cases.auto[6];near(noCredit.metrics['Sales tax']-trade.metrics['Sales tax'],560);near(budget.metrics['Payment per period'],600);assert.equal(budget.mode,'price');assert.equal(trade.values.owed,noCredit.values.owed);assert.equal(trade.values.trade,noCredit.values.trade);
});
test('Annual and one-time student extras have different timing from monthly extras',()=>{
 const monthly=cases.student[2].metrics,annual=cases.student[4].metrics,once=cases.student[5].metrics;
 assert.ok(monthly['Total interest']<annual['Total interest']);assert.ok(annual['Total interest']<once['Total interest']);assert.equal(cases.student[4].values.extra_monthly,'0');assert.equal(cases.student[4].values.extra_yearly,'1200');assert.equal(cases.student[5].values.extra_once_month,'1');
 for(const topic of ['auto','personal','student']as const){assert.equal(calculationGuideEntries[topic].publishedOn,'2026-11-01');assert.equal(calculationGuideEntries[topic].updatedOn,'2026-11-19');}
});
