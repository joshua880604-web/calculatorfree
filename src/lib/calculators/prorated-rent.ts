import {tool} from './helpers';
import {date,select,money,metric,type Values,type Result} from '../types';
import {value,integer,whole,usd,choose} from './expansion-common';

export const rentBases=['Actual days in each month','30-day month','365-day year','Actual days in each year'] as const;
const dayMs=86400000;
function parseDay(raw:string,label:string):Date{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw??''))throw Error('Enter a valid '+label+' date.');
 const [y,m,d]=raw.split('-').map(Number),day=new Date(Date.UTC(y,m-1,d));
 if(y<1900||y>2100||day.toISOString().slice(0,10)!==raw)throw Error('Enter a real '+label+' date between 1900 and 2100.');
 return day;
}
const iso=(d:Date)=>d.toISOString().slice(0,10);
const monthDays=(y:number,m:number)=>new Date(Date.UTC(y,m+1,0)).getUTCDate();
const yearDays=(y:number)=>(Date.UTC(y+1,0,1)-Date.UTC(y,0,1))/dayMs;
const scope=[
 'Use the billable dates and day-count method required by your agreement and applicable rules. This worksheet compares arithmetic conventions; it does not decide which charges are legally owed or whether a move-out day is billable.',
 'Calendar-month dates include both the first and last entered billable day. For an agreement that excludes the departure day, enter the preceding day as the last billable day. Calendar calculations use whole dates and do not depend on daylight-saving hours.',
 'Monthly rent is held constant. Deposits, utilities, fees, concessions, rent increases and statutory notice requirements are outside the calculation. No full-month cap is imposed on a fixed-30-day or annual-basis calculation; a 31-day charge may exceed one monthly rent.',
 'Calculations retain the unrounded daily rate and sum unrounded segment charges before rounding the displayed total. Contractual daily or per-line rounding can produce a different invoice total.',
];
export function rentByDates(v:Values):Result{
 const rent=value(v,'monthly_rent'),basis=choose(v,'basis',rentBases),start=parseDay(v.start,'first billable'),end=parseDay(v.end,'last billable');
 const days=(end.getTime()-start.getTime())/dayMs+1;
 if(days<1)throw Error('The last billable day must be on or after the first billable day.');
 if(days>3660)throw Error('Choose a date interval of at most 3,660 billable days.');
 const rows:(string|number)[][]=[];let total=0,cursor=new Date(start);
 while(cursor<=end){
  const y=cursor.getUTCFullYear(),m=cursor.getUTCMonth(),last=new Date(Math.min(end.getTime(),Date.UTC(y,m+1,0))),count=(last.getTime()-cursor.getTime())/dayMs+1;
  const denominator=basis===rentBases[0]?monthDays(y,m):basis===rentBases[1]?30:basis===rentBases[2]?365:yearDays(y);
  const numerator=basis===rentBases[2]||basis===rentBases[3]?rent*12:rent;
  const daily=numerator/denominator,charge=daily*count;total+=charge;
  rows.push([iso(cursor),iso(last),count,denominator,daily,charge]);cursor=new Date(last.getTime()+dayMs);
 }
 return {metrics:[money('Estimated rent for selected billable days',total),metric('Billable days included',days),money('Monthly rent used',rent),money('Average daily charge across selected dates',total/days),{...metric('Day-count method',0),displayValue:basis}],columns:['First billable day','Last billable day (inclusive)','Billable days','Days in selected denominator','Unrounded daily rate','Unrounded segment rent'],rows,notes:scope};
}
export function rentKnownDays(v:Values):Result{
 const rent=value(v,'monthly_rent'),count=integer(v,'billable_days',0,31),basis=choose(v,'basis',rentBases.slice(0,3));
 const month=integer(v,'month_days',28,31);
 if(count>month)throw Error('Billable days cannot exceed the entered calendar month length.');
 const denominator=basis===rentBases[0]?month:basis===rentBases[1]?30:365,numerator=basis===rentBases[2]?rent*12:rent,daily=numerator/denominator,total=daily*count;
 return {metrics:[money('Estimated rent for selected billable days',total),metric('Billable days included',count),money('Daily rate under selected method',daily),money('Monthly rent used',rent),{...metric('Day-count method',0),displayValue:basis}],columns:['Billable days','Entered month length','Selected denominator','Unrounded daily rate','Unrounded rent'],rows:[[count,month,denominator,daily,total]],notes:[...scope,'Known-days mode covers a single entered calendar month. Enter its actual 28–31-day length even when comparing a fixed-30 or 365-day basis. For leap-year annual methods or an interval spanning months, use By Billable Dates.']};
}
export const proratedRentCalculator=tool('prorated-rent',[
 {id:'dates',title:'By Billable Dates',description:'Split an inclusive date interval by calendar month and compare explicit day-count conventions.',fields:[usd('monthly_rent','Monthly rent',2000),date('start','First billable day (included)','2026-01-17'),date('end','Last billable day (included)','2026-01-31'),select('basis','Day-count method',[...rentBases])],formula:'Sum each segment: selected monthly or annual rent base / denominator days × billable days.',calculate:rentByDates},
 {id:'days',title:'By Known Billable Days',description:'Calculate one partial calendar month when you already know the billable day count.',fields:[usd('monthly_rent','Monthly rent',2000),whole('billable_days','Billable days in this calendar month',15,'days',0,31),whole('month_days','Actual calendar days in this month',31,'days',28,31),select('basis','Day-count method',[...rentBases.slice(0,3)])],formula:'Partial rent = rent base / selected denominator days × entered billable days.',calculate:rentKnownDays},
], 'Estimate partial-month rent by dates or known billable days. Compare actual-calendar, fixed-30-day and annual day-count methods with a visible breakdown.');
