import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runCalculation,calculators} from '../src/lib/calculators';
import {remainingGuideChecks} from '../src/lib/remaining-guide-checks';
import expected from './fixtures/remaining-guide-expected.json';
import {editorialGuides,editorialSchema} from '../src/lib/editorial-guides';
import {sitemapEntries} from '../src/lib/seo';
const labels:Record<string,string[]>={recast:['Recast remaining interest','Lump-sum-only remaining interest'],cd:['Maturity balance'],car:['Total interest'],emergency:['Emergency fund target','Remaining savings gap'],'debt-save':['Total interest'],apr:['Total borrowing cost over full term'],refinance:['New total interest'],ira:['Traditional IRA after-tax value','Roth balance with equivalent after-tax contribution'],margin:['Selling price','Gross profit per unit'],coast:['Coast FIRE number today'],snowball:['Total interest'],avalanche:['Total interest'],barista:['Required portfolio at part-time start']};
test('Remaining 14 guide grids match independent Decimal fixtures and current engines for all 70 cases',()=>{
 assert.equal(remainingGuideChecks.length,14);
 for(const c of remainingGuideChecks){
  assert.equal(c.rows.length,5);assert.equal(c.figure.x.length,5);assert.ok(c.method.length&&c.findings.length&&c.limits.length);
  const fixture=(expected as Record<string,string[][]>)[c.id];assert.equal(fixture.length,5);
  for(const [i,row] of c.rows.entries()){
   const r=runCalculation(c.tool,c.mode,row.values);
   const actual=c.id==='rent'?r.rows![4].slice(1,3).map(Number):labels[c.id].map(label=>r.metrics.find(m=>m.label===label)!.value+(c.id==='refinance'?3000:0));
   for(const [j,value] of actual.entries()){
    assert.ok(Math.abs(value-Number(fixture[i][j]))<1e-6,`${c.id} ${row.x} ${j}`);assert.ok(Math.abs(row.outputs[j]-value)<1e-9);
    assert.equal(c.figure.series[j].values[i],value);
   }
  }
 }
});
test('Every guide case has a complete parameter link to the intended existing calculator mode',()=>{
 for(const c of remainingGuideChecks)for(const [i,row] of c.rows.entries()){
  const u=new URL(c.hrefs[i],'https://www.calculatorfree.io');const p=new URLSearchParams(u.hash.slice(6));
  assert.equal(p.get('mode'),c.mode);assert.equal(p.get('share_version'),'1');
  for(const [k,v] of Object.entries(row.values))assert.equal(p.get(k),v);
  const tool=calculators.find(t=>t.id===c.tool)!;assert.ok(tool);assert.ok(tool.modes.some(m=>m.id===c.mode));
  const entries=sitemapEntries({origin:'https://www.calculatorfree.io',indexable:true});assert.ok(entries.some(e=>e.url==='https://www.calculatorfree.io'+u.pathname),u.pathname);
 }
});
test('Updated guide controls retain zero-case identities, sensitivity reversals and original publication dates',()=>{
 const get=(id:string)=>remainingGuideChecks.find(c=>c.id===id)!;
 const ira=get('ira');assert.ok(Math.abs(ira.rows[2].outputs[0]-ira.rows[2].outputs[1])<1e-6);
 assert.ok(ira.rows[0].outputs[0]>ira.rows[0].outputs[1]);assert.ok(ira.rows[4].outputs[0]<ira.rows[4].outputs[1]);
 const rent=get('rent');assert.ok(rent.rows[2].outputs[0]<rent.rows[2].outputs[1]);assert.ok(rent.rows[3].outputs[0]>rent.rows[3].outputs[1]);
 assert.deepEqual(get('margin').rows[0].outputs,[100,0]);
 for(const c of remainingGuideChecks){
  const step=c.rows[1].x-c.rows[0].x;for(let i=1;i<c.rows.length;i++)assert.equal(c.rows[i].x-c.rows[i-1].x,step);
  const g=editorialGuides.find(g=>g.path===`/guides/${c.slug}/`)!;assert.ok(g);assert.equal(g.updatedOn,c.slug==='is-refinancing-worth-it'?'2026-11-03':c.slug==='how-to-calculate-coast-fire'?'2026-10-31':'2026-10-30');assert.ok(g.publishedOn<'2026-10-30');assert.equal(editorialSchema(g)['@graph'][0].datePublished,g.publishedOn);
  for(const ext of ['svg','png'])assert.ok(readFileSync('public/research-charts/'+c.figure.id+'.'+ext).length>1000);
  const csv=readFileSync('public'+c.csv,'utf8');assert.equal(csv.split('Hypothetical deterministic model case; not observed data').length-1,5);
 }
});
