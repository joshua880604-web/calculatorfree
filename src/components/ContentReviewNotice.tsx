import SiteLink from './SiteLink';
import {publisherName} from '@/lib/content-transparency';
import './content-review.css';
export default function ContentReviewNotice({kind='calculator'}:{kind?:'calculator'|'guide'}){
 return <aside className="content-review" aria-label="Publisher and checking information">
  {kind==='calculator'&&<p className="content-review-byline">Published by <SiteLink href="/about#publisher">{publisherName}</SiteLink></p>}
  {kind==='guide'&&<p className="guide-disclaimer">Educational information only, not personalized financial, investment, tax or legal advice. Estimates depend on assumptions and do not guarantee outcomes. Read our <SiteLink href="/disclaimer">disclaimer</SiteLink>.</p>}
  <details className="content-review-details">
   <summary>How this {kind} is prepared and checked</summary>
   <p>AI tools assist drafting and implementation; calculation results use formula-based code. Examples check stated assumptions, not every personal circumstance. No independent professional review is claimed. Read our <SiteLink href="/methodology#editorial-policy">authorship and checking policy</SiteLink> or <SiteLink href="/about#contact">report an error</SiteLink>.</p>
  </details>
 </aside>;
}
