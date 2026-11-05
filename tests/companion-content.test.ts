import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculators,defaults,runCalculation} from '../src/lib/calculators';
import cases from '../src/lib/companion-guide-cases.json';
import rawGuides from '../src/lib/companion-guide-content.json';
import newTerms from '../src/lib/companion-glossary-data.json';
import {comparisonGuides,type ComparisonGuide} from '../src/lib/comparison-guides';
import {glossaryTerms,glossaryTermPath,glossaryForCalculator} from '../src/lib/glossary';
import {editorialGuides,editorialSchema} from '../src/lib/editorial-guides';
import {calculatorPresetHref} from '../src/lib/preset-links';
import {sharedInputs} from '../src/lib/sharing';
import {sitemapEntries,contentUpdatedOn} from '../src/lib/seo';

for(const c of cases)test(`Independent Decimal companion case: ${c.key}`,()=>{
 const calc=calculators.find(x=>x.id===c.calculatorId)!,mode=calc.modes.find(m=>m.id===c.mode)!;
 const result=runCalculation(calc.id,mode.id,{...defaults(mode),...Object.fromEntries(Object.entries(c.values).map(([k,v])=>[k,String(v)]))});
 for(const [label,value] of Object.entries(c.metrics)){const actual=result.metrics.find(m=>m.label===label);assert.ok(actual,label);assert.ok(Math.abs(actual.value-Number(value))<.000001,`${c.key}/${label}: ${actual.value} vs ${value}`);}
});
test('Five new articles and five terms have unique real routes, dates and reciprocal context',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};const entries=sitemapEntries(config);
 assert.equal(Object.keys(rawGuides).length,5);assert.equal(newTerms.length,5);
 for(const [topic] of Object.entries(rawGuides)){
  const guide=comparisonGuides[topic];assert.equal(editorialGuides.filter(x=>x.path===guide.meta.path).length,1);
  assert.ok(fs.existsSync('src/app'+guide.meta.path+'page.tsx'));
  assert.equal(entries.filter(x=>x.url===config.origin+guide.meta.path).length,1);assert.equal(contentUpdatedOn[guide.meta.path],'2026-11-05');
  assert.ok(guide.sections.length>=5);assert.ok(guide.questions.length>=5);assert.ok(guide.sources.length>=2);
  assert.ok(guide.sections.reduce((s,x)=>s+x.paragraphs.join(' ').split(/\s+/).length,0)>550);
  assert.equal(new Set(guide.sections.map(s=>s.id)).size,guide.sections.length);
  assert.ok(!guide.sections.some(s=>['examples','questions','sources'].includes(s.id)));
  for(const table of guide.sections.flatMap(s=>s.table?[s.table]:[])){assert.ok(table.rows.length);assert.ok(table.rows.every(r=>r.length===table.headers.length));}
  assert.ok(glossaryTerms.some(term=>term.guides?.some(g=>g.path===guide.meta.path)),guide.meta.path+' missing glossary context');
  for(const p of guide.presets){const calc=calculators.find(c=>'/'+c.id+'-calculator'===p.path)!;assert.ok(calc,p.path);const href=new URL(calculatorPresetHref(p.path,p.mode,p.values),config.origin);const restored=sharedInputs(calc,href.search,href.hash)!;assert.equal(restored.mode.id,p.mode);runCalculation(calc.id,p.mode,restored.values);}
  const csv=fs.readFileSync('public/data/comparison-guides/'+topic+'.csv','utf8');for(const section of guide.sections.filter(s=>s.table))assert.ok(csv.includes(section.table!.caption));
  const schema=editorialSchema(guide.meta,config);assert.ok(!/reviewedBy|aggregateRating/.test(JSON.stringify(schema)));
 }
 for(const term of newTerms){
  assert.equal(glossaryTerms.filter(t=>t.slug===term.slug).length,1);assert.equal(entries.filter(x=>x.url===config.origin+glossaryTermPath(term.slug)).length,1);
  assert.equal(contentUpdatedOn[glossaryTermPath(term.slug)],'2026-11-05');
  assert.ok(term.example.calculator.expected.length);assert.ok(term.questions.length>=3);
  for(const tool of term.tools)assert.ok(glossaryForCalculator(tool.id).some(t=>t.slug===term.slug));
  assert.ok(glossaryTerms.some(t=>t.related.includes(term.slug)),term.slug+' has no incoming term reference');
 }
});
test('Every new published numeric preset uses an independently checked case and actual inputs',()=>{
 const guides=[...Object.keys(rawGuides).map(k=>comparisonGuides[k]),comparisonGuides['lump-dca']];
 for(const guide of guides){for(const p of guide.presets){
  const key=(p as typeof p & {caseKey?:string}).caseKey;
  if(!key){assert.ok(guide.meta.path.includes('lump-sum')||p.mode==='deadlines');continue;}
  const c=cases.find(c=>c.key===key);assert.ok(c,key);assert.equal(p.mode,c.mode);assert.deepEqual(p.values,c.values);
 }}
 const dca=comparisonGuides['lump-dca'];assert.equal(dca.meta.publishedOn,'2026-11-04');assert.equal(dca.meta.updatedOn,'2026-11-05');
 assert.ok(dca.sections.some(s=>s.id==='manual-prices'));assert.ok(dca.sections.some(s=>s.id==='history'));assert.ok(dca.sections.some(s=>s.id==='cash-yield'));
 assert.ok(dca.meta.calculatorIds.includes('dca'));assert.equal(dca.presets.filter(p=>p.path==='/dca-calculator').length,3);
 assert.ok(fs.readFileSync('public/data/comparison-guides/lump-dca.csv','utf8').includes('$288.60'));
});
