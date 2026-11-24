import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement,Fragment} from 'react';
import {createGuideConceptLinker} from '../src/components/GuideConceptLinks';
import concepts from '../src/lib/guide-concept-links.json';
import linkReview from '../src/lib/internal-link-review.json';
import {glossaryTerms,glossaryTermPath} from '../src/lib/glossary';
import {editorialGuides,guideContentDate} from '../src/lib/editorial-guides';
import {relatedCalculatorIds} from '../src/lib/guides';
import {mortgageReadingGroups,mortgagePaymentGuide} from '../src/lib/mortgage-reading';
const html=(node:ReturnType<ReturnType<typeof createGuideConceptLinker>>)=>renderToStaticMarkup(createElement(Fragment,null,node));

test('Reviewed concepts point to existing definitions already associated with the guide',()=>{
 assert.equal(Object.keys(concepts).length,22);
 assert.equal(Object.values(concepts).flat().length,24);
 for(const [path,entries]of Object.entries(concepts)){
  const guide=editorialGuides.find(g=>g.path===path)!;assert.ok(guide,path);
  assert.equal(guide.linksUpdatedOn,linkReview.reviewedOn,path);
  assert.ok(guideContentDate(guide)>=linkReview.reviewedOn,path+' content date covers the link review and any later content edits');
  for(const entry of entries){const term=glossaryTerms.find(t=>t.slug===entry.slug)!;assert.ok(term);assert.ok(term.guides?.some(g=>g.path===path),path);assert.ok(glossaryTermPath(term.slug).startsWith('/glossary/'));}
 }
});
test('Concept links preserve prose, use word boundaries and link the first mention only per render',()=>{
 const path='/guides/credit-card-minimum-payment-and-payoff-time/';const link=createGuideConceptLinker(path);
 assert.equal(html(link('An April payment is due.')),'An April payment is due.');
 assert.equal(html(link('At 24% apr, APR is the annual rate.')),'At 24% <a href="/glossary/apr/" class="contextual-concept-link">apr</a>, APR is the annual rate.');
 assert.equal(html(link('APR later in the same guide.')),'APR later in the same guide.');
 assert.match(html(createGuideConceptLinker(path)('APR in a different render.')),/href="\/glossary\/apr\/"/);
 assert.equal(html(createGuideConceptLinker('/guides/not-reviewed/')('24% APR')),'24% APR');
});
test('Concept rendering escapes markup and handles multiple approved concepts without text loss',()=>{
 const link=createGuideConceptLinker('/guides/debt-snowball-vs-avalanche/');
 const text='Debt avalanche < debt snowball; debt avalanche again.';const markup=html(link(text));
 assert.equal((markup.match(/<a /g)??[]).length,2);
 assert.ok(markup.includes('&lt;'));
 assert.equal(markup.replace(/<[^>]*>/g,'').replace('&lt;','<'),text);
 assert.ok(markup.includes('/glossary/debt-avalanche/'));
 assert.ok(markup.includes('/glossary/debt-snowball/'));
});
test('Education and depreciation recommendations match the next task rather than the shared loan template',()=>{
 assert.equal(relatedCalculatorIds['college-cost'][0],'student-loan');
 assert.equal(relatedCalculatorIds['student-loan'][0],'college-cost');
 assert.ok(relatedCalculatorIds['college-cost'].includes('savings'));
 for(const id of ['college-cost','student-loan'])assert.ok(!relatedCalculatorIds[id].includes('business-loan'));
 assert.ok(relatedCalculatorIds['operating-cash-flow'].includes('depreciation'));
 assert.ok(relatedCalculatorIds['depreciation'].includes('operating-cash-flow'));
});
test('Mortgage task groups preserve all ten existing associated guides exactly once',()=>{
 const paths=[mortgagePaymentGuide,...mortgageReadingGroups.flatMap(g=>g.guides.map(guide=>guide.path))];
 const actual=editorialGuides.filter(g=>g.calculatorIds.includes('mortgage')).map(g=>g.path);
 assert.equal(paths.length,10);assert.equal(new Set(paths).size,10);assert.deepEqual([...paths].sort(),actual.sort());
});
