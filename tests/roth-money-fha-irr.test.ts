import test from 'node:test';
import assert from 'node:assert/strict';
import cases from '../src/lib/roth-money-fha-irr-cases.json';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {calculateMode} from '../src/lib/calculate-mode';
import {calculationLink,sharedInputs} from '../src/lib/sharing';
import {calculatorScope} from '../src/lib/calculator-scope';
import {embedContext} from '../src/lib/embed-context';
import {resultExportData} from '../src/lib/result-export';

for(const [i,c]of cases.entries())test(`Independent equal-budget / lease / financing / valuation case ${i+1}: ${c.calculatorId}/${c.mode}`,()=>{
 const tool=calculators.find(t=>t.id===c.calculatorId)!,mode=tool.modes.find(m=>m.id===c.mode)!;
 const values={...defaults(mode),...Object.fromEntries(Object.entries(c.values).map(([k,v])=>[k,String(v)]))};
 const result=runCalculation(tool.id,mode.id,values);
 for(const [label,expected]of Object.entries(c.metrics)){
  const actual=result.metrics.find(m=>m.label===label);assert.ok(actual,`Missing ${label}`);
  assert.ok(Math.abs(actual.value-expected)<1e-6,`${label}: ${actual.value} versus ${expected}`);
 }
 if('schedule_checks'in c)for(const check of c.schedule_checks??[]){const value=result.rows?.[check.row]?.[check.column];assert.equal(typeof value,'number');assert.ok(Math.abs(Number(value)-check.value)<1e-6);}
 // This is also the shared client/embed calculation wrapper.
 assert.deepEqual(calculateMode(tool,mode.id,values),result);
});
const tool=calculators.find(t=>t.id==='401k')!,mode=tool.modes.find(m=>m.id==='roth-vs-traditional')!;
const values=defaults(mode);
test('Roth comparison rejects over-allowance budgets instead of silently changing their basis',()=>{
 const atLimit={...values,amount:String(24500*.78)};
 assert.equal(runCalculation(tool.id,mode.id,atLimit).metrics.find(m=>m.label==='Annual traditional contribution')?.value,24500);
 assert.throws(()=>runCalculation(tool.id,mode.id,{...atLimit,amount:String(Number(atLimit.amount)+1)}),/exceeds/);
 assert.throws(()=>runCalculation(tool.id,mode.id,{...values,basis:'Same employee contribution',amount:'24501'}),/exceeds/);
});
test('Invalid tax, timing, amount and basis inputs do not produce plausible-looking comparisons',()=>{
 const patches:Record<string,string>[]=[{current_tax:'100'},{retirement_tax:'101'},{retirement_tax:'-1'},{years:'1.5'},{years:'0'},{rate:'-100'},{amount:'-1'},{amount:'NaN'},{allowance:'-1'},{basis:'unknown'}];
 for(const patch of patches)assert.throws(()=>runCalculation(tool.id,mode.id,{...values,...patch}));
});
test('A restored comparison link and export retain the budget basis and qualified-withdrawal scope',async()=>{
 const entered={...values,basis:'Same employee contribution',amount:'10000',retirement_tax:'32'};
 const url=new URL(calculationLink('https://www.calculatorfree.io',routeFor(tool.id),mode,entered,true));
 assert.equal(url.search,'');const restored=sharedInputs(tool,'',url.hash)!;
 assert.equal(restored.mode.id,mode.id);assert.deepEqual(restored.values,entered);
 const result=runCalculation(tool.id,mode.id,restored.values),exported=await resultExportData(tool.id,mode,restored.values,result);
 assert.equal(exported.scope,calculatorScope(tool.id,mode.id,entered));
 assert.match(exported.scope??'',/Qualified Roth|Qualified|qualified/);assert.match(exported.notes.join(' '),/different take-home budgets/);
 const context=embedContext(tool.id,entered,mode.id)!;assert.equal(context.scope,exported.scope);assert.match(context.disclaimer,/Equal-contribution/);
 assert.notEqual(embedContext(tool.id,entered,'projection')!.scope,context.scope);
 assert.equal(tool.modes[0].id,'projection');
});
