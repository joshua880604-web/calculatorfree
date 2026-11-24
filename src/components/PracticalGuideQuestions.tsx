import type {ReactNode} from 'react';
import {longTailHref,type LongTailLink} from '@/lib/long-tail-content';
import SiteLink from './SiteLink';

export type PracticalGuideQuestion={question:string;answer:string;anchor?:string;links?:LongTailLink[]};

export default function PracticalGuideQuestions({questions,linkConcepts}:{questions:PracticalGuideQuestion[];linkConcepts:(text:string)=>ReactNode}){
 return <>{questions.map(question=><section key={question.question} id={question.anchor}>
  <h3>{question.question}</h3><p>{linkConcepts(question.answer)}</p>
  {question.links?.length?<ul>{question.links.map(link=><li key={longTailHref(link)}><SiteLink href={longTailHref(link)}>{link.label}</SiteLink></li>)}</ul>:null}
 </section>)}</>;
}
