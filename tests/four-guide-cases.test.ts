import test from 'node:test';
import assert from 'node:assert/strict';
import cases from '../src/lib/four-guide-cases.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
for(const [i,c]of cases.entries())test(`Independent Decimal additional-guide case ${i+1}: ${c.calculatorId}/${c.mode}`,()=>{
 const tool=calculators.find(t=>t.id===c.calculatorId)!,mode=tool.modes.find(m=>m.id===c.mode)!;
 const result=runCalculation(c.calculatorId,c.mode,{...defaults(mode),...Object.fromEntries(Object.entries(c.values).map(([k,v])=>[k,String(v)]))});
 for(const [label,expected]of Object.entries(c.metrics)){const metric=result.metrics.find(m=>m.label===label);assert.ok(metric,`Missing ${label}`);assert.ok(Math.abs(metric.value-expected)<1e-6,`${label}: ${metric.value} versus ${expected}`);}
});
