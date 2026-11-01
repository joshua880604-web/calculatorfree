import SiteLink from './SiteLink';
import {glossaryTerms,glossaryTermPath,expandedGlossarySlugs} from '@/lib/glossary';
export default function GuideGlossaryLinks({path}:{path:string}) {
 const terms=glossaryTerms.filter(term=>expandedGlossarySlugs.includes(term.slug)&&term.guides?.some(guide=>guide.path===path));
 if(!terms.length)return null;
 return <section className="related guide-glossary-links" aria-labelledby="guide-glossary-heading"><h2 id="guide-glossary-heading">Key concepts explained</h2><ul>{terms.map(term=><li key={term.slug}><SiteLink href={glossaryTermPath(term.slug)}>{term.name}</SiteLink> — {term.definition}</li>)}</ul></section>;
}
