import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs,formatMetric} from '../src/lib/sharing';
import reference from '../docs/financial-clone/evidence/finance-three-decimal-20261118.json';
import {navigationHref} from '../src/lib/navigation';
const run=(id:string,mode:string,patch:Record<string,string|number>={})=>{
 const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;
 return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});
};
const get=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<=Math.max(1e-8,Math.abs(b)*1e-12),`${a} != ${b}`);
for(const f of reference.fixtures)test('Independent Decimal / calendar reference: '+f.id+' / '+f.title,()=>{
 const r=runCalculation(f.id,f.mode,Object.fromEntries(Object.entries(f.values).map(([k,v])=>[k,String(v)])));
 for(const [label,expected] of Object.entries(f.expected))near(get(r,label).value,Number(expected));
});
test('Basis-point units round trip and absolute changes stay distinct from relative growth',()=>{
 for(const bps of [-10000,-25,-.001,0,.125,25,10000]){
  for(const [unit,value] of [['Basis points',bps],['Percent / percentage points',bps/100],['Decimal',bps/10000]] as const){
   const r=run('basis-point','convert',{unit,value});near(get(r,'Basis points').value,bps);near(get(r,'Equivalent decimal fraction').value,bps/10000);
  }
 }
 const change=run('basis-point','rate-change');near(get(change,'Rate change in basis points').value,25);near(get(change,'Relative change from positive starting rate').value,5);
 for(const start_rate of [0,-1]){const m=get(run('basis-point','rate-change',{start_rate,end_rate:1}),'Relative change from positive starting rate');assert.ok(m.displayValue);assert.ok(!formatMetric(m).endsWith('%'));}
 near(get(run('basis-point','amount',{amount:200000,bps:-25}),'Amount represented by entered basis points').value,-500);
 assert.throws(()=>run('basis-point','amount',{amount:-1}));assert.throws(()=>run('basis-point','convert',{value:'NaN'}));assert.throws(()=>run('basis-point','convert',{unit:'bits per second'}));
});
test('Rent dates are inclusive, leap-aware, timezone-independent and split monthly',()=>{
 const label='Estimated rent for selected billable days';
 near(get(run('prorated-rent','dates',{start:'2024-02-01',end:'2024-02-29',monthly_rent:1800}),label).value,1800);
 near(get(run('prorated-rent','dates',{start:'2100-02-01',end:'2100-02-28',monthly_rent:1800}),label).value,1800);
 near(get(run('prorated-rent','dates',{start:'2026-03-07',end:'2026-03-09'}),'Billable days included').value,3);
 const cross=run('prorated-rent','dates',{start:'2023-12-31',end:'2024-01-01',basis:'Actual days in each year',monthly_rent:2000});
 near(get(cross,label).value,24000/365+24000/366);assert.equal(cross.rows!.length,2);
 const full=run('prorated-rent','dates',{start:'2026-01-01',end:'2026-01-31',basis:'30-day month'});near(get(full,label).value,2000/30*31);assert.ok(get(full,label).value>2000,'No undisclosed monthly cap');
 const january=run('prorated-rent','dates');assert.ok(Math.abs(get(january,label).value-Math.round(2000/31*100)/100*15)>.05,'Keep daily precision until final rounding');
 const invalidDates:Record<string,string|number>[]=[{start:'2026-02-29'},{start:'2026-02-30'},{start:'2024-02-30'},{start:'2026-01-17',end:'2026-01-16'},{start:'2026-01-01',end:'2040-01-01'},{start:'2026-01-01',end:'2101-01-01'},{basis:'Guess local law'}];
 for(const patch of invalidDates)assert.throws(()=>run('prorated-rent','dates',patch));
 assert.throws(()=>run('prorated-rent','days',{billable_days:29,month_days:28}));assert.throws(()=>run('prorated-rent','days',{billable_days:1.5}));near(get(run('prorated-rent','days',{billable_days:0}),label).value,0);
});
test('Operating cash flow reconciles direct, component and aggregate inputs with signed cash effects',()=>{
 const label='Operating cash flow under entered assumptions';
 const base=run('operating-cash-flow','indirect');
 near(get(base,label).value,get(run('operating-cash-flow','nwc'),label).value);near(get(base,label).value,get(run('operating-cash-flow','direct'),label).value);
 near(get(base,'Increase in operating net working capital').value,20000);near(get(base,'Working-capital cash-flow effect').value,-20000);
 near(get(run('operating-cash-flow','indirect',{ar_change:-30000}),label).value,175000);
 near(get(run('operating-cash-flow','nwc',{nwc_change:-20000}),label).value,170000);
 near(get(run('operating-cash-flow','nwc',{net_income:10000,noncash:-20000,nwc_change:0}),label).value,-10000);
 const refunds=run('operating-cash-flow','direct',{receipts:-500,suppliers:0,employees:0,taxes:0,interest:0,other:0});near(get(refunds,label).value,-500);
 near(base.rows!.reduce((s,row)=>s+Number(row[1]),0),get(base,label).value);
 assert.throws(()=>run('operating-cash-flow','direct',{suppliers:-1}));assert.throws(()=>run('operating-cash-flow','nwc',{nwc_change:'Infinity'}));
});
test('New financial tasks have complete reproducible presets and identical lazy-client calculations',async()=>{
 for(const id of ['basis-point','prorated-rent','operating-cash-flow']){
  const c=calculators.find(c=>c.id===id)!;assert.ok(c);assert.deepEqual(new Set(guides[id].examples.map(e=>e.mode)),new Set(c.modes.map(m=>m.id)));
  for(const e of guides[id].examples){const mode=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),mode.fields.map(f=>f.key).sort());
   const v=Object.fromEntries(Object.entries(e.values).map(([k,x])=>[k,String(x)])),result=runCalculation(id,e.mode,v);near(get(result,e.expected.label).value,e.expected.value);assert.deepEqual(await runClientCalculation(id,c.category,e.mode,v),result);
   const href=calculatorPresetHref(routeFor(id),e.mode,e.values),restored=sharedInputs(c,'',href.slice(href.indexOf('#')))!;assert.equal(restored.mode.id,e.mode);assert.deepEqual(restored.values,v);
  }
 }
 assert.equal(navigationHref('/bps-calculator'),'/basis-point-calculator');assert.equal(navigationHref('/prorate-rent-calculator.html'),'/prorated-rent-calculator');
});
