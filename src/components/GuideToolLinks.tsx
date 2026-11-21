import repairs from '@/lib/guide-tool-repairs.json';
import { calculators, routeFor } from '@/lib/catalog';
import SiteLink from './SiteLink';

// These are reviewed next calculation tasks, not automatically generated category links.
export default function GuideToolLinks({ path }: { path: string }) {
  const repair = (repairs as Record<string, { links: { id: string; description: string }[]; reviewedOn: string }>)[path];
  if (!repair?.links.length) return null;
  return <section className="related guide-tool-links" aria-labelledby="continue-calculating">
    <h2 id="continue-calculating">Continue with the relevant worksheet</h2>
    <ul>{repair.links.map(link => <li key={link.id}>
      <SiteLink href={routeFor(link.id)}>{calculators.find(c => c.id === link.id)!.title}</SiteLink>
      <p>{link.description}</p>
    </li>)}</ul>
    <p className="guide-byline">Related calculator links updated <time dateTime={repair.reviewedOn}>{new Date(repair.reviewedOn+'T00:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</time>.</p>
  </section>;
}
