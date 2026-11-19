import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {editorialGuides} from '../src/lib/editorial-guides';
import tasks from '../src/lib/focused-calculation-tasks.json';
import content from '../src/lib/refinance-payoff-rentbuy-content.json';
import reference from '../docs/financial-clone/evidence/refinance-payoff-rentbuy-reference-20261119.json';
const inputs=(v:object)=>Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]));
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);
for(const row of reference.cases)test('Independent refinance / payoff / rent-buy scenario: '+row.label,()=>{
 const values=inputs(row.values),result=runCalculation(row.calculatorId,row.mode,values);
 for(const[label,value]of Object.entries(row.expected)){const m=result.metrics.find(m=>m.label===label);assert.ok(m,label);near(m.value,Number(value));}
 for(const label of row.absentMetrics)assert.ok(!result.metrics.some(m=>m.label===label),label);
 for(const selected of row.selectedRows)for(let i=0;i<selected.length;i++)near(Number(result.rows![Number(selected[0])-1][i]),Number(selected[i]));
 if(row.calculatorId==='rent-vs-buy'){near(Number(result.rows![9][1]),Number(row.derived['Buyer equity at year 10']));near(Number(result.rows![9][2]),Number(row.derived['Renter wealth at year 10']));near(Number(result.rows![9][3]),Number(row.derived['Buyer minus renter at year 10']));}
 if(row.calculatorId==='mortgage-payoff'){near(result.rows!.length,Number(row.derived['Payments until payoff']));near(Number(result.rows![0][1]),Number(row.derived['First scheduled outlay']));}
 if(row.calculatorId==='refinance'){
  const rows=result.rows!.slice(0,60);near(Number(rows.at(-1)![4]),Number(row.derived['New balance at month 60']));near(rows.reduce((n,r)=>n+Number(r[1]),0),Number(row.derived['New payments through month 60']));
  const metric=(label:string)=>result.metrics.find(m=>m.label===label)!.value;const financed=Number(result.rows![0][3])+Number(result.rows![0][4]);const currentPrincipal=financed-Number(values.cashout)-(values.finance==='Yes'?metric('Closing costs'):0);const old=runCalculation('mortgage-payoff','remaining-normal',{principal:String(currentPrincipal),payment:String(metric('Current monthly payment')),rate:values.rate});const oldRows=old.rows!.slice(0,60);near(Number(oldRows.at(-1)![4]),Number(row.derived['Current balance at month 60']));near(oldRows.reduce((n,r)=>n+Number(r[2]),0)-rows.reduce((n,r)=>n+Number(r[2]),0)-metric('Closing costs'),Number(row.derived['Five-year interest-plus-fee savings']));
 }
});
test('Eleven tasks and fifteen displayed cases restore complete executable presets',()=>{
 let taskCount=0,caseCount=0;
 for(const id of ['refinance','mortgage-payoff','rent-vs-buy']as const){const tool=calculators.find(c=>c.id===id)!;
  for(const task of tasks[id]){const mode=tool.modes.find(m=>m.id===task.mode)!,v=inputs(task.values);assert.deepEqual(Object.keys(v).sort(),Object.keys(defaults(mode)).sort());const url=new URL(calculatorPresetHref(routeFor(id),mode.id,v),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',url.hash)!;assert.equal(restored.mode.id,mode.id);assert.deepEqual(restored.values,v);runCalculation(id,mode.id,v);taskCount++;}
  const csv=readFileSync(new URL('../public'+content[id].csvPath,import.meta.url),'utf8');assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('#calc=share_version=1'));
  for(const row of content[id].rows){const mode=tool.modes.find(m=>m.id===row.mode)!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());assert.equal(row.display.length,content[id].columns.length-1);assert.ok(csv.includes(row.label));caseCount++;}
 }
 assert.equal(taskCount,11);assert.equal(caseCount,15);
});
test('A smaller refinance payment and simple recovery do not imply a better same-date borrowing cost',()=>{
 const rows=content.refinance.rows;assert.ok(rows[2].metrics['Monthly payment reduction']>rows[0].metrics['Monthly payment reduction']);assert.ok(rows[2].metrics['New total interest']>rows[0].metrics['New total interest']);assert.ok(rows[3].metrics['Monthly payment reduction']<0);assert.ok(!('Simple closing-cost break-even (months)'in rows[3].metrics));assert.ok(rows[4].derived['Five-year interest-plus-fee savings']<0);near(rows[4].metrics['Closing costs'],5750);assert.equal(rows[4].values.cashout,'25000');
});
test('Earlier extra principal lowers interest without treating different cash budgets as equal',()=>{
 const rows=content['mortgage-payoff'].rows;assert.ok(rows[1].metrics['Interest with strategy']<rows[2].metrics['Interest with strategy']);assert.ok(rows[3].metrics['Interest with strategy']<rows[4].metrics['Interest with strategy']);near(rows[3].derived['First scheduled outlay'],12500);near(rows[4].derived['First scheduled outlay'],2500);
});
test('Rent/buy preserves a signed year-ten loss, a missing crossing and a funding shortfall',()=>{
 const rows=content['rent-vs-buy'].rows;assert.ok(rows[1].derived['Buyer minus renter at year 10']<0);assert.ok(rows[2].metrics['Renter terminal wealth after 30 years']<0);assert.ok(!('First year buying leads'in rows[3].metrics));assert.match(rows[3].display[3],/Not within 30 years/);assert.ok(content['rent-vs-buy'].notes.some(n=>n.includes('unfunded shortfall')));
 for(const [path,published]of [['/guides/is-refinancing-worth-it/','2026-10-28'],['/guides/rent-vs-buy-a-house/','2026-10-28'],['/guides/pay-off-mortgage-or-invest/','2026-10-31']]){const guide=editorialGuides.find(g=>g.path===path)!;assert.equal(guide.publishedOn,published);assert.equal(guide.updatedOn,'2026-11-19');}
});
