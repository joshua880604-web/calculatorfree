import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,routeFor} from '../src/lib/calculators';
import {calculators as catalog} from '../src/lib/catalog';
import {defaults,type Values,type Result} from '../src/lib/types';
import {calculateMode} from '../src/lib/calculate-mode';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides} from '../src/lib/guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {directorySearch} from '../src/lib/directory';
import {hasShareTools} from '../src/lib/share-tools';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {calculatorScope} from '../src/lib/calculator-scope';
import {sitemapEntries} from '../src/lib/seo';
import {expansionFieldVisible} from '../src/lib/expansion-field-visibility';

const ids=['retirement-withdrawal','balance-transfer','dscr','fsa','closing-cost'];
const calc=(id:string)=>calculators.find(c=>c.id===id)!;
const run=(id:string,mode:string,patch:Record<string,string|number>={})=>{const c=calc(id),m=c.modes.find(m=>m.id===mode)!;return calculateMode(c,m.id,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});};
const m=(r:Result,label:string)=>{const metric=r.metrics.find(m=>m.label===label);assert.ok(metric,`Missing metric: ${label}`);return metric.value;};
const near=(a:number,b:number,tol=1e-6)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
const zeroRetirement={balance:12000,years:1,return:0,fee:0,inflation:0,income:0,income_start:0,tax:0};
const transfer={balance:600,payment:300,current_apr:12,a_fee_rate:3,a_fee_min:0,a_intro:0,a_months:12,a_after:24,a_fee_payment:'Added to balance'};
const fsa={year:'2026',plan_limit:3400,medical:1800,prescriptions:0,dental:0,vision:0,other:0,contribution:2000,pay_periods:20,federal:22,state:0,payroll:0,unused_rule:'Forfeit unused funds'};
const buyer={price:100000,down_unit:'Percent',down:20,points:0,origination:1000,appraisal:0,title:500,government:500,prepaids:300,escrow:700,other:0,paid_costs:500,deposit:5000,seller_credit:1000,lender_credit:0};

for(const id of ids){
 for(const e of guides[id].examples)test(`Expansion worked example: ${id} — ${e.title}`,()=>near(m(run(id,e.mode,e.values),e.expected.label),e.expected.value,(e.expected.tolerance??.005)/Math.max(1,Math.abs(e.expected.value))));
 for(const mode of calc(id).modes)test(`Expansion lazy client, sharing and defaults: ${id}/${mode.id}`,async()=>{
  const c=calc(id),values=defaults(mode),server=calculateMode(c,mode.id,values),client=await runClientCalculation(id,c.category,mode.id,values);
  assert.deepEqual(client,server);assert.ok(hasShareTools(id));assert.ok(calculatorScope(id,mode.id,values));
  const link=new URL(calculationLink('https://www.calculatorfree.io',routeFor(id),mode,values,true));assert.deepEqual(sharedInputs(c,link.search,link.hash)?.values,values);
 });
}

test('Expansion pages have complete guides, unique categories, search ownership and canonical sitemap entries',()=>{
 const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});
 for(const id of ids){assert.equal(calculators.filter(c=>c.id===id).length,1);assert.ok(calculatorCategory(id));assert.equal(guides[id].questions.length,7);assert.ok(guides[id].examples.length>=3);assert.ok(guides[id].sources.length>=2);assert.equal(guides[id].checkedOn,'2026-11-05');assert.equal(directorySearch(catalog,calc(id).title)[0]?.tool.id,id);assert.equal(entries.filter(x=>x.url==='https://www.calculatorfree.io/'+id+'-calculator').length,1);}
 for(const [query,id,mode] of [['DSCR loan calculator','dscr','rental-loan'],['seller closing cost calculator','closing-cost','seller'],['retirement withdrawal calculator','retirement-withdrawal','longevity']] as const){const found=directorySearch(catalog,query)[0];assert.equal(found.tool.id,id);if(mode==='seller')assert.match(found.href,/mode=seller/);}
});

