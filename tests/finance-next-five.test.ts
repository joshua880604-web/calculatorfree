import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import fixtures from '../docs/financial-clone/evidence/finance-next-five-decimal-20261117.json';
import content from '../src/lib/finance-next-five-content.json';
import articles from '../src/lib/finance-next-five-guide-content.json';
import terms from '../src/lib/finance-next-five-glossary.json';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs,formatMetric} from '../src/lib/sharing';
import {sitemapEntries} from '../src/lib/seo';
import {addCalendarMonths,isoDate,singleLifeAnnuityFactor} from '../src/lib/calculators/sepp';
import {fixedPayment} from '../src/lib/calculators/mortgage-buydown';
const run=(id:string,mode:string,patch:Record<string,string|number>={})=>{
 const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;
 return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});
};
const get=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};
const near=(a:number,b:number,t=1e-7)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
test('All thirteen modes match independent Decimal numerical fixtures',()=>{
 assert.equal(fixtures.fixtures.length,27);assert.equal(new Set(fixtures.fixtures.map(f=>f.id+':'+f.mode)).size,13);
 for(const f of fixtures.fixtures){const r=run(f.id,f.mode,f.values as unknown as Record<string,string|number>);for(const [label,expected] of Object.entries(f.expected))near(get(r,label).value,Number(expected));}
});
test('Temporary subsidy never changes contract amortization or lender payment',()=>{
 const two=run('mortgage-buydown','2-1'),three=run('mortgage-buydown','3-2-1');
 for(const r of [two,three]){
  const schedule=r.additionalTables![0].rows;
  near(schedule.reduce((s,r)=>s+Number(r[5]),0),300000,1e-6);
  near(Number(schedule.at(-1)![6]),0);near(schedule.reduce((s,r)=>s+Number(r[2]),0),get(r,'Total temporary subsidy funding').value);
  for(const row of schedule)near(Number(row[1])+Number(row[2]),Number(row[3]));
 }
 assert.deepEqual(two.additionalTables![0].rows.map(r=>r.slice(3)),three.additionalTables![0].rows.map(r=>r.slice(3)));
 near(fixedPayment(12000,0,12),1000);near(get(run('mortgage-buydown','1-0',{rate:1}),'First-year borrower monthly P&I').value,300000/360);
 assert.throws(()=>run('mortgage-buydown','3-2-1',{months:24}),/full year/);
 assert.throws(()=>run('mortgage-buydown','3-2-1',{rate:2}),/Negative/);
 assert.throws(()=>run('mortgage-buydown','2-1',{months:360.5}),/whole/);
});
test('Short-put loss, breakeven, fees and collateral stay distinct',()=>{
 const r=run('cash-secured-put','expiration');near(get(r,'Modeled expiration profit / loss').value,-504);near(get(r,'Cash secured at strike × shares').value,10000);
 near(get(run('cash-secured-put','expiration',{stock:47.52}),'Modeled expiration profit / loss').value,0);
 const fees=run('cash-secured-put','expiration',{fees:600,stock:60});near(get(fees,'Maximum expiration profit').value,-100);near(get(fees,'Expiration breakeven per share').value,50.5);
 assert.throws(()=>run('cash-secured-put','expiration',{contracts:1.5}),/whole/);
 assert.throws(()=>run('cash-secured-put','expiration',{premium:50}),/below the strike/);
 assert.throws(()=>run('cash-secured-put','expiration',{stock:-1}));
});
test('PI starts future flows at period one and can rank differently from NPV',()=>{
 near(get(run('profitability-index','known-pv',{initial:100,pv:100}),'Profitability index').value,1);
 near(get(run('profitability-index','periodic',{initial:100,flows:'110',rate:10}),'Profitability index').value,1);
 const a=run('profitability-index','periodic',{initial:1000,flows:'1500'}),b=run('profitability-index','periodic',{initial:10000,flows:'13000'});
 assert.ok(get(a,'Profitability index').value>get(b,'Profitability index').value);assert.ok(get(a,'Net present value').value<get(b,'Net present value').value);
 const negative=run('profitability-index','periodic',{initial:100,flows:'200\n-150',rate:0});near(get(negative,'Profitability index').value,.5);near(get(negative,'Net present value').value,-50);
 assert.throws(()=>run('profitability-index','known-pv',{initial:0}));
});
test('ROE does not disguise undefined or economically misleading denominators',()=>{
 for(const equity of [0,-100]){const r=run('return-on-equity','average',{equity});assert.ok(get(r,'Return on equity').displayValue);assert.notEqual(formatMetric(get(r,'Return on equity')),'0.0000%');}
 assert.match(get(run('return-on-equity','balances',{begin_equity:-100,end_equity:300}),'Return on equity').displayValue!,/crossing/);
 const zeroSales=run('return-on-equity','dupont',{sales:0});near(get(zeroSales,'Return on equity').value,16);assert.ok(get(zeroSales,'DuPont return on equity').displayValue);
 const r=run('return-on-equity','dupont');near(get(r,'DuPont return on equity').value,get(r,'Return on equity').value);
});
test('SEPP first-year tables, rate ceiling and dates obey the disclosed scope',()=>{
 near(singleLifeAnnuityFactor(50,.04),18.1568,.00005);
 const n=run('72t','rmd');near(get(n,'Calculation divisor / annuity factor').value,36.2);
 const first=run('72t','amortization',{birth:'1968-08-15',start:'2024-12-01',valuation:'2023-12-31'});assert.equal(get(first,'Earliest general duration milestone').displayValue,'2029-12-01');
 const second=run('72t','rmd',{birth:'1968-08-15',start:'2023-12-01',valuation:'2022-12-31'});assert.equal(get(second,'Earliest general duration milestone').displayValue,'2028-12-01');
 assert.throws(()=>run('72t','amortization',{rate:5.01}),/exceeds/);
 near(get(run('72t','amortization',{rate:5.5,afr_prior:5.52}),'Ceiling from baseline and entered IRS rates').value,5.52);
 assert.throws(()=>run('72t','rmd',{valuation:'2026-01-01'}),/prior December/);
 assert.throws(()=>run('72t','amortization',{valuation:'2024-12-31'}),/valuation date/);
 assert.throws(()=>run('72t','rmd',{birth:'2026-02-30'}),/valid/);
 assert.throws(()=>run('72t','rmd',{start:'2022-12-01',valuation:'2021-12-31'}),/2023/);
 assert.throws(()=>run('72t','rmd',{birth:'1960-01-01'}),/before age/);
 assert.equal(addCalendarMonths(isoDate('2024-02-29'),12).toISOString().slice(0,10),'2025-02-28');
 assert.equal(addCalendarMonths(isoDate('1968-08-31'),714).toISOString().slice(0,10),'2028-02-29');
});
test('Every published mode has a complete working preset, lazy dispatch and indexable content cluster',async()=>{
 const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});
 for(const [id,g] of Object.entries(content)){
  const c=calculators.find(c=>c.id===id)!,article=articles[id as keyof typeof articles];
  assert.deepEqual(new Set(g.examples.map(e=>e.mode)),new Set(c.modes.map(m=>m.id)));
  assert.ok(terms.some(t=>t.tools.some(tool=>tool.id===id)));
  assert.ok(entries.some(e=>e.url==='https://www.calculatorfree.io/'+id+'-calculator'));
  assert.ok(entries.some(e=>e.url==='https://www.calculatorfree.io'+article.meta.path));
  for(const e of g.examples){
   const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());
   const values=Object.fromEntries(Object.entries(e.values).map(([k,v])=>[k,String(v)])),actual=runCalculation(id,e.mode,values);
   near(get(actual,e.expected.label).value,e.expected.value);
   assert.deepEqual(await runClientCalculation(id,c.category,e.mode,values),actual);
   const href=calculatorPresetHref('/'+id+'-calculator',e.mode,e.values),decoded=sharedInputs(c,'',href.slice(href.indexOf('#')))!;
   assert.equal(decoded.mode.id,e.mode);assert.deepEqual(decoded.values,values);
  }
 }
});
