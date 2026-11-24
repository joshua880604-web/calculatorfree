import test from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {expansionFieldVisible} from '../src/lib/expansion-field-visibility';
import {resultExportData} from '../src/lib/result-export';
import {anniversary,equityDate,equityISO,longTerm} from '../src/lib/calculators/equity-tax-common';
import {readFileSync} from 'node:fs';
import reference from '../docs/financial-clone/evidence/rsu-espp-reference-20261124.json';
import disclaimers from '../src/lib/calculator-disclaimers.json';import type {Result} from '../src/lib/types';
const run=(id:string,mode:string,patch:Record<string,unknown>={})=>{const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});};
const get=(r:Result,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<=Math.max(1e-7,Math.abs(b)*1e-12),`${a} != ${b}`);
for(const f of reference.fixtures)test('Independent stock-compensation arithmetic: '+f.key,()=>{const r=run(f.id,f.mode,f.values);for(const [label,value]of Object.entries(f.expected))close(get(r,label),Number(value));});
for(const id of ['rsu-tax','espp-tax']){
 const c=calculators.find(c=>c.id===id)!;
 for(const m of c.modes)test('Stock-compensation client and export: '+id+'/'+m.id,async()=>{const v=defaults(m),r=run(id,m.id);assert.deepEqual(await runClientCalculation(id,c.category,m.id,v),r);const e=await resultExportData(id,m,v,r);assert.equal(e.scope,guides[id].scope);assert.ok(e.copy.interpretation);assert.doesNotMatch(e.copy.interpretation!,/null|undefined|NaN|Infinity/);});
 test('Stock-compensation complete presets, links and scope: '+id,()=>{assert.ok(calculatorCategory(id));assert.equal((disclaimers as Record<string,string>)[id],guides[id].scope);assert.ok(readFileSync(new URL('../public/data/comparison-guides/'+id+'.csv',import.meta.url),'utf8').includes('Expected value'));for(const e of guides[id].examples){const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());close(get(run(id,m.id,e.values),e.expected.label),e.expected.value);}assert.equal(comparisonGuides[id].presets.length,guides[id].examples.length);for(const link of relatedCalculatorIds[id])assert.ok(relatedCalculatorIds[link].includes(id));});
}
test('Delivery conserves gross value and federal gap excludes supplied other withholding',()=>{
 for(const prior of [0,998000,1e6]){const r=run('rsu-tax','delivery',{prior_supplemental:prior});close(get(r,'Value after allocated withholding')+get(r,'Total allocated withholding'),get(r,'Taxable wage value at delivery'));}
 const a=run('rsu-tax','delivery'),b=run('rsu-tax','delivery',{other_withholding:0});close(get(a,'Assumed federal tax minus federal withholding'),get(b,'Assumed federal tax minus federal withholding'));
 assert.ok(get(run('rsu-tax','delivery',{prior_supplemental:1e6}),'Assumed federal tax minus federal withholding')<0);
});
test('Optional and actual withholding hide and ignore the other method’s input',()=>{
 assert.equal(expansionFieldVisible('rsu-tax',{method:'2026 optional supplemental method'},'actual_federal'),false);assert.equal(expansionFieldVisible('rsu-tax',{method:'Enter actual federal withholding'},'prior_supplemental'),false);
 close(get(run('rsu-tax','delivery',{actual_federal:''}),'Federal income tax withheld'),1100);close(get(run('rsu-tax','delivery',{method:'Enter actual federal withholding',prior_supplemental:'',actual_federal:1234}),'Federal income tax withheld'),1234);
});
test('Already-taxed RSU basis is not a second wage charge and losses get no automatic benefit',()=>{
 const r=run('rsu-tax','sale');close(get(r,'Adjusted basis of sold shares'),3500);close(get(r,'Capital gain / loss on sold shares'),2090);
 const loss=run('rsu-tax','sale',{sale_price:40});close(get(loss,'Capital gain / loss on sold shares'),-710);close(get(loss,'Assumed capital-gain tax on positive gain'),0);
});
test('ESPP compensation and capital loss conserve economic gain despite different tax classifications',()=>{
 for(const mode of ['known-price','discount-price'])for(const sale_price of [0,60,68,80,120])for(const purchase of ['2024-06-01','2026-06-01']){const r=run('espp-tax',mode,{sale_price,purchase});close(get(r,'Ordinary compensation income at disposition')+get(r,'Capital gain / loss after compensation basis'),get(r,'Economic profit / loss before assumed tax'));close(get(r,'Original purchase cost')+get(r,'Ordinary compensation income at disposition'),get(r,'Adjusted basis of sold shares'));}
 const r=run('espp-tax','known-price',{grant:'2025-01-01',purchase:'2025-06-01',sale:'2026-07-01'});assert.equal(get(r,'Disposition date-test result'),0);assert.equal(get(r,'Capital holding-period classification'),1);
});
test('Calendar anniversaries do not use fixed 365-day years',()=>{
 const leap=equityDate('2024-02-29','acquisition');assert.equal(equityISO(anniversary(leap,1)),'2025-02-28');assert.equal(longTerm(leap,equityDate('2025-02-28','sale')),false);assert.equal(longTerm(leap,equityDate('2025-03-01','sale')),true);
 const r=run('espp-tax','known-price',{grant:'2024-11-24',purchase:'2025-01-01'});assert.equal(get(r,'Disposition date-test result'),0);assert.ok(r.notes!.some(n=>n.includes('exact anniversary')));
});
test('Stock compensation rejects unsupported years, plans, bad data and impossible allocated withholding',()=>{
 for(const patch of [{settlement:'2027-01-01'},{settlement:'2026-02-30'},{shares:0},{fmv:0},{actual_federal:6000,method:'Enter actual federal withholding'},{other_withholding:5000},{method:'Unknown'},{shares:1e8,fmv:1e8},{shares:.000001,fmv:.000001,method:'Enter actual federal withholding',actual_federal:.01,other_withholding:0}])assert.throws(()=>run('rsu-tax','delivery',patch));
 for(const patch of [{sold:'2027-01-01'},{acquired:'2026-12-01'},{sold_shares:''},{sale_price:-1}])assert.throws(()=>run('rsu-tax','sale',patch));
 for(const patch of [{plan:'Nonqualified plan or unsure'},{sale:'2025-12-01'},{grant:'2026-11-25'},{purchase:'2022-01-01'},{paid:1},{grant_option:1},{shares:0},{sale:'2026-02-30'}])assert.throws(()=>run('espp-tax','known-price',patch));
 for(const patch of [{discount:16},{discount:-1},{price_base:'Unknown'}])assert.throws(()=>run('espp-tax','discount-price',patch));
});
