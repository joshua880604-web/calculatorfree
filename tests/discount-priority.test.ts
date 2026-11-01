import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {calculationLink,sharedInputs} from '../src/lib/sharing';

const run=(mode:string,values:Record<string,string>)=>runCalculation('discount',mode,values);
const values=(mode:string,v:Record<string,string>)=>Object.fromEntries(run(mode,v).metrics.map(m=>[m.label,m.value]));
test('Four existing discount operations retain their numbers and emphasize the solved amount',()=>{
  for(const [mode,v,primary,answer]of[
    ['percent',{before:'100',rate:'20'},'Sale price',80],
    ['amount',{before:'100',saved:'25'},'Sale price',75],
    ['original',{after:'80',rate:'20'},'Original price',100],
    ['rate',{before:'100',after:'80'},'Discount rate',20],
  ]as const){const r=run(mode,v);assert.equal(r.metrics[0].label,primary);assert.equal(r.metrics[0].value,answer);}
});
test('Stacked reductions preserve the remaining-price base and full intermediate precision',()=>{
  const a=values('stacked',{before:'100',first:'20',second:'20'});
  assert.equal(a['Sale price'],64);assert.equal(a['Amount saved'],36);assert.equal(a['Discount rate'],36);
  assert.equal(a['Price after first discount'],80);
  const b=values('stacked',{before:'199.95',first:'12.5',second:'20'});
  assert.ok(Math.abs(b['Sale price']-139.965)<1e-10);
  assert.equal(values('stacked',{before:'100',first:'100',second:'50'})['Sale price'],0);
  assert.equal(values('stacked',{before:'100',first:'20',second:'0'})['Sale price'],80);
});
test('Invalid reductions and non-invertible original prices are rejected',()=>{
  assert.throws(()=>run('stacked',{before:'100',first:'101',second:'10'}));
  assert.throws(()=>run('stacked',{before:'100',first:'20',second:'-1'}));
  assert.throws(()=>run('original',{after:'0',rate:'100'}));
});
test('Stacked-discount sharing restores the complete mode and calculation inputs',()=>{
  const c=calculators.find(c=>c.id==='discount')!,mode=c.modes.find(m=>m.id==='stacked')!;
  const v={...defaults(mode),before:'199.95',first:'12.5',second:'20'};
  const u=new URL(calculationLink('https://www.calculatorfree.io',routeFor(c.id),mode,v,true));
  const restored=sharedInputs(c,'',u.hash)!;
  assert.equal(restored.mode.id,'stacked');assert.deepEqual(restored.values,v);
  assert.deepEqual(run(restored.mode.id,restored.values),run(mode.id,v));
});
