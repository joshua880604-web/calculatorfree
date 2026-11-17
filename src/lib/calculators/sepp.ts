import tables from '../sepp-tables.json';
import {tool} from './helpers';
import {date,money,metric,type Values,type Result,type Field} from '../types';
import {usd,percentage,value} from './expansion-common';
const life:Record<string,number>=tables.singleLife,mortality:Record<string,number>=tables.mortality;
export function isoDate(raw:string,label='date'){
 const d=new Date(raw+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==raw)throw Error('Enter a valid '+label+' as YYYY-MM-DD.');
 return d;
}
// Clamp month-end birthdays/anniversaries rather than silently rolling into another month.
export function addCalendarMonths(d:Date,months:number){
 const first=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+months,1)),last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 first.setUTCDate(Math.min(d.getUTCDate(),last));return first;
}
const iso=(d:Date)=>d.toISOString().slice(0,10);
export function singleLifeAnnuityFactor(age:number,rate:number){
 let survival=1,factor=0;
 // Annuity-immediate, NOT an annuity-due: first modeled $1 is payable at year end if alive.
 for(let a=age;a<120;a++){survival*=1-mortality[String(a)];factor+=survival*Math.exp(-(a-age+1)*Math.log1p(rate));}
 return factor;
}
export function sepp(v:Values,method:'rmd'|'amortization'|'annuitization'='rmd'):Result{
 const birth=isoDate(v.birth,'birth date'),start=isoDate(v.start,'first payment date'),valuation=isoDate(v.valuation,'balance valuation date'),year=start.getUTCFullYear(),age=year-birth.getUTCFullYear(),age595=addCalendarMonths(birth,714),fifth=addCalendarMonths(start,60),later=fifth>age595?fifth:age595;
 if(year<2023||year>2100)throw Error('This worksheet supports new series starting from 2023 through 2100 under the currently stated rules. Historical series are unsupported.');
 if(age<18||age>59||start>=age595)throw Error('This first-payment worksheet supports ages 18–59 in the start year, with the first payment before age 59½.');
 const previousEnd=new Date(Date.UTC(year-1,11,31));
 if(valuation<previousEnd||valuation>start)throw Error('Use a valuation date from the prior December 31 through the first payment date.');
 if(method==='rmd'&&valuation.getTime()!==previousEnd.getTime())throw Error('RMD-method first-year calculations here require the prior December 31 balance and that valuation date.');
 const balance=value(v,'balance',.01),years=life[String(age)];
 let rate=0,ceiling=0,factor=years;
 if(method!=='rmd'){
  rate=value(v,'rate',0,30)/100;
  ceiling=Math.max(5,value(v,'afr_prior',0,30),value(v,'afr_second',0,30));
  if(rate*100>ceiling+1e-10)throw Error('Selected interest exceeds the greater of 5% and your entered IRS 120% mid-term rates for the two preceding months.');
  factor=method==='amortization'?(rate===0?years:-Math.expm1(-years*Math.log1p(rate))/rate):singleLifeAnnuityFactor(age,rate);
 }
 const annual=balance/factor;
 const metrics=[money('Estimated first-year annual SEPP amount',annual),money('Annual amount / 12 for budgeting',annual/12),metric('Age on birthday in first payment year',age),{...metric('Calculation divisor / annuity factor',factor),digits:8},money('Account balance used',balance),{...metric('Earliest general duration milestone',0),displayValue:iso(later)}];
 if(method!=='rmd')metrics.push(metric('Selected annual calculation interest rate',rate*100,'percent'),metric('Ceiling from baseline and entered IRS rates',ceiling,'percent'));
 return {metrics,columns:['Calculation assumption','Value'],rows:[['Method',method==='rmd'?'Single Life RMD method':method==='amortization'?'Single Life fixed amortization':'Single Life fixed annuitization'],['First payment date',v.start],['Balance valuation date',v.valuation],['Single Life period (years)',years],['59½ calendar-date milestone',iso(age595)],['Fifth anniversary of first payment',iso(fifth)],['Later of the two general milestones',iso(later)]],
 notes:[
 'New single-life traditional IRA series starting in 2023 or later only, using Notice 2022-6 and the current Single Life and mortality tables. This first-year estimate does not establish a series or determine eligibility. Joint lives, inherited accounts, employer-plan separation rules, pre-2023 series and nonqualified annuities are outside this worksheet.',
 method==='rmd'?'The SEPP RMD method uses the prior December 31 balance divided by Single Life expectancy for age on your birthday in the payment year. Recalculate the balance and age-based divisor each year; do not freeze this first-year amount. This is different from an age-based owner RMD obligation.':`The fixed ${method==='amortization'?'amortization':'annuitization'} amount is set for the first year under the stated assumptions; it is not automatically recalculated with annual investment returns. The selected calculation interest rate is not a forecast portfolio return.`,
 ...(method==='rmd'?[]:[`For a first payment in ${v.start.slice(0,7)}, enter any higher published IRS 120% federal mid-term rates from ${iso(addCalendarMonths(new Date(Date.UTC(year,start.getUTCMonth(),1)),-1)).slice(0,7)} and ${iso(addCalendarMonths(new Date(Date.UTC(year,start.getUTCMonth(),1)),-2)).slice(0,7)}. Enter the already-published 120% figure, not the base AFR. A zero entry uses only the 5% baseline. Rates are manual assumptions; no historical IRS rate is fetched or authenticated.`]),
 ...(method==='annuitization'?['The annuity-immediate divisor sums annual year-end $1 payments weighted by survival probabilities from 26 CFR 1.401(a)(9)-9(e), through terminal age 120. It does not use life expectancy as a substitute for a mortality-based annuity factor. The finite table horizon is a disclosed numerical convention, not a personalized longevity forecast.']:[]),
 'The displayed duration milestone is the later of the fifth anniversary and age 59½, not permission to change or stop payments on that date. Month-end date additions clamp to the last valid day; confirm leap-day and distribution-year timing with the custodian or tax professional. A permitted one-time switch from a fixed method to RMD in a later distribution year does not remove the original duration obligation.',
 'Each SEPP is managed for its own account. Adding funds, taking extra payments or making disallowed transfers can modify a series and create recapture tax and interest. Income tax can still apply. This tool does not calculate tax, recapture, withholding, eligibility, proration for a partial first year or the actual installment calendar. Annual / 12 is a budget equivalent; confirm annual totals and rounding with the custodian.']};
}
const common=():Field[]=>[date('birth','IRA owner birth date','1976-08-15'),date('start','First SEPP payment date','2026-11-17'),date('valuation','Account balance valuation date','2025-12-31'),usd('balance','One traditional IRA account balance',400000)];
const rates=():Field[]=>[percentage('rate','Selected annual calculation interest rate',4,0,30),{...percentage('afr_prior','IRS 120% mid-term rate: prior month',0,0,30),hint:'Optional higher ceiling: enter the published 120% figure for the month before your first payment. 0 keeps the 5% baseline.'},{...percentage('afr_second','IRS 120% mid-term rate: two months prior',0,0,30),hint:'Optional higher ceiling: enter the published 120% figure for two months before your first payment. No rates are looked up automatically.'}];
export const seppCalculator=tool('72t',[
 {id:'rmd',title:'RMD Method',description:'Estimate the first annual amount using the IRS Single Life table.',fields:common(),formula:'First-year SEPP = prior December 31 balance / Single Life expectancy at age in the payment year.',calculate:v=>sepp(v)},
 {id:'amortization',title:'Fixed Amortization',description:'Level annual payments using Single Life expectancy and a selected permitted rate.',fields:[...common(),...rates()],formula:'Annual SEPP = balance × i / [1 − (1+i)^−life expectancy]; at i=0 use balance / expectancy.',calculate:v=>sepp(v,'amortization')},
 {id:'annuitization',title:'Fixed Annuitization',description:'Use the IRS mortality table to calculate a single-life, year-end annuity divisor.',fields:[...common(),...rates()],formula:'Annual SEPP = balance / Σ [survival probability through year t / (1+i)^t], t starts at 1.',calculate:v=>sepp(v,'annuitization')}
], 'Estimate first-year 72(t) / SEPP distributions with the RMD, fixed amortization and mortality-based fixed annuitization methods for a new single-life traditional IRA series.');
