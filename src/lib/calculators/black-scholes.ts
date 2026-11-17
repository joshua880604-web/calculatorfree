import {tool} from './helpers';
import {num,select,money,metric,type Values,type Result} from '../types';
import {usd,value,percentage,choose,bounded} from './expansion-common';

// Q(x) = phi(x) integral_0^infinity exp(-x*t - t*t/2) dt for x >= 0.
// Integrating the tail directly preserves small negative-tail probabilities.
function normalTail(x:number):number {
 if(x>=39)return 0;
 const f=(t:number)=>Math.exp(-x*t-t*t/2),a=0,b=12,fa=1,fb=f(b),fm=f(6),initial=(b-a)*(fa+4*fm+fb)/6;
 function refine(l:number,r:number,fl:number,fr:number,mid:number,whole:number,tol:number,depth:number):number {
  const c=(l+r)/2,lm=f((l+c)/2),rm=f((c+r)/2),left=(c-l)*(fl+4*lm+mid)/6,right=(r-c)*(mid+4*rm+fr)/6,delta=left+right-whole;
  if(depth===0||Math.abs(delta)<=15*tol)return left+right+delta/15;
  return refine(l,c,fl,mid,lm,left,tol/2,depth-1)+refine(c,r,mid,fr,rm,right,tol/2,depth-1);
 }
 return Math.exp(-x*x/2)/Math.sqrt(2*Math.PI)*refine(a,b,fa,fb,fm,initial,1e-14,22);
}
export function normalCDF(x:number):number {return x>=0?1-normalTail(x):normalTail(-x);}
export function europeanOptionPrices(s:number,k:number,r:number,q:number,sigma:number,t:number) {
 if(![s,k,r,q,sigma,t].every(Number.isFinite)||s<=0||k<=0||sigma<0||t<0)throw Error('Use finite positive spot and strike, nonnegative volatility and time.');
 const spot=bounded(s*Math.exp(-q*t)),strike=bounded(k*Math.exp(-r*t)),difference=spot-strike;
 if(t===0||sigma===0)return {call:Math.max(difference,0),put:Math.max(-difference,0),spot,strike};
 const root=sigma*Math.sqrt(t);
 if(root===0)return {call:Math.max(difference,0),put:Math.max(-difference,0),spot,strike};
 const d1=(Math.log(s/k)+(r-q+sigma*sigma/2)*t)/root,d2=d1-root;
 // Calculate the out-of-the-money side first and recover the other by parity.
 if(difference>=0){const put=Math.max(0,strike*normalCDF(-d2)-spot*normalCDF(-d1));return {put,call:bounded(put+difference),spot,strike};}
 const call=Math.max(0,spot*normalCDF(d1)-strike*normalCDF(d2));return {call,put:bounded(call-difference),spot,strike};
}
export function blackScholes(v:Values):Result {
 const s=value(v,'spot',1e-8),k=value(v,'strike',1e-8),r=value(v,'risk_free',-100,100)/100,q=value(v,'dividend_yield',0,100)/100,sigma=value(v,'volatility',0,1000)/100;
 const unit=choose(v,'time_unit',['Years','Calendar days / 365']),raw=value(v,'time',0,unit==='Years'?100:36500),t=unit==='Years'?raw:raw/365,p=europeanOptionPrices(s,k,r,q,sigma,t);
 return {metrics:[money('European call theoretical value per share',p.call),money('European put theoretical value per share',p.put),metric('Time to expiry in model years',t),money('Discounted spot value per share',p.spot),money('Discounted strike value per share',p.strike),money('Call minus put per share',p.call-p.put),money('Put-call parity residual per share',(p.call-p.put)-(p.spot-p.strike))],columns:['Entered spot price scenario','European call per share','European put per share'],rows:[.8,.9,1,1.1,1.2].map(f=>{const a=europeanOptionPrices(s*f,k,r,q,sigma,t);return [s*f,a.call,a.put];}),notes:[
  'This Black-Scholes-Merton worksheet prices European-exercise call and put options with constant annual volatility, a constant continuously compounded risk-free rate and a constant continuous dividend yield. It does not price American early exercise or a discrete cash-dividend calendar.',
  'Rates are entered as annual percentages: 5 means 5%, converted to 0.05 internally. r and q are continuous rates, not effective annual returns or simple APR assumptions. Volatility is annualized. Calendar-day time uses the explicit days / 365 model convention, not a trading-day calendar.',
  'For positive time and volatility, d1 = [ln(S/K) + (r − q + sigma²/2)T] / (sigma sqrt(T)), d2 = d1 − sigma sqrt(T). Call = S exp(−qT) N(d1) − K exp(−rT) N(d2). Put-call parity is C − P = S exp(−qT) − K exp(−rT).',
  'At expiry, output is intrinsic value. At zero volatility with positive time, the deterministic discounted spot/strike difference supplies the boundary value. Negative continuous risk-free rates are allowed. The parity residual is a floating-point consistency check, not a tradable arbitrage signal.',
  'Values are theoretical amounts per share. They are not contract totals, a position’s profit/loss, market quotes, assignment probabilities, employee-option accounting fair values or recommendations. No live inputs or implied-volatility inference is supplied. The spot-price table changes only spot while holding other assumptions fixed.'
 ]};
}
export const blackScholesCalculator=tool('black-scholes',[
 {id:'european',title:'European Call & Put Model',description:'Price both European option types using the same explicit annual assumptions.',fields:[{...usd('spot','Current underlying spot price per share',100),min:1e-8},{...usd('strike','Exercise price per share',100),min:1e-8},percentage('volatility','Annualized volatility',20,0,1000),percentage('risk_free','Annual continuously compounded risk-free rate',5,-100,100),percentage('dividend_yield','Annual continuous dividend yield',0,0,100),select('time_unit','Expiry-time convention',['Years','Calendar days / 365']),{...num('time','Time remaining in the selected convention',1),max:36500}],formula:'C = S exp(−qT)N(d1) − K exp(−rT)N(d2); P follows the corresponding European put formula and put-call parity.',calculate:blackScholes}
], 'Calculate European call and put theoretical values with a continuous dividend yield. Inspect expiry, zero-volatility boundaries and put-call parity.');