test('Retirement distinguishes exact depletion, unfunded spending and sufficient other income',()=>{
 const exact=run('retirement-withdrawal','longevity',{...zeroRetirement,spending:1000});near(m(exact,'Portfolio balance at horizon'),0);assert.equal(m(exact,'First funding shortfall month'),0);
 const fail=run('retirement-withdrawal','longevity',{...zeroRetirement,spending:2000});assert.equal(m(fail,'First funding shortfall month'),7);near(m(fail,'Total unfunded spending'),12000);
 const covered=run('retirement-withdrawal','longevity',{...zeroRetirement,balance:0,spending:1000,income:1000});assert.equal(m(covered,'First funding shortfall month'),0);near(m(covered,'Total portfolio withdrawals before tax'),0);
 const delayed=run('retirement-withdrawal','longevity',{...zeroRetirement,balance:6000,years:2,spending:1000,income:1000,income_start:1});assert.equal(m(delayed,'First funding shortfall month'),7);near(m(delayed,'Total unfunded spending'),6000);near(Number(delayed.rows![1][7]),0);
 for(const row of exact.rows!)near(Number(row[1])+Number(row[4])-Number(row[5]),Number(row[8]));
 for(const patch of [{years:1.5},{income_start:.5},{return:-100},{fee:11},{tax:100},{inflation:-1},{balance:-1}])assert.throws(()=>run('retirement-withdrawal','longevity',{...zeroRetirement,spending:1000,...patch}));
});

test('Retirement budget matches an independent discounted-annuity solution and tax gross-up',()=>{
 const netMonthly=Math.pow(1.06,1/12)-1,n=120,pvFactor=(1-Math.pow(1+netMonthly,-n))/netMonthly;
 const r=run('retirement-withdrawal','budget',{...zeroRetirement,balance:120000,years:10,return:6});near(m(r,'Initial monthly spending budget'),120000/pvFactor);
 const taxed=run('retirement-withdrawal','budget',{...zeroRetirement,tax:20});near(m(taxed,'Initial monthly spending budget'),800);near(m(taxed,'Initial monthly portfolio withdrawal before tax'),1000);
 const indexed=run('retirement-withdrawal','longevity',{...zeroRetirement,balance:100000,years:2,inflation:10,spending:1000});near(Number(indexed.rows![0][2]),12000);near(Number(indexed.rows![1][2]),13200);
});

test('Balance transfer reconciles financed fees, upfront fees and exact promotion boundaries',()=>{
 const financed=run('balance-transfer','transfer',transfer);near(m(financed,'Total borrowing-cost savings from transfer'),-8.8494);near(m(financed,'Interest: Original card'),9.1506);
 const upfront=run('balance-transfer','transfer',{...transfer,a_fee_payment:'Paid separately'});assert.equal(upfront.rows!.length,2);near(m(upfront,'Transfer fee: offer A'),18);
 for(const r of [financed,upfront]){const principalPaid=r.rows!.reduce((s,row)=>s+Number(row[4])-Number(row[3]),0);near(principalPaid,transfer.balance+(r===financed?18:0));}
 const reset=run('balance-transfer','transfer',{...transfer,balance:1000,payment:100,a_fee_rate:0,a_months:2,a_after:12});near(Number(reset.rows![0][1]),0);near(Number(reset.rows![1][1]),0);near(Number(reset.rows![2][1]),12);near(Number(reset.rows![2][3]),8);near(m(reset,'Balance when offer A promotion ends'),800);
 const min=run('balance-transfer','transfer',{...transfer,a_fee_min:100});near(m(min,'Transfer fee: offer A'),100);
 const zero=run('balance-transfer','transfer',{...transfer,balance:0,a_fee_min:100});near(m(zero,'Transfer fee: offer A'),0);
 const none=run('balance-transfer','transfer',{...transfer,a_months:0});near(Number(none.rows![0][1]),24);assert.ok(none.metrics.find(x=>x.label==='Monthly payment to clear offer A during promotion')!.displayValue);
 const stalled=run('balance-transfer','transfer',{...transfer,balance:1000,payment:1,current_apr:100,a_months:0,a_after:100});assert.match(stalled.metrics[0].displayValue!,/Not comparable/);assert.equal(stalled.rows!.length,1200);
 for(const patch of [{payment:0},{a_months:1.5},{a_fee_rate:-1},{a_after:101},{a_fee_payment:'Unknown'}])assert.throws(()=>run('balance-transfer','transfer',{...transfer,...patch}));
});

