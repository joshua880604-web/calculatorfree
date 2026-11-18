import {tool} from './helpers';
import {num,select,metric,money,type Values,type Result} from '../types';
import {value,choose,usd} from './expansion-common';
import {ratioMetric} from './working-capital-common';

const units=['Basis points','Percent / percentage points','Decimal'] as const;
const signed=(key:string,label:string,initial:number,unit?:string,limit=1e9)=>({...num(key,label,initial,unit,-limit),max:limit});
const rateMetric=(label:string,n:number,format:'number'|'percent'='number')=>({...metric(label,n,format),displayValue:new Intl.NumberFormat('en-US',{maximumSignificantDigits:12}).format(n)+(format==='percent'?'%':'')});
const notes=[
 'One financial basis point is 0.01 percentage point, or 0.0001 as a decimal fraction. Basis points express an absolute rate difference, not a relative percentage increase. This tool does not calculate data-transfer bits per second.',
 'Signed values preserve increases and decreases. Currency amounts use USD as the display label; the proportional arithmetic works for any consistently used currency. No market rate or quotation is retrieved.',
];
export function basisConversion(v:Values):Result{
 const unit=choose(v,'unit',units),entered=value(v,'value',-1e9,1e9);
 const bps=unit===units[0]?entered:unit===units[1]?entered*100:entered*10000;
 return {metrics:[rateMetric('Basis points',bps),rateMetric('Equivalent percent',bps/100,'percent'),rateMetric('Equivalent decimal fraction',bps/10000)],columns:['Unit','Equivalent numeric value'],rows:[['Basis points',bps],['Percent / percentage points',bps/100],['Decimal fraction',bps/10000]],notes};
}
export function basisRateChange(v:Values):Result{
 const start=value(v,'start_rate',-1e6,1e6),end=value(v,'end_rate',-1e6,1e6),delta=end-start;
 return {metrics:[rateMetric('Rate change in basis points',delta*100),rateMetric('Rate change in percentage points',delta),rateMetric('Starting rate',start,'percent'),rateMetric('Ending rate',end,'percent'),ratioMetric('Relative change from positive starting rate',start>0?delta/start*100:null,'Not shown for a nonpositive starting rate','percent')],columns:['Measure','Value'],rows:[['Starting rate (%)',start],['Ending rate (%)',end],['Absolute change (percentage points)',delta],['Absolute change (basis points)',delta*100]],notes:[...notes,'Subtract the entered rate percentages before multiplying by 100. For 5% to 5.25%, the absolute change is 25 bps while the relative increase is 5%. The relative comparison is shown only for a positive starting rate; negative and zero starting rates require a separate interpretation.']};
}
export function basisAmount(v:Values):Result{
 const amount=value(v,'amount'),bps=value(v,'bps',-1e6,1e6),change=amount*bps/10000;
 return {metrics:[money('Amount represented by entered basis points',change),money('Amount used as the calculation base',amount),rateMetric('Basis points applied',bps),rateMetric('Equivalent rate',bps/100,'percent')],columns:['Calculation','Amount'],rows:[['Base amount',amount],['Basis points / 10,000',bps/10000],['Proportional amount',change]],notes:[...notes,'This is base amount × bps / 10,000, with no time period implied. A 25-bps annual fee on an unchanged $200,000 balance is $500 for one year, but this worksheet does not model changing balances, compounding, mortgage payment changes or fee billing dates.']};
}
export const basisPointCalculator=tool('basis-point',[
 {id:'convert',title:'Convert BPS, Percent & Decimal',description:'Convert one signed rate quantity between financial basis points, percent and decimal form.',fields:[signed('value','Value to convert',25),select('unit','Input unit',[...units])],formula:'Basis points = percent × 100 = decimal fraction × 10,000.',calculate:basisConversion},
 {id:'rate-change',title:'Change Between Two Rates',description:'Separate an absolute basis-point change from the relative percentage change.',fields:[signed('start_rate','Starting rate',5,'%',1e6),signed('end_rate','Ending rate',5.25,'%',1e6)],formula:'Rate change in bps = (ending percentage − starting percentage) × 100.',calculate:basisRateChange},
 {id:'amount',title:'Basis Points of an Amount',description:'Apply an entered basis-point quantity to a fixed monetary base.',fields:[usd('amount','Amount used as the calculation base',200000),signed('bps','Basis points to apply',25,'bps',1e6)],formula:'Proportional amount = base amount × basis points / 10,000.',calculate:basisAmount},
], 'Convert financial basis points to percent and decimals, compare two rates, or calculate the amount represented by basis points on a fixed balance.');
