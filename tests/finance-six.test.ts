import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import evidence from '../docs/financial-clone/evidence/finance-six-decimal-20261117.json';
import content from '../src/lib/finance-six-content.json';
import articles from '../src/lib/finance-six-guide-content.json';
import terms from '../src/lib/finance-six-glossary.json';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs,formatMetric} from '../src/lib/sharing';
import {sitemapEntries} from '../src/lib/seo';
import {resultContext} from '../src/lib/result-context';
const run=(id:string,mode:string,patch:Record<string,string|number>={})=>{const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});};
const get=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};
const near=(a:number,b:number,t=1e-7)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
test('All sixteen modes match thirty independent Decimal fixtures',()=>{
 assert.equal(evidence.fixtures.length,30);assert.equal(new Set(evidence.fixtures.map(f=>f.id+':'+f.mode)).size,16);
 for(const f of evidence.fixtures){const r=run(f.id,f.mode,f.values as unknown as Record<string,string|number>);for(const [label,expected] of Object.entries(f.expected))near(get(r,label).value,Number(expected));}
});
test('Reward units, annual caps and recurring bonus treatment remain separate',()=>{
 const a=run('credit-card-rewards','cashback');near(get(a,'Recurring annual net rewards before card interest').value,535);near(get(a,'First-year net including assumed one-time bonus').value,735);
 const p=run('credit-card-rewards','points');near(get(p,'Annual points / miles earned').value,60000);near(get(p,'Gross modeled annual reward value').value,600);
 const doubled=run('credit-card-rewards','points',{cents_per_point:2});near(get(doubled,'Gross modeled annual reward value').value,1200);near(get(doubled,'Annual points / miles earned').value,60000);
 const monthly=run('credit-card-rewards','cashback',{spend_period:'Monthly',categories:'1000, 3, 6000'}),yearly=run('credit-card-rewards','cashback',{categories:'12000, 3, 6000'});assert.deepEqual(monthly.metrics,yearly.metrics);near(get(monthly,'Gross modeled annual reward value').value,270);
 near(get(run('credit-card-rewards','cashback',{annual_fee:1000}),'Recurring annual net rewards before card interest').value,-370);
 const noBonus=run('credit-card-rewards','cashback',{bonus:0});near(get(noBonus,'Recurring annual net rewards before card interest').value,535);near(get(noBonus,'First-year net including assumed one-time bonus').value,535);
 assert.throws(()=>run('credit-card-rewards','cashback',{categories:'1000, 101, 0'}));
 assert.throws(()=>run('credit-card-rewards','cashback',{categories:'1000,3'}));
});
test('Flat plan comparison preserves signed advantages and honest crossing states',()=>{
 const cases:Record<string,string|number>[]=[{rate_a:1,rate_b:1,fee_a:0},{rate_a:1,rate_b:1},{rate_a:1,rate_b:2}];
 for(const patch of cases)assert.ok(get(run('credit-card-rewards','compare',patch),'Annual spend where recurring net rewards match').displayValue);
 near(get(run('credit-card-rewards','compare',{spend:9500}),'Recurring annual net advantage (A minus B)').value,0);
 const reverse=run('credit-card-rewards','compare',{rate_a:1,rate_b:2,fee_a:0,fee_b:95});near(get(reverse,'Annual spend where recurring net rewards match').value,9500);assert.ok(get(reverse,'Recurring annual net advantage (A minus B)').value<0);
});
test('Trade-ratio zero denominators never manufacture infinite or healthy multiples',()=>{
 const ar=run('accounts-receivable-turnover','average',{average_ar:0});assert.ok(get(ar,'Receivables turnover in selected period').displayValue);near(get(ar,'Average-balance DSO / collection days').value,0);
 const noSales=run('accounts-receivable-turnover','average',{credit_sales:0});assert.ok(get(noSales,'Average-balance DSO / collection days').displayValue);near(get(noSales,'Receivables turnover in selected period').value,0);
 const ap=run('days-payable-outstanding','purchases',{average_ap:0});near(get(ap,'Days payable outstanding').value,0);assert.ok(get(ap,'Payables turnover in selected period').displayValue);
 assert.ok(get(run('days-payable-outstanding','purchases',{purchases:0}),'Days payable outstanding').displayValue);
 assert.throws(()=>run('accounts-receivable-turnover','average',{days:90.5}),/whole/);
 assert.throws(()=>run('days-payable-outstanding','purchases',{days:0}));
});
test('Standalone ratios and both CCC financial modes reconcile with the same definitions',()=>{
 for(const mode of ['purchases','cogs']){
  const c=calculators.find(c=>c.id==='cash-conversion-cycle')!,m=c.modes.find(m=>m.id===mode)!,values=defaults(m),r=runCalculation(c.id,mode,values);
  const ar=run('accounts-receivable-turnover','average',{days:values.days,credit_sales:values.credit_sales,average_ar:values.average_ar}),ap=run('days-payable-outstanding',mode,{days:values.days,average_ap:values.average_ap,...(mode==='cogs'?{cogs:values.cogs}:{purchases:values.purchases})});
  near(get(r,'Average-balance collection days (DSO)').value,get(ar,'Average-balance DSO / collection days').value);near(get(r,'Payables days (DPO)').value,get(ap,'Days payable outstanding').value);
  const d=run('cash-conversion-cycle','days',{dio:get(r,'Inventory days (DIO)').value,dso:get(r,'Average-balance collection days (DSO)').value,dpo:get(r,'Payables days (DPO)').value});near(get(d,'Cash conversion cycle (days)').value,get(r,'Cash conversion cycle (days)').value);
 }
 near(get(run('cash-conversion-cycle','days',{dio:20,dso:5,dpo:40}),'Cash conversion cycle (days)').value,-15);
 assert.throws(()=>run('cash-conversion-cycle','purchases',{cogs:0}));assert.throws(()=>run('cash-conversion-cycle','purchases',{credit_sales:0}));assert.throws(()=>run('cash-conversion-cycle','purchases',{purchases:0}));
});
test('ROIC loss taxes, capital crossings and WACC point spreads have explicit meanings',()=>{
 const r=run('roic','ebit');near(get(r,'Annual NOPAT used').value,150000);near(get(r,'Annual return on invested capital').value,12);assert.equal(formatMetric(get(r,'Annual return on invested capital')),'12.0000%');near(get(r,'ROIC minus WACC (percentage points)').value,4);
 near(get(run('roic','ebit',{ebit:-50000}),'Annual NOPAT used').value,-50000);near(get(run('roic','ebit',{ebit:-50000,loss_tax:'Apply simplified tax rate to a loss'}),'Annual NOPAT used').value,-37500);
 for(const capital of [0,-100]){const r=run('roic','nopat',{capital});assert.ok(get(r,'Annual return on invested capital').displayValue);assert.ok(!formatMetric(get(r,'Annual return on invested capital')).endsWith('%'));assert.ok(get(r,'Simplified annual economic profit').displayValue);}
 assert.ok(get(run('roic','balances',{begin_capital:-100,end_capital:300}),'Annual return on invested capital').displayValue);
});
test('Coverage uses same-period interest, handles zero expense and preserves signed tax bridges',()=>{
 near(get(run('interest-coverage-ratio','ebit'),'EBIT interest coverage (times)').value,4);
 const zero=run('interest-coverage-ratio','ebit',{interest:0});assert.ok(get(zero,'EBIT interest coverage (times)').displayValue);assert.ok(get(zero,'EBIT needed for selected target coverage').displayValue);
 near(get(run('interest-coverage-ratio','bridge',{net_income:56000,income_tax:-1000,interest:30000}),'Period EBIT used').value,85000);
 near(get(run('interest-coverage-ratio','ebit',{ebit:-10000}),'EBIT interest coverage (times)').value,-.4);
 assert.throws(()=>run('interest-coverage-ratio','ebit',{interest:-1}));
});
test('Every published mode has complete presets, lazy dispatch, source context and an indexable content cluster',async()=>{
 const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});
 for(const [id,g] of Object.entries(content)){
  const c=calculators.find(c=>c.id===id)!,article=articles[id as keyof typeof articles];assert.deepEqual(new Set(g.examples.map(e=>e.mode)),new Set(c.modes.map(m=>m.id)));
  assert.ok(terms.some(t=>t.tools.some(tool=>tool.id===id)));assert.ok(entries.some(e=>e.url==='https://www.calculatorfree.io/'+id+'-calculator'));assert.ok(entries.some(e=>e.url==='https://www.calculatorfree.io'+article.meta.path));
  for(const e of g.examples){const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());const values=Object.fromEntries(Object.entries(e.values).map(([k,v])=>[k,String(v)])),r=runCalculation(id,e.mode,values);near(get(r,e.expected.label).value,e.expected.value);assert.deepEqual(await runClientCalculation(id,c.category,e.mode,values),r);const href=calculatorPresetHref('/'+id+'-calculator',e.mode,e.values),decoded=sharedInputs(c,'',href.slice(href.indexOf('#')))!;assert.equal(decoded.mode.id,e.mode);assert.deepEqual(decoded.values,values);assert.ok(resultContext(id,e.mode,values,r));}
 }
});
