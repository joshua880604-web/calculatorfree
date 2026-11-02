import test from 'node:test';
import assert from 'node:assert/strict';
import fixtures from './fixtures/calculator-depth-expected.json';
import {runCalculation,calculators,defaults} from '../src/lib/calculators';

// Expected amounts were calculated separately from the application engines:
// discounted cash flows, an amortization ledger, and annual book-value schedules.
test('Mode walkthrough amounts and intermediate schedule rows reconcile with independent calculations',()=>{
 for(const fixture of fixtures){
  const result=runCalculation(fixture.id,fixture.mode,Object.fromEntries(Object.entries(fixture.values).map(([key,value])=>[key,String(value)])));
  for(const [label,expected]of Object.entries(fixture.expected)){
   const actual=result.metrics.find(m=>m.label===label)?.value;
   assert.ok(actual!==undefined&&expected!==undefined&&Math.abs(actual-expected)<=fixture.tolerance,`${fixture.title}: ${label} ${actual} != ${expected}`);
  }
  if(fixture.rows){
   const expected=fixture.rows.all??[fixture.rows.first,fixture.rows.last];
   const actual=fixture.rows.all?result.rows:[result.rows?.[0],result.rows?.at(-1)];
   assert.equal(actual?.length,expected.length);
   expected.forEach((row,i)=>row!.forEach((amount,j)=>assert.ok(Math.abs(Number(actual?.[i]?.[j])-amount)<=.005,`${fixture.title}: row ${i}, column ${j}`)));
  }
 }
});

test('TVM period solving brackets normal positive-rate solutions before the far endpoint overflows',()=>{
 const mode=calculators.find(c=>c.id==='finance')!.modes.find(m=>m.id==='n')!;
 for(const [rate,future,n]of [[10,1210,2],[20,1200,1],[10,1000*Math.sqrt(1.1),.5]] as const){
  const result=runCalculation('finance','n',{...defaults(mode),PV:'-1000',PMT:'0',FV:String(future),rate:String(rate),pay:'1',compound:'1'});
  assert.ok(Math.abs(result.metrics[0].value-n)<1e-8);
 }
 assert.throws(()=>runCalculation('finance','n',{...defaults(mode),PV:'1000',PMT:'0',FV:'1000',rate:'10',pay:'1',compound:'1'}),/No solution/);
});
