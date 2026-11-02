import test from 'node:test';import assert from 'node:assert/strict';
import review from '../src/lib/semrush-salary-ira-faq-content.json';import{guides}from '../src/lib/guides';import{calculators,defaults,runCalculation}from '../src/lib/calculators';import{contentUpdatedOn}from '../src/lib/seo';
test('Salary and IRA FAQs retain functional links, explain scope and advance only their content review dates',()=>{
 assert.equal(guides.salary.questions.length,8);assert.equal(guides.ira.questions.length,7);
 for(const id of ['salary','ira']){const g=guides[id];assert.equal(g.checkedOn,'2026-11-02');assert.equal(contentUpdatedOn['/'+id+'-calculator.html'],'2026-11-02');assert.equal(new Set(g.questions.map(q=>q.question)).size,g.questions.length);}
 for(const anchor of ['use-salary-to-hourly','use-hourly-to-paycheck'])assert.ok(guides.salary.questions.find(q=>q.anchor===anchor)?.links?.length);
 assert.ok(guides.ira.questions.some(q=>q.answer.includes('not a withdrawal-tax calculation')));assert.ok(guides.ira.questions.some(q=>q.answer.includes('does not test those conditions')));
 for(const r of Object.values(review))for(const q of r.items)assert.ok(q.queries.length>0);
});
test('Question examples reproduce gross salary arithmetic and whole-year IRA cash flows',()=>{
 const salary=calculators.find(c=>c.id==='salary')!,sm=salary.modes[0],base={...defaults(sm),holidays:'0',vacation:'0'};
 for(const[v,label,expected]of[[{salary:'62400',frequency:'Annually',hours:'40'},'Unadjusted hourly rate',30],[{salary:'2400',frequency:'Biweekly',hours:'40'},'Unadjusted hourly rate',30],[{salary:'31200',frequency:'Annually',hours:'20'},'Unadjusted hourly rate',30]]as const){const r=runCalculation(salary.id,sm.id,{...base,...v});assert.ok(Math.abs(r.metrics.find(m=>m.label===label)!.value-expected)<1e-9);}
 const ira=calculators.find(c=>c.id==='ira')!,im=ira.modes[0],r=runCalculation(ira.id,im.id,{...defaults(im),age:'35',retire:'37',balance:'1000',contribution:'1000',max:'No',return:'6',retire_tax:'20'});for(const[label,expected]of[['Traditional IRA pre-tax balance',3183.6],['Traditional IRA after-tax value',2546.88]]as const)assert.ok(Math.abs(r.metrics.find(m=>m.label===label)!.value-expected)<1e-8);
});
