import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {calculationGuideEntries} from '../src/lib/calculation-guides';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {guideContentDate} from '../src/lib/editorial-guides';
import tasks from '../src/lib/focused-calculation-tasks.json';
import cases from '../src/lib/calculation-guide-cases.json';
import transfer from '../src/lib/transfer-scenario-content.json';
import reference from '../docs/financial-clone/evidence/mortgage-match-transfer-reference-20261119.json';
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-6,`${a} versus ${b}`);
const inputs=(v:object)=>Object.fromEntries(Object.entries(v).map(([k,v])=>[k,String(v)]));

for(const row of reference.cases)test('Independent mortgage / match / transfer case: '+row.label,()=>{
 const result=runCalculation(row.calculatorId,row.mode,inputs(row.values));
 for(const [label,expected]of Object.entries(row.expected)){const metric=result.metrics.find(m=>m.label===label);assert.ok(metric,label);near(metric.value,Number(expected));}
 if(row.calculatorId==='mortgage'){
  const extra=row.extra as unknown as {month13total:string;month13costs:string};near(Number(result.rows![12][7]),Number(extra.month13total));near(Number(result.rows![12][6]),Number(extra.month13costs));
 }
 if(row.calculatorId==='balance-transfer'){
  const extra=row.extra as unknown as {boundary:Record<string,string[]>};
  for(const [period,expected]of Object.entries(extra.boundary))for(let i=0;i<expected.length;i++)near(Number(result.rows![Number(period)-1][i]),Number(expected[i]));
 }
});

test('Fixed mortgage P&I stays fixed when ownership costs increase; a smaller down payment uses separate cash and manual PMI assumptions',()=>{
 const base=cases.mortgage[0],down=cases.mortgage[3],growth=cases.mortgage[4];
 near(base.metrics['Monthly principal & interest'],growth.metrics['Monthly principal & interest']);assert.ok(growth.extra.month13total>growth.metrics['Initial monthly total']);
 assert.equal(down.values.pmi_method,'Manual');near(down.metrics['Down payment'],37500);near(down.metrics['Initial monthly PMI'],125);near(down.metrics['Financed loan amount'],337500);
});

test('Match rate and eligible salary band are distinct; the new 3%-band match is 1.5% of pay',()=>{
 const narrow=cases.matching[4],wide=cases.matching[1];near(narrow.metrics['Employer annual match'],1200);near(wide.metrics['Employer annual match'],2400);
 near(narrow.metrics['Annual contribution to maximize match']!,2400);near(narrow.metrics['Employer annual match']/Number(narrow.values.salary),0.015);
});

test('Transfer deadline, post-promo APR and separately paid fees remain distinct at the same monthly budget',()=>{
 const full=transfer.rows[0],short=transfer.rows[1],upfront=transfer.rows[2],low=transfer.rows[3],offers=transfer.rows[4];
 assert.equal(short.values.payment,full.values.payment);assert.equal(short.values.a_months,'12');assert.ok(short.metrics['Borrowing cost: offer A']>full.metrics['Borrowing cost: offer A']);
 assert.equal(upfront.values.a_fee_payment,'Paid separately');near(upfront.metrics['Transfer fee: offer A'],180);assert.ok(upfront.metrics['Interest: offer A']<short.metrics['Interest: offer A']);
 assert.equal(low.values.payment,'250');assert.ok(low.metrics['Balance when offer A promotion ends']>0);assert.equal(offers.mode,'offers');assert.equal(offers.values.b_fee_rate,'5');
 const result=runCalculation('balance-transfer','offers',inputs(offers.values));near(result.metrics.find(m=>m.label==='Total borrowing-cost savings: A vs B')!.value,offers.metrics['Total borrowing-cost savings: A vs B']!);
});

test('All ten new task entries and all comparison rows restore complete mode-specific inputs',()=>{
 let count=0;
 for(const id of ['mortgage','401k','balance-transfer']as const)for(const task of tasks[id]){
  const tool=calculators.find(c=>c.id===id)!,mode=tool.modes.find(m=>m.id===task.mode)!;const values=inputs(task.values);
  assert.deepEqual(Object.keys(values).sort(),Object.keys(defaults(mode)).sort());const href=new URL(calculatorPresetHref(routeFor(id),task.mode,values),'https://www.calculatorfree.io');const restored=sharedInputs(tool,'',href.hash)!;
  assert.equal(restored.mode.id,task.mode);assert.deepEqual(restored.values,values);count++;
 }
 assert.equal(count,10);assert.equal(tasks.mortgage[1].values.loan_basis,'Loan amount');assert.equal(tasks.mortgage[2].values.pmi_method,'Manual');
 for(const row of reference.cases){const tool=calculators.find(c=>c.id===row.calculatorId)!,mode=tool.modes.find(m=>m.id===row.mode)!;assert.deepEqual(Object.keys(row.values).sort(),Object.keys(defaults(mode)).sort());}
});

test('Original guide publication dates survive and all updated tables expose complete downloadable assumptions',()=>{
 for(const [topic,published]of [['mortgage','2026-10-31'],['matching','2026-11-01']]as const){const guide=calculationGuideEntries[topic];assert.equal(guide.publishedOn,published);assert.equal(guideContentDate(guide),'2026-11-19');
  const csv=readFileSync(new URL(`../public/data/calculation-guides/${topic}-cases.csv`,import.meta.url),'utf8');assert.ok(csv.includes('Complete inputs'));assert.ok(csv.includes('#calc=share_version=1'));}
 const guide=comparisonGuides['balance-personal'].meta;assert.equal(guide.publishedOn,'2026-11-04');assert.equal(guideContentDate(guide),'2026-11-19');
 const csv=readFileSync(new URL('../public'+transfer.csvPath,import.meta.url),'utf8');for(const row of transfer.rows)assert.ok(csv.includes(row.label));
 assert.ok(transfer.intro.includes('does not compare with a personal loan'));assert.ok(transfer.notes.some(n=>n.includes('not deferred interest')));
});
