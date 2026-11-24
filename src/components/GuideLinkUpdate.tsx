import updates from '@/lib/internal-link-review.json';
import answerUpdates from '@/lib/practical-guide-answer-links.json';
export default function GuideLinkUpdate({path}:{path:string}){
 const conceptDate=updates.guides.includes(path)?updates.reviewedOn:undefined;
 const answerDate=answerUpdates.guides.includes(path)?answerUpdates.reviewedOn:undefined;
 if(!conceptDate&&!answerDate)return null;
 const date=(value:string)=><time dateTime={value}>{new Date(value+'T00:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})}</time>;
 return <p className="guide-byline">{conceptDate&&<>Concept links updated {date(conceptDate)}. </>}{answerDate&&<>Calculator links updated {date(answerDate)}.</>}</p>;
}
