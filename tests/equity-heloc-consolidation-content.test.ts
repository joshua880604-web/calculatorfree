import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {parseDebts,debtSchedule} from '../src/lib/debt-repayment';
import {sharedInputs} from '../src/lib/sharing';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {calculationGuideEntries} from '../src/lib/calculation-guides';
import tasks from '../src/lib/focused-calculation-tasks.json';
import cases from '../src/lib/calculation-guide-cases.json';
import content from '../src/lib/calculation-guide-content.json';
import limits from '../src/lib/heloc-credit-scenarios.json';
import reference from '../docs/financial-clone/evidence/equity-heloc-consolidation-reference-20261119.json';
const inputs=(v:object)=>Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]));
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);
for(const row of reference.cases)test('Independent equity / HELOC / consolidation scenario: '+row.label,()=>{
 const v=inputs(row.values),result=runCalculation(row.calculatorId,row.mode,v);
 for(const[label,value]of Object.entries(row.expected)){const metric=result.metrics.find(m=>m.label===label);assert.ok(metric,label);near(metric.value,Number(value));}
 for(const selected of row.selectedRows)for(let i=0;i<selected.length;i++)near(Number(result.rows![Number(selected[0])-1][i]),Number(selected[i]));
 if(row.currentPlanRows.length){const debts=parseDebts(v.debts),current=debtSchedule(debts,debts.reduce((n,d)=>n+d.minimum,0),true);for(const selected of row.currentPlanRows)for(let i=0;i<selected.length;i++)near(Number(current.rows![Number(selected[0])-1][i]),Number(selected[i]));}
});
test('Nine tasks, twenty-one phase/loan cases and two credit cases restore complete executable inputs',()=>{
 let taskCount=0,caseCount=0;
 for(const[id,topic]of [['heloc','heloc'],['home-equity-loan','equity'],['debt-consolidation','consolidation']]as const){
  const tool=calculators.find(c=>c.id===id)!;
  for(const task of tasks[id]){const mode=tool.modes.find(m=>m.id===task.mode)!,v=inputs(task.values);assert.deepEqual(Object.keys(v).sort(),Object.keys(defaults(mode)).sort());const url=new URL(calculatorPresetHref(routeFor(id),mode.id,v),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',url.hash)!;assert.equal(restored.mode.id,mode.id);assert.deepEqual(restored.values,v);runCalculation(id,mode.id,v);taskCount++;}
  const csv=readFileSync(new URL('../public/data/calculation-guides/'+topic+'-cases.csv',import.meta.url),'utf8');assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('#calc=share_version=1'));
  for(const row of cases[topic]){const mode=tool.modes.find(m=>m.id===row.mode)!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());assert.equal(row.display.length,content[topic].columns.length-1);assert.ok(csv.includes(row.label));caseCount++;}
 }
 assert.equal(taskCount,9);assert.equal(caseCount,21);
 const csv=readFileSync(new URL('../public'+limits.csvPath,import.meta.url),'utf8');
 for(const row of limits.rows){const mode=calculators.find(c=>c.id==='heloc')!.modes.find(m=>m.id==='maximum-credit')!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());assert.ok(csv.includes(row.label));}
});
test('HELOC boundary stops annual fees and keeps closing cash distinct from principal',()=>{
 const deducted=cases.heloc[4],upfront=cases.heloc[6],noDraw=cases.heloc[7];
 near(deducted.metrics['Net initial proceeds after closing costs'],upfront.metrics['Net initial proceeds after closing costs']);near(upfront.metrics['Cash disbursed at closing']-deducted.metrics['Cash disbursed at closing'],1000);near(noDraw.metrics['Annual fees during draw'],0);near(noDraw.metrics['Monthly draw payment'],0);
 const annual=runCalculation('heloc','draw-repay',inputs(cases.heloc[3].values));near(Number(annual.rows![119][1]),50000*.08/12+10);near(Number(annual.rows![120][1]),annual.metrics.find(m=>m.label==='Monthly repayment')!.value);assert.ok(Number(annual.rows![120][3])>0);
 near(limits.rows[0].metrics['Estimated maximum HELOC'],190000);near(limits.rows[1].metrics['Estimated maximum HELOC'],0);
});
test('Deducted home equity costs preserve net cash and zero-interest fees preserve positive APR',()=>{
 const upfront=cases.equity[1].metrics,deducted=cases.equity[5].metrics,zero=cases.equity[6].metrics;
 near(upfront['Net proceeds'],deducted['Net proceeds']);near(upfront['Nominal APR'],deducted['Nominal APR']);near(zero['Total interest'],0);assert.ok(zero['Nominal APR']>0);near(zero['Total payments']-zero['Net proceeds'],1500);
});
test('Multi-debt comparisons retain their current budget, changed installment and signed losses',()=>{
 const multi=cases.consolidation[4],short=cases.consolidation[5];assert.equal(multi.values.debts,short.values.debts);assert.ok(multi.metrics['Payment per period']<250);assert.ok(short.metrics['Payment per period']>250);assert.ok(cases.consolidation[1].metrics['Interest and fee savings']<0);near(multi.metrics['Current plan total interest'],short.metrics['Current plan total interest']);
 assert.ok(content.consolidation.reviewNotes.some(n=>n.includes('not equal-budget')));
 for(const topic of ['heloc','equity','consolidation']as const){assert.equal(calculationGuideEntries[topic].publishedOn,'2026-11-01');assert.equal(calculationGuideEntries[topic].updatedOn,'2026-11-19');}
});
