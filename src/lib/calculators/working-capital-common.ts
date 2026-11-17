import {metric,type Metric,type Values} from '../types';
import {whole,integer} from './expansion-common';
export const periodDaysField=()=>whole('days','Days in this reporting period',365,'days',1,3660);
export const periodDays=(v:Values)=>integer(v,'days',1,3660);
export function turnover(flows:number,averageBalance:number){return averageBalance>0?flows/averageBalance:null;}
export function balanceDays(flows:number,averageBalance:number,days:number){return flows>0?days*averageBalance/flows:null;}
export function ratioMetric(label:string,amount:number|null,missing:string,format:Metric['format']='number'):Metric{
 return amount===null?{...metric(label,0),displayValue:missing}:metric(label,amount,format);
}
export const ratioCell=(n:number|null)=>n===null?'Not defined for a zero denominator':n;
