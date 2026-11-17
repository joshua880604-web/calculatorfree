import {tool} from './helpers';
import {money,metric,type Values,type Result} from '../types';
import {usd,percentage,whole,value,integer} from './expansion-common';

export const buydownPlans={'2-1':[2,1],'3-2-1':[3,2,1],'1-0':[1],'1-1':[1,1]} as const;
export function fixedPayment(principal:number,annualPercent:number,months:number){
 const i=annualPercent/1200;
 return i===0?principal/months:principal*i/-Math.expm1(-months*Math.log1p(i));
}
export function mortgageBuydown(v:Values,plan:keyof typeof buydownPlans):Result{
 const p=value(v,'principal',.01),rate=value(v,'rate',0,30),months=integer(v,'months',12,600),discounts=buydownPlans[plan];
 if(months<discounts.length*12)throw Error('The term must cover every full year of the selected buydown plan.');
 if(rate<Math.max(...discounts))throw Error('The note rate must cover the largest temporary payment-rate reduction. Negative payment-calculation rates are unsupported.');
 const contract=fixedPayment(p,rate,months),borrower=discounts.map(d=>fixedPayment(p,rate-d,months));
 let balance=p,totalSubsidy=0;const rows:(string|number)[][]=[],monthly:(string|number)[][]=[];
 for(let k=1;k<=months;k++){
  const interest=balance*rate/1200,paid=k===months?balance+interest:contract,principal=paid-interest;
  const year=Math.floor((k-1)/12),subsidy=year<discounts.length?contract-borrower[year]:0,own=paid-subsidy;
  balance=Math.max(0,balance-principal);totalSubsidy+=subsidy;
  monthly.push([k,own,subsidy,paid,interest,principal,balance]);
  if(k%12===0||k===months){const stage=monthly.slice(year*12,k);rows.push([year+1,year<discounts.length?rate-discounts[year]:rate,year<discounts.length?borrower[year]:contract,stage.reduce((s,r)=>s+Number(r[2]),0),balance]);}
 }
 return {metrics:[money('First-year borrower monthly P&I',borrower[0]),money('Contract monthly P&I at note rate',contract),money('Total temporary subsidy funding',totalSubsidy),money('Monthly P&I after buydown',contract),money('Payment increase after first year',discounts.length>1?borrower[1]-borrower[0]:contract-borrower[0]),metric('Subsidized payment years',discounts.length)],columns:['Payment year','Illustrative payment-calculation rate (%)','Borrower monthly P&I','Subsidy during year','Contract year-end balance'],rows,
 additionalTables:[{title:'Monthly payment and contract amortization',columns:['Month','Borrower P&I','Subsidy','Full lender P&I','Contract interest','Contract principal','Ending balance'],rows:monthly}],
 notes:[`The ${plan} plan reduces the rate used to illustrate borrower payments, in percentage points. The note remains fixed at ${rate}%. Each lower payment uses the original principal and original term; it is not recalculated from a reduced balance or a shortened term.`,
 'The borrower payment plus subsidy equals the full lender P&I. The contract amortizes at the unchanged note rate. This subsidy is a funding cost paid by an eligible party, not a reduction in total contractual interest or an automatic seller concession entitlement.',
 'Payments are principal and interest only. Property tax, insurance, mortgage insurance, HOA dues, escrow changes and all closing charges are excluded. Displayed dollars are rounded; calculations retain full precision. The last lender payment may differ slightly to clear the balance.',
 'No loan eligibility, approval, financing commitment, subsidy-account interest, early-payoff refund or unused-funds ownership is determined. Qualify and budget for the full note-rate payment; compare a permanent discount-point offer separately.']};
}
export const mortgageBuydownCalculator=tool('mortgage-buydown',Object.keys(buydownPlans).map(id=>({id,title:id+' Buydown',description:'Compare borrower payments with the unchanged fixed-rate contract.',fields:[usd('principal','Original loan principal',300000),percentage('rate','Fixed note annual interest rate',7,0,30),whole('months','Original amortization term',360,'months',12,600)],formula:'Subsidy = note-rate P&I − reduced payment-rate P&I; both use original principal and term.',calculate:(v:Values)=>mortgageBuydown(v,id as keyof typeof buydownPlans)})), 'Compare 2-1, 3-2-1, 1-0 and 1-1 temporary mortgage buydowns. See borrower payments, total subsidy funding and the unchanged contract balance.');
