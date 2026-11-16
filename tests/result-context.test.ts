import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {resultContext,inputHint} from '../src/lib/result-context';
function run(id:string,mode:string,overrides:Record<string,string>={}) {
 const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!,v={...defaults(m),...overrides},r=runCalculation(id,mode,v);
 return {r,v,context:resultContext(id,mode,v,r),get:(label:string)=>r.metrics.find(m=>m.label===label)!.value};
}
const close=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<.005,`${actual} != ${expected}`);
test('annual loan frequency is explicit and agrees with independent annuity fixture',()=>{
 const x=run('loan','amortized',{principal:'10000',years:'2',months:'0',rate:'10',compound:'Annually',pay:'Annually'});
 close(x.get('Payment per period'),10000*.1/(1-1.1**-2));assert.match(x.context!,/payments made annually/);
});
test('compound interpretation separates principal and tax-adjusted losses',()=>{
 const x=run('compound-interest','growth',{principal:'1000',monthly:'0',annual:'0',years:'2',rate:'-10',compound:'Annually',tax:'0'});
 close(x.get('Ending balance'),810);close(x.get('Net investment earnings'),-190);assert.match(x.context!,/loss is -\$190.00/);
 assert.equal(resultContext('compound-interest','conversion',{}, {metrics:[]}),null);
});
test('retirement saving fixture independently sums 384 monthly deposits',()=>{
 const x=run('retirement','saving',{age:'35',retire:'67',target:'600000',balance:'30000',return:'6'});
 const monthly=1.06**(1/12)-1;let factor=0;for(let i=0;i<384;i++)factor+= (1+monthly)**i;
 close(x.get('Required monthly saving'),(600000-30000*1.06**32)/factor);assert.match(x.context!,/alternative plan/);
});
test('retirement explanation distinguishes deficits, surpluses and rounded zero',()=>{
 for(const [gap,phrase] of [[-10,'below'],[10,'above'],[.001,'match']] as const)assert.match(resultContext('retirement','required',{}, {metrics:[{label:'Projected surplus / shortfall',value:gap,format:'money'}]})!,new RegExp(phrase));
});
test('tax liability and refund are separate: 2025 single wages-only fixture',()=>{
 const x=run('income-tax','federal',{year:'2025',filing:'Single',wages:'50000',withheld:'5000'});
 // $50,000 less $15,750 standard deduction; first $11,925 at 10%, remainder at 12%.
 close(x.get('Estimated federal income tax'),11925*.1+(34250-11925)*.12);assert.match(x.context!,/tax year 2025/);assert.match(x.context!,/exceed/);
 const y=run('income-tax','federal',{year:'2025',filing:'Single',wages:'50000',withheld:'0'});assert.match(y.context!,/remains owed/);
});
test('unknown metric contract adds no invented interpretation; hints are mode-specific',()=>{
 assert.equal(resultContext('mortgage','monthly',{}, {metrics:[]}),null);assert.equal(inputHint('loan','bond','pay'),undefined);assert.match(inputHint('loan','amortized','pay')!,/frequency/);
});
test('Capital-cost explanations follow edited assumptions and retain the distinction from forecasts',()=>{
 const a=run('wacc','standard',{equity_cost:'12'});assert.match(a.context!,/9\.0000%/);assert.match(a.context!,/4\.5000%/);assert.match(a.context!,/not a guaranteed return/);
 const b=run('capm','market',{beta:'-.5'});assert.match(b.context!,/1\.5000%/);assert.match(b.context!,/expected market return minus/);
 const c=run('capm','premium');assert.match(c.context!,/not reduced a second time/);assert.match(c.context!,/not a forecast/);
});
test('CD interpretation distinguishes principal loss from a penalty covered by unpaid interest',()=>{
 const a=run('cd-early-withdrawal-penalty','days',{accrued:'20'});assert.match(a.context!,/\$9,909\.04/);assert.match(a.context!,/reduces the returned principal by \$90\.96/);
 const b=run('cd-early-withdrawal-penalty','dollars');assert.match(b.context!,/does not reduce principal/);assert.match(b.context!,/not a current bank-policy lookup/);
});
test('Runway explanation handles cash generation, an already reached reserve and history scope',()=>{
 const a=run('burn-rate','monthly',{inflows:'30000'});assert.match(a.context!,/generate \$5,000\.00/);assert.match(a.context!,/no finite modeled depletion/);assert.ok(!/generate -|Infinity/.test(a.context!));
 const b=run('burn-rate','monthly',{cash:'5000',inflows:'30000'});assert.match(b.context!,/already at or below/);assert.ok(!b.context!.includes('no finite'));
 const c=run('burn-rate','history');assert.match(c.context!,/\$15,000\.00/);assert.match(c.context!,/cannot be inferred from two balances/);
});
test('Bond interpretation preserves price, timing and fixed-cash-flow model boundaries',()=>{
 const a=run('bond-duration','fixed');assert.match(a.context!,/\$925\.61/);assert.match(a.context!,/7\.8950 years/);assert.match(a.context!,/7\.6650 years/);assert.match(a.context!,/does not model callable-bond effective duration/);
});
test('Five new explanations stay absent when the required metric contract is missing',()=>{
 for(const id of ['wacc','capm','bond-duration','cd-early-withdrawal-penalty','burn-rate'])assert.equal(resultContext(id,'unknown',{}, {metrics:[]}),null);
 const partial={metrics:[{label:'CAPM required annual return / cost of equity',value:10},{label:'Market risk premium used',value:5}]};assert.equal(resultContext('capm','market',{},partial),null);
});
