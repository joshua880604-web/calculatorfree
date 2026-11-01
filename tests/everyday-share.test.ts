import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,routeFor,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {calculationLink,sharedInputs,summaryText} from '../src/lib/sharing';
import {everydayShareToolIds,hasShareTools,hasEmbed,hasPinterest,shareTabs,shareToolPaths,shareScenarioHelp} from '../src/lib/share-tools';
import {resultTables} from '../src/lib/share-formats';
import {imageMetrics} from '../src/lib/result-image-data';
test('Everyday links restore all 19 calculation modes without adding unsupported actions',async()=>{
 let count=0;
 for(const id of everydayShareToolIds){
  const c=calculators.find(c=>c.id===id)!;
  assert.ok(hasShareTools(id));assert.equal(shareToolPaths[routeFor(id).slice(0,-5)],id);
  assert.equal(hasEmbed(id),false);assert.equal(hasPinterest(id),false);assert.deepEqual(shareTabs(id),['Share','Cite','Export']);
  assert.doesNotMatch(shareScenarioHelp(id),/financial advisor|retirement/);
  for(const m of c.modes){
   const v=defaults(m),plain=new URL(calculationLink('https://example.com',routeFor(id),m,v)),url=new URL(calculationLink('https://example.com',routeFor(id),m,v,true));
   assert.equal(plain.search+plain.hash,'');assert.equal(url.search,'');
   const restored=sharedInputs(c,'',url.hash)!;assert.equal(restored.mode.id,m.id);assert.deepEqual(restored.values,v);
   const result=runCalculation(id,m.id,v);assert.deepEqual(await runClientCalculation(id,c.category,m.id,restored.values),result);assert.deepEqual(imageMetrics(id,m.id,result),result.metrics);count++;
  }
 }
 assert.equal(count,19);
});
test('Scientific links preserve encoded expressions, angle modes and independent expected results',()=>{
 const c=calculators.find(c=>c.id==='scientific')!,m=c.modes[0];
 for(const [expression,angle,expected] of [['sin(30) + 2^3','Degrees',8.5],['sin(pi/2) + log(100) + 5!','Radians',123],['2^3^2 + 100%','Degrees',513],['-2^2 + ln(e)','Radians',-3]] as const){
  const v={expression,angle},u=new URL(calculationLink('https://example.com',routeFor(c.id),m,v,true)),restored=sharedInputs(c,'',u.hash)!;assert.deepEqual(restored.values,v);
  const r=runCalculation(c.id,m.id,restored.values);assert.ok(Math.abs(r.metrics[0].value-expected)<1e-10);assert.equal(resultTables(r).length,0);assert.match(summaryText(c.title,m,c.id,r,u.href,v),new RegExp('Angle mode: '+angle));
 }
 const invalid=sharedInputs(c,'',new URL(calculationLink('https://example.com',routeFor(c.id),m,{expression:'1/0',angle:'Radians'},true)).hash)!;assert.throws(()=>runCalculation(c.id,m.id,invalid.values));
});
test('Calendar outputs and selected non-USD bill rounding survive summaries and image preparation',()=>{
 const date=calculators.find(c=>c.id==='date')!,m=date.modes.find(m=>m.id==='add')!,v={...defaults(m),start:'2028-02-28',days:'1'},r=runCalculation(date.id,m.id,v);assert.equal(r.metrics[0].displayValue,'2028-02-29');assert.match(summaryText(date.title,m,date.id,r,'https://example.com'),/2028-02-29/);assert.equal(imageMetrics(date.id,m.id,r)[0].displayValue,'2028-02-29');
 const tip=calculators.find(c=>c.id==='tip-bill-split')!,tm=tip.modes[0],tv={...defaults(tm),bill:'100',tax:'0',tip:'0',people:'3',currency:'JPY'},tr=runCalculation(tip.id,tm.id,tv);assert.deepEqual(tr.rows,[[1,34],[2,33],[3,33]]);assert.equal(tr.metrics[0].currency,'JPY');assert.doesNotMatch(summaryText(tip.title,tm,tip.id,tr,'https://example.com'),/\$/);assert.equal(resultTables(tr)[0].rows.length,3);
});
