import test from 'node:test';
import assert from 'node:assert/strict';
import {calculators,runCalculation} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {comparisonGuides} from '../src/lib/comparison-guides';
import {glossaryTerms} from '../src/lib/glossary';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs} from '../src/lib/sharing';
import reference from '../docs/financial-clone/evidence/companion-comparisons-reference-20261118.json';

for(const fixture of reference.fixtures){
 test('Independent guide comparison: '+fixture.topic+' / '+fixture.title,async()=>{
  const calc=calculators.find(c=>c.id===fixture.id)!;assert.ok(calc);
  const mode=calc.modes.find(m=>m.id===fixture.mode)!;
  assert.deepEqual(Object.keys(fixture.values).sort(),mode.fields.map(f=>f.key).sort());
  const values=Object.fromEntries(Object.entries(fixture.values).map(([k,v])=>[k,String(v)]));
  const result=runCalculation(calc.id,mode.id,values);
  for(const [label,expected] of Object.entries(fixture.expected)){
   const actual=result.metrics.find(m=>m.label===label);assert.ok(actual,label);
   assert.ok(Math.abs(actual.value-Number(expected))<=Math.max(1e-7,Math.abs(Number(expected))*1e-12),`${label}: ${actual.value} != ${expected}`);
  }
  assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,values),result);
  const guide=comparisonGuides[fixture.topic];const link=guide.presets.find(p=>p.label===fixture.title);assert.ok(link);
  assert.equal(link.mode,mode.id);
  const href=calculatorPresetHref(link.path,link.mode,link.values),decoded=sharedInputs(calc,'',href.slice(href.indexOf('#')))!;
  assert.equal(decoded.mode.id,mode.id);assert.deepEqual(decoded.values,values);
 });
}
test('Edited guides keep publication dates, distinguish comparison scenarios, and link to their definitions',()=>{
 const topics=[...new Set(reference.fixtures.map(f=>f.topic))];assert.equal(topics.length,17);
 for(const topic of topics){
  const guide=comparisonGuides[topic],cases=reference.fixtures.filter(f=>f.topic===topic);
  assert.equal(guide.meta.publishedOn,'2026-11-17');assert.equal(guide.meta.updatedOn,'2026-11-18');
  assert.equal(guide.presets.length,cases.length);assert.ok(guide.exampleNote);
  const table=guide.sections.find(s=>s.table&&s.table.rows.length===cases.length);assert.ok(table);
  const term=glossaryTerms.find(t=>t.tools[0]?.id===topic)!;assert.ok(term);
  assert.ok(term.guides!.some(g=>g.path===guide.meta.path));assert.equal(term.updatedOn,'2026-11-18');
 }
});
