import SiteLink from '@/components/SiteLink';
import GuideDirectoryControls from '@/components/GuideDirectoryControls';
import {pageMetadata} from '@/lib/seo';
import {guidesPath,editorialGuides,editorialSchema,type EditorialGuide} from '@/lib/editorial-guides';
import {guideDirectoryGroups,featuredGuidePaths} from '@/lib/guide-directory';
import {directoryPath,serializeSchema} from '@/lib/site';
export const metadata=pageMetadata(guidesPath,'Financial Guides: Worked Comparisons & Calculator Examples','Browse financial guides by topic or search for worked examples covering mortgages, FIRE, investing, debt, taxes and business finance.');
function GuideRow({guide,topic}:{guide:EditorialGuide;topic:string}) {
 return <li className="guide-directory-row" data-guide-search={[guide.heading,guide.cardIntro,topic,...guide.calculatorIds].join(' ')}><h3><SiteLink href={guide.path}>{guide.heading}</SiteLink></h3><p>{guide.cardIntro}</p></li>;
}
export default function Guides(){return <div className="page-wrap glossary-page guides-page guides-directory-page"><main id="main">
 <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <span aria-current="page">Guides</span></nav>
 <h1>Financial guides</h1><p>Find worked examples, clear assumptions and calculators for your next financial decision.</p>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema())}}/>
 <GuideDirectoryControls total={editorialGuides.length}>
  <nav className="guide-topic-nav" aria-label="Guide topics">{guideDirectoryGroups.map(group=><a data-guide-category key={group.id} href={'#guides-'+group.id}>{group.title} <span>{group.guides.length}</span></a>)}</nav>
  <section className="featured-guides" data-featured-guides aria-labelledby="featured-guides-heading"><h2 id="featured-guides-heading">Start with these guides</h2><div className="featured-guide-grid">{featuredGuidePaths.map(path=>{const guide=editorialGuides.find(g=>g.path===path)!;return <article key={path}><h3><SiteLink href={path}>{guide.heading}</SiteLink></h3><p>{guide.cardIntro}</p></article>;})}</div></section>
  <div className="guide-topic-grid">{guideDirectoryGroups.map(group=><section className="guide-topic-group" data-guide-group key={group.id} aria-labelledby={'guides-'+group.id}>
   <h2 id={'guides-'+group.id}>{group.title} <span data-group-count>{group.guides.length}</span></h2><p className="guide-topic-description">{group.description}</p>
   <ul className="guide-directory-list">{group.guides.slice(0,5).map(guide=><GuideRow key={guide.path} guide={guide} topic={group.title}/>)}</ul>
   {group.guides.length>5&&<details data-guide-more><summary>View all {group.guides.length} guides <span>({group.guides.length-5} more)</span></summary><ul className="guide-directory-list">{group.guides.slice(5).map(guide=><GuideRow key={guide.path} guide={guide} topic={group.title}/>)}</ul></details>}
  </section>)}</div>
 </GuideDirectoryControls>
 <p className="guide-directory-footer"><SiteLink href="/methodology">Calculation methodology and review status</SiteLink> · <SiteLink href="/glossary/">Financial glossary</SiteLink></p>
 </main></div>;}
