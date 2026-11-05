import {test} from 'node:test';
import assert from 'node:assert/strict';
import {glossaryTerms,glossaryExampleLink,glossaryForCalculator,glossarySchema,glossaryTermPath} from '../src/lib/glossary';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {sharedInputs} from '../src/lib/sharing';
import {navigationHref} from '../src/lib/navigation';
import {sitemapEntries} from '../src/lib/seo';

for(const term of glossaryTerms){
 test('Glossary examples and tool scope: '+term.slug,()=>{
  for(const tool of term.tools){
   assert.ok(calculators.some(calc=>calc.id===tool.id&&!calc.directory),tool.id);
   assert.ok(glossaryForCalculator(tool.id).some(item=>item.slug===term.slug));
  }
  for(const slug of term.related){assert.notEqual(slug,term.slug);assert.ok(glossaryTerms.some(item=>item.slug===slug));}
  const example=term.example.calculator;if(!example)return;
  const calc=calculators.find(calc=>calc.id===example.id)!,mode=calc.modes.find(mode=>mode.id===example.mode)!;
  assert.ok(mode,example.id+'/'+example.mode);
  for(const [key,value] of Object.entries(example.values)){
   const field=mode.fields.find(field=>field.key===key);assert.ok(field,key);
   if(field.options)assert.ok(field.options.includes(String(value)),key+'='+value);
  }
  const url=new URL(glossaryExampleLink(example),'https://calculatorfree.io');
  assert.equal(url.pathname,navigationHref(routeFor(example.id)));assert.equal(url.search,'');assert.equal(sharedInputs(calc,'',url.hash)!.mode.id,mode.id);
  const result=runCalculation(calc.id,mode.id,{...defaults(mode),...Object.fromEntries(Object.entries(example.values).map(([key,value])=>[key,String(value)]))});
  for(const expected of example.expected){
   const actual=result.metrics.find(metric=>metric.label===expected.label);assert.ok(actual,expected.label);
   assert.ok(Math.abs(actual.value-expected.value)<(expected.tolerance??.00001),actual.value+' != '+expected.value);
  }
 });
}
test('DCA illustration uses share-weighted cost and shows the ending loss',()=>{
 const prices=[12,10,8],deposit=120,shares=prices.reduce((n,price)=>n+deposit/price,0);
 assert.equal(shares,37);assert.equal((360/shares).toFixed(2),'9.73');assert.equal(shares*8,296);assert.equal(360-shares*8,64);
 const term=glossaryTerms.find(term=>term.slug==='dollar-cost-averaging')!;
 assert.equal(term.example.calculator?.id,'dca');assert.equal(term.example.calculator?.mode,'prices');assert.equal(term.example.calculator?.values.prices,'12\n10\n8');assert.match(term.pitfall.text,/manual equal-dollar purchase prices/);
});
test('Glossary structured data and sitemap describe real visible pages without invented authority',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};
 const entries=sitemapEntries(config),hub=glossarySchema(undefined,config);
 assert.equal(glossaryTerms.length,94);assert.equal(new Set(glossaryTerms.map(term=>term.slug)).size,glossaryTerms.length);
 assert.equal(hub['@graph'][0]['@type'],'DefinedTermSet');
 for(const term of glossaryTerms){
  assert.ok(entries.some(entry=>entry.url===config.origin+glossaryTermPath(term.slug)));
  const schema=glossarySchema(term,config),definition=schema['@graph'][0];
  assert.equal(definition['@type'],'DefinedTerm');assert.equal(definition.description,term.definition);
  assert.ok(!/reviewedBy|aggregateRating|FAQPage/.test(JSON.stringify(schema)));
 }
 assert.ok(!JSON.stringify(glossarySchema(glossaryTerms[0],{indexable:false})).includes('https://calculatorfree.io'));
});
