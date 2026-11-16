"use client";
import SiteLink from "@/components/SiteLink";

import {useEffect,useRef,useState,type FormEvent,type KeyboardEvent} from "react";
import {calculators} from "@/lib/catalog";
import {navigationHref} from "@/lib/navigation";
type SearchEngine = typeof import("@/lib/directory");
let searchPromise: Promise<SearchEngine> | undefined;
function loadSearch() {
  return searchPromise ??= import("@/lib/directory").catch(error=>{searchPromise=undefined;throw error;});
}

export default function CalculatorSearch({id,tools=calculators,compact=false,minimal=false}:{id:string;tools?:typeof calculators;compact?:boolean;minimal?:boolean}) {
  const calculatorCount=tools.filter(tool=>tool.id!=='real-estate').length;
  const [query,setQuery]=useState("");
  const [engine,setEngine]=useState<SearchEngine|null>(null),[loadError,setLoadError]=useState(false);
  const [open,setOpen]=useState(false),[active,setActive]=useState(-1),[expanded,setExpanded]=useState(false);
  const form=useRef<HTMLFormElement>(null),input=useRef<HTMLInputElement>(null);
  const search=query.trim(),results=engine&&search?engine.directorySearch(tools,search):[];
  const loading=!!search&&!engine&&!loadError;
  useEffect(()=>{
    if(!search || engine)return;
    let current=true;setLoadError(false);
    loadSearch().then(next=>{if(current)setEngine(next);}).catch(()=>{if(current)setLoadError(true);});
    return()=>{current=false;};
  },[search,engine]);
  const visible=expanded?results:results.slice(0,8),showing=open&&!!search;
  const listId=id+'-suggestions',optionId=(i:number)=>id+'-option-'+i;
  useEffect(()=>{
    function outside(e:PointerEvent){if(!form.current?.contains(e.target as Node))setOpen(false);}
    document.addEventListener('pointerdown',outside);
    return ()=>document.removeEventListener('pointerdown',outside);
  },[]);
  useEffect(()=>{
    if(showing&&active>=0)document.getElementById(id+'-option-'+active)?.scrollIntoView({block:'nearest'});
  },[active,showing,id]);
  async function submit(e:FormEvent){
    e.preventDefault();
    if(!search){input.current?.focus();return;}
    const submitted=query,selected=showing&&active>=0?visible[active]:undefined;
    let available:SearchEngine;
    try { available=engine??await loadSearch(); }
    catch {if(input.current?.value===submitted)setLoadError(true);return;}
    if(input.current?.value!==submitted)return;
    setEngine(available);setLoadError(false);
    const matches=available.directorySearch(tools,search);
    const targetId=available.directoryTarget(tools,search)?.id;
    const target=selected??matches.find(r=>r.tool.id===targetId);
    if(target){
      const href=navigationHref(target.href),url=new URL(href,window.location.href);
      if(url.href===window.location.href && url.hash.startsWith('#calc='))window.dispatchEvent(new Event('calculator-preset'));
      else window.location.assign(href);
      setOpen(false);return;
    }
    setOpen(true);setExpanded(true);input.current?.focus();
  }
  function keys(e:KeyboardEvent<HTMLInputElement>){
    if(e.nativeEvent.isComposing)return;
    if(e.key==='Escape'){e.preventDefault();setOpen(false);setActive(-1);return;}
    if(e.key==='Tab'){setOpen(false);setActive(-1);return;}
    if((e.key==='ArrowDown'||e.key==='ArrowUp')&&search&&visible.length){
      e.preventDefault();setOpen(true);
      setActive(i=>e.key==='ArrowDown'?(i+1)%visible.length:(i<0?visible.length-1:(i-1+visible.length)%visible.length));
    }
  }
  return <form ref={form} className={'directory-search'+(compact?' sidebar-search':'')+(minimal?' simple-search':'')} role="search" aria-label="Calculator search" onSubmit={submit} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
    <label htmlFor={id}>Find a calculator</label>
    <div className="directory-search-control">
      <div className="directory-search-field">
        <input ref={input} id={id} type="search" autoComplete="off" maxLength={160} placeholder={compact||minimal?'Search calculators':'Try car payment, mortgage, or retirement'} value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(-1);setExpanded(false);}} onFocus={()=>setOpen(true)} onKeyDown={keys} role="combobox" aria-autocomplete="list" aria-expanded={showing} aria-controls={listId} aria-activedescendant={showing&&active>=0?optionId(active):undefined}/>
        {query&&<button type="button" className="directory-search-clear" aria-label="Clear search" onClick={()=>{setQuery("");setActive(-1);setExpanded(false);input.current?.focus();}}>×</button>}
      </div>
      <button type="submit" className="directory-search-submit">Search</button>
      {showing&&<div className="directory-suggestions">
        <ul id={listId} role="listbox" aria-label="Matching calculators">
          {visible.map(({tool,href},i)=><li key={tool.id} role="presentation"><SiteLink id={optionId(i)} href={href} role="option" aria-selected={i===active} tabIndex={-1} onMouseDown={e=>e.preventDefault()}>{tool.id==='real-estate'?'Real Estate calculators (category)':tool.title}</SiteLink></li>)}
        </ul>
        {loading&&<p>Loading calculator search…</p>}
        {loadError&&<p>Search could not load. Try again or browse the calculator categories.</p>}
        {!loading&&!loadError&&!results.length&&<p>No calculators found. Try “loan”, “tax”, or “interest”.</p>}
        {!expanded&&results.length>visible.length&&<button type="button" className="directory-search-more" onClick={()=>{setExpanded(true);input.current?.focus();}}>Show all {results.length} matching results</button>}
      </div>}
    </div>
    <span role="status" aria-live="polite">{search?(loading?"Loading calculator search…":loadError?"Search unavailable. Browse the calculator categories.":`${results.length} ${results.length===1?'result':'results'} found`):compact?'':`${calculatorCount} ${calculatorCount===1?'calculator':'calculators'} available`}</span>
  </form>;
}
