import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import embedTools from '../src/lib/embed-tools.json';
import {embedCode,embedTool,embedURL} from '../src/lib/embed-code';
import {calculators} from '../src/lib/calculators';

test('Approved embeds preserve every public calculator destination',()=>{
 for(const {id} of embedTools){const tool=embedTool(id)!;assert.ok(tool);assert.equal(calculators.find(c=>c.id===id)?.title,tool.title);assert.equal(new URL(embedURL(id)).pathname,'/embed/'+tool.slug+'/');}
 assert.ok(embedTool('mortgage'));assert.ok(embedTool('covered-call'));assert.equal(embedTool('income-tax'),undefined);assert.throws(()=>embedURL('income-tax'));
});
test('Copied embed code has a lazy titled frame, no input payload, and qualified attribution',()=>{
 const code=embedCode('roi','dark',800);assert.match(code,/src="https:\/\/www\.calculatorfree\.io\/embed\/roi-calculator\/\?theme=dark"/);assert.match(code,/loading="lazy"/);assert.match(code,/title="ROI Calculator by CalculatorFree.io"/);assert.match(code,/referrerpolicy="no-referrer"/);assert.match(code,/rel="nofollow noopener"/);assert.ok(!/share_version|cost=|returned=|balance=|<script/.test(code));
});
test('Embed configuration cannot inject code, arbitrary URLs, dimensions or themes',()=>{
 for(const id of ['../roi','roi" onload="alert(1)','https://example.com'])assert.throws(()=>embedCode(id,'light',800));
 for(const height of [-1,0,399,2401,800.5,Infinity,NaN])assert.throws(()=>embedCode('roi','light',height));
 assert.throws(()=>embedURL('roi','dark" onload="x' as 'dark'));
});
test('Embed policy permits opaque local-file parents while retaining resource restrictions and noindex',async()=>{
 const headers=await readFile('public/_headers','utf8');const section=headers.split('/embed/*')[1].split('/embed/assets/*')[0];assert.ok(!/(?:^|;)\s*frame-ancestors\b/.test(section));assert.ok(!/X-Frame-Options:/i.test(section));assert.match(section,/connect-src 'none'/);assert.match(section,/X-Robots-Tag: noindex/);assert.ok(!headers.split('/embed/*')[0].includes('X-Robots-Tag: noindex'));
});

test('Embed presets and custom heights support a bounded integer range',()=>{
 for(const height of [400,600,650,800,801,1000,1200,2400])assert.ok(embedCode('roi','light',height).includes(`height="${height}"`));
});
