'use client';
import {useEffect,useRef,useState} from 'react';

// Page navigation stays outside calculator state, forms and URL-fragment handling.
export default function BackToTop(){
 const button=useRef<HTMLButtonElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{
  if(location.pathname.startsWith('/embed/'))return;
  let frame=0;
  function check(){
   frame=0;
   const control=button.current;if(!control)return;
   const end=document.querySelector<HTMLElement>('[data-calculator-end]');
   const active=document.activeElement;
   let show=window.scrollY>=window.innerHeight*2&&(!end||end.getBoundingClientRect().top<=0);
   if(show&&active instanceof HTMLElement&&active.matches('input,select,textarea,[contenteditable]:not([contenteditable="false"])'))show=false;
   if(show&&document.querySelector('dialog[open],[role="dialog"][aria-modal="true"],.mobile-menu[open],.favorites-menu[open],.theme-menu[open],.nav-menu[open],[aria-busy="true"],button.calculate:disabled'))show=false;
   const viewport=window.visualViewport;
   if(show&&viewport&&window.innerHeight-viewport.height-viewport.offsetTop>80)show=false;
   // Yield to existing actions and fixed notices rather than covering their hit areas.
   if(show){
    const style=getComputedStyle(control),right=parseFloat(style.right)||16,bottom=parseFloat(style.bottom)||16;
    const x=window.innerWidth-right-22,y=window.innerHeight-bottom-22;
    outer:for(const [px,py]of [[x,y],[x-18,y-18],[x+18,y-18],[x-18,y+18],[x+18,y+18]]){
     for(const hit of document.elementsFromPoint(px,py)){
      if(control.contains(hit))continue;
      if(hit.closest('a[href],button,input,select,textarea,summary,[role="button"],[role="link"]')){show=false;break outer;}
      for(let node:Element|null=hit;node&&node!==document.body;node=node.parentElement){
       if(['fixed','sticky'].includes(getComputedStyle(node).position)){show=false;break outer;}
      }
     }
    }
   }
   setVisible(show);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(check);}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('focusin',schedule);
  document.addEventListener('focusout',schedule);
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  const resize=new ResizeObserver(schedule);resize.observe(document.documentElement);
  const mutations=new MutationObserver(schedule);
  mutations.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','aria-busy','disabled','style','class']});
  schedule();
  return()=>{
   if(frame)cancelAnimationFrame(frame);
   resize.disconnect();mutations.disconnect();
   window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
   document.removeEventListener('focusin',schedule);document.removeEventListener('focusout',schedule);
   window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);
  };
 },[]);
 function goToTop(){
  const target=document.querySelector<HTMLElement>('main h1')??document.querySelector<HTMLElement>('main');
  if(target){
   if(!target.hasAttribute('tabindex')){target.setAttribute('tabindex','-1');target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}
   target.focus({preventScroll:true});
  }
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return <button ref={button} className="back-to-top" type="button" hidden={!visible} aria-label="Back to top" title="Back to top" onClick={goToTop}>
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4h14M6 13l6-6 6 6M12 7v13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
 </button>;
}
