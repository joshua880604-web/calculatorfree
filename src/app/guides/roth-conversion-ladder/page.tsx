import DecisionGuideArticle from '@/components/DecisionGuideArticle';
import {decisionGuideEntries} from '@/lib/decision-guides';
import {pageMetadata} from '@/lib/seo';
const guide=decisionGuideEntries.roth;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...meta,openGraph:{...meta.openGraph,type:'article' as const,publishedTime:guide.publishedOn,modifiedTime:guide.updatedOn??guide.publishedOn}};
export default function Page(){return <DecisionGuideArticle topic="roth"/>;}
