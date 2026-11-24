import test from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {expansionFieldVisible} from '../src/lib/expansion-field-visibility';
import {irmaaBracket,irmaaStatuses} from '../src/lib/calculators/irmaa';
import {resultExportData} from '../src/lib/result-export';
import disclaimers from '../src/lib/calculator-disclaimers.json';
import data from '../src/lib/irmaa-data.json';
import reference from '../docs/financial-clone/evidence/ladder-irmaa-reference-20261124.json';
import {readFileSync} from 'node:fs';import type {Result} from '../src/lib/types';
const run=(id:string,mode:string,patch:Record<string,unknown>={})=>{const c=calculators.find(c=>c.id===id)!;const m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});};
const get=(r:Result,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<Math.max(1e-7,Math.abs(b)*1e-12),`${a} != ${b}`);
for(const f of reference.fixtures)test('Independent ladder/IRMAA oracle: '+f.key,()=>{const r=run(f.id,f.mode,f.values);for(const [label,value]of Object.entries(f.expected))close(get(r,label),Number(value));});
for(const id of ['bond-ladder','irmaa']){
 const c=calculators.find(c=>c.id===id)!;
 for(const m of c.modes)test('Lazy client and export contracts: '+id+'/'+m.id,async()=>{const v=defaults(m),r=run(id,m.id);assert.deepEqual(await runClientCalculation(id,c.category,m.id,v),r);const e=await resultExportData(id,m,v,r);assert.equal(e.scope,guides[id].scope);assert.ok(e.copy.interpretation);assert.doesNotMatch(e.copy.interpretation!,/null|undefined|NaN|Infinity/);});
 test('Complete actual presets, category, CSV, disclaimer and reciprocal links: '+id,()=>{
  assert.ok(calculatorCategory(id));assert.equal((disclaimers as Record<string,string>)[id],guides[id].scope);assert.ok(readFileSync(new URL('../public/data/comparison-guides/'+id+'.csv',import.meta.url),'utf8').includes('Expected value'));
  for(const e of guides[id].examples){const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());close(get(run(id,m.id,e.values),e.expected.label),e.expected.value);}
  assert.equal(comparisonGuides[id].presets.length,guides[id].examples.length);for(const linked of relatedCalculatorIds[id])assert.ok(relatedCalculatorIds[linked].includes(id));
 });
}
test('Official full Part B totals reconcile and distinct MFS top boundaries remain year-specific',()=>{
 assert.equal(data.checkedOn,'2026-11-24');for(const y of Object.values(data.years))for(let i=0;i<6;i++)close(y.standardPartB+y.partBAdjustment[i],y.partBTotal[i]);
 assert.equal(irmaaBracket('2027',irmaaStatuses[2],387999.99).index,4);assert.equal(irmaaBracket('2027',irmaaStatuses[2],388000).index,5);
 assert.equal(irmaaBracket('2026',irmaaStatuses[2],390999.99).index,4);assert.equal(irmaaBracket('2026',irmaaStatuses[2],391000).index,5);
});
test('IRMAA bridge matches known MAGI and coverage does not charge absent benefits',()=>{
 const known=run('irmaa','known-magi'),bridge=run('irmaa','agi-bridge');assert.deepEqual(known.metrics,bridge.metrics);assert.deepEqual(known.rows,bridge.rows);
 const p={magi:112001};close(get(run('irmaa','known-magi',{...p,coverage:'Part B only'}),'Monthly Part D IRMAA per person'),0);close(get(run('irmaa','known-magi',{...p,coverage:'Part D only'}),'Monthly Part B IRMAA per person'),0);
 const r=run('irmaa','known-magi',{magi:112000,extra_income:1});close(get(r,'Monthly IRMAA change in added-income scenario'),99.1);assert.match(r.metrics.find(m=>m.label==='Selected income tier')!.displayValue!,/112,000/);
});
test('IRMAA rejects unannounced years, unsupported combinations and invalid numbers',()=>{
 for(const patch of [{year:'2028'},{year:'2025'},{people:2},{status:'Unknown'},{coverage:'Unknown'},{magi:''},{magi:'Infinity'},{part_d_plan:-1},{extra_income:-1},{magi:1e12,extra_income:1}])assert.throws(()=>run('irmaa','known-magi',patch));
 assert.throws(()=>run('irmaa','agi-bridge',{tax_exempt_interest:-1}));
});
test('Both ladder modes preserve cash-flow cost conservation and event sums across roll choices',()=>{
 for(const mode of ['coupon-bonds','treasury-bills'])for(const maturity of ['Retain maturity proceeds','Roll same face amount']){
  const r=run('bond-ladder',mode,{maturity});close(get(r,'Retained cash through horizon')+get(r,'Outstanding purchase cost, not market value')-get(r,'Initial purchase cost'),get(r,'Realized cash-flow gain, not tax income'));
  close(r.rows!.reduce((s,row)=>s+Number(row[4]),0),get(r,'Retained cash through horizon'));close(r.rows!.reduce((s,row)=>s+Number(row[3]),0),get(r,'Principal spent on reinvestment'));
 }
 const r=run('bond-ladder','coupon-bonds',{rungs:'1000, 105, 2, 2, 2',horizon_months:12});assert.ok(get(r,'Realized cash-flow gain, not tax income')<0);
});
test('Ladder horizon inclusion, month-end clamping and no-payment case are explicit',()=>{
 const r=run('bond-ladder','coupon-bonds',{settlement:'2028-01-31',rungs:'1000, 100, 12, 2, 12',horizon_months:2});assert.equal(r.rows![0][0],'2028-02-29');assert.equal(r.rows![1][0],'2028-03-31');close(get(r,'Face amount still outstanding'),0);
 const no=run('bond-ladder','treasury-bills',{horizon_days:27});close(get(no,'Retained cash through horizon'),0);close(get(no,'Face amount still outstanding'),30000);
});
test('Ladder rejects irregular coupons, malformed rungs, invalid dates and bill premium quotes',()=>{
 for(const patch of [{rungs:''},{rungs:'1000, 100, 4, 2.5, 2'},{rungs:'1000, 100, 4, 2, 3'},{rungs:'1000, 100, 4, 31, 1'},{rungs:'0, 100, 4, 2, 2'},{rungs:'1000, NaN, 4, 2, 2'},{rungs:'1,000, 100, 4, 2, 2'},{rungs:('1000, 100, 4, 2, 2\n').repeat(21)},{renewal_months:7},{settlement:'2026-02-30'},{horizon_months:0}])assert.throws(()=>run('bond-ladder','coupon-bonds',patch));
 for(const patch of [{rungs:'1000, 101, 28'},{rungs:'1000, 99, 28.5'},{rungs:'1000, 99, 367'},{renewal_price:100.01},{renewal_days:27}])assert.throws(()=>run('bond-ladder','treasury-bills',patch));
});

test('Part B-only hides and ignores an inapplicable Part D plan quote',()=>{const r=run('irmaa','known-magi',{coverage:'Part B only',part_d_plan:'',magi:112001});close(get(r,'Monthly total premiums for selected people'),293.1);assert.equal(expansionFieldVisible('irmaa',{coverage:'Part B only'},'part_d_plan'),false);assert.equal(expansionFieldVisible('irmaa',{coverage:'Part D only'},'part_d_plan'),true);});
