import test from 'node:test';import assert from 'node:assert/strict';
import{guides}from'../src/lib/guides';import{calculators,defaults,runCalculation}from'../src/lib/calculators';import{contentUpdatedOn}from'../src/lib/seo';
const c=calculators.find(c=>c.id==='refinance')!,m=c.modes[0];
test('Refinance questions preserve the published cash-out anchor and source boundaries',()=>{
 assert.equal(guides.refinance.questions.length,8);assert.ok(guides.refinance.questions.find(q=>q.anchor==='use-cash-out-costs')?.links?.some(x=>x.id==='mortgage'));
 assert.equal(guides.refinance.examples[0].expected.value,500);assert.equal(guides.refinance.examples.length,2);assert.equal(contentUpdatedOn['/refinance-calculator.html'],'2026-11-02');assert.ok(guides.refinance.scope.includes('No live rates'));
});
test('FAQ fee arithmetic, cash-out debt and omitted nonpositive payment break-even reconcile',()=>{
 const v=defaults(m),r=runCalculation(c.id,m.id,{...v,cashout:'30000',points:'1',fees:'3000',finance:'Yes'});assert.equal(r.metrics.find(x=>x.label==='Closing costs')!.value,5800);assert.ok(Math.abs(Number(r.rows![0][3])+Number(r.rows![0][4])-285800)<1e-7);assert.ok(!r.metrics.some(x=>x.label.includes('break-even')));
 const flat=runCalculation(c.id,m.id,{...v,principal:'12000',payment:'1000',rate:'0',new_rate:'0',new_years:'1'});assert.ok(!flat.metrics.some(x=>x.label.includes('break-even')));
});
