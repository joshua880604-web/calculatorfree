import descriptions from './pinterest-descriptions.json';
import {canonicalCitationURL} from './share-formats';
import {shareToolPaths,hasPinterest} from './share-tools';
export function pinterestCoverPath(id:string){if(!hasPinterest(id))throw new Error('Pinterest sharing is unavailable for this calculator.');return `/social/pinterest/${id}-v1.png`;}
// Pins always use a public cover and canonical tool page, never calculation inputs.
export function pinterestShareURL(path:string,title:string){
 const url=canonicalCitationURL(path),id=shareToolPaths[new URL(url).pathname];
 if(!id||!hasPinterest(id))throw new Error('Pinterest sharing is unavailable for this calculator.');
 const media=`https://www.calculatorfree.io${pinterestCoverPath(id)}`;
 return 'https://www.pinterest.com/pin/create/button/?'+new URLSearchParams({url,media,description:`${title} — ${descriptions[id as keyof typeof descriptions]??"Explore estimates using your own assumptions."} Free to use at CalculatorFree.io. Educational estimates, not financial advice.`});
}
