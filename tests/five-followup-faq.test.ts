import test from 'node:test';import assert from 'node:assert/strict';
import{guides}from'../src/lib/guides';import{calculators,defaults,runCalculation,routeFor}from'../src/lib/calculators';import{contentUpdatedOn}from'../src/lib/seo';
const expected={'biweekly-mortgage':7,'mortgage-recast':8,'emergency-fund':7,'take-home-paycheck':6,'roth-ira':7};
const calc=(id:string,values:Record<string,string>={},mode?:string)=>{const c=calculators.find(c=>c.id===id)!,m=mode?c.modes.find(m=>m.id===mode)!:c.modes[0];return runCalculation(id,m.id,{...defaults(m),...values});};
const metric=(r:ReturnType<typeof calc>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
test('Five FAQ refreshes retain anchored calculation links and correct review dates',()=>{
 for(const[id,count]of Object.entries(expected)){const g=guides[id];assert.equal(g.questions.length,count);assert.equal(new Set(g.questions.map(q=>q.question)).size,count);assert.equal(g.checkedOn,'2026-11-02');assert.equal(contentUpdatedOn[routeFor(id)],id==='roth-ira'?'2026-11-03':'2026-11-02');}
 for(const[id,anchors]of Object.entries({'emergency-fund':['use-target'],'take-home-paycheck':['use-actual-paycheck','use-pay-frequency','use-fica-oasdi'],'roth-ira':['use-roth-eligibility-vs-growth','use-roth-growth-example','use-roth-versus-traditional-tool','use-roth-annual-monthly-timing']}))for(const anchor of anchors)assert.ok(guides[id].questions.find(q=>q.anchor===anchor)?.links?.length);
 assert.ok(!guides['take-home-paycheck'].questions.some(q=>q.question==='Will the paycheck result match my payslip exactly?'));
});
test('New FAQ illustrations reproduce payment, timing and IRA cap behavior',()=>{
 const b=calc('biweekly-mortgage',{principal:'300000',rate:'6',years:'30',months:'0',extra:'0'});assert.ok(Math.abs(metric(b,'Interest saved versus standard monthly')-74436.01943612151)<.005);assert.ok(Math.abs(metric(b,'Biweekly interest saving versus matched budget')-770.66)<.01);assert.equal(metric(b,'Number of biweekly payments'),638);
 const r=calc('mortgage-recast');assert.ok(Math.abs(metric(r,'New monthly P&I after recast')-1610.7535037137714)<.000001);assert.ok(Math.abs(metric(r,'Monthly P&I reduction')-322.1507007427542)<.000001);
 const e=calc('emergency-fund',{expenses:'3000',months:'6',savings:'5200',deposit:'500'},'plan');assert.equal(metric(e,'Months to reach target'),26);assert.equal(metric(e,'Final deposit needed'),300);
 for(const[age,limit]of[[35,7500],[50,8600]]){const ira=calc('roth-ira',{age:String(age),retire:String(age+1),balance:'0',contribution:'10000',max:'No',return:'0'});assert.equal(metric(ira,'Total contributions'),limit);}
});
