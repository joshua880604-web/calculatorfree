import type {ReactNode} from 'react';
import type {EditorialGuide} from '@/lib/editorial-guides';
import {editorialSchema} from '@/lib/editorial-guides';
import {directoryPath,serializeSchema} from '@/lib/site';
import ContentReviewNotice from './ContentReviewNotice';
import SourceReferences from './SourceReferences';
import SiteLink from './SiteLink';
export default function QuestionGuideArticle({guide,sections,sources,children}:{guide:EditorialGuide;sections:{id:string;label:string}[];sources:{title:string;url:string}[];children:ReactNode}){
 return <div className="page-wrap glossary-page guides-page"><main id="main"><article className="editorial-article">
  <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <SiteLink href="/guides/">Guides</SiteLink> / <span aria-current="page">{guide.breadcrumb}</span></nav>
  <p className="glossary-category">{guide.topic} · {guide.format}</p><h1>{guide.heading}</h1>
  <p className="guide-byline">By <SiteLink href="/about#publisher">CalculatorFree.io</SiteLink> · Published <time dateTime={guide.publishedOn}>November 3, 2026</time>. Source context and example arithmetic checked on this date.</p>
  <ContentReviewNotice kind="guide"/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema(guide))}}/>
  <nav className="guide-nav" aria-label="Guide sections">{sections.map(s=><a key={s.id} href={'#'+s.id}>{s.label}</a>)}<a href="#sources">Sources & limits</a></nav>
  {children}
  <section aria-labelledby="sources"><h2 id="sources">Sources, checks and limitations</h2><SourceReferences context={'guide:'+guide.path} sources={sources}/><p>Sources explain the rules within their stated scope; they do not endorse this website. Worked examples are hypothetical. No independent professional review is claimed. Read our <SiteLink href="/methodology#editorial-policy">authorship and checking policy</SiteLink> or <SiteLink href="/about#contact">report a correction</SiteLink>.</p></section>
  <p><SiteLink href="/guides/">Browse all financial guides</SiteLink></p>
 </article></main></div>;
}
