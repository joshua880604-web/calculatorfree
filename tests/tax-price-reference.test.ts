import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators} from '../src/lib/calculators';
import reference from '../docs/financial-clone/evidence/tax-price-reference-20261119.json';
import content from '../src/lib/tax-price-reference.json';
import practical from '../src/lib/practical-guide-content.json';
import tasks from '../src/lib/focused-calculation-tasks.json';
import {calculatorPresetHref} from '../src/lib/preset-links';
function valuesOf(v:Record<string,string|undefined>){return Object.fromEntries(Object.entries(v).filter(([,value])=>value!==undefined)) as Record<string,string>;}

for(const c of reference.cases){test('Independent tax-price identity: '+c.key,()=>{
 const tool=calculators.find(t=>t.id===c.calculatorId)!;
 const mode=tool.modes.find(m=>m.id===c.mode)!;
 const values=Object.fromEntries(Object.entries(c.values).filter(([,v])=>v!==undefined)) as Record<string,string>;
 const result=mode.calculate(values);
 for(const[key,label]of Object.entries(c.calculatorId==='vat'?{net:'Net amount',tax:'VAT amount',gross:'Gross amount',rate:'VAT rate'}:{net:'Before-tax price',tax:'Sales tax',gross:'After-tax price',rate:'Tax rate'})){
  const actual=result.metrics.find(m=>m.label===label)!.value;
  const expected=Number(c.expected[key as keyof typeof c.expected]);
  assert.ok(Math.abs(actual-expected)<1e-9,`${c.key}: ${label}: ${actual} vs ${expected}`);
 }
});}

test('VAT task links clear every unknown field and all six input pairs recover one invoice',()=>{
 const vat=calculators.find(t=>t.id==='vat')!.modes[0];
 const pairs=new Set<string>();
 for(const c of content.rows.filter(c=>c.calculatorId==='vat')){
  assert.deepEqual(Object.keys(c.values).sort(),vat.fields.map(f=>f.key).sort());
  const known=Object.entries(c.values).filter(([,v])=>v!=='').map(([k])=>k).sort();
  assert.equal(known.length,2);pairs.add(known.join(','));
  const href=calculatorPresetHref('/vat-calculator',c.mode,c.values);
  const params=new URLSearchParams(href.split('#calc=')[1]);
  for(const[k,v]of Object.entries(c.values))assert.equal(params.get(k),v);
 }
 assert.equal(pairs.size,6);
 for(const id of ['sales-tax','vat'] as const){
  for(const task of tasks[id]){
   const mode=calculators.find(t=>t.id===id)!.modes.find(m=>m.id===task.mode)!;
   assert.deepEqual(Object.keys(task.values).sort(),mode.fields.map(f=>f.key).sort());
   assert.ok(mode.calculate(valuesOf(task.values)).metrics.every(m=>Number.isFinite(m.value)));
  }
 }
});

test('Tax guide compares tax dollars when rates vary, preserving complete input cases',()=>{
 const guide=practical.find(g=>g.slug==='tax-inclusive-prices-sales-tax-and-vat')!;
 assert.equal(guide.cases.length,4);
 for(const c of guide.cases){
  const expectedLabel=c.calculatorId==='sales-tax'?'Sales tax':'VAT amount';
  const mode=calculators.find(t=>t.id===c.calculatorId)!.modes.find(m=>m.id===c.mode)!;
  assert.equal(c.focus.label,expectedLabel);
  assert.equal(c.focus.value,mode.calculate(valuesOf(c.values)).metrics.find(m=>m.label===expectedLabel)!.value);
 }
 assert.deepEqual(guide.cases.map(c=>c.focus.value),[7,0,20,10]);
 assert.equal(reference.rounding.lineTax,'0.00');assert.equal(reference.rounding.basketTax,'0.01');
});
