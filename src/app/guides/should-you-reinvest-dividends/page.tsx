import DecisionGuideArticle from '@/components/DecisionGuideArticle';
import {decisionGuideEntries} from '@/lib/decision-guides';
import {pageMetadata} from '@/lib/seo';
const guide=decisionGuideEntries.drip;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata=meta;
export default function Page(){return <DecisionGuideArticle topic="drip"/>;}
