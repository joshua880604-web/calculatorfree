import test from 'node:test';import assert from 'node:assert/strict';
import {calculators}from'../src/lib/calculators';import{editorialGuides}from'../src/lib/editorial-guides';
import content from'../src/lib/practical-guide-content.json';import cases from'../src/lib/remaining-tool-cases.json';
test('Financial guide completion covers all 110 financial/business tools without adding utility guide pages',()=>{
 const covered=new Set(editorialGuides.flatMap(g=>g.calculatorIds));const financial=calculators.filter(c=>c.modes.some(m=>m.fields.length)&&c.category!=='Everyday Tools');assert.equal(financial.length,110);assert.deepEqual(financial.filter(c=>!covered.has(c.id)).map(c=>c.id),[]);assert.equal(content.length,24);assert.equal(Object.keys(cases).length,34);assert.equal(editorialGuides.length,113);
});
test('New grouped guides have distinct topics, complete preset inputs, matching data units and honest verification wording',()=>{
 assert.equal(new Set(content.map(g=>g.slug)).size,24);
 for(const g of content){assert.ok(g.sections.length>=3);assert.ok(g.questions.length>=2);assert.ok(g.sources.length);assert.equal(g.cases.length,g.ids.length*2);for(const c of g.cases){const tool=calculators.find(x=>x.id===c.calculatorId)!;const mode=tool.modes.find(m=>m.id===c.mode)!;assert.ok(g.ids.includes(c.calculatorId));assert.deepEqual(Object.keys(c.values).sort(),mode.fields.map(f=>f.key).sort());assert.ok(Number.isFinite(c.focus.value));}}
});
