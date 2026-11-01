import SiteLink from './SiteLink';
import rawNotes from '@/lib/source-use-notes.json';
import './source-references.css';

type Reference={title:string;url:string}|{label:string;href:string};
type UseNote={role:string;usedFor:string;scope:string;title?:string};
type PageNote={note:string;extras?:{title:string;url:string}[];overrides?:Record<string,Partial<UseNote>>};
const notes=rawNotes as {updatedOn:string;entries:Record<string,UseNote>;pages:Record<string,PageNote>};
export default function SourceReferences({context,sources}:{context:string;sources:Reference[]}) {
 const page=notes.pages[context];
 const normalized=sources.map(source=>'url' in source?source:{url:source.href,title:source.label});
 const entries=[...normalized,...(page?.extras??[])].filter((source,index,all)=>all.findIndex(other=>other.url===source.url)===index);
 if(!page)return <ul>{entries.map(source=><li key={source.url}><SiteLink href={source.url}>{source.title}</SiteLink></li>)}</ul>;
 return <div className="source-reference-block" data-source-context={context}>
  <p className="source-model-note">{page.note}</p>
  <ul className="annotated-sources">{entries.map(source=>{
   const base=notes.entries[source.url],note=base?{...base,...page.overrides?.[source.url]}:undefined;
   return <li key={source.url} data-source-url={source.url} data-source-role={note?.role}>
    <SiteLink href={source.url}>{note?.title??source.title}</SiteLink>
    {note&&<><p className="source-use"><strong>Used for:</strong> {note.usedFor}</p><p className="source-scope"><strong>Scope:</strong> {note.scope}</p></>}
   </li>;
  })}</ul>
  <p className="source-note-date">Source-use notes updated <time dateTime={notes.updatedOn}>November 1, 2026</time>. Calculation checks, publication dates and source/data editions are recorded separately.</p>
 </div>;
}
