import SiteLink from './SiteLink';
import {publisherName} from '@/lib/content-transparency';
import './content-review.css';
export default function ContentReviewNotice({kind='calculator'}:{kind?:'calculator'|'guide'}){
 return <aside className="content-review" aria-label="Publisher and checking information">
  {kind==='calculator'&&<p className="content-review-byline">Published by <SiteLink href="/about#publisher">{publisherName}</SiteLink></p>}
  {kind==='guide'&&<p className="guide-disclaimer">Educational information only, not personalized financial, investment, tax or legal advice. Estimates depend on assumptions and do not guarantee outcomes. Read our <SiteLink href="/disclaimer">disclaimer</SiteLink>.</p>}
  <details className="content-review-details">
   <summary>How this {kind} is prepared and checked</summary>
   <p>Published by <SiteLink href="/about#publisher">{publisherName}</SiteLink>. AI tools assist implementation and drafting. Calculator outputs come from formula-based code running in your browser; there is no runtime AI calculation service.</p>
   <p>Sources, examples and model limitations are documented on this page. The checking methods are described in our <SiteLink href="/methodology#validation">calculation methodology</SiteLink>. Numerical checks test the stated scenarios; they do not establish complete coverage of tax rules, contracts or personal circumstances.</p>
   <p>No named independent professional review is claimed for this page. See our <SiteLink href="/methodology#editorial-policy">authorship and review policy</SiteLink> for how publishing, arithmetic checks and professional review are distinguished.</p>
  </details>
 </aside>;
}
