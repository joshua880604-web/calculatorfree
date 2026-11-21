import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageMetadata,sitemapEntries} from '../src/lib/seo';
import {editorialGuides,editorialSchema,guideContentDate} from '../src/lib/editorial-guides';
import {readFileSync} from 'node:fs';

test('Every guide presents consistent real editorial dates in article schema, sitemap and sharing metadata',()=>{
 const config={origin:'https://www.calculatorfree.io',indexable:true};
 const sitemap=sitemapEntries(config);
 for(const guide of editorialGuides){
  const metadata=pageMetadata(guide.path,guide.title,guide.description,config);
  const graph=editorialSchema(guide,config)['@graph'];
  const article=graph.find(n=>n['@type']==='Article')!;
  const og=metadata.openGraph as {type:string;publishedTime:string;modifiedTime:string};
  assert.equal(og.type,'article',guide.path);
  assert.equal(og.publishedTime,article.datePublished,guide.path);
  assert.equal(og.modifiedTime,article.dateModified,guide.path);
  assert.equal(og.modifiedTime,guideContentDate(guide),guide.path);
  assert.equal(sitemap.find(p=>p.url===config.origin+guide.path)?.lastModified,article.dateModified,guide.path);
 }
 assert.equal((pageMetadata('/guides/','Guides','Browse guides',config).openGraph as {type:string}).type,'website');
});

test('All catalog legacy HTML aliases redirect directly to canonical pages, with renamed routes preserved',()=>{
 const catalog=JSON.parse(readFileSync('src/lib/catalog-data.json','utf8')) as {local_route:string}[];
 const rules=new Map(readFileSync('public/_redirects','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')).map(l=>{const[from,to,status]=l.split(/\s+/);assert.equal(status,'301');return[from,to];}));
 for(const entry of catalog)assert.equal(rules.get(entry.local_route),entry.local_route.slice(0,-5),entry.local_route);
 for(const destination of rules.values())assert.ok(!rules.has(destination),'No redirect chain: '+destination);
 const aliases=JSON.parse(readFileSync('src/lib/calculator-route-aliases.json','utf8')) as Record<string,string>;
 for(const[from,to]of Object.entries(aliases)){assert.equal(rules.get(from),to);assert.equal(rules.get(from+'.html'),to);}
});
