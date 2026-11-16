import test from 'node:test';
import assert from 'node:assert/strict';
import {publisherIdentity,aboutPublisherSchema} from '../src/lib/content-transparency';
import {calculatorSchema} from '../src/lib/seo';
import {editorialGuides,editorialSchema,guideContentDate} from '../src/lib/editorial-guides';
import {calculators} from '../src/lib/calculators';
const config={origin:'https://www.calculatorfree.io',indexable:true};
test('All calculator and guide publisher references resolve to the real About identity',()=>{
 const publisher=publisherIdentity(config);
 assert.equal(publisher['@id'],'https://www.calculatorfree.io/about#publisher');
 for(const calc of calculators.filter(c=>!c.directory)){
  const app=calculatorSchema(calc,config)['@graph'][0];assert.deepEqual(app.publisher,publisher);
  assert.ok(!('reviewedBy' in app));assert.ok(!('review' in app));
 }
 for(const guide of editorialGuides){
  const article=editorialSchema(guide,config)['@graph'][0] as any;
  assert.deepEqual(article.author,publisher);assert.deepEqual(article.publisher,publisher);
  assert.equal(article.datePublished,guide.publishedOn);assert.equal(article.dateModified,guideContentDate(guide));
  assert.ok(!('reviewedBy' in article));
 }
});
test('About describes the organization referenced by content rather than an invented person',()=>{
 const graph=aboutPublisherSchema(config)['@graph'];const page=graph[0] as any,publisher=graph[1] as any;
 assert.equal(page['@type'],'AboutPage');assert.equal(page.mainEntity['@id'],publisher['@id']);
 assert.equal(publisher['@type'],'Organization');assert.equal(publisher.url,'https://www.calculatorfree.io/about');
 assert.ok(!('hasCredential' in publisher));assert.ok(!('award' in publisher));
});
test('Safe nonproduction publisher markup invents no origin',()=>{
 const p=publisherIdentity({indexable:false});assert.ok(!('@id' in p));assert.ok(!('url' in p));
});
