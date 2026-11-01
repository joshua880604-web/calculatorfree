'use client';
import {useEffect,useRef,type ReactNode} from 'react';
const normalize=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export default function GuideDirectoryControls({children,total}:{children:ReactNode;total:number}) {
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null);
 const savedOpen=useRef<Map<HTMLDetailsElement,boolean>|null>(null);
 useEffect(()=>{const controls=root.current?.querySelector<HTMLElement>('[data-guide-search-controls]');if(controls)controls.hidden=false;},[]);
 function filter(value:string) {
  const el=root.current;if(!el)return;
  const tokens=normalize(value).split(/\s+/).filter(Boolean),active=tokens.length>0;
  const details=[...el.querySelectorAll<HTMLDetailsElement>('details[data-guide-more]')];
  if(active&&!savedOpen.current)savedOpen.current=new Map(details.map(d=>[d,d.open]));
  let matches=0;
  for(const group of el.querySelectorAll<HTMLElement>('[data-guide-group]')) {
   let count=0;
   for(const row of group.querySelectorAll<HTMLElement>('[data-guide-search]')) {
    const haystack=normalize(row.dataset.guideSearch??'');const match=tokens.every(token=>haystack.includes(token));row.hidden=!match;if(match)count++;
   }
   matches+=count;group.hidden=count===0;
   const label=group.querySelector('[data-group-count]');if(label)label.textContent=String(count);
  }
  for(const detail of details) {
   const hasRows=[...detail.querySelectorAll<HTMLElement>('[data-guide-search]')].some(row=>!row.hidden);
   detail.hidden=active&&!hasRows;
   if(active)detail.open=true;else if(savedOpen.current)detail.open=savedOpen.current.get(detail)??false;
   const summary=detail.querySelector('summary');if(summary)summary.hidden=active;
  }
  if(!active)savedOpen.current=null;
  const featured=el.querySelector<HTMLElement>('[data-featured-guides]');if(featured)featured.hidden=active;
  const status=el.querySelector('[data-guide-status]');if(status)status.textContent=active?`${matches} ${matches===1?'guide':'guides'} found`:`${total} guides across 7 topics`;
  const empty=el.querySelector<HTMLElement>('[data-guide-empty]');if(empty)empty.hidden=matches!==0;
  const clear=el.querySelector<HTMLButtonElement>('[data-guide-clear]');if(clear)clear.hidden=!value;
 }
 return <div className="guide-directory" ref={root} onClick={event=>{if((event.target as HTMLElement).closest('[data-guide-category]')&&input.current?.value){input.current.value='';filter('');}}}>
  <div className="guide-directory-search" data-guide-search-controls hidden><label htmlFor="guide-search">Find a guide</label><div className="guide-search-field"><input ref={input} id="guide-search" type="search" placeholder="Try Coast FIRE, PMI or loan payments" onChange={event=>filter(event.target.value)} onKeyDown={event=>{if(event.key==='Escape'&&input.current){input.current.value='';filter('');}}}/><button type="button" data-guide-clear hidden onClick={()=>{if(input.current){input.current.value='';filter('');input.current.focus();}}}>Clear</button></div><p className="guide-directory-status" data-guide-status role="status" aria-live="polite">{total} guides across 7 topics</p></div>
  {children}<p data-guide-empty hidden>No matching guides. Try a broader term, such as retirement, mortgage or tax.</p>
 </div>;
}
