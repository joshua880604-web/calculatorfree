import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3015';
const dir=process.env.QA_OUTPUT_DIR??'/workspace/work/calculator-expansion-implementation-20261105/remaining-browser';
await fs.mkdir(dir,{recursive:true});
const content=JSON.parse(await fs.readFile('src/lib/remaining-tool-content.json','utf8'));
const configs=[
 {id:'1031-exchange',mode:'exchange',key:'basis',value:'123456',modes:['exchange','deadlines']},
 {id:'home-maintenance-cost',mode:'allowance',key:'home_value',value:'321000',modes:['allowance','components']},
 {id:'vacancy-rate',mode:'snapshot',key:'units',value:'15',modes:['snapshot','period']},
 {id:'credit-utilization',mode:'cards',key:'target',value:'20',modes:['cards']},
 {id:'dca',mode:'prices',key:'budget',value:'750',modes:['prices']},
 {id:'rule-of-72',mode:'time',key:'rate',value:'7',modes:['time','return']},
 {id:'capital-gains-tax',mode:'sale',key:'basis',value:'65000',modes:['sale']},
 {id:'retirement-withdrawal',mode:'rate',key:'withdrawal_rate',value:'3.5',modes:['longevity','budget','rate','nest-egg']},
 {id:'stock-average',mode:'average-down',key:'held',value:'123',modes:['purchases','average-down']},
];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[],errors=[];
async function setMode(page,mode){const picker=page.locator("#calculation-mode");if(await picker.isVisible())await picker.selectOption(mode);else await page.locator("#tab-"+mode).click();}
try{
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});
  await context.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const config of configs){
   const {id,mode,key,value,modes}=config;
   const response=await page.goto(base+'/'+id+'-calculator');assert.equal(response.status(),200);
   if(modes.length>1)await setMode(page,mode);
   const field=page.locator('[id="'+id+'-'+mode+'-'+key+'"]');await field.fill(value);
   await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();
   assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/'+id+'-calculator');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' overflow at '+width);
   checks.push({id,width,calculate:true,canonical:true,noOverflow:true});
   if(width===390){await page.locator('.metric.primary').scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/'+id+'-mobile.png'});}
   await page.getByRole('button',{name:/^(Share \/ Export|Share your results)$/}).first().click();const dialog=page.getByRole('dialog');await dialog.waitFor();
   await dialog.locator('input[type=checkbox]').first().check();await page.waitForFunction(()=>document.querySelector('#calculator-share-link')?.value.includes('#calc='));const target=new URL(await dialog.getByLabel('Share link',{exact:true}).inputValue());
   await dialog.getByRole('tab',{name:'Export',exact:true}).click();const download=page.waitForEvent('download');await dialog.getByRole('button',{name:'Download CSV',exact:true}).click();const file=await download;await file.saveAs(dir+'/'+id+'-'+width+'.csv');assert.ok((await fs.stat(dir+'/'+id+'-'+width+'.csv')).size>30);
   await dialog.getByRole('button',{name:'Close share dialog',exact:true}).click();
   await page.goto(base+target.pathname+target.hash);
   await page.waitForFunction(({id,mode,key,value})=>document.getElementById(id+'-'+mode+'-'+key)?.value===value,{id,mode,key,value});
   checks.push({id,width,shareRestoresInputs:true,csvExport:true});
   for(const next of modes){if(modes.length>1)await setMode(page,next);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+'/'+next+' overflow');checks.push({id,width,mode:next,executes:true});}
  }
  // Exercise meaningful changing-state behavior beyond defaults.
  await page.goto(base+'/stock-average-calculator?mode=average-down');await page.locator('#tab-average-down').click();await page.getByLabel('New purchase price per share',{exact:true}).fill('40');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').getByText('No finite purchase reaches this target',{exact:true}).waitFor();checks.push({width,impossibleAverageTarget:true});
  await page.goto(base+'/1031-exchange-calculator');await page.locator('#tab-deadlines').click();await page.getByLabel('Applicable tax return due date including any extension',{exact:true}).fill('2027-10-15');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result').getByText('2027-05-04',{exact:true}).first().waitFor();checks.push({width,exchangeEarlierDeadline:true});
  await context.close();
 }
 const plain=await browser.newContext({javaScriptEnabled:false});await plain.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());const page=await plain.newPage();
 for(const [id,g] of Object.entries(content)){await page.goto(base+'/'+id+'-calculator');for(const q of g.questions)assert.equal(await page.getByRole('heading',{name:q.question,exact:true}).count(),1);assert.ok((await page.locator('.calculator-guide').innerText()).includes(g.summary));assert.equal(await page.getByRole('heading',{name:'Important information & limitations',exact:true}).count(),1);checks.push({id,staticGuide:true,sevenStaticQuestions:true,staticDisclaimer:true});}
 await plain.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
}finally{await fs.writeFile(dir+'/results.json',JSON.stringify({checks,errors},null,2));await browser.close();}
