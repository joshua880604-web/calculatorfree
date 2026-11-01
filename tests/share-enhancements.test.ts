import {test} from 'node:test';
import assert from 'node:assert/strict';
import {markdownTable,citationText} from '../src/lib/share-formats';
import {embedResources,embedResourceGroups,embedResourcesSchema,embedResourcesPath} from '../src/lib/embed-resources';
import {sitemapEntries} from '../src/lib/seo';
import tools from '../src/lib/embed-tools.json';
test('Markdown tables preserve complete reports and escape literal cell boundaries, formatting and HTML',()=>{
 const text=markdownTable({key:'a',title:'a',columns:['Name','Amount'],rows:[['A|B',-12],['one\ntwo',0],['<script>**x**</script>',2],['C:\\plans',3]]});
 assert.equal(text,'| Name | Amount |\n| --- | --- |\n| A\\|B | -12 |\n| one<br>two | 0 |\n| &lt;script&gt;\\*\\*x\\*\\*&lt;/script&gt; | 2 |\n| C:\\\\plans | 3 |');
 assert.equal(markdownTable({key:'b',title:'b',columns:['Month'],rows:Array.from({length:360},(_,i)=>[i+1])}).split('\n').length,362);
});
test('HTML citations link the descriptive calculator title and keep publisher and access date outside the anchor',()=>{
 assert.equal(citationText('coast-fire','Coast FIRE Calculator','/coast-fire-calculator.html','2026-10-30','html'),'<a href="https://www.calculatorfree.io/coast-fire-calculator">Coast FIRE Calculator</a> by CalculatorFree.io (accessed 2026-10-30).');
});
test('Embed resources lists exactly supported widgets and owns one canonical sitemap entry',()=>{
 assert.deepEqual(embedResources.map(t=>t.id),tools.map(t=>t.id));assert.equal(embedResources.length,78);assert.ok(embedResources.every(t=>t.description.length>30));
 const config={origin:'https://www.calculatorfree.io',indexable:true},schema=embedResourcesSchema(config),list=schema['@graph'][1] as any;
 assert.equal(list.numberOfItems,78);assert.equal(new Set(list.itemListElement.map((t:any)=>t.url)).size,78);assert.ok(list.itemListElement.every((t:any)=>!t.url.includes('/embed/')&&!t.url.endsWith('.html')));
 assert.equal(sitemapEntries(config).filter(e=>e.url===config.origin+embedResourcesPath).length,1);assert.doesNotMatch(JSON.stringify(schema),/FAQPage|aggregateRating/);
});

test('Embed topic groups cover every supported calculator exactly once',()=>{
 const grouped=embedResourceGroups.flatMap(group=>group.tools.map(tool=>tool.id));
 assert.equal(embedResourceGroups.length,7);assert.ok(embedResourceGroups.every(group=>group.tools.length>0));
 assert.equal(new Set(grouped).size,grouped.length);assert.deepEqual(grouped.sort(),tools.map(tool=>tool.id).sort());
});
