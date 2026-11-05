'use client';
import type {ReactNode} from 'react';
import {shareActionHash,shareOpenEvent} from '@/lib/share-tools';

export default function ShareActionLink({id,tab,children}:{id:string;tab:'Embed'|'Cite';children:ReactNode}){
 const href=shareActionHash(tab);
 return <a href={href} aria-haspopup="dialog" onClick={event=>{
  // Native fragments also work on a fresh load and before the calculator hydrates.
  // Repeating the same fragment needs an explicit event, since hashchange won't fire.
  if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey&&location.hash===href){
   event.preventDefault();window.dispatchEvent(new CustomEvent(shareOpenEvent,{detail:{id,tab}}));
  }
 }}>{children}</a>;
}
