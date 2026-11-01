import test from 'node:test';
import assert from 'node:assert/strict';
import rows from '../src/lib/house-affordability-income-cases.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
for(const row of rows)test(`Independent Decimal60 income scenario: ${row.income}`,()=>{
 const c=calculators.find(c=>c.id===row.calculatorId)!;
 const mode=c.modes.find(m=>m.id===row.mode)!;
 const values={...defaults(mode),...Object.fromEntries(Object.entries(row.values).map(([k,v])=>[k,String(v)]))};
 const result=runCalculation(c.id,mode.id,values);
 for(const [label,expected] of Object.entries(row.metrics)){
  const actual=result.metrics.find(m=>m.label===label);assert.ok(actual,label);
  assert.ok(Math.abs(actual.value-expected)<1e-6,`${label}: ${actual.value} versus ${expected}`);
 }
});
