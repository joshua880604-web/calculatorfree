import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import aliases from '../src/lib/calculator-route-aliases.json';
import {navigationHref} from '../src/lib/navigation';
import {calculators,routeFor} from '../src/lib/calculators';
import {calculatorSchema,sitemapEntries} from '../src/lib/seo';
import {readFavorites} from '../src/lib/favorites';
const config={origin:'https://www.calculatorfree.io',indexable:true};
test('Historical routes and calculator synonyms normalize without changing query or fragment bytes',()=>{
 assert.equal(Object.keys(aliases).length,8);
 const suffix='?mode=payment&label=A%26B&amount=100#calc=share_version=1&mode=payment&principal=6000';
 const rules=new Map(fs.readFileSync('public/_redirects','utf8').split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith('#')).map(l=>{const[a,b]=l.split(/\s+/);return[a,b];}));
 for(const[from,to]of Object.entries(aliases)){
  for(const old of[from,from+'.html']){assert.equal(navigationHref(old+suffix),to+suffix);assert.equal(navigationHref('https://calculatorfree.io'+old+suffix),config.origin+to+suffix);assert.equal(rules.get(old),to);}
  assert.equal(rules.get(to+'.html'),to);assert.ok(!rules.has(to));
  assert.equal(navigationHref('https://www.calculator.net'+from+'.html'),'https://www.calculator.net'+from+'.html');
 }
});
test('Single and multiple cards retain separate ownership, IDs and saved favorites',()=>{
 const ids=['credit-card','credit-cards-payoff','take-home-paycheck','repayment','rent','currency'];
 const saved=readFavorites({getItem:()=>JSON.stringify(ids),setItem:()=>{throw Error('No migration write required');}});
 assert.deepEqual(saved,ids);
 assert.equal(routeFor('credit-card'),'/single-credit-card-payoff-calculator.html');
 assert.equal(routeFor('credit-cards-payoff'),'/multiple-credit-card-payoff-calculator.html');
 assert.equal(aliases['/credit-card-payoff-calculator'],'/multiple-credit-card-payoff-calculator');
 const sitemap=sitemapEntries(config).map(e=>e.url);
 for(const id of ids){const c=calculators.find(c=>c.id===id)!;const url=config.origin+routeFor(id).slice(0,-5);assert.equal(sitemap.filter(x=>x===url).length,1);assert.equal(calculatorSchema(c,config)['@graph'][0].url,url);}
 for(const from of Object.keys(aliases))assert.ok(!sitemap.includes(config.origin+from));
});
