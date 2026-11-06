import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shareToolIds,expandedShareToolIds,pinterestToolIds,hasPinterest,hasEmbed,shareTabs,hasShareTools,shareToolPaths,shareTabFor,shareTabFromHash} from '../src/lib/share-tools';
import tools from '../src/lib/embed-tools.json';
import {canonicalCitationURL,citationText,resultTables,spreadsheetCell,tableText,socialShareURL} from '../src/lib/share-formats';
import {calculators,defaults,runCalculation,routeFor} from '../src/lib/calculators';
import {runClientCalculation} from '../src/lib/calculate-client';
import {embedCode} from '../src/lib/embed-code';
test('Enhanced sharing covers all 131 calculators while Embed and Pinterest remain capability gated',()=>{
 assert.equal(shareToolIds.length,131);assert.equal(new Set(shareToolIds).size,131);assert.equal(expandedShareToolIds.length,12);assert.equal(pinterestToolIds.length,58);assert.equal(hasShareTools('covered-call'),true);assert.equal(hasShareTools('roi'),true);assert.equal(tools.length,88);
 assert.equal(Object.keys(shareToolPaths).length,131);
 for(const id of shareToolIds){assert.equal(shareToolPaths[routeFor(id).slice(0,-5)],id);assert.ok(hasShareTools(id));const tool=tools.find(t=>t.id===id);assert.equal(hasEmbed(id),Boolean(tool));assert.deepEqual(shareTabs(id),tool?['Share','Embed','Cite','Export']:['Share','Cite','Export']);if(tool){assert.equal('/'+tool.slug,routeFor(id).slice(0,-5));assert.match(embedCode(id,'light',800),/rel="nofollow noopener"/);}}
 for(const id of expandedShareToolIds)assert.equal(hasPinterest(id),(pinterestToolIds as readonly string[]).includes(id));
 for(const id of pinterestToolIds)assert.equal(hasPinterest(id),true);
});
test('Citations use canonical page URLs with no calculation or tracking payload',()=>{
 assert.equal(canonicalCitationURL('/coast-fire-calculator.html?balance=999#calc=secret'),'https://www.calculatorfree.io/coast-fire-calculator');
 const t=citationText('coast-fire','Coast FIRE Calculator','/coast-fire-calculator.html','2026-10-29','plain');assert.match(t,/Accessed 2026-10-29/);assert.doesNotMatch(t,/published|updated|balance=|share_version/);
 assert.throws(()=>canonicalCitationURL('https://evil.example/tool'));assert.throws(()=>canonicalCitationURL('javascript:alert(1)'));
});
test('Direct sharing entries respect embed availability and preserve calculation fragments',()=>{
 for(const tool of tools){assert.equal(shareTabFromHash(tool.id,'#embed-code'),'Embed');assert.equal(shareTabFor(tool.id,'Embed'),'Embed');}
 for(const id of shareToolIds){assert.equal(shareTabFromHash(id,'#cite-calculator'),'Cite');assert.equal(shareTabFromHash(id,'#calc=share_version=1&mode=projection'),null);assert.equal(shareTabFromHash(id,'#embed-and-cite'),null);assert.equal(shareTabFor(id,'invalid'),'Share');}
 assert.equal(shareTabFromHash('income-tax','#embed-code'),null);assert.equal(shareTabFor('income-tax','Embed'),'Share');assert.equal(shareTabFromHash('unknown','#cite-calculator'),null);
});
test('Citations safely format HTML and BibTeX without invented publication metadata',()=>{
 const h=citationText('roi','A < B & "C"','/roi-calculator.html','2026-10-29','html');assert.match(h,/A &lt; B &amp; &quot;C&quot;/);assert.doesNotMatch(h,/< B/);
 const b=citationText('coast-fire','A {B} & C%','/coast-fire-calculator.html','2026-10-29','bibtex');assert.match(b,/@online\{calculatorfree_coast_fire/);assert.ok(b.includes('\\{B\\} \\& C\\%'));assert.match(b,/urldate = \{2026-10-29\}/);assert.doesNotMatch(b,/\n  year|\n  date/);
 assert.throws(()=>citationText('roi','ROI','/roi-calculator.html','2026-02-30','plain'));
});
test('Social URLs retain a result fragment inside the encoded share destination and no amounts in default text',()=>{
 const url='https://www.calculatorfree.io/coast-fire-calculator#calc=share_version=1&balance=1000';for(const site of ['facebook','x','linkedin'] as const){const u=new URL(socialShareURL(site,url,'Coast FIRE Calculator'));assert.equal(u.searchParams.get(site==='facebook'?'u':'url'),url);if(site==='x')assert.equal(u.searchParams.get('text'),'Coast FIRE Calculator');assert.equal(u.protocol,'https:');}
});
test('Table exports preserve all rows, annual schedules and independently selectable extra reports',()=>{
 const result={metrics:[],columns:['Month','Value'],rows:Array.from({length:360},(_,i)=>[i+1,-i]),annualColumns:['Year','Value'],annualRows:[[1,10]],additionalTables:[{title:'Sensitivity',columns:['Name','Value'],rows:[['A',1]]}]};const tables=resultTables(result);assert.deepEqual(tables.map(t=>t.key),['main','annual','extra-0']);assert.equal(tables[0].rows.length,360);assert.ok(tableText(tables[0],'csv').includes('"360","-359"'));assert.ok(tableText(tables[0],'tsv').includes('360\t-359'));assert.equal(resultTables({metrics:[]}).length,0);
});
test('CSV and spreadsheet paste escape formula text, quotes, line breaks and leading control characters',()=>{
 for(const s of ['=SUM(1,2)','+1','@A1','-cmd',' \t=1'])assert.equal(spreadsheetCell(s),"'"+s);assert.equal(spreadsheetCell(-5),'-5');assert.equal(spreadsheetCell('ordinary'),'ordinary');
 const table={key:'a',title:'a',columns:['Name','Amount'],rows:[['A"B\nC',-12],['=1',0]]};assert.ok(tableText(table,'csv').includes('"A""B\nC","-12"'));assert.ok(tableText(table,'tsv').includes('"A""B\nC"\t-12'));assert.ok(tableText(table,'tsv').includes("'=1\t0"));
});
test('Every approved embed mode uses the exact existing main-site client calculation, not a substitute formula',async()=>{
 let count=0;for(const tool of tools){const calc=calculators.find(c=>c.id===tool.id)!;for(const mode of calc.modes){const v=defaults(mode);assert.deepEqual(await runClientCalculation(calc.id,calc.category,mode.id,v),runCalculation(calc.id,mode.id,v),calc.id+'/'+mode.id);count++;}}
 assert.ok(count>30);
});
