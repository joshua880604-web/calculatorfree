import {tool} from './helpers';
import {money,metric,type Values,type Result} from '../types';
import {leadMetrics,value,integer,usd,percentage,whole,bounded} from './expansion-common';

type Plan={balance:number;months:number;rate:number;inflation:number;tax:number;income:number;start:number};
function plan(v:Values):Plan{
 const gross=value(v,'return',-99,50)/100,fee=value(v,'fee',0,10)/100;
 return {balance:value(v,'balance'),months:integer(v,'years',1,100)*12,
  rate:Math.pow((1+gross)*(1-fee),1/12)-1,inflation:value(v,'inflation',0,20)/100,
  tax:value(v,'tax',0,80)/100,income:value(v,'income'),start:integer(v,'income_start',0,100)*12};
}
function simulate(p:Plan,spending:number,report:boolean){
 let balance=p.balance,firstShortfall=0,totalWithdrawn=0,totalTax=0,totalShortfall=0,totalIncome=0,totalReturn=0;
 const rows:(string|number)[][]=[];let yearReturn=0,yearWithdrawn=0,yearTax=0,yearShortfall=0,yearIncome=0,yearSpending=0,opening=balance;
 for(let month=1;month<=p.months;month++){
  const factor=Math.pow(1+p.inflation,Math.floor((month-1)/12));
  const expense=spending*factor,income=month>p.start?p.income*factor:0,gap=Math.max(0,expense-income),requested=gap/(1-p.tax);
  const earned=bounded(balance*p.rate),available=Math.max(0,bounded(balance+earned)),taken=Math.min(available,requested),tax=taken*p.tax,shortfall=Math.max(0,gap-(taken-tax));
  balance=Math.max(0,available-taken);
  if(shortfall>Math.max(1e-7,gap*1e-10)&&!firstShortfall)firstShortfall=month;
  if(!report&&firstShortfall)return {firstShortfall,balance,rows,totalWithdrawn,totalTax,totalShortfall,totalIncome,totalReturn};
  totalWithdrawn+=taken;totalTax+=tax;totalShortfall+=shortfall;totalIncome+=income;totalReturn+=earned;
  yearReturn+=earned;yearWithdrawn+=taken;yearTax+=tax;yearShortfall+=shortfall;yearIncome+=income;yearSpending+=expense;
  if(report&&month%12===0){rows.push([month/12,opening,yearSpending,yearIncome,yearReturn,yearWithdrawn,yearTax,yearShortfall,balance]);opening=balance;yearReturn=yearWithdrawn=yearTax=yearShortfall=yearIncome=yearSpending=0;}
 }
 return {firstShortfall,balance,rows,totalWithdrawn,totalTax,totalShortfall,totalIncome,totalReturn};
}
export function retirementWithdrawal(v:Values,solve=false):Result{
 const p=plan(v);let spending=solve?0:value(v,'spending');
 if(solve){
  let lo=0,hi=Math.max(1,p.balance,p.income);
  for(let i=0;i<100&&!simulate(p,hi,false).firstShortfall;i++)hi=bounded(hi*2);
  if(!simulate(p,hi,false).firstShortfall)throw Error('A monthly spending bound could not be found.');
  for(let i=0;i<85;i++){const mid=(lo+hi)/2;if(simulate(p,mid,false).firstShortfall)hi=mid;else lo=mid;}
  // Move conservatively below the numerical feasibility boundary.
  spending=Math.max(0,lo*(1-1e-10));
 }
 const r=simulate(p,spending,true),initialIncome=p.start===0?p.income:0,initial=Math.max(0,spending-initialIncome)/(1-p.tax);
 const status=r.firstShortfall?{...metric('First funding shortfall month',r.firstShortfall),displayValue:`Month ${r.firstShortfall} (${Math.floor((r.firstShortfall-1)/12)} full years and ${(r.firstShortfall-1)%12} full months funded)`}:{...metric('First funding shortfall month',0),displayValue:`None within ${p.months/12} modeled years`};
 return {metrics:leadMetrics([money('Initial monthly spending budget',spending),money('Initial monthly portfolio withdrawal before tax',initial),p.balance>0?metric('Initial annual portfolio withdrawal rate',initial*12/p.balance*100,'percent'):{...metric('Initial annual portfolio withdrawal rate',0,'percent'),displayValue:'Undefined: starting portfolio is zero'},status,money('Portfolio balance at horizon',r.balance),money('Total portfolio withdrawals before tax',r.totalWithdrawn),money('Estimated tax on portfolio withdrawals',r.totalTax),money('Total unfunded spending',r.totalShortfall),money('Total other spendable income',r.totalIncome),money('Net investment growth after modeled fees',r.totalReturn)],solve?['Initial monthly spending budget','Initial monthly portfolio withdrawal before tax']:['First funding shortfall month','Portfolio balance at horizon','Initial monthly portfolio withdrawal before tax']),
 columns:['Year','Opening portfolio','Spending target','Other spendable income','Net investment growth','Gross portfolio withdrawal','Withdrawal tax','Unfunded spending','Ending portfolio'],rows:r.rows,
 notes:[
 'USD retirement drawdown starting now, with month-end withdrawals after investment growth. Spending and other income increase once at each completed year by the same entered inflation rate. The spending budget is the first year’s monthly amount. Other income is already spendable after its own tax and begins after the selected number of full years; it is not a benefit estimate.',
 'The gross annual return is effective. Annual net growth factor = (1 + return) × (1 − annual fee); its twelfth root sets monthly growth. This proportional fee convention excludes fixed fees and is not a forecast. Surplus other income is not reinvested.',
 'The flat withdrawal-tax assumption applies only to gross portfolio withdrawals: gross withdrawal = positive spending gap / (1 − tax rate). It does not calculate tax brackets, account ordering, Social Security taxation, RMDs, penalties or a tax return. Enter zero for a before-tax illustration or tax-free withdrawals.',
 'Withdrawals are capped at available assets. Unfunded spending records any remaining after-tax gap; the first shortfall is measured in whole monthly payment periods. The yearly table continues through the full selected horizon, even after a shortfall. A zero balance with sufficient other income is not automatically an unfunded month.',
 ...(solve?['Monthly spending is solved so that every modeled month is funded under these assumptions; it is not a recommended or guaranteed safe withdrawal amount. The portfolio is allowed to reach zero after the last payment.']:[]),
 'No historical returns, Monte Carlo probabilities or assurance of a safe rate are provided. Actual return sequences, changing inflation, taxes and spending can produce different outcomes. Use the 4 percent rule guide for the distinction between a selected withdrawal rate and retirement safety.'
 ]};
}
const fields=()=>[usd('balance','Starting retirement portfolio',1000000),whole('years','Retirement horizon',30,'years',1,100),percentage('return','Assumed effective annual return before fees',5,-99,50),percentage('fee','Annual asset fee',.5,0,10),percentage('inflation','Annual spending and income increase',2.5,0,20),usd('income','Other monthly spendable income',2000,'Combined Social Security, pension or other income after its own taxes. No automatic benefit lookup.'),whole('income_start','Other income starts after',0,'full years',0,100),percentage('tax','Flat tax assumption on portfolio withdrawals',0,0,80)];
export function withdrawalRateScenario(v:Values):Result{
 const p=plan(v),selected=value(v,'withdrawal_rate',0,100),gross=p.balance*selected/1200,spending=gross*(1-p.tax)+(p.start===0?p.income:0);
 const r=retirementWithdrawal({...v,spending:String(spending)});
 return {...r,metrics:[...r.metrics,metric('Selected initial annual withdrawal rate',selected,'percent')],notes:[`The selected ${selected}% rate sets the first year's gross portfolio withdrawal only. The initial spending budget adds any other income available now after the entered flat withdrawal tax. Later spending follows the inflation assumption; withdrawals are not recalculated each year as a percentage of the remaining portfolio.`,...r.notes!, 'This is a withdrawal-rate scenario, not an estimate of a safe withdrawal rate. No historical sequence, asset allocation, Monte Carlo success probability or individualized recommendation is used. Compare multiple return and inflation assumptions.']};
}
export function startingNestEgg(v:Values):Result{
 const p=plan(v),spending=value(v,'spending');let required=0;
 for(let month=1;month<=p.months;month++){const factor=(1+p.inflation)**Math.floor((month-1)/12),income=month>p.start?p.income*factor:0,gap=Math.max(0,spending*factor-income)/(1-p.tax);required=bounded(required+bounded(gap/Math.pow(1+p.rate,month)));}
 const report=retirementWithdrawal({...v,balance:String(required*(1+1e-12))});
 return {...report,metrics:[money('Required starting retirement nest egg',required),money('Additional retirement assets needed now',Math.max(0,required-p.balance)),money('Entered retirement assets minus required nest egg',p.balance-required),...report.metrics],notes:['The nest egg target is the present value of each monthly gross portfolio withdrawal, discounted with the same constant net return used in the drawdown model. Retirement starts now. The annual table illustrates the solved starting nest egg, not your entered current balance; the entered balance is used only for the funding gap.',...report.notes!, 'This finite-horizon target allows the modeled portfolio to reach zero after the last payment. It does not preserve a bequest, model pre-retirement accumulation or establish a safe nest egg. Use Retirement Calculator for a savings plan before retirement.']};
}
export const retirementWithdrawalCalculator=tool('retirement-withdrawal',[
 {id:'longevity',title:'How Long Will Savings Last?',description:'Project a monthly spending budget, other income and capped portfolio withdrawals over a selected retirement horizon.',formula:'Monthly gross withdrawal = max(0, spending − spendable other income) / (1 − withdrawal tax rate); ending assets = max(0, opening assets × monthly growth factor − gross withdrawal).',fields:[...fields(),usd('spending','Initial monthly spending budget',5000)],calculate:v=>retirementWithdrawal(v)},
 {id:'budget',title:'Find a Monthly Spending Budget',description:'Solve the initial monthly spending amount that stays funded throughout the selected constant-return scenario.',formula:'Solve the largest initial spending budget for which all monthly after-tax spending gaps can be funded through the selected horizon.',fields:fields(),calculate:v=>retirementWithdrawal(v,true)},
 {id:'rate',title:'Withdrawal Rate Scenario',description:'Test an initial portfolio withdrawal rate, then inspect an inflation-adjusted spending path and any funding shortfall. This does not calculate a guaranteed safe rate.',formula:'First-year gross monthly portfolio withdrawal = starting portfolio × initial annual withdrawal rate / 12. Spending then follows the entered inflation assumption.',fields:[...fields(),percentage('withdrawal_rate','Initial annual portfolio withdrawal rate',4)],calculate:withdrawalRateScenario},
 {id:'nest-egg',title:'Find a Starting Nest Egg',description:'Solve the starting portfolio needed now to fund a monthly spending gap over your selected constant-return retirement horizon.',formula:'Required nest egg = sum of each month’s positive after-tax income gap / (1 − withdrawal tax) / (1 + net monthly return)^month.',fields:[...fields(),usd('spending','Initial monthly spending budget',5000)],calculate:startingNestEgg}
], 'Estimate retirement withdrawals, a monthly spending budget and how long your savings may fund a spending gap. Include inflation, fees and other income, then inspect the annual balance and any unfunded spending.');
