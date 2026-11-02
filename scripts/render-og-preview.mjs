// Optional asset-authoring step; the static build uses the committed PNG.
// Supply PLAYWRIGHT_MODULE and CHROMIUM_PATH when using a managed browser install.
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');
const logo=await readFile('public/favicon.svg','utf8');
const font=(await readFile('public/fonts/inter-latin-variable-3100e775.woff2')).toString('base64');
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-display:block}
*{box-sizing:border-box}body{margin:0;font-family:Inter,sans-serif;color:#121b2c}
.card{width:1200px;height:630px;padding:54px 64px;position:relative;overflow:hidden;background:linear-gradient(120deg,#fff 35%,#f1f0ff 100%);border:1px solid #e2e7f3}
.brand{display:flex;gap:14px;align-items:center;font-size:31px;font-weight:750;letter-spacing:-1px;color:#7365d6}.brand svg{width:43px;height:48px}.brand .free{color:#c55000}.brand .io{font-size:25px;color:#64748b}
.badge{position:absolute;right:64px;top:62px;padding:12px 18px;border:1px solid #d9d3ff;border-radius:40px;background:#fff;font-size:17px;color:#5846d8;font-weight:650}
h1{font-size:76px;line-height:1.08;letter-spacing:-3px;font-weight:800;max-width:820px;margin:46px 0 24px;position:relative;z-index:1}
.description{font-size:27px;line-height:1.5;max-width:800px;margin:0;color:#52627c;position:relative;z-index:1}
.symbol{position:absolute;right:54px;top:215px;transform:rotate(9deg);opacity:.16}.symbol svg{width:240px;height:270px}
.accent{position:absolute;left:64px;bottom:102px;width:90px;height:6px;border-radius:5px;background:linear-gradient(90deg,#7365d6 65%,#c55000 65%)}
footer{position:absolute;bottom:46px;left:64px;right:64px;display:flex;align-items:center;justify-content:space-between;color:#52627c;font-size:15px}footer strong{font-size:23px;font-weight:650;color:#5846d8}
</style><main class="card"><div class="brand">${logo}<span>Calculator<span class="free">Free</span><span class="io">.io</span></span></div><div class="badge">Free · No account required</div><h1>Plan with<br>clearer numbers.</h1><p class="description">Free financial calculators for mortgages,<br>investing and retirement.</p><div class="symbol" aria-hidden="true">${logo}</div><div class="accent"></div><footer><strong>calculatorfree.io</strong><span>Educational estimates. Not financial advice.</span></footer></main></html>`;
const browser=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.route('**/*',route=>route.abort());
 await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
 await mkdir('public/social',{recursive:true});
 const path=resolve('public/social/og-default-v1.png');await page.screenshot({path});
 console.log('Rendered 1200 × 630 brand preview:',path);
}finally{await browser.close();}
