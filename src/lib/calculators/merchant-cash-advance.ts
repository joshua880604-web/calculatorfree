import {tool} from './helpers';
import {date,money,metric,select,type Values,type Result,type Metric} from '../types';
import {value,integer,usd,percentage,whole,choose} from './expansion-common';
const DAY=86400000,MAX_ANNUAL_PERCENT=1000000;
export const mcaCalendars=['Every calendar day','Weekdays (Mon–Fri only)','Weekly (every 7 days)'] as const;
function readDate(raw:string,label:string){if(!/^\d{4}-\d{2}-\d{2}$/.test(raw??''))throw Error('Enter a valid '+label+'.');const t=Date.parse(raw+'T00:00:00Z');if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==raw||Number(raw.slice(0,4))<2000||Number(raw.slice(0,4))>2100)throw Error('Use a real '+label+' in 2000–2100.');return t;}
const iso=(t:number)=>new Date(t).toISOString().slice(0,10);
const weekday=(t:number)=>![0,6].includes(new Date(t).getUTCDay());
export function annualMcaIrr(net:number,flows:{day:number;amount:number}[]):Metric{
 const label='Illustrative effective annual IRR, not legal APR';
 const pv=(q:number)=>{let sum=0,correction=0;for(const f of flows){const adjusted=f.amount/net*Math.exp(-q*f.day/365)-correction,next=sum+adjusted;correction=(next-sum)-adjusted;sum=next;}return sum;};
 if(Math.abs(pv(0)-1)<=Number.EPSILON*8)return metric(label,0,'percent');
 let lo=0,hi=Math.log1p(MAX_ANNUAL_PERCENT/100);
 if(pv(hi)>1)return {...metric(label,0),displayValue:'Above 1,000,000% (display limit)'};
 for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(pv(mid)>1)lo=mid;else hi=mid;}
 return {...metric(label,Math.expm1((lo+hi)/2)*100,'percent'),digits:4};
}
export function merchantCashAdvance(v:Values,sales=false):Result{
 const advance=value(v,'advance',1,1e9),factor=value(v,'factor',1,3),fees=value(v,'withheld_fees',0,1e9),net=advance-fees;
 if(net<.01)throw Error('Upfront withheld fees must leave at least $0.01 in net funding.');
 const total=advance*factor,start=readDate(v.funding_date,'funding date'),first=readDate(v.first_debit,'first remittance date'),calendar=choose(v,'calendar',mcaCalendars);
 if(first<=start)throw Error('The first remittance must be after the funding date.');if(calendar===mcaCalendars[1]&&!weekday(first))throw Error('Choose a Monday–Friday first remittance for the weekday schedule.');
 let count:number,payment:number;
 if(sales){payment=value(v,'sales_per_interval',.01,1e10)*value(v,'holdback',.000001,100)/100;const complete=Math.floor(total/payment);count=complete+(total-complete*payment>Number.EPSILON*8*Math.max(total,payment)?1:0);count=Math.max(1,count);if(count>1000)throw Error('The sales/holdback assumption needs more than 1,000 remittances. Increase assumed sales or holdback, or reduce the advance.');}
 else{count=integer(v,'remittances',1,1000);payment=total/count;}
 const flows:{day:number;amount:number}[]=[],rows:(string|number)[][]=[];let t=first,previous=0;
 for(let i=1;i<=count;i++){
  const day=Math.round((t-start)/DAY);if(day>3650)throw Error('Keep the assumed remittance horizon within 3,650 calendar days.');
  const cumulative=i===count?total:Math.min(total,payment*i),amount=cumulative-previous;previous=cumulative;flows.push({day,amount});rows.push([i,iso(t),day,amount,cumulative,Math.max(0,total-cumulative)]);
  t+=DAY*(calendar===mcaCalendars[2]?7:1);if(calendar===mcaCalendars[1])while(!weekday(t))t+=DAY;
 }
 const cost=total-net,irr=annualMcaIrr(net,flows),last=flows.at(-1)!;
 return {metrics:[irr,money('Net cash received at funding',net),money('Total contracted remittances',total),money('Factor markup above gross advance',total-advance),money('Fees withheld at funding',fees),money('Total financing cash cost above net funding',cost),metric('Total cash cost divided by net funding',cost/net*100,'percent'),money('Initial scheduled remittance',flows[0].amount),money('Final scheduled remittance',last.amount),metric('Assumed number of remittances',count),metric('Calendar days from funding to final remittance',last.day),{...metric('Final assumed remittance date',0),displayValue:iso(start+last.day*DAY)}],columns:['Remittance','Assumed date','Calendar day after funding','Cash remitted','Cumulative remittances','Contract amount remaining'],rows,additionalTables:[{title:'Funding and remittance cash flows',columns:['Assumed date','Day after funding','Business cash flow'],rows:[[iso(start),0,net],...flows.map((f,i)=>[rows[i][1],f.day,-f.amount])],note:'One positive funding inflow and only later negative remittances. Annual IRR uses actual calendar-day offsets divided by 365; it is not a statutory APR disclosure.'},{title:'Gross to net funding and cost',columns:['Bridge item','USD'],rows:[['Gross advance',advance],['Withheld upfront fees',-fees],['Net funding received',net],['Total contracted remittances',total],['Remittances minus net funding',cost]]}],notes:[
 'One USD advance with factor-based total remittances and a single upfront fee withheld from funding. Net funding = gross advance − withheld fee; contracted remittances = gross advance × factor. The difference is a cash cost, not a reducing-balance interest charge. No further fees, refinancing, default, early-payoff discounts, refunds or legal classification of the contract are determined.',
 sales?'Revenue mode assumes the same eligible sales amount at every selected remittance interval. Multiply that sales amount by the entered holdback percentage, then reduce the final remittance to the remaining contract amount. Sales are an assumption, not a forecast; actual revenue changes, reconciliation and contract terms can alter both payment dates and annualized cost.':'Fixed-count mode divides the contracted total by the entered number of future remittances. It does not infer the count from a guessed number of business days per year. Every remittance is retained at model precision; an actual agreement may round debits differently.',
 'The first remittance is an explicit date strictly after funding. Choose every calendar day, weekdays excluding Saturday/Sunday only, or exactly seven days between weekly debits. Weekday mode does not exclude public holidays; it requires a weekday first debit. Up to 1,000 remittances and 3,650 calendar days are supported.',
 'The factor is not an APR. The displayed effective annual cash-flow IRR is the unique nonnegative rate making discounted future remittances equal net funding, using Actual/365 dates. It compounds the dated cash-flow rate and must not be compared as if it were a legally disclosed nominal APR. No state-specific commercial-financing disclosure rules are implemented. Values above 1,000,000% are explicitly flagged rather than represented as zero.',
 'A lower assumed sales/holdback amount extends the scenario and changes its annualized cost without changing the factor-based contracted total. A shorter modeled repayment time can raise annualized IRR. Neither scenario establishes whether a contract permits its payment pattern or whether financing is suitable or available.'
 ]};
}
const base=()=>[usd('advance','Gross advance before withheld fees',50000),{key:'factor',label:'Factor rate (1.30 means total remittances of 130% of advance)',value:1.3,min:1,max:3},usd('withheld_fees','Upfront fees withheld from funding',1500),date('funding_date','Funding date','2026-12-01'),date('first_debit','First remittance date','2026-12-02'),{...select('calendar','Assumed remittance calendar',[...mcaCalendars],mcaCalendars[1]),hint:'Weekday mode skips weekends only; public holidays are not excluded.'}];
export const merchantCashAdvanceCalculator=tool('merchant-cash-advance',[
 {id:'fixed-remittances',title:'Fixed Remittance Count',description:'Use a stated count and actual payment calendar, including fees withheld from funding.',fields:[...base(),whole('remittances','Number of remittances',130,'payments',1,1000)],formula:'Total remittances = gross advance × factor. Net funding = advance − withheld fee. Find effective annual r with net funding = Σ remittance / (1+r)^(calendar days/365).',calculate:v=>merchantCashAdvance(v)},
 {id:'sales-holdback',title:'Sales & Holdback Scenario',description:'Assume constant eligible sales per selected interval, with a reduced final remittance.',fields:[...base(),usd('sales_per_interval','Assumed eligible sales per remittance interval',5000),percentage('holdback','Share of each interval’s eligible sales remitted',10,.000001,100)],formula:'Assumed normal remittance = eligible sales per interval × holdback. Continue to the contracted total and truncate the final remittance. Annualize the resulting dated cash flows.',calculate:v=>merchantCashAdvance(v,true)}
], 'Separate factor rate, net funding and total remittances for a merchant cash advance. Model fixed or revenue-based cash-flow scenarios and an explicitly illustrative effective annual IRR.');