test('DSCR loan capacity reproduces the selected target without double-counting property costs',()=>{
 for(const repayment of ['Amortizing','Interest only']){const base={rent:3000,loan:200000,rate:6,years:30,taxes:300,insurance:150,hoa:50,target:1.25,repayment};const r=run('dscr','rental-loan',base),capacity=m(r,'Maximum loan principal from DSCR only');const resized=run('dscr','rental-loan',{...base,loan:capacity});near(m(resized,'Rent-to-PITIA DSCR'),1.25);}
 const negative=run('dscr','noi',{noi:-100,debt:100,target:1.25});near(m(negative,'NOI-based DSCR'),-1);near(m(negative,'Maximum annual debt service at target'),0);
 const noDebt=run('dscr','noi',{noi:100,debt:0,target:1.25});assert.ok(noDebt.metrics[0].displayValue);
 const zeroIo=run('dscr','rental-loan',{rent:1000,loan:200000,rate:0,years:30,repayment:'Interest only',taxes:0,insurance:0,hoa:0,target:1.25});assert.ok(zeroIo.metrics[0].displayValue);assert.match(zeroIo.metrics.find(x=>x.label==='Maximum loan principal from DSCR only')!.displayValue!,/No finite/);
 const noCapacity=run('dscr','rental-loan',{rent:100,taxes:200,insurance:0,hoa:0});near(m(noCapacity,'Maximum loan principal from DSCR only'),0);
 for(const patch of [{years:1.5},{target:0},{rate:-1},{repayment:'Unknown'}] as Record<string,string|number>[])assert.throws(()=>run('dscr','rental-loan',patch));
});

test('Health FSA applies plan-year caps, loss accounting and mutually exclusive employer rules',()=>{
 const none=run('fsa','health',fsa);near(m(none,'Estimated annual tax saving'),440);near(m(none,'Modeled forfeiture'),200);near(m(none,'Tax saving less modeled forfeiture'),240);near(m(none,'Salary deduction per pay period'),100);
 for(const [rule,patch] of [['Carryover',{carry_limit:100}],['Grace period',{grace_expenses:100}]] as const){const r=run('fsa','health',{...fsa,unused_rule:rule,...patch});near(m(r,'Modeled forfeiture'),100);near(m(r,'Estimated carryover to next year')+m(r,'Reimbursements from selected grace-period expenses')+m(r,'Modeled forfeiture'),200);}
 const cap=run('fsa','health',{...fsa,year:'2025',medical:0,contribution:1000,unused_rule:'Carryover',carry_limit:1000});near(m(cap,'Employee contribution limit used'),3300);near(m(cap,'Estimated carryover to next year'),660);
 assert.throws(()=>run('fsa','health',{...fsa,year:'2025',contribution:3400}));assert.throws(()=>run('fsa','health',{...fsa,plan_limit:1000}));assert.throws(()=>run('fsa','health',{...fsa,pay_periods:1.5}));assert.throws(()=>run('fsa','health',{...fsa,federal:50,state:30,payroll:20}));assert.throws(()=>run('fsa','health',{...fsa,year:'2027'}));
 const hidden=run('fsa','health',{...fsa,carry_limit:'not a number',grace_expenses:'not a number'});near(m(hidden,'Modeled forfeiture'),200);assert.equal(expansionFieldVisible('fsa',fsa as unknown as Values,'carry_limit'),false);
});

test('Closing settlement cash counts prior payments and credits once, preserves refunds and negative seller proceeds',()=>{
 const r=run('closing-cost','buyer',buyer);near(m(r,'Estimated cash due / refund at closing'),16500);near(m(r,'Total buyer cash outlay including prior payments'),22000);
 const dollar=run('closing-cost','buyer',{...buyer,down_unit:'Dollars',down:20000});assert.deepEqual(dollar,r);
 const excess=run('closing-cost','buyer',{...buyer,seller_credit:5000,lender_credit:5000});near(m(excess,'Credits applied to itemized costs'),3000);near(m(excess,'Credits not applied by this worksheet'),7000);near(m(excess,'Estimated cash due / refund at closing'),14500);
 const refund=run('closing-cost','buyer',{...buyer,deposit:30000});near(m(refund,'Estimated cash due / refund at closing'),-8500);near(m(refund,'Total buyer cash outlay including prior payments'),22000);
 const seller=run('closing-cost','seller',{price:100000,payoff:100000,commission_unit:'Dollars',commission:0,title:1000,government:0,other:0,buyer_credit:0});near(m(seller,'Estimated net sale proceeds / cash required'),-1000);
 assert.throws(()=>run('closing-cost','buyer',{...buyer,down:101}));assert.throws(()=>run('closing-cost','buyer',{...buyer,paid_costs:3001}));assert.throws(()=>run('closing-cost','seller',{commission_unit:'Percent',commission:101}));
});
