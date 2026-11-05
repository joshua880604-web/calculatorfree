'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import SiteLink from './SiteLink';
const EmbedCodeDialog=dynamic(()=>import('./EmbedCodeDialog'),{ssr:false,loading:()=> <p role="status">Opening embed options…</p>});

export default function EmbedResourceActions({id,title,path}:{id:string;title:string;path:string}){
 const [open,setOpen]=useState(false);
 return <>
  <div className="embed-resource-actions">
   <SiteLink className="embed-primary-action" href={path+'#embed-code'} aria-haspopup="dialog" aria-label={'Get embed code for '+title} onClick={event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();setOpen(true);
   }}>Get embed code</SiteLink>
   <SiteLink href={path} aria-label={'Open '+title}>Open calculator →</SiteLink>
  </div>
  {open&&<EmbedCodeDialog id={id} onClose={()=>setOpen(false)}/>}
 </>;
}
