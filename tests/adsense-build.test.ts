import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {validateAdSense,checkAdSenseBuild,adsensePublisher} from '../scripts/check-adsense-build.mjs';
import {stripErrorDocumentAds,stripErrorFlightAds} from '../scripts/prepare-ad-free-errors.mjs';

const loader=`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisher}" crossorigin="anonymous"></script>`;
const document=(head:string,body='')=>`<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

test('AdSense check accepts one asynchronous loader in the head',()=>{
 assert.equal(validateAdSense(document(loader)),true);
 assert.equal(validateAdSense(document(loader.replace('async ','async="" '))),true);
});
test('Serialized or inline ad references do not satisfy AdSense coverage',()=>{
 assert.throws(()=>validateAdSense(document('')),/exactly one/);
 assert.throws(()=>validateAdSense(document(`<script>var source=${JSON.stringify(loader.replace(/</g,'\\u003c'))};</script>`)),/exactly one/);
});
test('AdSense check rejects duplicate loaders and another publisher',()=>{
 assert.throws(()=>validateAdSense(document(loader+loader)),/exactly one/);
 assert.throws(()=>validateAdSense(document(loader.replace(adsensePublisher,'ca-pub-0000000000000000'))),/publisher/);
});
test('AdSense check preserves the approved source and nonblocking head placement',()=>{
 assert.throws(()=>validateAdSense(document(loader.replace('async ',''))),/asynchronously/);
 assert.throws(()=>validateAdSense(document(loader.replace('pagead2.googlesyndication.com','example.com'))),/source/);
 assert.throws(()=>validateAdSense(document('',loader)),/document head/);
 assert.throws(()=>validateAdSense(document(loader.replace('crossorigin="anonymous"',''))),/crossorigin/);
});
test('New nested HTML pages are included automatically in the build gate',async()=>{
 const root=await mkdtemp(join(tmpdir(),'calculatorfree-adsense-'));
 try{
  await assert.rejects(checkAdSenseBuild(root),/no exported HTML/);
  await writeFile(join(root,'index.html'),document(loader));
  const nested=join(root,'guides','new-guide');await mkdir(nested,{recursive:true});
  await writeFile(join(nested,'index.html'),document(loader));
  assert.deepEqual(await checkAdSenseBuild(root),{passed:true,htmlPages:2,publisher:adsensePublisher});
  await writeFile(join(nested,'new-page.html'),document(''));
  await assert.rejects(checkAdSenseBuild(root),/new-page.html/);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('Only approved embed paths may omit ads; ordinary and unexpected embed pages still need them',async()=>{
 const root=await mkdtemp(join(tmpdir(),'calculatorfree-embeds-'));
 try{
  await writeFile(join(root,'index.html'),document(loader));
  const dir=join(root,'embed','roi-calculator');await mkdir(dir,{recursive:true});
  await writeFile(join(dir,'index.html'),document('<meta name="robots" content="noindex,follow">'));
  const report=await checkAdSenseBuild(root);assert.deepEqual(report.adFreeEmbedPages,['embed/roi-calculator/index.html']);
  await writeFile(join(dir,'index.html'),document('<meta name="robots" content="noindex,follow">'+loader));
  await assert.rejects(checkAdSenseBuild(root),/embed must be ad-free/);
  await writeFile(join(dir,'index.html'),document(''));
  await assert.rejects(checkAdSenseBuild(root),/embed must be noindex/);
  await writeFile(join(dir,'index.html'),document('<meta name="robots" content="noindex,follow">'));
  const extra=join(root,'embed','unapproved');await mkdir(extra,{recursive:true});await writeFile(join(extra,'index.html'),document(''));
  await assert.rejects(checkAdSenseBuild(root),/exactly one AdSense/);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('Error exports remove advertising before load and hydration while preserving page content',()=>{
 const payload='0:["$","h1",null,{"children":"Not found"}]\n4:'+JSON.stringify(['$','script',null,{async:true,src:`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisher}`,crossOrigin:'anonymous'}])+'\n';
 const flight='<script>self.__next_f.push('+JSON.stringify([1,payload])+')</script>';
 const html=document(loader+'<meta name="robots" content="noindex">','<h1>Not found</h1>'+flight+'<script src="/_next/static/chunks/runtime.js"></script>');
 const cleaned=stripErrorDocumentAds(html);
 assert.doesNotMatch(cleaned,/adsbygoogle|googlesyndication/);
 assert.match(cleaned,/<h1>Not found<\/h1>/);
 assert.match(cleaned,/runtime.js/);
 assert.match(cleaned,/content="noindex"/);
 assert.doesNotMatch(stripErrorFlightAds(payload),/adsbygoogle/);
 assert.throws(()=>stripErrorDocumentAds(html+'<!-- unexpected adsbygoogle reference -->'),/still contains an ad reference/);
});

test('Explicit error documents must be ad-free and noindex; content pages still require ads',async()=>{
 const root=await mkdtemp(join(tmpdir(),'calculatorfree-error-ads-'));
 try{
  await writeFile(join(root,'index.html'),document(loader));
  for(const name of ['404.html','_not-found.html'])await writeFile(join(root,name),document('<meta name="robots" content="noindex"/>'));
  assert.deepEqual((await checkAdSenseBuild(root)).adFreeErrorPages,['404.html','_not-found.html']);
  await writeFile(join(root,'404.html'),document(loader+'<meta name="robots" content="noindex"/>'));
  await assert.rejects(checkAdSenseBuild(root),/error page must be ad-free/);
  await writeFile(join(root,'404.html'),document(''));
  await assert.rejects(checkAdSenseBuild(root),/error page must be noindex/);
 }finally{await rm(root,{recursive:true,force:true});}
});
