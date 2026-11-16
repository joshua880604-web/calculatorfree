import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import content from '../src/lib/finance-five-content.json';
import articles from '../src/lib/finance-five-guide-content.json';
import terms from '../src/lib/finance-five-glossary.json';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs,formatMetric} from '../src/lib/sharing';
import {sitemapEntries} from '../src/lib/seo';
const run=(id:string,mode:string,patch:Record<string,string|number>={})=>{
 const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;
 return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});
};
const get=(r:ReturnType<typeof run>,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m;};
const near=(a:number,b:number,t=1e-8)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const w='Weighted average cost of capital',re='CAPM required annual return / cost of equity',pen='Early withdrawal penalty',proceeds='Estimated net proceeds after penalty',burn='Monthly net operating cash burn';
test('WACC fixtures use percentage units, debt-only tax shield and exact financing weights',()=>{
 const r=run('wacc','standard');near(get(r,w).value,7.8);assert.equal(formatMetric(get(r,w)),'7.8000%');
 near(get(r,'After-tax cost of debt').value,4.5);near(get(r,'Debt tax shield contribution').value,.6);
 near(r.rows!.reduce((s,r)=>s+Number(r[2]),0),100);near(r.rows!.reduce((s,r)=>s+Number(r[4]),0),7.8);
 near(get(run('wacc','preferred',{equity:500000,debt:300000,preferred:200000}),w).value,7.75);
 near(get(run('wacc','standard',{debt:0}),w).value,10);
 near(get(run('wacc','standard',{equity:0}),w).value,4.5);
 near(get(run('wacc','preferred',{equity:0,debt:0,preferred:200000}),w).value,7);
 near(get(run('wacc','standard',{tax:0}),w).value,8.4);
 near(get(run('wacc','standard',{tax:100}),w).value,6);
 assert.throws(()=>run('wacc','standard',{equity:0,debt:0}),/positive total/);
 assert.throws(()=>run('wacc','standard',{tax:101}));assert.throws(()=>run('wacc','standard',{debt:-1}));
});
test('CAPM input modes agree without subtracting the risk-free rate twice',()=>{
 near(get(run('capm','market'),re).value,10);near(get(run('capm','premium'),re).value,10);
 near(get(run('capm','market',{beta:-.5}),re).value,1.5);
 near(get(run('capm','premium',{beta:0}),re).value,4);
 near(get(run('capm','market',{market_return:4}),re).value,4);
 near(get(run('capm','market',{market_return:2}),re).value,1.6);
 near(get(run('capm','premium',{premium:9}),re).value,14.8);
 assert.throws(()=>run('capm','premium',{beta:Infinity}));
});
test('Fixed-bond results match independent 60-digit Decimal cash-flow fixtures',()=>{
 const r=run('bond-duration','fixed');
 near(get(r,'Modeled bond price').value,925.6126256977225);
 near(get(r,'Macaulay duration (years)').value,7.894997340182342);
 near(get(r,'Modified duration (years)').value,7.665045961342080);
 near(get(r,'Convexity (years squared)').value,71.78539801290004);
 near(get(r,'DV01: first-order value of one basis point').value,.7094863318371566);
 near(r.rows!.reduce((s,row)=>s+Number(row[3]),0),get(r,'Modeled bond price').value);
 const zero=run('bond-duration','fixed',{coupon:0});near(get(zero,'Macaulay duration (years)').value,10);
 const par=run('bond-duration','fixed',{yield:5});near(get(par,'Modeled bond price').value,1000);
 const noYield=run('bond-duration','fixed',{yield:0});near(get(noYield,'Modeled bond price').value,1500);
 const neg=run('bond-duration','fixed',{yield:-1});assert.ok(get(neg,'Modeled bond price').value>1500);
 const twice=run('bond-duration','fixed',{face:2000});near(get(twice,'Modeled bond price').value,2*get(r,'Modeled bond price').value);near(get(twice,'Modified duration (years)').value,get(r,'Modified duration (years)').value);
 const unchanged=run('bond-duration','fixed',{shift:0});near(get(unchanged,'Exact price at shocked yield').value,get(unchanged,'Modeled bond price').value);
 assert.throws(()=>run('bond-duration','fixed',{periods:1.5}),/whole/);
 assert.throws(()=>run('bond-duration','fixed',{frequency:'3'}));
 assert.throws(()=>run('bond-duration','fixed',{frequency:'1',shift:-107}),/positive periodic/);
});
test('Bond derivatives agree with finite differences and small-shock convexity improves the approximation',()=>{
 const r=run('bond-duration','fixed'),p=get(r,'Modeled bond price').value,h=.0001;
 const up=get(run('bond-duration','fixed',{yield:6+h}),'Modeled bond price').value,down=get(run('bond-duration','fixed',{yield:6-h}),'Modeled bond price').value;
 near(-(up-down)/(2*h/100*p),get(r,'Modified duration (years)').value,1e-7);
 near((up+down-2*p)/((h/100)**2*p),get(r,'Convexity (years squared)').value,.005);
 const small=run('bond-duration','fixed',{shift:.1}).additionalTables![0].rows[0];assert.ok(Math.abs(Number(small[2])-Number(small[3]))<Math.abs(Number(small[1])-Number(small[3])));
});
test('CD contract days, months, known penalties and principal loss reconcile',()=>{
 const r=run('cd-early-withdrawal-penalty','days');near(get(r,pen).value,110.95890410958904);near(get(r,proceeds).value,10089.041095890411);
 near(get(run('cd-early-withdrawal-penalty','days',{day_basis:360}),pen).value,112.5);
 near(get(run('cd-early-withdrawal-penalty','days',{day_basis:366}),pen).value,110.65573770491804);
 const m=run('cd-early-withdrawal-penalty','months');near(get(m,pen).value,112.5);
 near(get(run('cd-early-withdrawal-penalty','dollars'),proceeds).value,10087.5);
 const loss=run('cd-early-withdrawal-penalty','days',{accrued:20});near(get(loss,'Principal reduction after accrued interest').value,90.95890410958904);near(get(loss,proceeds).value,9909.041095890411);
 near(get(run('cd-early-withdrawal-penalty','days',{penalty_days:0}),proceeds).value,10200);
 near(get(run('cd-early-withdrawal-penalty','dollars',{penalty:10200}),proceeds).value,0);
 assert.throws(()=>run('cd-early-withdrawal-penalty','dollars',{penalty:10201}),/exceeds principal/);
 assert.throws(()=>run('cd-early-withdrawal-penalty','days',{penalty_days:1.5}),/whole/);
 assert.throws(()=>run('cd-early-withdrawal-penalty','days',{day_basis:364}));
});
test('Cash runway distinguishes reserves, operating generation and adjusted financing history',()=>{
 const r=run('burn-rate','monthly');near(get(r,burn).value,15000);near(get(r,'Monthly gross operating cash burn').value,25000);near(get(r,'Months until entered cash reserve').value,6);near(get(r,'Months until zero cash').value,100000/15000);
 near(get(run('burn-rate','history'),burn).value,15000);
 near(get(run('burn-rate','history',{excluded:-10000}),burn).value,5000);
 const historical=run('burn-rate','history');assert.match(get(historical,'Monthly gross operating cash burn').displayValue!,/Not inferable/);
 for(const inflows of [25000,30000]){const r=run('burn-rate','monthly',{inflows});assert.match(get(r,'Months until zero cash').displayValue!,/No finite depletion/);}
 for(const cash of [0,5000,10000])near(get(run('burn-rate','monthly',{cash}),'Months until entered cash reserve').value,0);
 near(get(run('burn-rate','monthly',{cash:0,inflows:30000}),'Months until zero cash').value,0);
 assert.throws(()=>run('burn-rate','history',{months:1.5}),/whole/);
 assert.throws(()=>run('burn-rate','monthly',{outflows:-1}));
});
test('New guide presets restore every mode and validate published numbers through lazy client dispatch',async()=>{
 const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});
 for(const [id,g] of Object.entries(content)){
  const c=calculators.find(c=>c.id===id)!,article=articles[id as keyof typeof articles];
  assert.deepEqual(new Set(g.examples.map(e=>e.mode)),new Set(c.modes.map(m=>m.id)));
  assert.ok(terms.some(t=>t.tools.some(tool=>tool.id===id)));
  assert.equal(entries.filter(e=>e.url==='https://www.calculatorfree.io/'+id+'-calculator').length,1);
  assert.ok(entries.some(e=>e.url==='https://www.calculatorfree.io'+article.meta.path));
  for(const e of g.examples){
   const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());
   const values=Object.fromEntries(Object.entries(e.values).map(([k,v])=>[k,String(v)]));
   const actual=runCalculation(id,e.mode,values);near(get(actual,e.expected.label).value,e.expected.value,1e-7);
   assert.deepEqual(await runClientCalculation(id,c.category,e.mode,values),actual);
   const href=calculatorPresetHref('/'+id+'-calculator',e.mode,e.values),decoded=sharedInputs(c,'',href.slice(href.indexOf('#')))!;
   assert.equal(decoded.mode.id,e.mode);assert.deepEqual(decoded.values,values);
  }
 }
});
