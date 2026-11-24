import test from 'node:test';import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {guides,relatedCalculatorIds} from '../src/lib/guides';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {calculatorCategory} from '../src/lib/calculator-categories';
import {resultExportData} from '../src/lib/result-export';
import reference from '../docs/financial-clone/evidence/roa-assumption-reference-20261124.json';
import disclaimers from '../src/lib/calculator-disclaimers.json';import type {Result} from '../src/lib/types';
const run=(id:string,mode:string,patch:Record<string,unknown>={})=>{const c=calculators.find(c=>c.id===id)!,m=c.modes.find(m=>m.id===mode)!;return runCalculation(id,mode,{...defaults(m),...Object.fromEntries(Object.entries(patch).map(([k,v])=>[k,String(v)]))});};
const get=(r:Result,label:string)=>{const m=r.metrics.find(m=>m.label===label);assert.ok(m,label);return m.value};
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<=Math.max(.00001,Math.abs(b)*1e-13),`${a} != ${b}`);
for(const f of reference.fixtures)test('Independent ROA / assumption arithmetic: '+f.key,()=>{const r=run(f.id,f.mode,f.values);for(const [label,value]of Object.entries(f.expected))close(get(r,label),Number(value));});
for(const id of ['return-on-assets','assumable-mortgage']){
 const c=calculators.find(c=>c.id===id)!;
 for(const m of c.modes)test('ROA / assumption client and export: '+id+'/'+m.id,async()=>{const v=defaults(m),r=run(id,m.id);assert.deepEqual(await runClientCalculation(id,c.category,m.id,v),r);const e=await resultExportData(id,m,v,r);assert.equal(e.scope,guides[id].scope);assert.ok(e.copy.interpretation);assert.doesNotMatch(e.copy.interpretation!,/\b(?:null|NaN|Infinity)\b/);});
 test('ROA / assumption complete presets, scope and related links: '+id,()=>{assert.ok(calculatorCategory(id));assert.equal((disclaimers as Record<string,string>)[id],guides[id].scope);for(const e of guides[id].examples){const m=c.modes.find(m=>m.id===e.mode)!;assert.deepEqual(Object.keys(e.values).sort(),m.fields.map(f=>f.key).sort());close(get(run(id,m.id,e.values),e.expected.label),e.expected.value);}assert.equal(comparisonGuides[id].presets.length,guides[id].examples.length);for(const link of relatedCalculatorIds[id])assert.ok(relatedCalculatorIds[link].includes(id));});
}
test('ROA denominator semantics preserve undefined states and signed losses',()=>{
 const r=run('return-on-assets','known-average',{average_assets:0,revenue:0});for(const label of ['Return on assets for entered period','Net profit margin for entered period','Asset turnover for entered period'])assert.match(r.metrics.find(m=>m.label===label)!.displayValue!,/Undefined/);
 close(get(run('return-on-assets','balances',{net_income:-50000}),'Return on assets for entered period'),-5);
 const z=run('return-on-assets','known-average',{revenue:0});close(get(z,'Return on assets for entered period'),12);assert.match(z.metrics.find(m=>m.label==='Net profit margin for entered period')!.displayValue!,/Undefined/);
});
test('ROA margin and turnover identity uses fractions and no automatic annualization',()=>{const r=run('return-on-assets','balances');close(get(r,'Net profit margin for entered period')*get(r,'Asset turnover for entered period'),get(r,'Return on assets for entered period'));close(get(r,'Return on assets for entered period'),12);});
test('Assumption cash and interest conserve the same price plus cost at every horizon',()=>{
 for(const mode of ['cash-gap','financed-gap'])for(const horizon_months of [1,12,60,120,240,360,600]){const r=run('assumable-mortgage',mode,{horizon_months});close(get(r,'Assumption cash through horizon including debt payoff'),450000+get(r,'Assumption scenario interest plus fees through horizon'));close(get(r,'New-loan cash through horizon including debt payoff'),450000+get(r,'New-loan interest plus fees through horizon'));close(get(r,'New-loan cash through horizon including debt payoff')-get(r,'Assumption cash through horizon including debt payoff'),get(r,'New-loan cost minus assumption cost through horizon'));assert.ok(r.rows!.every(row=>Number(row[5])>=0&&Number(row[8])>=0));}
});
test('Assumption schedule retires old debt, stops future payments and preserves negative advantage',()=>{
 const r=run('assumable-mortgage','cash-gap',{remaining_months:1,new_months:2,horizon_months:3});close(Number(r.rows![0][5]),0);close(Number(r.rows![1][1]),0);close(Number(r.rows![2][6]),0);
 assert.ok(get(run('assumable-mortgage','financed-gap',{assumed_rate:12,new_rate:2,assumption_fees:9000,new_fees:0}),'New-loan cost minus assumption cost through horizon')<0);
});
test('Zero gap ignores inapplicable financing fields while real gap validates them',()=>{
 const a=run('assumable-mortgage','financed-gap',{buyer_cash:150000,gap_rate:'',gap_months:'',gap_fees:''});const b=run('assumable-mortgage','cash-gap');assert.deepEqual(a.metrics,b.metrics);assert.deepEqual(a.rows,b.rows);assert.deepEqual(a.additionalTables,b.additionalTables);
 assert.throws(()=>run('assumable-mortgage','financed-gap',{gap_rate:''}));
});
for(const patch of [{price:200000},{buyer_cash:150001},{remaining_months:0},{horizon_months:1.5},{new_rate:31},{assumption_fees:-1},{assumed_balance:0},{gap_months:0}])test('Assumption rejects invalid scenario '+JSON.stringify(patch),()=>assert.throws(()=>run('assumable-mortgage','financed-gap',patch)));
for(const patch of [{net_income:''},{net_income:'Infinity'},{beginning_assets:-1},{ending_assets:-1},{revenue:-1},{target_roa:101}])test('ROA rejects invalid accounting input '+JSON.stringify(patch),()=>assert.throws(()=>run('return-on-assets','balances',patch)));
