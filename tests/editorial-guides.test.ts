import {test} from 'node:test';
import assert from 'node:assert/strict';
import {editorialGuides,cdSavingsGuide,editorialSchema} from '../src/lib/editorial-guides';
import {calculators} from '../src/lib/catalog';
import {sitemapEntries} from '../src/lib/seo';
const config={origin:'https://www.calculatorfree.io',indexable:true};
test('Editorial guide entries have real calculator relationships and one canonical sitemap entry',()=>{
 assert.equal(new Set(editorialGuides.map(g=>g.path)).size,editorialGuides.length);
 for(const guide of editorialGuides){
  assert.ok(guide.path.startsWith('/guides/')&&guide.path.endsWith('/'));
  assert.ok(guide.calculatorIds.every(id=>calculators.some(c=>c.id===id)));
  assert.equal(sitemapEntries(config).filter(x=>x.url===config.origin+guide.path).length,1);
 }
 assert.deepEqual(cdSavingsGuide.calculatorIds,['cd','savings','emergency-fund']);
});
test('Articles and Guides collection describe the same visible entries without invented credentials',()=>{
 for(const guide of editorialGuides){
 const graph=editorialSchema(guide,config)['@graph'];const article=graph[0] as any;
 assert.equal(article['@type'],'Article');assert.equal(article.headline,guide.heading);
 assert.equal(article.datePublished,guide.publishedOn);assert.equal(article.dateModified,guide.updatedOn??guide.publishedOn);assert.equal(article.author['@type'],'Organization');
 assert.ok(!('reviewedBy' in article));
 const hub=editorialSchema(false,config)['@graph'][0] as any;
 assert.equal(hub.hasPart.filter((a:any)=>a.url===article.url).length,1);
 const breadcrumb=graph.find(a=>a['@type']==='BreadcrumbList') as any;
 assert.equal(breadcrumb.itemListElement.at(-1).item,article.url);
 }
});

test('Substantive question updates preserve original publication and advance reviewed sitemap dates',()=>{
 const updated=editorialGuides.filter(g=>g.updatedOn);
 assert.equal(updated.length,45);
 const november4Updates=new Set(["/guides/how-are-heloc-payments-calculated/", "/guides/how-to-calculate-home-equity-loan-payments/", "/guides/how-to-calculate-personal-loan-payments/", "/guides/how-to-compare-debt-consolidation-loans/", "/guides/roth-conversion-ladder/"]);
 for(const path of ["/guides/how-to-calculate-auto-loan-payments/", "/guides/how-to-calculate-auto-lease-payments/", "/guides/how-401k-matching-works/", "/guides/compound-interest-with-monthly-contributions/", "/guides/how-to-calculate-monthly-budget/", "/guides/401k-vs-roth-ira/"])november4Updates.add(path);
 for(const path of ["/guides/roth-vs-traditional-401k/","/guides/how-to-calculate-fha-loan-payments/","/guides/how-to-calculate-monthly-mortgage-payment/","/guides/how-to-calculate-irr/","/guides/how-to-calculate-present-value/"])november4Updates.add(path);
 const novemberUpdates=new Set(['/guides/how-to-calculate-monthly-mortgage-payment/','/guides/compound-interest-with-monthly-contributions/','/guides/how-long-will-retirement-savings-last/','/guides/how-does-an-hsa-work/','/guides/how-401k-matching-works/','/guides/how-to-calculate-cap-rate/','/guides/how-to-calculate-rental-property-cash-flow/','/guides/how-are-heloc-payments-calculated/','/guides/how-much-house-can-i-afford/','/guides/how-to-calculate-simple-interest/','/guides/how-much-house-can-i-afford/','/guides/how-to-calculate-rental-property-cash-flow/','/guides/should-you-reinvest-dividends/','/guides/is-refinancing-worth-it/']);
 for(const guide of updated){
  assert.equal(guide.updatedOn,['/guides/cd-ladder/','/guides/irr-vs-npv/','/guides/leasing-vs-buying-a-car/','/guides/15-vs-30-year-mortgage/'].includes(guide.path)?'2026-11-06':guide.path==='/guides/lump-sum-vs-dollar-cost-averaging/'?'2026-11-05':november4Updates.has(guide.path)?'2026-11-04':novemberUpdates.has(guide.path)?'2026-11-03':['/guides/compound-interest-with-monthly-contributions/','/guides/biweekly-vs-monthly-mortgage-payments/'].includes(guide.path)?'2026-11-01':guide.path==='/guides/how-to-calculate-coast-fire/'?'2026-10-31':'2026-10-30');
  assert.ok(guide.publishedOn<=guide.updatedOn!);
  const entry=sitemapEntries(config).find(e=>e.url===config.origin+guide.path)!;
  assert.equal(entry.lastModified,guide.updatedOn);
 }
 assert.equal(editorialGuides.filter(g=>g.publishedOn==='2026-10-27').length,6);
});
