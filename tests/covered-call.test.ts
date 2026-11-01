import {test} from 'node:test';
import assert from 'node:assert/strict';
import {coveredCallCalculator as calc,coveredCallPlan} from '../src/lib/calculators/covered-call';
import {defaults,type Result} from '../src/lib/types';
import {runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {resultTrend} from '../src/lib/result-trend';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {sitemapEntries,calculatorSchema} from '../src/lib/seo';
const mode=calc.modes[0],input=(p:Record<string,string|number>={})=>({...defaults(mode),...Object.fromEntries(Object.entries(p).map(([k,n])=>[k,String(n)]))});
const run=(p:Record<string,string|number>={})=>runCalculation(calc.id,mode.id,input(p));
const n=(r:Result,label:string)=>{const m=r.metrics.find(x=>x.label===label);assert.ok(m,label);return m.value;};
const close=(a:number,b:number,t=.000001)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const basic={stock:50,strike:55,premium:2,contracts:1,stock_fee:0,option_fee:0,exit_fee:0,expiry:60,days:30};
test('Covered call standard buy-write matches independent expiry intrinsic-value arithmetic',()=>{
 const r=run(basic);for(const [label,value] of Object.entries({'Covered call profit / loss at your expiry price':700,'Net initial debit':4800,'Gross option premium received':200,'Break-even stock price':48,'Maximum expiry profit (may be negative)':700,'Worst-case loss at zero stock price':4800,'Shares-only profit / loss at your expiry price':1000,'Covered call minus shares-only profit':-300}))close(n(r,label),value);
});
test('Covered call stock decline retains loss even after premium receipt',()=>{
 const r=run({...basic,expiry:40});close(n(r,'Covered call profit / loss at your expiry price'),-800);close(n(r,'Covered call minus shares-only profit'),200);
});
test('Covered call zero stock value reaches reported worst-case loss',()=>{
 const r=run({...basic,expiry:0});close(n(r,'Covered call profit / loss at your expiry price'),-n(r,'Worst-case loss at zero stock price'));close(n(r,'Shares-only profit / loss at your expiry price'),-5000);
});
test('Covered call fees reconcile initial debit, exit payoff and consistent stock-only alternative',()=>{
 const r=run({...basic,contracts:2,stock_fee:5,option_fee:.65,exit_fee:3,expiry:45});close(n(r,'Net initial debit'),9606.3);close(n(r,'Covered call profit / loss at your expiry price'),-609.3);close(n(r,'Shares-only profit / loss at your expiry price'),-1008);close(n(r,'Covered call minus shares-only profit'),398.7);close(n(r,'Break-even stock price'),9609.3/200);close(n(r,'Worst-case loss at zero stock price'),9609.3);
});
test('Covered call contract multiplier scales share and option fees but not fixed position fees',()=>{
 const a=run({...basic,option_fee:1}),b=run({...basic,option_fee:1,contracts:3});close(n(b,'Shares purchased and fully covered'),300);close(n(b,'Net initial debit'),3*n(a,'Net initial debit'));const c=run({...basic,option_fee:1,contracts:3,stock_fee:5,exit_fee:7});close(n(c,'Net initial debit')-n(b,'Net initial debit'),5);close(n(b,'Covered call profit / loss at your expiry price')-n(c,'Covered call profit / loss at your expiry price'),12);
});
test('Covered call premium per share becomes 100 times contracts, never treated as pure profit',()=>{
 const r=run({...basic,premium:1.25,contracts:4,expiry:45});close(n(r,'Gross option premium received'),500);close(n(r,'Covered call profit / loss at your expiry price'),-1500);
});
test('Covered call zero premium and zero fees is stock-only below strike and capped above',()=>{
 for(const expiry of [0,30,50,55,70]){const r=run({...basic,premium:0,expiry});close(n(r,'Covered call profit / loss at your expiry price'),(Math.min(expiry,55)-50)*100);assert.ok(n(r,'Covered call profit / loss at your expiry price')<=n(r,'Shares-only profit / loss at your expiry price'))}
});
test('Covered call flat and upside scenarios remain capped at exactly the strike result',()=>{
 const at=run({...basic,expiry:55}),up=run({...basic,expiry:1e6});close(n(at,'Covered call profit / loss at your expiry price'),n(up,'Covered call profit / loss at your expiry price'));assert.match(at.metrics.at(-1)!.displayValue!,/uncertain/);assert.match(up.metrics.at(-1)!.displayValue!,/assigned/);assert.match(run({...basic,expiry:54}).metrics.at(-1)!.displayValue!,/unexercised/);
});
test('Covered call break-even includes entry and exit fees and has zero P/L at that price',()=>{
 const p={...basic,stock_fee:4,option_fee:1,exit_fee:5},r=run(p),be=n(r,'Break-even stock price');close(be,48.1);close(n(run({...p,expiry:be}),'Covered call profit / loss at your expiry price'),0);
});
test('Covered call below-entry strike can yield a negative maximum with no reachable break-even',()=>{
 const r=run({...basic,strike:40});close(n(r,'Maximum expiry profit (may be negative)'),-800);assert.match(r.metrics.find(m=>m.label==='Break-even stock price')!.displayValue!,/No break-even/);assert.ok(r.rows!.every(row=>Number(row[1])<0));
});
test('Covered call exact break-even at strike permits zero maximum but no positive profit',()=>{
 const r=run({...basic,strike:48});close(n(r,'Maximum expiry profit (may be negative)'),0);close(n(r,'Break-even stock price'),48);assert.equal(r.metrics.find(m=>m.label==='Break-even stock price')!.displayValue,undefined);
});
test('Covered call ROI uses positive net debit, with simple annualization affecting no payoff',()=>{
 const a=run(basic),b=run({...basic,days:7});close(n(a,'Expiry return on net initial debit'),700/4800*100);close(n(a,'Covered call profit / loss at your expiry price'),n(b,'Covered call profit / loss at your expiry price'));close(n(b,'Simple annualized maximum return (illustration only)'),700/4800*100*365/7);
});
test('Covered call scenario rows conserve long-stock plus short-call economic value',()=>{
 const p={...basic,contracts:3,option_fee:.5,stock_fee:7,exit_fee:4},r=run(p),q=300;
 for(const row of r.rows!){const s=Number(row[0]),stock=(s-50)*q-7-4,option=2*q-.5*3-Math.max(s-55,0)*q;close(Number(row[1]),stock+option);close(Number(row[2]),stock);close(Number(row[3]),option);}
 assert.ok(r.rows!.some(row=>row[0]===55));assert.ok(r.rows!.some(row=>row[0]===60));assert.equal(r.rows![0][0],0);
});
test('Covered call reconciliation tables correctly sum signed components',()=>{
 const r=run({...basic,stock_fee:5,option_fee:1,exit_fee:4});const initial=r.additionalTables![0].rows;close(initial.slice(0,-1).reduce((s,row)=>s+Number(row[1]),0),n(r,'Net initial debit'));const expiry=r.additionalTables![1].rows;close(expiry.slice(0,2).reduce((s,row)=>s+Number(row[1]),0),Number(expiry[2][1]));close(Number(expiry[2][1])+Number(expiry[3][1])+Number(expiry[4][1]),Number(expiry[5][1]));
});
test('Covered call payoff chart uses calculated expiry prices and both P/L series, not time',()=>{
 const v=input(),r=run(),t=resultTrend(calc.id,mode.id,v,r)!;assert.match(t.xLabel,/Stock price at expiry/);assert.equal(t.secondaryLabel,'Shares-only P/L');assert.equal(t.points.length,r.rows!.length);for(let i=0;i<t.points.length;i++){assert.equal(t.points[i].x,r.rows![i][0]);assert.equal(t.points[i].balance,r.rows![i][1]);assert.equal(t.points[i].comparison,r.rows![i][2]);}assert.match(t.help,/not a time path/);
});
test('Covered call rejects invalid units, missing data, fractional contracts and net-credit trades',()=>{
 for(const p of [{stock:0},{strike:0},{premium:-1},{contracts:0},{contracts:1.5},{contracts:10001},{days:0},{days:1.5},{days:3651},{stock_fee:-1},{option_fee:-1},{exit_fee:-1},{expiry:-1},{expiry:1e7},{stock:''},{premium:'NaN'},{premium:50}] as Record<string,string|number>[])assert.throws(()=>coveredCallPlan(input({...basic,...p})));
});
test('Covered call bounded extremes keep every number finite and a positive debit is required',()=>{
 const r=run({...basic,stock:1e6,strike:1e6,premium:0,contracts:10000,stock_fee:1e6,option_fee:1e6,exit_fee:1e6,expiry:1e6,days:1});assert.ok(r.metrics.every(m=>Number.isFinite(m.value)));assert.ok(r.rows!.every(row=>row.every(x=>Number.isFinite(x))));assert.throws(()=>run({...basic,premium:50.01}));
});
test('Covered call client engine and original fee-aware worked examples match',async()=>{
 assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,input()),run());for(const e of guides[calc.id].examples)close(n(run(e.values),e.expected.label),e.expected.value);assert.equal(guides[calc.id].questions.length,13);
});
test('Covered call has one canonical investment page, relevant links and no invented rating',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+'/covered-call-calculator').length,1);assert.equal(calculatorCategory(calc.id)!.id,'saving-investing');for(const id of ['roi','investment','average-return'])assert.ok(relatedCalculatorIds[id].includes(calc.id));const s=JSON.stringify(calculatorSchema(calc,config));assert.match(s,/WebApplication/);assert.doesNotMatch(s,/aggregateRating/);
});
