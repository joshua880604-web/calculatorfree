import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,routeFor,runCalculation} from '../src/lib/calculators';
import {defaults,type Result} from '../src/lib/types';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
import content from '../src/lib/four-comparison-content.json';
import refs from './four-comparison-reference.json';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {directorySearch} from '../src/lib/directory';
import {calculators as catalog} from '../src/lib/catalog';
import {glossaryForCalculator} from '../src/lib/glossary';
import {editorialGuides} from '../src/lib/editorial-guides';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {sitemapEntries,contentUpdatedOn} from '../src/lib/seo';
import {resultExportData} from '../src/lib/result-export';
import {hasShareTools,hasEmbed,hasPinterest} from '../src/lib/share-tools';
const calc=(id:string)=>calculators.find(c=>c.id===id)!;
const run=(id:string,mode:string,patch:Record<string,string|number|undefined>={})=>{const c=calc(id),m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))});};
const get=(r:Result,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};
const n=(r:Result,label:string)=>get(r,label).value;
const near=(a:number,b:number,tol=.000001)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(const [id,g] of Object.entries(content)){
 test(`New comparison page coverage: ${id}`,()=>{assert.equal(g.questions.length,8);assert.equal(g.examples.length,3);assert.equal(g.checkedOn,'2026-11-06');assert.ok(calculatorCategory(id));assert.ok(glossaryForCalculator(id).length);assert.ok(editorialGuides.some(g=>g.calculatorIds.includes(id)));assert.ok(hasShareTools(id));assert.ok(!hasEmbed(id));assert.ok(!hasPinterest(id));assert.equal(directorySearch(catalog,calc(id).title)[0].tool.id,id);assert.equal(sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true}).filter(e=>e.url==='https://www.calculatorfree.io/'+id+'-calculator').length,1);assert.equal(contentUpdatedOn[routeFor(id)],'2026-11-06');});
 for(const e of g.examples)test(`Independent worked example: ${id}/${e.title}`,()=>near(n(run(id,e.mode,e.values),e.expected.label),e.expected.value,.005));
 for(const m of calc(id).modes)test(`New comparison lazy client, share and export: ${id}/${m.id}`,async()=>{const c=calc(id),v=defaults(m),r=run(id,m.id);assert.deepEqual(await runClientCalculation(id,c.category,m.id,v),r);const link=new URL(calculationLink('https://www.calculatorfree.io',routeFor(id),m,v,true));const shared=sharedInputs(c,link.search,link.hash)!;assert.deepEqual(shared.values,v);assert.equal(shared.mode.id,m.id);assert.ok((await resultExportData(id,m,v,r)).scope);});
}
test('CD ladder: equal APYs reconcile regardless of maturity timing',()=>{
 const r=run('cd-ladder','ladder');near(n(r,'Ending ladder wealth'),50000*1.04**5);near(n(r,'Ladder minus single-CD wealth'),0);near(n(r,'Retained cash at horizon'),10000*1.04**5);assert.ok(n(r,'Accrued assets still in CDs')>48000);
 const monthly=run('cd-ladder','ladder',{rungs:'1000, 1, 12',renewal_term:1,renewal_apy:12,horizon:12,single_apy:12});near(n(monthly,'Ending ladder wealth'),1120);
});
test('CD ladder: independently compounded mixed rates and renewals',()=>{const r=run('cd-ladder','ladder',{rungs:'1000, 12, 4\n2000, 24, 5',horizon:36,renewal_term:12,renewal_apy:6});near(n(r,'Ending ladder wealth'),refs.mixedLadderWealth);assert.equal(r.additionalTables![0].rows.length,5);});
test('CD ladder: withdrawn interest is retained, not compounded or spent',()=>{const r=run('cd-ladder','ladder',{rungs:'1000, 12, 10',horizon:18,renewal_term:12,renewal_apy:10,interest:'Withdraw interest at maturity'});near(n(r,'Retained cash at horizon'),100);near(n(r,'Accrued assets still in CDs'),1000*Math.sqrt(1.1));});
test('CD ladder: no maturity before the horizon and zero rates',()=>{const r=run('cd-ladder','ladder',{rungs:'1000, 24, 0',horizon:12});near(n(r,'Ending ladder wealth'),1000);near(n(r,'Retained cash at horizon'),0);assert.equal(r.additionalTables![0].rows.length,0);});
for(const rungs of ['', '0,12,4','1000,12.5,4','1000,0,4','1000,12,-1','1000,12,Infinity','1,000,12,4',Array(21).fill('1000,12,4').join('\n')])test(`CD ladder invalid row: ${rungs.slice(0,30)}`,()=>assert.throws(()=>run('cd-ladder','ladder',{rungs})));
test('NPV matches independent high-precision discounted annuity',()=>near(n(run('npv','periodic'),'Net present value'),refs.npvAnnual));
test('NPV counts initial and later signed flows once at zero rate',()=>{const r=run('npv','periodic',{flows:'-1000\n500\n-300\n1000',rate:0});near(n(r,'Net present value'),200);near(n(r,'Present value of inflows'),1500);near(n(r,'Present value of outflows'),1300);});
test('NPV monthly conversion and negative discount rates',()=>{near(n(run('npv','periodic',{flows:'-100\n110',frequency:'Monthly',rate:(1.01**12-1)*100}),'Net present value'),-100+110/1.01);near(n(run('npv','periodic',{flows:'-100\n90',rate:-10}),'Net present value'),0);});
test('XNPV sorts dates, aggregates same-day effects, and uses leap-year ACT/365',()=>{
 const r=run('npv','dated',{flows:'2029-01-01, 1100\n2028-01-01, -600\n2028-01-01, -400',rate:10});near(n(r,'Net present value'),-1000+1100/1.1**(366/365));assert.equal(r.rows![0][0],'2028-01-01');
 near(n(run('npv','dated',{flows:'2026-01-01, -1000\n2026-01-01, 1100',rate:10}),'Net present value'),100);
});
for(const patch of [{flows:'2026-02-30, 100'},{flows:'2026-13-01, 100'},{flows:'2026-1-01, 100'},{flows:'2026-01-01, NaN'},{rate:-100},{rate:1001}])test(`XNPV invalid input: ${JSON.stringify(patch)}`,()=>assert.throws(()=>run('npv','dated',patch)));
test('NPV upper and lower rate sensitivity bounds remain finite',()=>{for(const rate of [-99,1000]){const r=run('npv','periodic',{rate,flows:'-100\n110'});assert.ok(r.additionalTables![0].rows.every(x=>Number.isFinite(x[1])));}});
test('NPV long low-discount scenarios reject overflow',()=>assert.throws(()=>run('npv','periodic',{rate:-99,flows:Array(500).fill('1000000000000').join('\n')})));
test('Car purchase balance and net cost match independent closed-form Decimal values',()=>{const r=run('lease-vs-buy-car','comparison');near(n(r,'Scheduled monthly purchase loan payment'),refs.car.payment);near(n(r,'Purchase loan balance at comparison end'),refs.car.balance);near(n(r,'Net cost: buy and sell'),refs.car.netCost);});
test('Car negative equity is added to cost and a paid-off loan stays zero',()=>{
 const r=run('lease-vs-buy-car','comparison',{price:10000,buy_fees:0,loan:10000,rate:0,term:60,months:12,resale:5000,buy_operating:0});near(n(r,'Net sale equity after repaying loan'),-3000);near(n(r,'Net cost: buy and sell'),5000);
 const done=run('lease-vs-buy-car','comparison',{price:10000,buy_fees:0,loan:10000,rate:0,term:12,months:36});near(n(done,'Purchase loan balance at comparison end'),0);assert.ok(done.rows!.slice(12).every(row=>row[2]===200));
});
test('Lease first payment is included once and mileage is prorated',()=>{const r=run('lease-vs-buy-car','comparison',{months:18,lease_payment:400,lease_upfront:1000,lease_end:0,lease_operating:0,annual_miles:12000,allowed_miles:10000,per_mile:.25});near(n(r,'Net cost: lease'),8950);near(n(r,'Excess-mileage charge'),750);});
for(const patch of [{loan:40000},{months:0},{months:36.5},{rate:-1},{per_mile:-.25}])test(`Car invalid input: ${JSON.stringify(patch)}`,()=>assert.throws(()=>run('lease-vs-buy-car','comparison',patch)));
test('Mortgage payment, balance and interest match independent Decimal reference',()=>{const r=run('mortgage-comparison','offers',{a_points:0,a_fees:0});near(n(r,'Scheduled monthly payment: A'),refs.mortgage.payment);near(n(r,'Remaining balance: A'),refs.mortgage.balance);near(n(r,'Interest through horizon: A'),refs.mortgage.interest);near(n(r,'Fee-adjusted annual rate estimate: A'),6.5);});
test('Mortgage fees reconcile upfront and financed once',()=>{for(const fee_payment of ['Paid upfront','Financed']){const r=run('mortgage-comparison','offers',{a_points:1,a_fees:2000,a_fee_payment:fee_payment});near(n(r,'Included fees: A'),5000);near(n(r,'Borrowing cost through horizon: A'),n(r,'Interest through horizon: A')+5000);assert.ok(n(r,'Fee-adjusted annual rate estimate: A')>6.5);}});
test('Mortgage estimate uses contractual payments while extra principal lowers horizon interest',()=>{const a=run('mortgage-comparison','offers'),b=run('mortgage-comparison','offers',{extra:500});near(n(a,'Fee-adjusted annual rate estimate: A'),n(b,'Fee-adjusted annual rate estimate: A'));assert.ok(n(b,'Interest through horizon: A')<n(a,'Interest through horizon: A'));});
test('Mortgage full payoff stops payments and interest for later horizon months',()=>{const r=run('mortgage-comparison','offers',{loan:1000,b_fees:0,b_points:0,a_rate:0,a_fees:0,a_points:0,a_term:12,horizon:24,extra:1000});near(n(r,'Remaining balance: A'),0);near(n(r,'Cash paid through horizon: A'),1000);assert.ok(r.rows!.slice(1).every(row=>row[1]===0&&row[2]===0&&row[3]===0));});
test('Mortgage identical offers tie and small-principal fees have finite annual rates',()=>{const r=run('mortgage-comparison','offers',{b_rate:6.5,b_points:0});assert.match(get(r,'Lower-cost option').displayValue!,/Equal/);near(n(r,'Borrowing-cost advantage of offer A'),0);const small=run('mortgage-comparison','offers',{loan:100,b_fees:0,b_points:0,a_fees:10,a_points:0});assert.ok(n(small,'Fee-adjusted annual rate estimate: A')>6.5);});
for(const patch of [{loan:0},{a_term:1.5},{a_fees:300000},{horizon:601},{a_fee_payment:'Invalid'}])test(`Mortgage invalid input: ${JSON.stringify(patch)}`,()=>assert.throws(()=>run('mortgage-comparison','offers',patch)));
