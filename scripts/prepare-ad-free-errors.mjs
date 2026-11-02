import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';

export const adFreeErrorPages=['404.html','_not-found.html'];
const adSource=/https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?/;

// Static export inherits the root head on errors. Remove the loader before
// hosting, including its Flight row so hydration cannot restore it. A changed
// Next serialization format fails the assertion rather than silently shipping ads.
export function stripErrorFlightAds(payload){
 return payload.replace(/^([0-9a-f]+):(\[.*\])$/gm,(row,id,value)=>{
  let element;try{element=JSON.parse(value);}catch{return row;}
  return Array.isArray(element)&&element[0]==='$'&&element[1]==='script'&&adSource.test(element[3]?.src??'')?id+':null':row;
 });
}
export function stripErrorDocumentAds(html){
 const output=html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,script=>{
  if(/^<script\b[^>]*\bsrc=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?[^"']*["'][^>]*>/i.test(script))return '';
  const match=script.match(/^(<script\b[^>]*>self\.__next_f\.push\()([\s\S]*)(\)<\/script>)$/);
  if(!match)return script;
  const chunk=JSON.parse(match[2]);
  if(chunk[0]!==1||typeof chunk[1]!=='string')return script;
  chunk[1]=stripErrorFlightAds(chunk[1]);
  return match[1]+JSON.stringify(chunk).replaceAll('<','\\u003c')+match[3];
 });
 assert.ok(!/adsbygoogle|googlesyndication/i.test(output),'Error document still contains an ad reference; inspect the Next export format');
 return output;
}
export async function prepareAdFreeErrors(root='out'){
 for(const name of adFreeErrorPages){const path=join(root,name);await writeFile(path,stripErrorDocumentAds(await readFile(path,'utf8')));}
 // Keep the error route's exported Flight responses consistent with its HTML.
 async function cleanFlight(path){
  const text=stripErrorFlightAds(await readFile(path,'utf8'));
  assert.ok(!/adsbygoogle|googlesyndication/i.test(text),'Error Flight payload still contains an ad reference: '+path);
  await writeFile(path,text);
 }
 await cleanFlight(join(root,'_not-found.txt'));
 for(const name of await readdir(join(root,'_not-found'))){if(name.endsWith('.txt'))await cleanFlight(join(root,'_not-found',name));}
}
