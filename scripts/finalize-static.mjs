import {readdir,rm,rename,stat,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
// The application uses normal <a> document navigation, not Next Link/RSC prefetch.
// Export physical *.html documents for extensionless static serving.
// Legacy public *.html requests redirect via _redirects; these are storage files.
let count=0;
for(const name of await readdir('out')){
 if(!name.endsWith('.html.html'))continue;
 const target=join('out',name.slice(0,-5));
 try{if((await stat(target)).isDirectory())await rm(target,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}
 await rename(join('out',name),target);count++;
}
console.log(`Prepared ${count} static .html routes.`);
// This extensionless document uses normal anchors, not RSC navigation. Remove
// Next's matching RSC-only directory so static hosts resolve its .html document.
await rm('out/embed-resources',{recursive:true,force:true});
// Glossary uses directory URLs, independent of the established calculator URLs.
// No RSC navigation is used; canonical documents are served as index.html.
const glossary='out/glossary';
await mkdir(glossary,{recursive:true});
 for(const name of await readdir(glossary)){
  if(!name.endsWith('.html')||name==='index.html')continue;
  const folder=join(glossary,name.slice(0,-5));await mkdir(folder,{recursive:true});
  await rename(join(glossary,name),join(folder,'index.html'));
 }
await rename('out/glossary.html',join(glossary,'index.html'));
console.log('Prepared glossary directory documents.');
// Guides are static directory documents, with no client router dependency.
const guides='out/guides';
await mkdir(guides,{recursive:true});
for(const name of await readdir(guides)){
 if(!name.endsWith('.html')||name==='index.html')continue;
 const folder=join(guides,name.slice(0,-5));await mkdir(folder,{recursive:true});
 await rename(join(guides,name),join(folder,'index.html'));
}
await rename('out/guides.html',join(guides,'index.html'));
console.log('Prepared guides directory documents.');
// Error screens have no advertising inventory. Strip the inherited root loader
// from both static HTML and hydration data before the coverage gate runs.
const {prepareAdFreeErrors}=await import('./prepare-ad-free-errors.mjs');
await prepareAdFreeErrors();
// Content pages retain ads; approved embeds and explicit error pages are ad-free.
const {checkAdSenseBuild}=await import('./check-adsense-build.mjs');
console.log('AdSense coverage:',await checkAdSenseBuild());
await import('./check-public-brand.mjs');
