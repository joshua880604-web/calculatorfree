import {tool} from './helpers';
import {money,metric,select,type Values,type Result} from '../types';
import {usd,value,percentage,integer,whole,choose,bounded} from './expansion-common';
export function dividendDiscountModel(v:Values,twoStage=false):Result {
 const r=value(v,'required_return',-99,100)/100,g=value(v,'growth',-99,100)/100;
 if(r<=g)throw Error('The annual required return must exceed the perpetual stable growth rate.');
 const d=value(v,'dividend');let next:number,terminal:number,pvDividends=0,pvTerminal:number,rows:(string|number)[][]=[];
 if(twoStage){
  const n=integer(v,'years',1,100),early=value(v,'early_growth',-99,100)/100;
  for(let t=1;t<=n;t++){const div=bounded(d*Math.pow(1+early,t)),pv=bounded(div/Math.pow(1+r,t));pvDividends=bounded(pvDividends+pv);rows.push([t,div,pv]);}
  next=bounded(d*Math.pow(1+early,n)*(1+g));terminal=bounded(next/(r-g));pvTerminal=bounded(terminal/Math.pow(1+r,n));
 }else{
  const basis=choose(v,'dividend_basis',['Latest annual dividend (D0)','Next annual dividend (D1)']);
  next=bounded(basis==='Latest annual dividend (D0)'?d*(1+g):d);terminal=bounded(next/(r-g));pvTerminal=terminal;
  rows=[['Entered dividend',d,''],['Next annual dividend (D1)',next,''],['Required return minus growth',r-g,''],['Stable-growth model value',terminal,terminal]];
 }
 const present=bounded(pvDividends+pvTerminal);
 return {metrics:[money('Modeled dividend-discount value per share',present),money(twoStage?'First stable-stage dividend per share':'Next annual dividend per share',next),money('PV of explicit early-stage dividends',pvDividends),money('PV of stable-stage terminal value',pvTerminal),money(twoStage?'Terminal price at end of early stage':'Stable-growth value at time zero',terminal),metric('Required return minus stable growth (percentage points)',(r-g)*100)],columns:twoStage?['End of year','Dividend per share','Present value of dividend']:['Stable-growth measure','Value','Present value'],rows,notes:[
  'This is an assumption-based equity valuation of future annual end-of-year dividends, not a quoted or predicted share price. All rates use a consistent annual currency and nominal/real basis. The required return is entered, not a forecast or a company lookup.',
  twoStage?'The latest dividend D0 grows at the early-stage rate for N full years. The stable-stage dividend is D(N+1) = DN × (1 + stable growth). Terminal price is located at year N and discounted by N years, alongside the explicit dividends for years 1 through N. One required return applies to both stages.':'If the entered dividend is D0, grow it once to get D1. If it is already D1, do not grow it again. Gordon value = D1 / (required return − perpetual growth); setting growth to zero is the constant-dividend case.',
  'Perpetual required return must exceed stable growth and the rates must define valid discount and growth factors. A small positive spread makes the estimate very sensitive. No number is shown for a nonconvergent r ≤ g case.',
  'A zero dividend under a proportional-growth assumption stays zero. That does not establish that a non-dividend-paying business has no market value. Future distributions, growth sustainability and payout policies need evidence beyond this model.',
  'Dividend reinvestment projects holdings and distributions under assumed prices; it is not this discount valuation. The tool does not automatically infer growth from ROE, recommend trades, fetch dividends or determine tax treatment.'
 ]};
}
const common=()=>[usd('dividend','Annual dividend per share',2),percentage('growth','Perpetual stable dividend growth rate',4,-99,100),percentage('required_return','Annual required return on equity',10,-99,100)];
export const dividendDiscountModelCalculator=tool('dividend-discount-model',[
 {id:'stable',title:'Stable Growth / Gordon Model',description:'Distinguish the latest and next annual dividend under perpetual stable growth.',fields:[...common(),select('dividend_basis','The dividend entered is',['Latest annual dividend (D0)','Next annual dividend (D1)'])],formula:'D1 = D0 × (1 + g), if needed; value = D1 / (r − g), with r > g.',calculate:v=>dividendDiscountModel(v)},
 {id:'two-stage',title:'Two-Stage Dividend Growth',description:'Discount an explicit growth stage and a stable-growth terminal value.',fields:[...common().map(f=>f.key==='dividend'?{...f,label:'Latest annual dividend per share (D0)'}:f),percentage('early_growth','Dividend growth during the early stage',10,-99,100),whole('years','Full years in the early stage',2,'years',1,100)],formula:'Value = sum of Dt/(1+r)^t for t=1…N + [DN × (1+g)/(r−g)]/(1+r)^N.',calculate:v=>dividendDiscountModel(v,true)}
], 'Estimate dividend-discount value using a stable-growth Gordon model or two-stage annual dividends. Inspect dividend timing, terminal value and required-return assumptions.');
