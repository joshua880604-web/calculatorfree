import type {Values} from '../src/lib/types';
import test from 'node:test';import assert from 'node:assert/strict';
import fixtures from './fixtures/priority-two-expected.json';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {cardMinimumResult,cardMinimumCalculator} from '../src/lib/calculators/credit-card-minimum-payment';
import {capRatePlan,capRateCalculator} from '../src/lib/calculators/cap-rate';
import {runClientCalculation} from '../src/lib/calculate-client';import {resultTrend} from '../src/lib/result-trend';import {calculatorSchema,sitemapEntries} from '../src/lib/seo';import {hasShareTools,hasEmbed,hasPinterest} from '../src/lib/share-tools';import {guides} from '../src/lib/guides';import {calculatorPresetHref} from '../src/lib/preset-links';import {sharedInputs} from '../src/lib/sharing';
const close=(a:number,b:number,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const value=(r:ReturnType<typeof capRatePlan>,label:string)=>r.metrics.find(m=>m.label===label)!.value;
test('36 minimum-payment cases agree with independent 60-digit Decimal schedules, including zero and impossible payments',()=>{
 for(const f of fixtures.card){if(f.error){assert.throws(()=>cardMinimumResult(f.values));continue;}const r=cardMinimumResult(f.values);close(value(r,'Initial modeled minimum payment'),f.firstMinimum!);close(value(r,'Initial payment including extra'),f.firstPayment!);close(value(r,'Months to repay'),f.months!);close(value(r,'Total interest'),f.interest!);close(value(r,'Total payments'),f.total!);assert.equal(r.rows!.length,f.rows!.length);r.rows!.forEach((row,i)=>row.forEach((n,j)=>close(Number(n),f.rows![i][j])));}
});
test('42 cap-rate and capitalization-value cases match independent Decimal results, with signed NOI and undefined positive value',()=>{
 for(const f of fixtures.cap){const r=capRatePlan(f.values);close(value(r,'Capitalization rate'),f.rate);close(value(r,'Annual NOI needed at target cap rate'),f.needed);close(value(r,'NOI surplus / shortfall versus target'),f.surplus);const implied=r.metrics.find(m=>m.label==='Indicated value at target cap rate')!;if(f.implied===null)assert.match(implied.displayValue!,/zero or negative/);else close(implied.value,f.implied,.00001);}
});
test('Minimum payments preserve debt, interest and final-payment conservation, with declining total payments and explicit extra',()=>{
 const r=cardMinimumResult(defaults(cardMinimumCalculator.modes[0]));let balance=5000,paid=0,interest=0,principal=0;for(const row of r.rows!){const [,p,i,pr,b]=row.map(Number);close(p,i+pr);close(balance-pr,b);balance=b;paid+=p;interest+=i;principal+=pr;}close(principal,5000);close(paid,5000+interest);close(balance,0);assert.ok(Number(r.rows![1][1])<Number(r.rows![0][1]));
 const extra=cardMinimumResult({...defaults(cardMinimumCalculator.modes[0]),extra:'50'});assert.ok(value(extra,'Months to repay')<value(r,'Months to repay'));assert.ok(value(extra,'Total interest')<value(r,'Total interest'));close(value(extra,'Initial payment including extra'),250);
 const tiny=cardMinimumResult({...defaults(cardMinimumCalculator.modes[0]),principal:'10',extra:'50'});close(value(tiny,'Initial payment including extra'),10.2);assert.equal(tiny.rows!.length,1);
});
test('Percentage plus interest and percentage alone are different payment rules; invalid inputs and non-amortization fail',()=>{
 const d=defaults(cardMinimumCalculator.modes[0]);assert.throws(()=>cardMinimumResult({...d,interest_extra:'No'}),/cover interest/);const no=cardMinimumResult({...d,interest_extra:'No',extra:'50'});close(value(no,'Initial modeled minimum payment'),100);close(value(no,'Initial payment including extra'),150);assert.ok(no.metrics.find(m=>m.label==='Interest saved versus minimum only')!.displayValue);
 for(const patch of [{rate:'101'},{rate:'NaN'},{minimum:'-1'},{floor:'-1'},{principal:'-1'},{interest_extra:'Unknown'},{extra:''},{principal:'1000000001'}] as Values[])assert.throws(()=>cardMinimumResult({...d,...patch}));
});
test('Rental NOI is annualized exactly once and excludes financing; monthly and equivalent annual inputs agree',()=>{
 const m=defaults(capRateCalculator.modes[1]),monthly=capRatePlan(m,true),annual:Values={...m,period:'Annually'};for(const f of capRateCalculator.modes[1].fields)if(f.unit==='$/period')annual[f.key]=String(Number(m[f.key])*12);const yearly=capRatePlan(annual,true);close(value(monthly,'Annual net operating income'),31800);close(value(monthly,'Capitalization rate'),10.6);assert.deepEqual(monthly.metrics,yearly.metrics);assert.deepEqual(monthly.additionalTables,yearly.additionalTables);assert.ok(!capRateCalculator.modes[1].fields.some(f=>f.key==='loan'));
 const empty=capRatePlan({...m,rent:'0',other_income:'0'},true);assert.ok(value(empty,'Capitalization rate')<0);assert.ok(empty.metrics[3].displayValue);const vacant=capRatePlan({...m,vacancy:'100'},true);close(value(vacant,'Annual net operating income'),-13800);
 for(const patch of [{value:'0'},{value:'-1'},{target:'0'},{target:'101'},{noi:'Infinity'}] as Values[])assert.throws(()=>capRatePlan({...defaults(capRateCalculator.modes[0]),...patch}));assert.throws(()=>capRatePlan({...m,vacancy:'101'},true));assert.throws(()=>capRatePlan({...m,period:'Daily'},true));
});
test('New tools keep lazy-client math, full fragment restoration, annual CSV data and the real repayment chart consistent',async()=>{
 for(const c of [cardMinimumCalculator,capRateCalculator])for(const m of c.modes){const d=defaults(m),r=runCalculation(c.id,m.id,d);assert.deepEqual(await runClientCalculation(c.id,c.category,m.id,d),r);const url=new URL(calculatorPresetHref(routeFor(c.id),m.id,d),'https://www.calculatorfree.io');assert.deepEqual(sharedInputs(c,'',url.hash)!.values,d);assert.ok(hasShareTools(c.id));assert.equal(hasEmbed(c.id),true);assert.equal(hasPinterest(c.id),true);if(c.id==='credit-card-minimum-payment'){assert.ok(r.annualRows?.length);const trend=resultTrend(c.id,m.id,d,r)!;assert.equal(trend.points.at(-1)!.balance,r.rows!.at(-1)![4]);}else assert.equal(resultTrend(c.id,m.id,d,r),null);}
});
test('Each focused tool has a distinct canonical, visible researched FAQ, no fake ratings, and no ambiguous search ownership',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};for(const id of ['credit-card-minimum-payment','cap-rate']){const c=calculators.find(c=>c.id===id)!;assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+routeFor(id).slice(0,-5)).length,1);assert.equal(guides[id].questions.length,id==='cap-rate'?11:11);assert.equal(guides[id].examples.length,2);const schema=JSON.stringify(calculatorSchema(c,config));assert.match(schema,/WebApplication/);assert.doesNotMatch(schema,/aggregateRating/);}
});
