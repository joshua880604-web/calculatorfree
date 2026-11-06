import {test} from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {shareToolIds,remainingFinancialShareToolIds,shareToolPaths,hasShareTools,hasEmbed,hasPinterest,shareTabs,shareScenarioHelp} from '../src/lib/share-tools';
import {calculationLink,sharedInputs,modeCaption,formatMetric} from '../src/lib/sharing';
import {resultExportData} from '../src/lib/result-export';
test('Sharing covers every financial calculator alongside the everyday extension, excluding directories',()=>{
 const financial=calculators.filter(c=>!c.directory&&calculatorCategory(c.id)?.id!=='everyday');assert.equal(financial.length,126);assert.deepEqual(new Set(shareToolIds.filter(id=>calculatorCategory(id)?.id!=='everyday')),new Set(financial.map(c=>c.id)));assert.equal(remainingFinancialShareToolIds.length,82);
 for(const c of calculators){if(c.directory)assert.equal(hasShareTools(c.id),false);else{assert.equal(hasShareTools(c.id),true);assert.equal(shareToolPaths[routeFor(c.id).slice(0,-5)],c.id);assert.deepEqual(shareTabs(c.id),hasEmbed(c.id)?['Share','Embed','Cite','Export']:['Share','Cite','Export']);}}
 assert.equal(shareToolIds.filter(hasEmbed).length,88);assert.equal(shareToolIds.filter(hasPinterest).length,58);
});
test('All 162 remaining financial modes preserve their complete input fragment round trips',()=>{
 let count=0;for(const id of remainingFinancialShareToolIds){const c=calculators.find(c=>c.id===id)!;for(const m of c.modes){const values=defaults(m),link=new URL(calculationLink('https://www.calculatorfree.io',routeFor(id),m,values,true)),restored=sharedInputs(c,link.search,link.hash)!;assert.equal(restored.mode.id,m.id);assert.deepEqual(restored.values,values);assert.deepEqual(runCalculation(id,m.id,restored.values),runCalculation(id,m.id,values));count++;}}assert.equal(count,162);
});
test('Tax years, selected currencies, reference dates and signed marriage outcomes survive export preparation',async()=>{
 const tax=calculators.find(c=>c.id==='income-tax')!,tm=tax.modes[0],tv={...defaults(tm),year:'2025'};assert.ok(modeCaption(tm,tv).includes('2025'));const taxData=await resultExportData(tax.id,tm,tv,runCalculation(tax.id,tm.id,tv));assert.match(taxData.scope!,/tax year 2025/);assert.match(shareScenarioHelp(tax.id),/tax professional/);
 const c=calculators.find(c=>c.id==='currency')!,m=c.modes.find(m=>m.id==='manual')!,v={...defaults(m),from:'USD',to:'JPY',amount:'2',rate:'150'};const raw=runCalculation(c.id,m.id,v),data=await resultExportData(c.id,m,v,raw);assert.ok(modeCaption(m,v).includes('USD → JPY'));assert.equal(data.metrics[0].value,300);assert.ok(!formatMetric(data.metrics[0]).includes('$'));assert.ok(data.notes.some(n=>n.includes('Manual rate')&&n.includes('JPY')));
 const saved=c.modes.find(m=>m.id==='snapshot')!,sv={...defaults(saved),from:'EUR',to:'GBP'},snapshot=await resultExportData(c.id,saved,sv,runCalculation(c.id,saved.id,sv));assert.ok(snapshot.notes.some(n=>n.includes('component')&&n.includes('not live')));
 const marriage=calculators.find(c=>c.id==='marriage-tax')!,mm=marriage.modes[0],mv=defaults(mm),r=runCalculation(marriage.id,mm.id,mv),exported=await resultExportData(marriage.id,mm,mv,r);const signed=r.metrics.at(-1)!;assert.equal(exported.metrics[0].value,Math.abs(signed.value));assert.match(exported.metrics[0].label,/savings|additional tax|difference/);
});
