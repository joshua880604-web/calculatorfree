import DecisionGuideArticle from '@/components/DecisionGuideArticle';
import {decisionGuideEntries} from '@/lib/decision-guides';
import {guideContentDate} from '@/lib/editorial-guides';
import {pageMetadata} from '@/lib/seo';
const guide=decisionGuideEntries.mortgage;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...meta,openGraph:{...meta.openGraph,type:'article' as const,publishedTime:guide.publishedOn,modifiedTime:guideContentDate(guide)}};
export default function Page(){return <DecisionGuideArticle topic="mortgage"/>;}
