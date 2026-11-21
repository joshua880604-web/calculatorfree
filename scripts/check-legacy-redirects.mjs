import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3641';
const catalog=JSON.parse(await fs.readFile('src/lib/catalog-data.json','utf8'));
const routes=[...new Set([...catalog.map(c=>c.local_route),'/financial-calculator.html','/about.html','/privacy.html','/methodology.html','/loan-calculators.html','/savings-investment-calculators.html','/retirement-calculators.html','/tax-income-calculators.html','/business-calculators.html','/everyday-calculators.html'])];
const migrated=JSON.parse(await fs.readFile('src/lib/calculator-route-aliases.json','utf8'));
const expected=new Map([['/','/financial-calculator'],['/index.html','/financial-calculator'],['/glossary.html','/glossary/'],...routes.map(p=>[p,p.slice(0,-5)])]);
expected.set('/embed-resources.html','/embed-resources');
expected.set('/embed-resources/','/embed-resources');
for(const [from,to]of Object.entries(migrated)){expected.set(from,to);expected.set(from+'.html',to);}
const rules=new Map((await fs.readFile('out/_redirects','utf8')).split(/\r?\n/).filter(l=>l.trim()&&!l.trim().startsWith('#')).map(l=>{const [a,b,c]=l.split(/\s+/);assert.equal(c,'301');return[a,b];}));
assert.deepEqual(rules,expected);
let checks=0;
for(const [from,to] of expected){
 for(const method of ['GET','HEAD']){
  const suffix='?principal=1000&rate=4&rate_type=APY&note=a%2Bb';
  const r=await fetch(base+from+suffix,{method,redirect:'manual'});assert.equal(r.status,301,from);assert.equal(r.headers.get('location'),to+suffix,from);
  const target=await fetch(new URL(r.headers.get('location'),base),{method,redirect:'manual'});assert.equal(target.status,200,to);assert.equal(target.headers.get('location'),null,to);
  checks++;
 }
}
for(const path of ['/favicon.ico','/robots.txt','/does-not-exist.html']){const r=await fetch(base+path,{redirect:'manual'});assert.equal(r.status,path.includes('does-not-exist')?404:200);checks++;}
console.log(JSON.stringify({passed:true,rules:expected.size,httpChecks:checks,queryPreserved:true,noChains:true}));
