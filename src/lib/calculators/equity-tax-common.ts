import rules from '../equity-tax-rules.json';
const DAY=86400000;
export function equityDate(raw:string,label:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(raw??''))throw Error(`Enter a valid ${label} as YYYY-MM-DD.`);
 const t=Date.parse(raw+'T00:00:00Z');if(!Number.isFinite(t)||new Date(t).toISOString().slice(0,10)!==raw||Number(raw.slice(0,4))<2000||Number(raw.slice(0,4))>2100)throw Error(`Enter a real ${label} from 2000 to 2100.`);return t;
}
export function anniversary(t:number,years:number){const d=new Date(t),year=d.getUTCFullYear()+years,month=d.getUTCMonth(),last=new Date(Date.UTC(year,month+1,0)).getUTCDate();return Date.UTC(year,month,Math.min(d.getUTCDate(),last));}
export const equityISO=(t:number)=>new Date(t).toISOString().slice(0,10);
export const holdingDays=(a:number,b:number)=>Math.round((b-a)/DAY);
export function requireEquityTaxYear(t:number){if(new Date(t).getUTCFullYear()!==rules.supportedTaxYear)throw Error('This worksheet currently supports tax year 2026 events only.');}
export const longTerm=(acquired:number,sold:number)=>sold>anniversary(acquired,1);
