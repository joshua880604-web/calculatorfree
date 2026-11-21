import updates from '@/lib/internal-link-review.json';
export default function GuideLinkUpdate({path}:{path:string}){
 if(!updates.guides.includes(path))return null;
 return <p className="guide-byline">Concept links updated <time dateTime={updates.reviewedOn}>{new Date(updates.reviewedOn+'T00:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</time>.</p>;
}
