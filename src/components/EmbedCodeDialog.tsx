'use client';
import {useEffect,useId,useRef} from 'react';
import {createPortal} from 'react-dom';
import {embedTool} from '@/lib/embed-code';
import EmbedPanel from './EmbedPanel';
import SiteLink from './SiteLink';

export default function EmbedCodeDialog({id,onClose}:{id:string;onClose:()=>void}){
 const tool=embedTool(id)!,headingId=useId(),dialog=useRef<HTMLDialogElement>(null),heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  dialog.current?.showModal();heading.current?.focus({preventScroll:true});
  return()=>{previous?.focus({preventScroll:true});};
 },[]);
 return createPortal(<dialog ref={dialog} className="calculator-share-dialog embed-code-dialog" aria-labelledby={headingId}
  onCancel={event=>{event.preventDefault();onClose();}}
  onClick={event=>{if(event.target!==event.currentTarget)return;const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)onClose();}}>
  <header className="share-dialog-header"><div><h2 id={headingId} ref={heading} tabIndex={-1}>Embed {tool.title}</h2><p>Copy the code to add this calculator to your website.</p></div><button type="button" className="share-dialog-close" aria-label="Close embed dialog" onClick={onClose}>×</button></header>
  <div className="share-dialog-panel"><EmbedPanel id={id}/><p><SiteLink href={'/'+tool.slug}>Open the full calculator →</SiteLink></p></div>
 </dialog>,document.body);
}
