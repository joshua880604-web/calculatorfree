import test from 'node:test';
import assert from 'node:assert/strict';
import cases from '../src/lib/calculation-guide-cases.json';
import content from '../src/lib/calculation-guide-content.json';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import {datesYears} from '../src/lib/finance';
for(const [topic,rows] of Object.entries(cases))for(const row of rows)test(`Independent Decimal calculation guide: ${topic}/${row.label}`,()=>{
 const c=calculators.find(c=>c.id===row.calculatorId)!;const m=c.modes.find(m=>m.id===row.mode)!;
 const v={...defaults(m),...Object.fromEntries(Object.entries(row.values).map(([k,v])=>[k,String(v)]))};const r=runCalculation(c.id,m.id,v);
 for(const [label,value] of Object.entries(row.metrics)){const a=r.metrics.find(m=>m.label===label);assert.ok(a,label);assert.ok(Math.abs(a.value-value)<1e-6,`${label}: ${a.value} versus ${value}`);}
});
test('Guide dated return convention matches the engine and warns about interim cash flows',()=>{
 assert.equal(datesYears('2024-01-01','2025-01-01'),366/365);
 assert.match(content.annualized.sections.find(s=>s.id==='excel')!.paragraphs.join(' '),/divided by 365 /);
 assert.match(content.annualized.sections.find(s=>s.id==='cash-flows')!.paragraphs.join(' '),/not appropriate/);
});

test('Property and business scenarios retain losses and the bundled-quote reconciliation',()=>{
 assert.ok(cases.house[0].metrics['Monthly budget difference versus renting']>0);
 assert.ok(cases.house[2].metrics['Monthly budget difference versus renting']<0);
 assert.equal(cases.house[3].metrics['Effective monthly tenant rent'],0);
 assert.ok(cases.cash[2].metrics['Cash-on-cash return']<0);
 assert.ok(cases.cash[4].metrics['Annual cash flow used']<0);
 assert.equal(cases.landed[0].metrics['Total landed cost'],cases.landed[3].metrics['Total landed cost']);
 assert.equal(cases.landed[3].metrics['Additional shipment costs'],0);
});
test('Each article table has the right columns and calculator inputs for every case',()=>{
 for(const [topic,data] of Object.entries(content)){
  const rows=cases[topic as keyof typeof content];
  for(const row of rows){assert.equal(row.display.length,data.columns.length-1);assert.ok(data.meta.calculatorIds.includes(row.calculatorId));}
 }
});

test('Property guide reference cases reconcile periods, financing, signed losses and fee treatment',()=>{
 assert.equal(cases.noi[0].metrics['Annual net operating income'],cases.noi[3].metrics['Annual net operating income']);
 assert.ok(cases.noi[2].metrics['Annual net operating income']<0);
 assert.equal(cases.cap[0].metrics['Annual net operating income'],cases.cap[1].metrics['Annual net operating income']);
 assert.ok(cases.cap[0].metrics['Capitalization rate']>cases.cap[1].metrics['Capitalization rate']);
 assert.ok(cases.rental[0].metrics['First-year cash flow']>0);
 assert.ok(cases.rental[0].metrics['Total investment profit']<0);
 assert.ok(cases.rental[1].metrics['First-year cash flow']<0);
 assert.equal(cases.rental[0].metrics['Capitalization rate'],cases.rental[4].metrics['Capitalization rate']);
 assert.equal(cases.heloc[0].metrics['Monthly repayment'],cases.heloc[4].metrics['Monthly repayment']);
 assert.equal(cases.heloc[0].metrics['Total interest'],cases.heloc[4].metrics['Total interest']);
 assert.equal(cases.heloc[5].metrics['Total interest'],0);
 assert.ok(cases.heloc[5].metrics['Monthly repayment']>0);
});
