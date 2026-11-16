import {tool} from './helpers';
import {money,metric,select,type Values,type Result} from '../types';
import {usd,percentage,value,integer,whole,bounded} from './expansion-common';
export function bondDuration(v:Values):Result{
 const face=value(v,'face',.01),coupon=value(v,'coupon',0,100)/100,y=value(v,'yield',-99,1000)/100,periods=integer(v,'periods',1,1200),m=Number(v.frequency);
 if(![1,2,4,12].includes(m))throw Error('Choose a supported annual coupon frequency.');
 const shift=value(v,'shift',-1000,1000)/100,base=1+y/m;
 if(1+(y+shift)/m<=0)throw Error('The shocked yield must leave a positive periodic discount factor.');
 const rows:(string|number)[][]=[];let price=0,weighted=0,convex=0;
 for(let i=1;i<=periods;i++){
  const cf=face*coupon/m+(i===periods?face:0),pv=bounded(cf*Math.exp(-i*Math.log1p(y/m)));
  price+=pv;weighted+=i/m*pv;convex+=i*(i+1)*pv/(m*m*base*base);
  rows.push([i,i/m,cf,pv]);
 }
 bounded(price);if(price<=0)throw Error('These inputs do not produce a positive representable bond price.');
 const mac=weighted/price,mod=mac/base,c=convex/price,shockPrice=bounded(rows.reduce((s,r)=>s+Number(r[2])*Math.exp(-Number(r[0])*Math.log1p((y+shift)/m)),0));
 return {metrics:[{...metric('Macaulay duration (years)',mac),digits:4},{...metric('Modified duration (years)',mod),digits:4},money('Modeled bond price',price),{...metric('Convexity (years squared)',c),digits:4},{...money('DV01: first-order value of one basis point',price*mod*.0001),digits:4},money('Exact price at shocked yield',shockPrice)],columns:['Coupon period','Years from settlement','Cash flow','Present value'],rows,additionalTables:[{title:'Parallel yield-shift comparison',columns:['Yield change (percentage points)','Duration-only price change (%)','Duration + convexity price change (%)','Exact fixed-cash-flow price change (%)'],rows:[[shift*100,-mod*shift*100,(-mod*shift+.5*c*shift*shift)*100,(shockPrice/price-1)*100]],note:'Shift is an absolute percentage-point change, not a relative percent change. Approximations can be inaccurate for large shifts; exact repricing holds all promised cash flows fixed.'}],notes:['Settlement is on a coupon date immediately after the previous payment. Enter whole remaining coupon periods: 20 semiannual periods means 10 years. No accrued interest, irregular first/last coupons, default, fees or taxes are modeled.','Yield is nominal annual compounded at the selected coupon frequency. Macaulay duration is the present-value-weighted time to payment; modified duration divides it by 1 + yield / frequency. DV01 is the magnitude of the first-order price change per 0.01 percentage point yield rise.','Convexity is the second derivative of price with respect to decimal annual nominal yield, divided by price. The approximation uses one-half times convexity times the squared decimal yield shift.','This is a fixed-cash-flow bond model, not effective duration for callable, putable or mortgage-backed securities. Those cash flows may change with rates. A flat parallel yield shift does not model every yield-curve movement. Price and risk measures scale with entered face value as appropriate.']};
}
export const bondDurationCalculator=tool('bond-duration',[
 {id:'fixed',title:'Fixed-Coupon Bond',description:'Measure interest-rate sensitivity for a bond with regular remaining coupon periods.',fields:[{...usd('face','Face value',1000),min:.01},percentage('coupon','Annual coupon rate',5),percentage('yield','Annual yield to maturity',6,-99,1000),select('frequency','Coupon payments per year',['1','2','4','12'],'2'),whole('periods','Remaining full coupon periods',20,'periods',1,1200),percentage('shift','Yield shock: percentage-point change',1,-1000,1000)],formula:'P = Σ CFᵢ / (1 + y/m)^i; Dmac = Σ(i/m) × PVᵢ / P; Dmod = Dmac / (1 + y/m).',calculate:bondDuration},
], 'Calculate Macaulay and modified bond duration, convexity and DV01. Inspect discounted coupons and compare a yield-shift approximation with fixed-cash-flow repricing.');
