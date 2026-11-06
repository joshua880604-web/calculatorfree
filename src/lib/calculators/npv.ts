import {tool} from './helpers';
import {area,money,select,type Values,type Result} from '../types';
import {value,percentage,choose,bounded} from './expansion-common';
import {lines,cell} from './remaining-inputs';
export function npv(v:Values,dated=false):Result{
 const rate=value(v,'rate',-99,1000)/100;
 let flows:{label:string;amount:number;time:number}[];
 if(dated){
  const parsed=lines(v.flows,2,500).map(([date,amount])=>{const day=Date.parse(date+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==date)throw Error('Use valid YYYY-MM-DD dates.');return {date,day,amount:cell(amount,-1e12)};}).sort((a,b)=>a.day-b.day);
  flows=parsed.map(x=>({label:x.date,amount:x.amount,time:(x.day-parsed[0].day)/86400000/365}));
 }else{
  const f=choose(v,'frequency',['Annual','Quarterly','Monthly']),frequency=f==='Annual'?1:f==='Quarterly'?4:12;
  flows=lines(v.flows,1,500).map(([amount],i)=>({label:String(i),amount:cell(amount,-1e12),time:i/frequency}));
 }
 const discounted=(r:number)=>flows.map(f=>({...f,pv:bounded(f.amount*Math.exp(-f.time*Math.log1p(r)))}));
 const rows=discounted(rate),sum=(r:number)=>bounded(discounted(r).reduce((s,f)=>s+f.pv,0)),inflows=rows.filter(x=>x.amount>0).reduce((s,f)=>s+f.pv,0),outflows=-rows.filter(x=>x.amount<0).reduce((s,f)=>s+f.pv,0);
 return {metrics:[money('Net present value',bounded(inflows-outflows)),money('Present value of inflows',inflows),money('Present value of outflows',outflows),money('Undiscounted net cash flow',flows.reduce((s,f)=>s+f.amount,0))],columns:[dated?'Date':'Period (0 = today)','Years from first flow','Cash flow','Discount factor','Present value'],rows:rows.map(f=>[f.label,f.time,f.amount,Math.exp(-f.time*Math.log1p(rate)),f.pv]),
 additionalTables:[{title:'Discount-rate sensitivity',columns:['Effective annual discount rate (%)','Net present value'],rows:[Math.max(-.99,rate-.02),rate,Math.min(10,rate+.02)].filter((r,i,a)=>a.indexOf(r)===i).map(r=>[r*100,sum(r)])}],
 notes:[dated?'Actual-date mode uses the earliest supplied date as time zero after sorting; same-date flows are allowed. Every year is a fixed 365 days (ACT/365), including intervals crossing leap years. This follows the Excel XNPV discounting convention.':'Periodic mode includes the first listed cash flow at time zero exactly once. Each later flow occurs at the end of its annual, quarterly or monthly period. The entered rate is effective annual; the equivalent period rate is (1 + annual rate)^(1 / periods per year) − 1.',
 'Enter outlays as negative and receipts as positive, including any later capital expenditure and terminal proceeds. The tool does not invent an initial investment, taxes, inflation, fees or resale value. Use cash flows and a discount rate on a consistent nominal/real and pre-/after-tax basis.',
 'Positive NPV means modeled inflows exceed modeled outflows after discounting at your chosen rate; negative NPV means a shortfall against that assumption. Neither result guarantees performance or determines a suitable discount rate for you.',
 'For Excel periodic reconciliation, add the time-zero cash flow to NPV(period rate, later flows); do not include it inside that NPV range. For actual dates use XNPV(annual rate, amounts, dates), with the earliest date first. Sensitivity varies the annual rate by two percentage points and is capped at the supported −99% to 1,000% range.']};
}
const rate=()=>percentage('rate','Effective annual discount rate',10,-99,1000);
export const npvCalculator=tool('npv',[
 {id:'periodic',title:'Periodic Cash Flows',description:'Discount signed cash flows at regular intervals, starting with a time-zero flow.',fields:[area('flows','Cash flows, starting today','-10000\n4000\n4000\n4000','One signed amount per line. First row is time zero; up to 500 rows.'),select('frequency','Spacing after the first flow',['Annual','Quarterly','Monthly']),rate()],formula:'NPV = Σ CFᵢ / (1 + effective annual discount rate)^(i / periods per year), including i = 0.',calculate:v=>npv(v)},
 {id:'dated',title:'XNPV: Actual Dates',description:'Discount irregular dated cash flows using actual days divided by 365.',fields:[area('flows','Dated cash flows: YYYY-MM-DD, amount','2026-11-06, -10000\n2027-11-06, 4000\n2028-11-05, 4000\n2029-11-05, 4000','One date and signed amount per line. Dates are sorted; up to 500 rows.'),rate()],formula:'XNPV = Σ CFᵢ / (1 + annual discount rate)^((dateᵢ − earliest date) / 365 days).',calculate:v=>npv(v,true)}
], 'Calculate net present value from periodic or irregular dated cash flows. Include initial investment, compare discount-rate scenarios and inspect every discounted amount.');
