import ComparisonGuideArticle from '@/components/ComparisonGuideArticle';
import {comparisonGuides} from '@/lib/comparison-guides';
import {pageMetadata} from '@/lib/seo';
const guide=comparisonGuides['simple-compound'].meta;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...meta,openGraph:{...meta.openGraph,type:'article' as const,publishedTime:guide.publishedOn,modifiedTime:guide.publishedOn}};
export default function Page(){return <ComparisonGuideArticle topic="simple-compound"/>;}
