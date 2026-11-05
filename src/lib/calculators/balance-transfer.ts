import {tool} from './helpers';
import {money,metric,select,type Values,type Result} from '../types';
import {value,integer,usd,percentage,whole,choose,bounded} from './expansion-common';
type Offer={fee:number;financed:boolean;intro:number;months:number;after:number};
type Path={interest:number;paid:number;balance:number;count:number;remainingAtPromo:number;rows:(string|number)[][];complete:boolean};
function offer(v:Values,prefix:string,principal:number):Offer{
 const percent=value(v,prefix+'fee_rate',0,100),minimum=value(v,prefix+'fee_min'),financed=choose(v,prefix+'fee_payment',['Added to balance','Paid separately'])==='Added to balance';
 return {fee:principal>0?Math.max(principal*percent/100,minimum):0,financed,intro:value(v,prefix+'intro',0,100)/100,months:integer(v,prefix+'months',0,1200),after:value(v,prefix+'after',0,100)/100};
}
function project(principal:number,payment:number,o:Offer):Path{
 let balance=principal+(o.financed?o.fee:0),interest=0,paid=0,count=0,remainingAtPromo=o.months===0?balance:0;
 const rows:(string|number)[][]=[];
 for(let month=1;month<=1200&&balance>1e-8;month++){
  const apr=month<=o.months?o.intro:o.after,opening=balance,charge=bounded(opening*apr/12),amount=Math.min(opening+charge,payment);
  balance=Math.max(0,bounded(opening+charge-amount));interest+=charge;paid+=amount;count=month;
  rows.push([month,apr*100,opening,charge,amount,balance]);
  if(month===o.months)remainingAtPromo=balance;
 }
 return {interest,paid,balance,count,remainingAtPromo,rows,complete:balance<=1e-8};
}
function requiredPayment(principal:number,o:Offer){
 if(o.months===0)return null;const balance=principal+(o.financed?o.fee:0),r=o.intro/12;
 return Math.abs(r)<1e-12?balance/o.months:balance*r/-Math.expm1(-o.months*Math.log1p(r));
}
export function balanceTransfer(v:Values,compare=false):Result{
 const principal=value(v,'balance'),budget=value(v,'payment',.01),a=offer(v,'a_',principal);
 const original:Offer={fee:0,financed:false,intro:0,months:0,after:compare?0:value(v,'current_apr',0,100)/100};
 const b=compare?offer(v,'b_',principal):original,ra=project(principal,budget,a),rb=project(principal,budget,b),name=compare?'Offer B':'Original card';
 const costs=(r:Path,o:Offer)=>r.interest+o.fee,complete=ra.complete&&rb.complete;
 const saving=complete?money(compare?'Total borrowing-cost savings: A vs B':'Total borrowing-cost savings from transfer',costs(rb,b)-costs(ra,a)):{...money(compare?'Total borrowing-cost savings: A vs B':'Total borrowing-cost savings from transfer',0),displayValue:'Not comparable: a path is not repaid within 100 years'};
 const count=(label:string,r:Path)=>r.complete?metric(label,r.count):{...metric(label,1200),displayValue:'Not repaid within 1,200 months'};
 const needed=requiredPayment(principal,a);
 return {metrics:[saving,money('Transfer fee: offer A',a.fee),money('Interest: offer A',ra.interest),money('Borrowing cost: offer A',costs(ra,a)),count('Months to repay: offer A',ra),money('Balance when offer A promotion ends',ra.remainingAtPromo),needed===null?{...money('Monthly payment to clear offer A during promotion',0),displayValue:'No promotional period selected'}:money('Monthly payment to clear offer A during promotion',needed),money(`Interest: ${name}`,rb.interest),money(`Fee: ${name}`,b.fee),count(`Months to repay: ${name}`,rb),money('Unpaid balance after projection: offer A',ra.balance),money(`Unpaid balance after projection: ${name}`,rb.balance)],
 columns:['Month','APR (%)','Opening balance','Interest','Payment','Ending balance'],rows:ra.rows,
 additionalTables:[{title:compare?'Offer B repayment':'Original card repayment',columns:['Month','APR (%)','Opening balance','Interest','Payment','Ending balance'],rows:rb.rows,note:'The same fixed monthly payment budget applies. The last payment is capped at the remaining amount due.'}],
 notes:[
 'One USD balance is transferred in full. The same fixed monthly payment is used for every path; payments occur at month end after APR/12 interest. Fractional cents are retained internally. This monthly illustration can differ from an issuer’s daily-balance interest calculation and required minimum payment.',
 'Transfer fee = the larger of transferred balance × fee percentage and the entered minimum, with no fee for a zero transfer. A financed fee enters the initial balance and earns the same modeled APR as that balance; a separately paid fee is an additional time-zero cash outlay and is not financed. Actual fee APR treatment can differ by card.',
 'The introductory APR applies for exactly the selected number of monthly periods; the subsequent APR starts the following month on the remaining balance. This is not a deferred-interest plan with retroactive interest. A zero-month offer starts immediately at its subsequent APR.',
 'Borrowing cost is interest plus the one-time transfer fee, including a financed fee only once. A positive savings amount favors offer A. Lifetime cost differences are displayed only when both paths repay within 1,200 months; otherwise review unpaid balances and the truncated interest schedules. No present-value adjustment is made.',
 'The promotion-end balance is zero if the balance repays sooner. The required promotional payment includes a financed fee but excludes a separately paid fee. Minimum fees and longer repayment can outweigh a lower introductory APR.',
 'No new purchases, annual fees, rewards, late fees, missed payments, rate changes beyond the two stated APRs, partial transfers, issuer eligibility or credit-score changes are modeled. Separately paid fees require cash in addition to the common monthly budget.'
 ]};
}
const common=()=>[usd('balance','Balance to transfer in full',6000),usd('payment','Fixed monthly repayment budget',350)];
const fields=(prefix:string,label:string,months:number)=>[percentage(prefix+'fee_rate',`${label}: transfer fee`,3),usd(prefix+'fee_min',`${label}: minimum transfer fee`,5),select(prefix+'fee_payment',`${label}: fee payment`,['Added to balance','Paid separately']),percentage(prefix+'intro',`${label}: introductory APR`,0),whole(prefix+'months',`${label}: promotional duration`,months,'months',0,1200),percentage(prefix+'after',`${label}: APR after promotion`,24)];
export const balanceTransferCalculator=tool('balance-transfer',[
 {id:'transfer',title:'Transfer vs. Original Card',description:'Compare one full balance transfer with keeping the same balance on the original card, using the same monthly payment.',formula:'Monthly interest = opening balance × applicable APR / 12. Borrowing-cost savings = original-card interest − (transfer interest + transfer fee), when both paths repay.',fields:[...common(),percentage('current_apr','Original card APR',24),...fields('a_','New card',18)],calculate:v=>balanceTransfer(v)},
 {id:'offers',title:'Compare Two Transfer Offers',description:'Compare two fee and promotional-rate combinations using the same balance and repayment budget.',formula:'For each offer, model its financed or upfront fee, promotional months and later APR; compare total interest plus its one-time fee.',fields:[...common(),...fields('a_','Offer A',18),...fields('b_','Offer B',12)],calculate:v=>balanceTransfer(v,true)}
], 'Compare credit-card balance transfer fees, promotional APRs and payoff schedules. Check whether interest savings cover the fee and how much to pay before the promotion ends.');
