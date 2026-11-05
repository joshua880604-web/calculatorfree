import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import('/opt/codex/cua_node/lib/node_modules/playwright/index.mjs');
const base=process.env.QA_BASE_URL??'http://127.0.0.1:3015';
const dir=process.env.QA_OUTPUT_DIR??'/workspace/work/calculator-expansion-implementation-20261105/browser';
await fs.mkdir(dir,{recursive:true});
const content=JSON.parse(await fs.readFile('src/lib/expansion-five-content.json','utf8'));
const configs=[
 ['retirement-withdrawal','balance','123456',['longevity','budget']],
 ['balance-transfer','balance','1234',['transfer','offers']],
 ['dscr','rent','3210',['rental-loan','noi']],
 ['fsa','plan_limit','3000',['health']],
 ['closing-cost','price','310000',['buyer','seller']],
];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const checks=[],errors=[];
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});
  await context.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const [id,key,input,modes] of configs){
   const response=await page.goto(base+'/'+id+'-calculator');assert.equal(response.status(),200);
   await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();
   assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://www.calculatorfree.io/'+id+'-calculator');
   const field=page.locator('#'+id+'-'+modes[0]+'-'+key);await field.fill(input);await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();
   assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' overflow at '+width);
   checks.push({id,width,calculate:true,canonical:true,noOverflow:true});
   if(width===390){await page.locator('.metric.primary').scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/'+id+'-mobile.png'});}
   await page.getByRole('button',{name:/^(Share \/ Export|Share your results)$/}).first().click();const dialog=page.getByRole('dialog');await dialog.waitFor();
   await dialog.locator('input[type=checkbox]').first().check();await page.waitForFunction(()=>document.querySelector('#calculator-share-link')?.value.includes('#calc='));const link=await dialog.getByLabel('Share link',{exact:true}).inputValue();const target=new URL(link);assert.ok(target.hash.startsWith('#calc='));
   await dialog.getByRole('tab',{name:'Export',exact:true}).click();
   const download=page.waitForEvent('download');await dialog.getByRole('button',{name:'Download CSV',exact:true}).click();const file=await download;await file.saveAs(dir+'/'+id+'-'+width+'.csv');assert.ok((await fs.stat(dir+'/'+id+'-'+width+'.csv')).size>30);
   await dialog.getByRole('button',{name:'Close share dialog',exact:true}).click();
   await page.goto(base+target.pathname+target.hash);if(modes.length>1)await page.locator('#tab-'+modes[0]+'[aria-selected=true]').waitFor();
   await page.waitForFunction(({id,mode,key,input})=>document.getElementById(id+'-'+mode+'-'+key)?.value===input,{id,mode:modes[0],key,input});assert.equal(await page.locator('#'+id+'-'+modes[0]+'-'+key).inputValue(),input);checks.push({id,width,shareRestoresInputs:true,fullCsvExport:true});
   for(const mode of modes){if(modes.length>1)await page.locator('#tab-'+mode).click();await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.metric.primary').waitFor();assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push({id,width,mode,executes:true});}
  }
  await page.goto(base+'/fsa-calculator');const rule=page.getByLabel('Employer unused-funds rule',{exact:true});
  assert.equal(await page.getByLabel('Employer carryover limit',{exact:true}).count(),0);
  await rule.selectOption('Carryover');await page.getByLabel('Employer carryover limit',{exact:true}).fill('100');await page.getByRole('button',{name:'Calculate',exact:true}).click();await page.locator('.result').getByText('Estimated carryover to next year',{exact:true}).waitFor();
  await rule.selectOption('Grace period');assert.equal(await page.getByLabel('Employer carryover limit',{exact:true}).count(),0);await page.getByLabel('Additional eligible spending during the grace period',{exact:true}).fill('100');await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal((await page.getByRole('alert').allTextContents()).join('').trim(),'');checks.push({width,fsaUnusedRulesSwitchCorrectly:true});
  await context.close();
 }
 const plain=await browser.newContext({javaScriptEnabled:false});await plain.route('**/*',route=>route.request().url().startsWith(base+'/')?route.continue():route.abort());const page=await plain.newPage();
 for(const [id] of configs){await page.goto(base+'/'+id+'-calculator');assert.equal(await page.getByRole('heading',{name:'Common questions',exact:false}).count(),1);for(const q of content[id].questions)assert.equal(await page.getByRole('heading',{name:q.question,exact:true}).count(),1);assert.ok((await page.locator('.calculator-guide').innerText()).includes(content[id].summary));assert.equal(await page.getByRole('heading',{name:'Important information & limitations',exact:true}).count(),1);checks.push({id,staticGuide:true,sevenStaticQuestions:true,staticDisclaimer:true});}
 await plain.close();assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,checks:checks.length,errors}));
}finally{await fs.writeFile(dir+'/results.json',JSON.stringify({checks,errors},null,2));await browser.close();}
