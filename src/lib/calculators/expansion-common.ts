import {num,number as read,metric,type Values,type Field,type Metric} from '../types';

export function value(v:Values,key:string,min=0,max=1e12){
 const x=read(v,key);if(x<min||x>max)throw Error(`${key.replaceAll('_',' ')} must be between ${min} and ${max}.`);return x;
}
export function integer(v:Values,key:string,min:number,max:number){const x=value(v,key,min,max);if(!Number.isInteger(x))throw Error(`${key.replaceAll('_',' ')} must be a whole number.`);return x;}
export const usd=(key:string,label:string,initial:number,hint?:string):Field=>({...num(key,label,initial,'$'),max:1e12,...(hint?{hint}:{})});
export const percentage=(key:string,label:string,initial:number,min=0,max=100):Field=>({...num(key,label,initial,'%',min),max});
export const whole=(key:string,label:string,initial:number,unit:string,min:number,max:number):Field=>({...num(key,label,initial,unit,min),max,step:1});
export function ratio(label:string,numerator:number,denominator:number){return denominator>0?{...metric(label,numerator/denominator),digits:3}:{...metric(label,0),displayValue:'Undefined: denominator is zero'};}
export function choose(v:Values,key:string,options:readonly string[]){if(!options.includes(v[key]))throw Error(`Choose ${key.replaceAll('_',' ')}.`);return v[key];}
export function bounded(x:number){if(!Number.isFinite(x)||Math.abs(x)>1e100)throw Error('The projection exceeds the supported numeric range. Reduce amounts, rates or duration.');return x;}
export function leadMetrics(metrics:Metric[],labels:string[]){return [...labels.flatMap(label=>metrics.filter(m=>m.label===label)),...metrics.filter(m=>!labels.includes(m.label))];}
