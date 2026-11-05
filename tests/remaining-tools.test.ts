import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,routeFor} from '../src/lib/calculators';
import {calculators as catalog} from '../src/lib/catalog';
import {defaults,type Result} from '../src/lib/types';
import {calculateMode} from '../src/lib/calculate-mode';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,type Guide} from '../src/lib/guides';
import content from '../src/lib/remaining-tool-content.json';
import supplements from '../src/lib/remaining-mode-content.json';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {directorySearch} from '../src/lib/directory';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {resultExportData} from '../src/lib/result-export';
import {hasShareTools} from '../src/lib/share-tools';
import {sitemapEntries} from '../src/lib/seo';
const calc=(id:string)=>calculators.find(c=>c.id===id)!;
const run=(id:string,mode:string,patch:Record<string,string|number|undefined>={})=>{const c=calc(id),m=c.modes.find(x=>x.id===mode)!;return calculateMode(c,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==undefined).map(([k,v])=>[k,String(v)]))});};
const get=(r:Result,label:string)=>{const m=r.metrics.find(x=>x.label===label);assert.ok(m,`Missing metric: ${label}`);return m;};
const n=(r:Result,label:string)=>get(r,label).value;
const near=(a:number,b:number,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(const [id,g] of Object.entries({...content,...supplements} as unknown as Record<string,Pick<Guide,"examples">>))for(const e of g.examples)test(`Remaining worked example: ${id}/${e.title}`,()=>near(n(run(id,e.mode,e.values),e.expected.label),e.expected.value,.01/Math.max(1,Math.abs(e.expected.value))));
for(const id of [...Object.keys(content),'retirement-withdrawal','stock-average'])for(const mode of calc(id).modes)test(`Remaining client and complete sharing: ${id}/${mode.id}`,async()=>{
 const c=calc(id),v=defaults(mode),r=calculateMode(c,mode.id,v);
 assert.deepEqual(await runClientCalculation(id,c.category,mode.id,v),r);assert.ok(hasShareTools(id));
 const url=new URL(calculationLink('https://www.calculatorfree.io',routeFor(id),mode,v,true));const restored=sharedInputs(c,url.search,url.hash)!;assert.deepEqual(restored.values,v);assert.equal(restored.mode.id,mode.id);
 const exported=await resultExportData(id,mode,v,r);assert.ok(exported.metrics.length);assert.ok(exported.scope);
});
test('All seven new tasks have one canonical page, category, guide and search entry',()=>{
 const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});
 for(const id of Object.keys(content)){assert.ok(calculatorCategory(id));assert.equal(guides[id].questions.length,7);assert.equal(guides[id].examples.length,3);assert.equal(guides[id].checkedOn,'2026-11-05');assert.ok(guides[id].sources.length>=2);assert.equal(entries.filter(e=>e.url==='https://www.calculatorfree.io/'+id+'-calculator').length,1);assert.equal(directorySearch(catalog,calc(id).title)[0].tool.id,id);}
 assert.match(directorySearch(catalog,'Nest egg calculator')[0].href,/mode=nest-egg/);
 assert.match(directorySearch(catalog,'Safe withdrawal rate calculator')[0].href,/mode=rate/);
 assert.match(directorySearch(catalog,'Stock average down target calculator')[0].href,/mode=average-down/);
});
test('1031 cash boot, liabilities, expense allocation and replacement basis reconcile',()=>{
 const t=run('1031-exchange','exchange',{basis:100000,replacement:250000,cash_received:40000,debt_relieved:80000,debt_assumed:150000,cash_paid:0,expenses:0});
 near(n(t,'Realized gain / loss in modeled exchange'),120000);near(n(t,'Gain recognized under simplified boot rules'),40000);near(n(t,'Modeled replacement basis before special adjustments'),170000);
 const f=run('1031-exchange','exchange',{basis:175000,replacement:220000,cash_received:0,debt_relieved:150000,debt_assumed:80000,cash_paid:40000,expenses:0});near(n(f,'Gain recognized under simplified boot rules'),30000);near(n(f,'Modeled replacement basis before special adjustments'),175000);
 const expense=run('1031-exchange','exchange',{basis:100000,replacement:250000,cash_received:40000,debt_relieved:80000,debt_assumed:150000,cash_paid:0,expenses:5000});near(n(expense,'Realized gain / loss in modeled exchange'),115000);near(n(expense,'Gain recognized under simplified boot rules'),35000);near(n(expense,'Modeled replacement basis before special adjustments'),170000);
 const more=run('1031-exchange','exchange',{basis:100000,replacement:250000,cash_received:1000,debt_relieved:0,debt_assumed:0,cash_paid:0,expenses:2000});near(n(more,'Net boot after qualifying exchange expenses'),0);near(n(more,'Modeled replacement basis before special adjustments'),101000);
 const loss=run('1031-exchange','exchange',{basis:300000,replacement:250000,cash_received:0,debt_relieved:0,debt_assumed:0,cash_paid:0,expenses:0});near(n(loss,'Gain recognized under simplified boot rules'),0);near(n(loss,'Deferred gain / unrecognized loss'),-50000);near(n(loss,'Modeled replacement basis before special adjustments'),300000);
 for(const r of [t,f,expense,more,loss])near(n(r,'Realized gain / loss in modeled exchange'),n(r,'Gain recognized under simplified boot rules')+n(r,'Deferred gain / unrecognized loss'));
});
test('1031 calendar deadlines handle leap years, earlier tax deadlines and invalid dates',()=>{
 const r=run('1031-exchange','deadlines',{transfer:'2028-01-31',tax_due:'2028-04-15'});assert.equal(get(r,'45-day identification date').displayValue,'2028-03-16');assert.equal(get(r,'180-day outer date').displayValue,'2028-07-29');assert.equal(get(r,'Earlier receipt deadline in this scenario').displayValue,'2028-04-15');
 const outer=run('1031-exchange','deadlines',{transfer:'2026-11-05',tax_due:'2027-10-15'});assert.equal(get(outer,'Earlier receipt deadline in this scenario').displayValue,'2027-05-04');
 for(const patch of [{transfer:'2026-02-30'},{transfer:'2026-13-01'},{tax_due:'2025-01-01'}])assert.throws(()=>run('1031-exchange','deadlines',patch));
});
test('Maintenance uses a pooled reserve and separates immediate gaps from future payments',()=>{
 const pooled=run('home-maintenance-cost','components',{routine:0,reserve:6000,components:'First, 6000, 1\nSecond, 6000, 2'});near(n(pooled,'Monthly contribution to replacement reserve'),250);near(Number(pooled.rows![0][4]),3000);near(Number(pooled.rows![1][4]),0);
 const now=run('home-maintenance-cost','components',{routine:1200,reserve:500,components:'Now, 1000, 0\nLater, 1200, 1'});near(n(now,'Immediate replacement cash shortfall'),500);near(n(now,'Monthly budget including routine maintenance'),200);near(Number(now.rows![0][1]),0);
 const covered=run('home-maintenance-cost','components',{routine:0,reserve:50000,components:'Roof, 10000, 5'});near(n(covered,'Monthly contribution to replacement reserve'),0);near(n(covered,'Ending replacement reserve in modeled horizon'),40000);
 const growth=run('home-maintenance-cost','allowance',{home_value:100000,rate:1,increase:10,years:2});near(Number(growth.rows![1][1]),1100);near(n(growth,'Total allowance across selected years'),2100);
 for(const components of ['Roof,1000,1.5','Roof,1000,-1','Roof,-1,5','Roof,1,000,5',''])assert.throws(()=>run('home-maintenance-cost','components',{components}));
});
test('Unit-day vacancy differs from snapshot vacancy and prevents duplicated collection loss',()=>{
 const r=run('vacancy-rate','period',{available_days:300,vacant_days:30,scheduled_rent:10000,uncollected:500});near(n(r,'Physical vacancy rate'),10);near(n(r,'Modeled economic rental loss rate'),15);near(n(r,'Rent after vacancy and collection loss'),8500);
 assert.ok(get(run('vacancy-rate','period',{scheduled_rent:0,uncollected:0}),'Modeled economic rental loss rate').displayValue);
 for(const patch of [{vacant_days:4000},{available_days:0},{vacant_days:1.5},{scheduled_rent:100,uncollected:100}])assert.throws(()=>run('vacancy-rate','period',patch));
 assert.throws(()=>run('vacancy-rate','snapshot',{units:1,vacant:2}));
});
test('Credit utilization uses weighted limits and distinguishes aggregate from per-card targets',()=>{
 const r=run('credit-utilization','cards',{cards:'900,1000\n100,9000',target:10});near(n(r,'Overall credit utilization'),10);near(n(r,'Payment to reach overall target'),0);near(n(r,'Payments to bring every card to target'),800);
 near(n(run('credit-utilization','cards',{cards:'1500,1000',target:30}),'Overall credit utilization'),150);
 const zero=run('credit-utilization','cards',{cards:'100,0',target:0});assert.ok(get(zero,'Overall credit utilization').displayValue);near(n(zero,'Payment to reach overall target'),100);assert.equal(zero.rows![0][3],'Undefined');
 for(const cards of ['1,2,3','-1,100','1,NaN','',Array(31).fill('1,100').join('\n')])assert.throws(()=>run('credit-utilization','cards',{cards}));
});
test('DCA uses equal cash budgets after fees and does not guarantee a better outcome',()=>{
 const equal=run('dca','prices',{budget:100,fee:0,prices:'10\n10\n10',terminal:10});near(n(equal,'DCA value minus lump-sum value'),0);near(n(equal,'Average cost per share including fees'),10);
 const fees=run('dca','prices',{budget:100,fee:10,prices:'10\n10\n10',terminal:10});near(n(fees,'Total shares purchased'),27);near(n(fees,'Total cash committed'),300);near(n(fees,'DCA value minus lump-sum value'),-20);
 const zero=run('dca','prices',{budget:100,fee:0,prices:'10\n20',terminal:0});near(n(zero,'Unrealized DCA gain / loss before sale fees and tax'),-200);
 const a=run('dca','prices',{prices:'100\n50\n25'}),b=run('dca','prices',{prices:'25\n100\n50'});near(n(a,'Total shares purchased'),n(b,'Total shares purchased'));
 for(const patch of [{prices:'0'},{prices:'-5'},{prices:'10,20'},{prices:'10\nNaN'},{fee:1000},{budget:0}])assert.throws(()=>run('dca','prices',patch));
});
test('Rule of 72 exact inverse doubles the amount and nonpositive growth never doubles it',()=>{
 for(const years of [1,2,10,100]){const r=run('rule-of-72','return',{years}),rate=n(r,'Exact effective annual return required');near((1+rate/100)**years,2);near(n(run('rule-of-72','time',{rate}),'Exact doubling time'),years);}
 for(const rate of [0,-1,-99])assert.match(get(run('rule-of-72','time',{rate}),'Exact doubling time').displayValue!,/No doubling/);
 near(n(run('rule-of-72','time',{rate:8}),'Rule of 72 doubling-time approximation'),9);
 assert.throws(()=>run('rule-of-72','return',{years:0}));
});
test('Capital gains uses year-specific stacked bands and includes displaced preferential tax',()=>{
 const base={filing:'Single',holding:'Long term: more than one year',ordinary:0,preferential:0,proceeds:50000,basis:0,selling_fees:0,niit:'Exclude NIIT scenario',state:0};
 near(n(run('capital-gains-tax','sale',{...base,year:'2026'}),'Additional regular federal income tax'),82.5);
 near(n(run('capital-gains-tax','sale',{...base,year:'2025'}),'Additional regular federal income tax'),247.5);
 const short=run('capital-gains-tax','sale',{...base,year:'2026',holding:'Short term: one year or less',ordinary:49000,preferential:1000,proceeds:500});near(n(short,'Additional regular federal income tax'),127.5);
 const high=run('capital-gains-tax','sale',{...base,year:'2026',ordinary:500000,proceeds:60000});near(n(high,'Additional regular federal income tax'),9725);
 for(const filing of ['Single','Married filing jointly','Head of household','Married filing separately'])assert.ok(Number.isFinite(n(run('capital-gains-tax','sale',{...base,year:'2026',filing}),'Estimated additional tax from the sale')));
});
test('Capital gains NIIT is incremental; losses do not invent deductions or refunds',()=>{
 const base={proceeds:20000,basis:0,selling_fees:0,ordinary:150000,preferential:0,filing:'Single',magi:195000,other_nii:0,state:0};
 near(n(run('capital-gains-tax','sale',base),'Additional net investment income tax'),570);
 near(n(run('capital-gains-tax','sale',{...base,proceeds:10000,magi:250000,other_nii:50000}),'Additional net investment income tax'),380);
 const loss=run('capital-gains-tax','sale',{...base,basis:50000,state:10});near(n(loss,'Realized capital gain / loss'),-30000);near(n(loss,'Estimated additional tax from the sale'),0);near(n(loss,'Sale proceeds after selling fees and modeled taxes'),20000);
 const state=run('capital-gains-tax','sale',{...base,state:5});near(n(state,'Assumed additional state / local tax'),1000);
 for(const patch of [{year:'2027'},{filing:'Unknown'},{holding:'Unknown'},{basis:-1}])assert.throws(()=>run('capital-gains-tax','sale',patch));
});
const retirement={years:1,return:0,fee:0,inflation:0,income:0,income_start:0,tax:0};
test('Nest egg target matches an independent annuity and handles deferred income',()=>{
 const rate=Math.pow(1.06,1/12)-1,expected=1000*(1-Math.pow(1+rate,-120))/rate;
 const r=run('retirement-withdrawal','nest-egg',{...retirement,balance:0,years:10,return:6,spending:1000});near(n(r,'Required starting retirement nest egg'),expected);assert.equal(n(r,'First funding shortfall month'),0);near(n(r,'Portfolio balance at horizon'),0,.00001);
 const delayed=run('retirement-withdrawal','nest-egg',{...retirement,balance:0,years:2,spending:1000,income:1000,income_start:1});near(n(delayed,'Required starting retirement nest egg'),12000);assert.equal(n(delayed,'First funding shortfall month'),0);
 const covered=run('retirement-withdrawal','nest-egg',{...retirement,balance:0,spending:1000,income:1000});near(n(covered,'Required starting retirement nest egg'),0);
});
test('Withdrawal rate sets initial gross withdrawal while later spending stays inflation indexed',()=>{
 const r=run('retirement-withdrawal','rate',{...retirement,balance:120000,years:2,withdrawal_rate:10,inflation:10,tax:20,income:200});near(n(r,'Initial monthly portfolio withdrawal before tax'),1000);near(n(r,'Initial monthly spending budget'),1000);near(Number(r.rows![1][2]),13200);near(Number(r.rows![1][5]),13200);assert.ok(r.notes!.some(x=>x.includes('not an estimate of a safe')));
});
test('Average-down target includes fees, rounds whole shares and rejects impossible finite targets',()=>{
 const r=run('stock-average','average-down',{held:100,average:50,purchase_price:30,target:40,fee:10,share_unit:'Fractional shares'});near(n(r,'Additional shares needed'),101);near(n(r,'Average cost after modeled purchase'),40);near(n(r,'Additional cash needed including purchase fee'),3040);
 const whole=run('stock-average','average-down',{held:100,average:50,purchase_price:33,target:40,fee:5,share_unit:'Whole shares'});near(n(whole,'Additional shares needed'),144);assert.ok(n(whole,'Average cost after modeled purchase')<=40);
 for(const purchase_price of [40,50])assert.match(get(run('stock-average','average-down',{purchase_price,target:40}),'Additional shares needed').displayValue!,/No finite/);
 near(n(run('stock-average','average-down',{average:35,target:40,fee:100}),'Additional cash needed including purchase fee'),0);
});
