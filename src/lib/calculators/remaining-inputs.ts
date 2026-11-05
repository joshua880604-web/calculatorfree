import {metric} from '../types';
export function lines(raw:string,columns:number,max=100){
 const rows=(raw??'').trim().split(/\r?\n/).filter(s=>s.trim());
 if(!raw?.trim()||rows.length>max)throw Error(`Enter 1 to ${max} rows.`);
 return rows.map((line,i)=>{const parts=line.split(',').map(x=>x.trim());if(parts.length!==columns||parts.some(x=>!x))throw Error(`Row ${i+1}: enter ${columns} comma-separated values without thousands separators.`);return parts;});
}
export function cell(raw:string,min=0,max=1e12){const x=Number(raw);if(!Number.isFinite(x)||x<min||x>max)throw Error(`Use finite numbers from ${min} to ${max}, without currency symbols.`);return x;}
export function pctMetric(label:string,n:number,d:number){return d>0?metric(label,n/d*100,'percent'):{...metric(label,0,'percent'),displayValue:'Undefined: denominator is zero'};}

