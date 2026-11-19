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
import reference from '../docs/financial-clone/evidence/fha-va-afford-reference-20261119.json';
const inputs=(v:object)=>Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]));
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);
for(const row of reference.cases)test('Independent FHA / VA / affordability scenario: '+row.label,()=>{
 const result=runCalculation(row.calculatorId,row.mode,inputs(row.values));
 for(const[label,value]of Object.entries(row.expected)){const metric=result.metrics.find(m=>m.label===label);assert.ok(metric,label);near(metric.value,Number(value));}
 for(const selected of row.selectedRows)for(let i=0;i<selected.length;i++){const actualIndex=i===0?0:i+1;near(Number(result.rows![Number(selected[0])-1][actualIndex]),Number(selected[i]));}
 if(row.calculatorId==='house-affordability'){near(Number(row.expected['Monthly housing budget']),Number(row.derived['Monthly principal and interest'])+Number(row.derived['Other monthly housing costs']));}
});
test('Ten task presets and twenty-one comparisons restore every supported field',()=>{
 let taskCount=0,caseCount=0;
 for(const[id,topic]of [['fha-loan','fha'],['va-mortgage','va'],['house-affordability','afford']]as const){
  const tool=calculators.find(c=>c.id===id)!;
  for(const task of tasks[id]){const mode=tool.modes.find(m=>m.id===task.mode)!,v=inputs(task.values);assert.deepEqual(Object.keys(v).sort(),Object.keys(defaults(mode)).sort());const href=new URL(calculatorPresetHref(routeFor(id),mode.id,v),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',href.hash)!;assert.equal(restored.mode.id,mode.id);assert.deepEqual(restored.values,v);runCalculation(id,mode.id,v);taskCount++;}
  const csv=readFileSync(new URL('../public/data/calculation-guides/'+topic+'-cases.csv',import.meta.url),'utf8');assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('#calc=share_version=1'));
  for(const row of cases[topic]){const mode=tool.modes.find(m=>m.id===row.mode)!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());assert.equal(row.display.length,content[topic].columns.length-1);assert.ok(csv.includes(row.label));caseCount++;}
 }
 assert.equal(taskCount,10);assert.equal(caseCount,21);
});
test('FHA lower appraisal changes premium terms and extra principal preserves the original MIP baseline',()=>{
 const base=cases.fha[0],down=cases.fha[1],appraised=cases.fha[4],extra=cases.fha[5];near(down.metrics['Monthly principal & interest'],appraised.metrics['Monthly principal & interest']);near(down.metrics['FHA MIP duration in years'],11);near(appraised.metrics['FHA MIP duration in years'],30);near(appraised.metrics['Annual FHA MIP rate'],.55);
 const b=runCalculation('fha-loan','monthly',inputs(base.values)),e=runCalculation('fha-loan','monthly',inputs(extra.values));near(Number(b.rows![12][8]),Number(e.rows![12][8]));assert.ok(e.rows!.length<b.rows!.length);near(extra.metrics['Initial monthly total']-base.metrics['Initial monthly total'],100);assert.ok(extra.metrics['Total FHA MIP']<base.metrics['Total FHA MIP']);
});
test('VA cash, property costs and the narrow prior-use category stay separate',()=>{
 const base=cases.va[0].metrics,cash=cases.va[1].metrics,costs=cases.va[6].metrics,manufactured=cases.va[7].metrics;near(base['Upfront fee'],manufactured['Upfront fee']);near(costs['Initial monthly total']-base['Initial monthly total'],550);near(costs['Monthly principal & interest'],base['Monthly principal & interest']);assert.ok(cash['Financed loan amount']<base['Financed loan amount']);assert.equal(cases.va[7].values.repeat,'Only a manufactured home');near(cases.va[5].metrics['Upfront fee'],0);
});
test('Affordability allocates maintenance and fixed cash without converting them to approvals',()=>{
 assert.ok(cases.afford[5].metrics['Estimated home price']<cases.afford[0].metrics['Estimated home price']);near(cases.afford[6].metrics['Down payment'],100000);const row=reference.cases.find(r=>r.label===cases.afford[6].label)!;near(Number(row.derived['Other monthly housing costs']),725);near(Number(row.derived['Monthly principal and interest']),1775);
 for(const topic of ['fha','va','afford']as const){assert.equal(calculationGuideEntries[topic].publishedOn,'2026-11-01');assert.equal(calculationGuideEntries[topic].updatedOn,'2026-11-19');}
});
