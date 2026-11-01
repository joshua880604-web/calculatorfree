import type {Result} from './types';
export type EmbedReport={title:string;columns:string[];rows:(string|number)[][];note:string;totalRows:number};
// Select existing model output only. No recomputation or new financial assumptions.
export function embedReport(id:string,result:Result):EmbedReport|null{
 const table=id==='drip'?result.additionalTables?.find(t=>t.title==='Where the final wealth comes from'):
 id==='mortgage-vs-invest'?result.additionalTables?.find(t=>t.title==='Same horizon, different investment return assumptions'):
 id==='roth-conversion-ladder'?result.additionalTables?.find(t=>t.title==='Each conversion has its own five-tax-year clock'):undefined;
 if(!table){
  // Keep long schedules inside an optional, horizontally scrollable excerpt.
  if(!result.columns?.length||!result.rows?.length)return null;
  return {title:'Calculation details',columns:result.columns,rows:result.rows.slice(0,20),totalRows:result.rows.length,note:'Model-generated details under the entered assumptions. Open the full calculator for the complete schedule and other reports.'};
 }
 const indexes=id==='mortgage-vs-invest'?[0,3,6,7]:table.columns.map((_,i)=>i);
 const columns=id==='mortgage-vs-invest'?['Effective annual return (%)','Paydown-first position (USD)','Invest-first position (USD)','Invest-first advantage (USD)']:table.columns;
 return {title:table.title,columns,rows:table.rows.slice(0,20).map(row=>indexes.map(i=>row[i])),note:table.note??'',totalRows:table.rows.length};
}
