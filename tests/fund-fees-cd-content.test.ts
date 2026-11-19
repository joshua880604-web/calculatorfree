import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {practicalGuideList} from '../src/lib/practical-guides';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {guides} from '../src/lib/guides';
import tasks from '../src/lib/focused-calculation-tasks.json';
import content from '../src/lib/fund-fees-cd-content.json';
import reference from '../docs/financial-clone/evidence/fund-fees-cd-reference-20261119.json';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);
const inputs=(v:object)=>Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]));
for(const row of reference.cases)test('Independent fund / fees / CD example: '+row.label,()=>{
 const result=runCalculation(row.calculatorId,row.mode,inputs(row.values));
 for(const [label,value]of Object.entries(row.expected)){const m=result.metrics.find(m=>m.label===label);assert.ok(m,label);near(m.value,Number(value));}
 for(const selected of row.selectedRows)for(let i=0;i<selected.length;i++)near(Number(result.rows![Number(selected[0])-1][i]),Number(selected[i]));
});
test('Gross and equivalent net returns give matching balances without deducting the fund expense twice',()=>{
 const rows=content['investment-fee'].rows;
 near(rows[0].metrics['Ending balance after modeled fees']!,rows[2].metrics['Ending balance after modeled fees']!);
 near(rows[1].metrics['Ending balance after modeled fees']!,rows[3].metrics['Ending balance after modeled fees']!);
 assert.equal(rows[2].values.basis,'After fund fees');assert.equal(rows[2].values.rate,'7.784');near(rows[2].metrics['Modeled fees paid']!,0);
 assert.ok(rows[0].metrics['Balance reduction including lost growth']!>rows[0].metrics['Modeled fees paid']!);
 assert.ok(content['investment-fee'].notes.some(n=>n.includes('does not mean')));
});
test('Mutual fund redemption applies the exit charge after the pre-exit schedule and preserves the no-charge counterfactual',()=>{
 const rows=content['mutual-fund'].rows;const exit=rows[3];const result=runCalculation('mutual-fund','projection',inputs(exit.values));
 near(Number(result.rows!.at(-1)![3])*.98,exit.metrics['Net redemption value']);
 near(rows[4].metrics['Effect of fees and lost growth'],0);assert.ok(rows[2].metrics['Net redemption value']>rows[0].metrics['Net redemption value']);
 assert.ok(content['mutual-fund'].notes.some(n=>n.includes('entire final')));
});
test('CD term, nominal/APY convention and tax timing remain separate',()=>{
 const rows=content.cd.rows;assert.deepEqual(rows.slice(0,3).map(r=>r.values.months),['6','12','14']);
 assert.ok(rows[3].metrics['Interest earned']>rows[1].metrics['Interest earned']);near(rows[1].metrics['Maturity balance'],10400);
 near(rows[4].metrics['Maturity balance'],10400);near(rows[4].metrics['After-tax balance'],10312);
 const r=runCalculation('cd','accumulation',{...inputs(rows[1].values),compound:'Daily'});near(r.metrics.find(m=>m.label==='Maturity balance')!.value,10400);
});
test('All ten task entries and fifteen table rows restore complete executable input sets',()=>{
 let count=0;
 for(const id of ['mutual-fund','investment-fee','cd']as const){
  for(const task of tasks[id]){const tool=calculators.find(c=>c.id===id)!,mode=tool.modes.find(m=>m.id===task.mode)!,values=inputs(task.values);assert.deepEqual(Object.keys(values).sort(),Object.keys(defaults(mode)).sort());const href=new URL(calculatorPresetHref(routeFor(id),task.mode,values),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',href.hash)!;assert.equal(restored.mode.id,task.mode);assert.deepEqual(restored.values,values);runCalculation(id,task.mode,values);count++;}
  const data=content[id];assert.equal(data.rows.length,5);const csv=readFileSync(new URL('../public'+data.csvPath,import.meta.url),'utf8');assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('#calc=share_version=1'));
  for(const row of data.rows){const tool=calculators.find(c=>c.id===id)!,mode=tool.modes.find(m=>m.id===row.mode)!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());assert.equal(row.display.length,data.columns.length-1);assert.ok(csv.includes(row.label));}
 }
 assert.equal(count,10);
});
test('Updated guides preserve publication dates and the duplicated six-month CD example is merged',()=>{
 const fee=practicalGuideList.find(g=>g.path==='/guides/mutual-fund-fees-and-investment-costs/')!;assert.equal(fee.publishedOn,'2026-11-01');assert.equal(fee.updatedOn,'2026-11-19');
 const apy=comparisonGuides['apr-apy'].meta;assert.equal(apy.publishedOn,'2026-11-03');assert.equal(apy.updatedOn,'2026-11-19');
 assert.ok(guides.cd.examples.some(e=>e.title==='A 6-month CD at an illustrative 4% APY'));assert.ok(!guides.cd.examples.some(e=>e.title==='A six-month CD quoted at 4% APY'));
});
