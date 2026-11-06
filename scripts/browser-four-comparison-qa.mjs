import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3015';
const dir=process.env.QA_OUTPUT_DIR??'/workspace/work/four-comparison-tools-20261106/browser';
await fs.mkdir(dir,{recursive:true});
const content=JSON.parse(await fs.readFile('src/lib/four-comparison-content.json','utf8'));
const configs=[{id:'cd-ladder',mode:'ladder',key:'horizon',value:'72',modes:['ladder']},{id:'npv',mode:'periodic',key:'rate',value:'8',modes:['periodic','dated']},{id:'lease-vs-buy-car',mode:'comparison',key:'lease_payment',value:'500',modes:['comparison']},{id:'mortgage-comparison',mode:'offers',key:'horizon',value:'72',modes:['offers']}];
const checks=[],errors=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
async function noOverflow(page,label){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' overflow');}
try{
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});
  await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const config of configs){
   const {id,mode,key,value,modes}=config,path='/'+id+'-calculator';
   assert.equal((await page.goto(base+path)).status(),200);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();
   const field=page.locator('[id="'+id+'-'+mode+'-'+key+'"]');assert.ok(await field.isVisible());await field.fill(value);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');await noOverflow(page,path+' '+width);
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io'+path);
   if(width===390)await page.screenshot({path:dir+'/'+id+'-mobile.png'});if(width===1440&&id==='npv')await page.screenshot({path:dir+'/npv-desktop.png'});
   checks.push({id,width,calculate:true,noOverflow:true,canonical:true});
   await page.getByRole('button',{name:/^(Share \/ Export|Share your results)$/}).first().click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await dialog.getByRole('tab',{name:'Embed',exact:true}).count(),0);assert.equal(await dialog.getByRole('link',{name:'Pinterest',exact:true}).count(),0);
   await dialog.getByLabel('Include my inputs in the share link',{exact:true}).check();await page.waitForFunction(()=>document.querySelector('#calculator-share-link')?.value.includes('#calc='));const target=new URL(await dialog.getByLabel('Share link',{exact:true}).inputValue());
   await dialog.getByRole('tab',{name:'Cite',exact:true}).click();assert.ok((await dialog.getByLabel('Citation text',{exact:true}).inputValue()).includes('https://www.calculatorfree.io'+path));
   await dialog.getByRole('tab',{name:'Export',exact:true}).click();const pending=page.waitForEvent('download');await dialog.getByRole('button',{name:'Download CSV',exact:true}).click();const file=await pending,output=dir+'/'+id+'-'+width+'.csv';await file.saveAs(output);assert.ok((await fs.stat(output)).size>30);await noOverflow(page,id+' dialog '+width);
   await dialog.getByRole('button',{name:'Close share dialog',exact:true}).click();await page.goto(base+target.pathname+target.hash);await page.waitForFunction(({id,mode,key,value})=>document.getElementById(id+'-'+mode+'-'+key)?.value===value,config);checks.push({id,width,shareRestoresInputs:true,csv:true,citation:true});
   for(const next of modes){if(modes.length>1)await page.locator('#tab-'+next).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');await noOverflow(page,id+'/'+next+' '+width);checks.push({id,mode:next,width,executes:true});}
  }
  await page.goto(base+'/npv-calculator');await page.locator('#tab-dated').click();await page.getByLabel('Dated cash flows: YYYY-MM-DD, amount',{exact:true}).fill('2026-02-30, -1000\n2027-01-01, 1100');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.getByRole('alert').filter({hasText:'Use valid YYYY-MM-DD dates.'}).waitFor();checks.push({width,invalidDateError:true});
  await page.getByLabel('Dated cash flows: YYYY-MM-DD, amount',{exact:true}).fill('2027-01-01, 1100\n2026-01-01, -1000');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').getByText('$0.00',{exact:true}).waitFor();checks.push({width,unsortedDateRecovery:true});
  await context.close();
 }
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false});await context.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());const page=await context.newPage();
  for(const [id,g] of Object.entries(content)){assert.equal((await page.goto(base+'/'+id+'-calculator')).status(),200);for(const q of g.questions)assert.equal(await page.getByRole('heading',{name:q.question,exact:true}).count(),1);assert.ok((await page.locator('.calculator-guide').innerText()).includes(g.summary));assert.equal(await page.getByRole('heading',{name:'Important information & limitations',exact:true}).count(),1);for(const e of g.examples)assert.equal(await page.getByRole('heading',{name:e.title,exact:true}).count(),1);await noOverflow(page,id+' noJS '+width);checks.push({id,width,staticFAQs:8,staticExamples:3,noOverflow:true});}
  const links=[['/guides/cd-ladder/','cd-ladder'],['/guides/irr-vs-npv/','npv'],['/guides/leasing-vs-buying-a-car/','lease-vs-buy-car'],['/guides/15-vs-30-year-mortgage/','mortgage-comparison'],['/glossary/certificate-of-deposit/','cd-ladder'],['/glossary/net-present-value/','npv'],['/glossary/lease-residual-value/','lease-vs-buy-car'],['/glossary/mortgage-points/','mortgage-comparison'],['/glossary/apr/','mortgage-comparison']];
  for(const [path,id] of links){assert.equal((await page.goto(base+path)).status(),200);assert.ok(await page.locator('a[href="/'+id+'-calculator"]').count(),path+' new tool link');await noOverflow(page,path+' '+width);checks.push({path,width,newToolLink:true,static:true,noOverflow:true});}
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
}finally{await fs.writeFile(dir+'/results.json',JSON.stringify({checks,errors},null,2));await browser.close();}
