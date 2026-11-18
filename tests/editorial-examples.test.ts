import test from 'node:test';
import assert from 'node:assert/strict';
import {runCalculation} from '../src/lib/calculators';
import {guides} from '../src/lib/guides';
import reference from '../docs/financial-clone/evidence/editorial-examples-decimal-20261118.json';

const inputKey=(values:object)=>JSON.stringify(Object.entries(values).map(([k,v])=>[k,String(v)]).sort());
for(const fixture of reference.fixtures){
 test('Published scenario matches independent Decimal arithmetic: '+fixture.id+' / '+fixture.title,()=>{
  const example=guides[fixture.id].examples.find(e=>e.mode===fixture.mode&&inputKey(e.values)===inputKey(fixture.values));
  assert.ok(example,'The independent scenario must remain reproducible from a published example');
  const result=runCalculation(fixture.id,fixture.mode,Object.fromEntries(Object.entries(fixture.values).map(([k,v])=>[k,String(v)])));
  for(const [label,expected] of Object.entries(fixture.expected)){
   const actual=result.metrics.find(m=>m.label===label);assert.ok(actual,label);
   assert.ok(Math.abs(actual.value-Number(expected))<=Math.max(1e-8,Math.abs(Number(expected))*1e-12),`${label}: ${actual.value} != ${expected}`);
  }
 });
}
