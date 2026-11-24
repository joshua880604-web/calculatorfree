import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import PracticalGuideQuestions,{type PracticalGuideQuestion} from '../src/components/PracticalGuideQuestions';
import content from '../src/lib/practical-guide-content.json';
import review from '../src/lib/practical-guide-answer-links.json';
import {calculators,defaults} from '../src/lib/calculators';
import {longTailHref} from '../src/lib/long-tail-content';
import {sharedInputs} from '../src/lib/sharing';
import {editorialGuides,guideContentDate} from '../src/lib/editorial-guides';

test('Practical guide answers retain their text and expose every configured calculator link and anchor',()=>{
 let totalLinks=0;const affected:string[]=[];
 for(const guide of content){
  const questions=guide.questions as unknown as PracticalGuideQuestion[];
  const markup=renderToStaticMarkup(createElement(PracticalGuideQuestions,{questions,linkConcepts:text=>text}));
  const links=questions.flatMap(question=>question.links??[]);
  assert.equal((markup.match(/<a /g)??[]).length,links.length,guide.slug);
  for(const question of questions){
   assert.ok(markup.includes(renderToStaticMarkup(createElement('h3',null,question.question))));
   assert.ok(markup.includes(renderToStaticMarkup(createElement('p',null,question.answer))));
   if(question.anchor)assert.ok(markup.includes(`id="${question.anchor}"`));
   for(const link of question.links??[])assert.ok(markup.includes(renderToStaticMarkup(createElement('a',{href:longTailHref(link)},link.label))));
  }
  if(links.length)affected.push('/guides/'+guide.slug+'/');
  totalLinks+=links.length;
 }
 assert.equal(totalLinks,27);assert.deepEqual(affected,review.guides);
});

test('Answer links restore supported modes and declared inputs; link-review dates remain separate from numerical review',()=>{
 for(const guide of content){
  const questions=guide.questions as unknown as PracticalGuideQuestion[];
  const anchors=questions.flatMap(q=>q.anchor?[q.anchor]:[]);
  assert.equal(new Set(anchors).size,anchors.length,guide.slug);
  if(guide.slug==='covered-call-expiry-profit-and-downside')for(const link of questions.flatMap(q=>q.links??[]))assert.equal(link.id,'covered-call','Covered-call answers lead directly to the expiry model');
  if(guide.slug==='credit-card-minimum-payment-and-payoff-time')for(const link of questions.flatMap(q=>q.links??[]))assert.equal(link.id,'credit-card-minimum-payment','Minimum-payment answers lead directly to their own model');
  for(const link of questions.flatMap(q=>q.links??[])){
   assert.ok(link.label?.trim(),guide.slug+' descriptive link label');
   const calc=calculators.find(c=>c.id===link.id)!;assert.ok(calc,link.id);
   const mode=calc.modes.find(m=>m.id===link.mode)!;assert.ok(mode,link.mode);
   const url=new URL(longTailHref(link),'https://www.calculatorfree.io');
   assert.equal(url.search,'');assert.ok(url.hash.startsWith('#calc='));
   const restored=sharedInputs(calc,'',url.hash)!;assert.equal(restored.mode.id,mode.id);
   for(const [key,value] of Object.entries(link.values??{})){
    const field=mode.fields.find(f=>f.key===key);assert.ok(field,key);
    if(field.options)assert.ok(field.options.includes(value),key);
    assert.equal(restored.values[key],value,key);
   }
   assert.ok(mode.calculate({...defaults(mode),...link.values}).metrics.every(m=>Number.isFinite(m.value)));
  }
  if(review.guides.includes('/guides/'+guide.slug+'/')){
   const meta=editorialGuides.find(g=>g.path==='/guides/'+guide.slug+'/')!;
   assert.equal(meta.linksUpdatedOn,review.reviewedOn);
   assert.ok(guideContentDate(meta)>=review.reviewedOn);
  }
 }
});
