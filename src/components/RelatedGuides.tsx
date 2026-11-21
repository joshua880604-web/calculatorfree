import SiteLink from './SiteLink';
import {editorialGuides} from '@/lib/editorial-guides';
import {mortgageReadingGroups,mortgagePaymentGuide} from '@/lib/mortgage-reading';
import './mortgage-reading.css';
export default function RelatedGuides({id}:{id:string}){
 const guides=editorialGuides.filter(guide=>guide.calculatorIds.includes(id));
 if(!guides.length)return null;
 if(id!=='mortgage')return <section className="related"><h2>Related guides</h2><ul>{guides.map(guide=><li key={guide.path}><SiteLink href={guide.path}>{guide.heading}</SiteLink> — {guide.cardIntro}</li>)}</ul></section>;
 const grouped=new Set([mortgagePaymentGuide,...mortgageReadingGroups.flatMap(group=>group.guides.map(guide=>guide.path))]);
 const remaining=guides.filter(guide=>!grouped.has(guide.path));
 return <section className="related mortgage-reading" aria-labelledby="mortgage-reading-heading">
  <h2 id="mortgage-reading-heading">Mortgage guides by task</h2>
  <p><SiteLink href={mortgagePaymentGuide}>Understand your monthly mortgage payment</SiteLink> — start with principal, interest and entered ownership costs.</p>
  <div className="mortgage-reading-groups">{mortgageReadingGroups.map(group=><section key={group.title}>
   <h3>{group.title}</h3><ul>{group.guides.map(guide=><li key={guide.path}><SiteLink href={guide.path}>{guide.label}</SiteLink></li>)}</ul>
  </section>)}</div>
  {remaining.length>0&&<section><h3>More mortgage reading</h3><ul>{remaining.map(guide=><li key={guide.path}><SiteLink href={guide.path}>{guide.heading}</SiteLink></li>)}</ul></section>}
 </section>;
}
