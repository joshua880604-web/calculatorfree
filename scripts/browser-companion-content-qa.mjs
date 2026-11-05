import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3015';
const out=process.env.QA_OUTPUT_DIR??'/workspace/work/calculator-companion-content-20261105/browser';
await fs.mkdir(out,{recursive:true});
const guides=JSON.parse(await fs.readFile('src/lib/companion-guide-content.json','utf8'));
const terms=JSON.parse(await fs.readFile('src/lib/companion-glossary-data.json','utf8'));
const existingTerms=JSON.parse(await fs.readFile('src/lib/glossary-data.json','utf8'));
const dca=JSON.parse(await fs.readFile('src/lib/comparison-guide-content.json','utf8'))['lump-dca'];
const allGuides={...guides,'lump-dca':dca};
const allTerms=[...terms,...existingTerms.filter(t=>['dollar-cost-averaging','vacancy-rate'].includes(t.slug))];
const checks=[],errors=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false,reducedMotion:'reduce'});
  await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  const page=await context.newPage();
  for(const [key,g] of Object.entries(allGuides)){
   const response=await page.goto(base+g.meta.path);assert.equal(response.status(),200);
   assert.equal(await page.getByRole('heading',{level:1,name:g.meta.heading,exact:true}).count(),1);
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io'+g.meta.path);
   for(const q of g.questions)assert.equal(await page.getByRole('heading',{name:q.question,exact:true}).count(),1);
   assert.equal(await page.getByRole('link',{name:'Download the guide’s example tables as CSV',exact:true}).count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),g.meta.path+' overflow at '+width);
   const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();assert.ok(schemas.some(s=>JSON.parse(s)['@graph']?.some(x=>x['@type']==='Article'&&x.headline===g.meta.heading)));
   if(width===390&&['exchange-1031','capital-gains','lump-dca'].includes(key))await page.screenshot({path:out+'/'+key+'-mobile.png'});
   checks.push({path:g.meta.path,width,staticArticle:true,canonical:true,questions:true,noOverflow:true});
  }
  for(const term of allTerms){
   const path='/glossary/'+term.slug+'/';const response=await page.goto(base+path);assert.equal(response.status(),200);
   assert.equal(await page.getByRole('heading',{level:1,name:term.name,exact:true}).count(),1);
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io'+path);
   assert.ok((await page.locator('.glossary-definition').innerText()).includes(term.definition));
   assert.equal(await page.getByRole('link',{name:/Try these example inputs/}).count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path+' overflow at '+width);
   if(width===390&&term.slug==='credit-utilization')await page.screenshot({path:out+'/credit-utilization-term-mobile.png'});
   checks.push({path,width,staticDefinition:true,exampleLink:true,canonical:true,noOverflow:true});
  }
  await page.goto(base+'/guides/');for(const g of Object.values(guides))assert.ok(await page.locator('a[href="'+g.meta.path+'"]').count(),g.meta.path+' absent from static hub');
  await page.goto(base+'/glossary/');for(const term of terms)assert.ok(await page.locator('a[href="/glossary/'+term.slug+'/"]').count(),term.slug+' absent from static glossary hub');
  checks.push({width,newPagesInStaticHubs:true});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce',acceptDownloads:true});
 await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 async function reproduce(href,mode,values){
  const target=new URL(href,base);await page.goto(base+target.pathname+target.search+target.hash);
  const id=target.pathname.replace(/^\//,'').replace(/-calculator$/,'');
  await page.waitForFunction(({id,mode,values})=>Object.entries(values).every(([key,value])=>document.getElementById(id+'-'+mode+'-'+key)?.value===String(value)),{id,mode,values});
  await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();
  assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');
 }
 for(const [key,g] of Object.entries(allGuides)){
  await page.goto(base+g.meta.path);
  const links=[];for(const preset of g.presets)links.push({preset,href:await page.getByRole('link',{name:preset.label,exact:true}).getAttribute('href')});
  const csv=await context.request.get(base+'/data/comparison-guides/'+key+'.csv');assert.equal(csv.status(),200);assert.ok((await csv.text()).includes(g.sections.find(s=>s.table).table.caption));checks.push({topic:key,csvResponse:true});
  for(const {preset,href} of links){await reproduce(href,preset.mode,preset.values);checks.push({topic:key,mode:preset.mode,presetRestoresAndCalculates:true});}
 }
 for(const term of allTerms){
  await page.goto(base+'/glossary/'+term.slug+'/');const href=await page.getByRole('link',{name:/Try these example inputs/}).getAttribute('href');await reproduce(href,term.example.calculator.mode,term.example.calculator.values);checks.push({term:term.slug,exampleRestoresAndCalculates:true});
 }
 await page.goto(base+dca.meta.path);const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download the guide’s example tables as CSV',exact:true}).click();const file=await download;await file.saveAs(out+'/lump-dca.csv');assert.ok((await fs.readFile(out+'/lump-dca.csv','utf8')).includes('$288.60'));checks.push({dcaUpdatedCsvDownload:true});
 await context.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
}finally{await fs.writeFile(out+'/results.json',JSON.stringify({checks,errors},null,2));await browser.close();}
