import {createElement,type ReactNode} from 'react';
import reviewed from '@/lib/guide-concept-links.json';

type Concept={slug:string;phrases:string[]};
const escape=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Each render gets its own set. Only editorially approved phrases are linked,
// once per concept, in plain prose supplied by the guide's server component.
export function createGuideConceptLinker(path:string){
 const concepts=(reviewed as Record<string,Concept[]>)[path]??[];
 const used=new Set<string>();
 return (text:string):ReactNode=>{
  const matches=concepts.filter(c=>!used.has(c.slug)).flatMap(concept=>{
   const pattern=new RegExp('(?<![\\p{L}\\p{N}_])('+concept.phrases.map(escape).sort((a,b)=>b.length-a.length).join('|')+')(?![\\p{L}\\p{N}_])','iu');
   const match=pattern.exec(text);
   return match?[{slug:concept.slug,index:match.index,text:match[0]}]:[];
  }).sort((a,b)=>a.index-b.index||b.text.length-a.text.length);
  if(!matches.length)return text;
  const result:ReactNode[]=[];let cursor=0;
  for(const match of matches){
   if(match.index<cursor)continue;
   result.push(text.slice(cursor,match.index));
   result.push(createElement('a',{key:match.slug,href:'/glossary/'+match.slug+'/',className:'contextual-concept-link'},match.text));
   used.add(match.slug);cursor=match.index+match.text.length;
  }
  result.push(text.slice(cursor));return result;
 };
}
