import SiteLink from './SiteLink';
import ShareActionLink from './ShareActionLink';
import {embedCode,embedTool} from '@/lib/embed-code';
import {hasShareTools} from '@/lib/share-tools';
import {routeFor} from '@/lib/catalog';
export default function EmbedCitationHelp({id,title}:{id:string;title:string}){
 const tool=embedTool(id),embedded=Boolean(tool),enhanced=hasShareTools(id);
 if(!embedded&&!enhanced)return null;
 return <section id="embed-and-cite" className="embed-citation-help" aria-labelledby="embed-citation-heading"><h2 id="embed-citation-heading">{embedded?"Embed & cite this calculator":"Share & cite this calculator"}</h2>
 <div className="embed-help-actions">{embedded&&<ShareActionLink id={id} tab="Embed">Get embed code</ShareActionLink>}{enhanced&&<ShareActionLink id={id} tab="Cite">Cite this calculator</ShareActionLink>}</div>
 {embedded?<><details><summary>Can I embed this {title} on my blog?</summary><p>Yes. Choose Get embed code above to copy the code, adjust its theme or height, and preview the widget. No calculation or account is required. The hosted embed is free for personal and commercial blog use and contains no ads. Keep the CalculatorFree.io attribution and credit link visible. See the <SiteLink href="/embed-resources#usage">embed setup and usage guidance</SiteLink>.</p></details>
 <details><summary>Default embed code</summary><div id="embed-code"><p>Light theme, {tool!.height} pixels high and responsive width. Copy this default code directly, or use Get embed code above to customize it. If JavaScript is unavailable, this code can still be selected and copied manually.</p><label className="embed-default-label" htmlFor="default-calculator-embed">{title} default embed code</label><textarea id="default-calculator-embed" readOnly rows={6} defaultValue={embedCode(id,'light',tool!.height)} spellCheck={false}/></div></details></>:<details><summary>How do I share a recalculable scenario?</summary><p>Calculate your result, open Share your results and choose Include my inputs in the share link. Recipients can reopen your inputs and recalculate. Anyone with the link can read those inputs; model updates may change results. Leave the checkbox off to share only the calculator page.</p></details>}
 <details><summary>How do I cite this calculator in my article?</summary><div id="cite-calculator"><p>Choose Cite this calculator above for plain text, HTML or BibTeX. The citation uses the tool’s canonical page and your access date, without personal inputs or results. Review the calculator’s assumptions and sources when explaining an estimate.</p><p>For a manual citation, link to <SiteLink href={routeFor(id)}>{title}</SiteLink> by CalculatorFree.io and add the date you accessed it.</p></div></details>
 </section>;
}
