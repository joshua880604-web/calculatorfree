import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {europeanOptionPrices,normalCDF} from '../src/lib/calculators/black-scholes';
import evidence from '../docs/financial-clone/evidence/markets-six-reference-20261117.json';
import content from '../src/lib/markets-six-content.json';
import articles from '../src/lib/markets-six-guide-content.json';
import terms from '../src/lib/markets-six-glossary.json';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs,formatMetric} from '../src/lib/sharing';
import {sitemapEntries} from '../src/lib/seo';
import {resultContext} from '../src/lib/result-context';
const run=(id:string,mode:string,patch:Record<string,string|number>={})=>{const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});};
const get=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};
const near=(a:number,b:number,t=1e-8)=>assert.ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Eleven market/acquisition modes match 24 independent 80-digit reference fixtures',()=>{
 assert.equal(evidence.fixtures.length,24);assert.equal(new Set(evidence.fixtures.map(f=>f.id+':'+f.mode)).size,11);
 for(const f of evidence.fixtures){const r=run(f.id,f.mode,f.values as unknown as Record<string,string|number>);for(const [label,expected] of Object.entries(f.expected))near(get(r,label).value,Number(expected),1e-10);}
});
test('Split direction, theoretical fractions and sequential allocations preserve position totals',()=>{
 const a=run('stock-split','single',{shares:103,price:4,average_cost:3,new_shares:1,old_shares:10});near(get(a,'Theoretical shares after splits').value,10.3);near(get(a,'Total acquisition cost preserved').value,309);
 const seq=run('stock-split','chain',{splits:'3, 2\n1, 5'}),one=run('stock-split','single',{new_shares:3,old_shares:10});for(const m of seq.metrics)near(m.value,get(one,m.label).value);
 const invalid:Record<string,string|number>[]=[{new_shares:0},{old_shares:0},{new_shares:1.5}];for(const patch of invalid)assert.throws(()=>run('stock-split','single',patch));
 assert.throws(()=>run('stock-split','chain',{splits:'1, 2.5'}));assert.throws(()=>run('stock-split','chain',{splits:'3, 2, 1'}));
});
test('CAC keeps unique customers, itemized allocations and zero-denominator states explicit',()=>{
 near(get(run('customer-acquisition-cost','total'),'Acquisition cost per unique new customer').value,250);
 assert.deepEqual(run('customer-acquisition-cost','total').metrics,run('customer-acquisition-cost','itemized').metrics);
 const zero=get(run('customer-acquisition-cost','total',{customers:0}),'Acquisition cost per unique new customer');assert.ok(zero.displayValue);assert.ok(!formatMetric(zero).includes('$'));
 near(get(run('customer-acquisition-cost','total',{cost:0}),'Acquisition cost per unique new customer').value,0);
 assert.throws(()=>run('customer-acquisition-cost','total',{customers:1.5}));assert.throws(()=>run('customer-acquisition-cost','itemized',{people:-1}));
});
test('DDM grows only D0 and discounts terminal price from the correct year',()=>{
 const d0=run('dividend-discount-model','stable'),d1=run('dividend-discount-model','stable',{dividend:2.08,dividend_basis:'Next annual dividend (D1)'});assert.deepEqual(d0.metrics,d1.metrics);
 const n=run('dividend-discount-model','two-stage',{required_return:8,growth:3});near(get(n,'Terminal price at end of early stage').value,49.852);near(get(n,'Modeled dividend-discount value per share').value,46.85185185185185);
 const negativeRates=run('dividend-discount-model','stable',{required_return:-1,growth:-2});near(get(negativeRates,'Modeled dividend-discount value per share').value,196);
 assert.throws(()=>run('dividend-discount-model','stable',{required_return:4}));assert.throws(()=>run('dividend-discount-model','two-stage',{growth:12}));assert.throws(()=>run('dividend-discount-model','two-stage',{years:1.5}));
 near(get(run('dividend-discount-model','stable',{dividend:0}),'Modeled dividend-discount value per share').value,0);
});
test('Basic EPS reconciles period weights, common earnings and losses without hidden dilution',()=>{
 near(get(run('earnings-per-share','weighted-schedule'),'Basic earnings per common share').value,5.1328125);
 const changed=run('earnings-per-share','weighted-schedule',{share_schedule:'300000, 365'});assert.deepEqual(changed.metrics,run('earnings-per-share','known-average').metrics);
 near(get(run('earnings-per-share','known-average',{net_income:-100000,preferred_adjustment:10000,average_shares:50000}),'Basic earnings per common share').value,-2.2);
 assert.ok(get(run('earnings-per-share','known-average',{average_shares:0}),'Basic earnings per common share').displayValue);
 assert.throws(()=>run('earnings-per-share','weighted-schedule',{share_schedule:'100000, 90\n200000, 274'}));assert.throws(()=>run('earnings-per-share','weighted-schedule',{share_schedule:'100000, 90.5\n200000, 274.5'}));
});
test('Sharpe uses arithmetic excess returns, sample volatility and one explicit scaling factor',()=>{
 const a=run('sharpe-ratio','return-series'),period=get(a,'Sharpe ratio for one observation period').value;near(period,.2401922307076307);near(get(a,'Assumption-annualized Sharpe ratio').value,3/Math.sqrt(13));
 const annualFactor1=run('sharpe-ratio','return-series',{periods_per_year:1});near(get(annualFactor1,'Assumption-annualized Sharpe ratio').value,period);
 const shifted=run('sharpe-ratio','return-series',{returns:'-1, 2, 4, 1',risk_free:1});assert.deepEqual(shifted.metrics,a.metrics);
 for(const [mode,patch] of [['statistics',{std_dev:0}],['return-series',{returns:'2, 2, 2'}]] as const){const z=get(run('sharpe-ratio',mode,patch),'Sharpe ratio for one observation period');assert.ok(z.displayValue);assert.ok(!formatMetric(z).includes('%'));}
 assert.throws(()=>run('sharpe-ratio','return-series',{returns:'2'}));assert.throws(()=>run('sharpe-ratio','return-series',{returns:'1, NaN'}));assert.throws(()=>run('sharpe-ratio','statistics',{periods_per_year:12.5}));
});
test('Gaussian tails and European model boundaries preserve parity under varied parameters',()=>{
 near(normalCDF(0),.5,1e-14);near(normalCDF(1),.8413447460685429,1e-14);near(normalCDF(-8),6.220960574271784e-16,1e-25);near(normalCDF(-1)+normalCDF(1),1,1e-14);
 for(const s of [1,50,100,200,1e6])for(const r of [-.02,0,.05])for(const q of [0,.03])for(const sigma of [0,.01,.2,2])for(const t of [0,.01,1,10]){
  const p=europeanOptionPrices(s,100,r,q,sigma,t);assert.ok(p.call>=0&&p.put>=0&&Number.isFinite(p.call+p.put));near(p.call-p.put,p.spot-p.strike,1e-11);assert.ok(p.call<=p.spot+1e-8&&p.put<=p.strike+1e-8);
 }
 assert.deepEqual(europeanOptionPrices(100,100,.05,0,1e-300,1e-300),{call:0,put:0,spot:100,strike:100});
 assert.throws(()=>run('black-scholes','european',{spot:0}));assert.throws(()=>run('black-scholes','european',{time:101}));assert.throws(()=>run('black-scholes','european',{volatility:-1}));
});
test('All new modes have complete reproducible presets, source-linked content and canonical clusters',async()=>{
 const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});
 for(const [id,g] of Object.entries(content)){
  const c=calculators.find(c=>c.id===id)!,article=articles[id as keyof typeof articles];assert.deepEqual(new Set(g.examples.map(e=>e.mode)),new Set(c.modes.map(m=>m.id)));assert.ok(terms.some(t=>t.tools.some(tool=>tool.id===id)));
  for(const path of ['/'+id+'-calculator',article.meta.path,'/glossary/'+terms.find(t=>t.tools[0].id===id)!.slug+'/']){const e=entries.find(e=>e.url==='https://www.calculatorfree.io'+path);assert.ok(e);assert.equal(e.lastModified,'2026-11-18');}
  for(const e of g.examples){const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());const values=Object.fromEntries(Object.entries(e.values).map(([k,v])=>[k,String(v)])),r=runCalculation(id,e.mode,values);near(get(r,e.expected.label).value,e.expected.value);assert.deepEqual(await runClientCalculation(id,c.category,e.mode,values),r);const href=calculatorPresetHref('/'+id+'-calculator',e.mode,e.values),decoded=sharedInputs(c,'',href.slice(href.indexOf('#')))!;assert.equal(decoded.mode.id,e.mode);assert.deepEqual(decoded.values,values);assert.ok(resultContext(id,e.mode,values,r));}
 }
});
