import ComparisonGuideArticle from '@/components/ComparisonGuideArticle';
import {comparisonGuides} from '@/lib/comparison-guides';
import {pageMetadata} from '@/lib/seo';
const guide=comparisonGuides["capital-gains"].meta;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...meta,openGraph:{...meta.openGraph,type:'article' as const,publishedTime:guide.publishedOn,modifiedTime:guide.updatedOn??guide.publishedOn}};
export default function Page(){return <ComparisonGuideArticle topic="capital-gains"/>;}
