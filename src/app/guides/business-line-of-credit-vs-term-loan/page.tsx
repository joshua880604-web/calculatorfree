import ComparisonGuideArticle from '@/components/ComparisonGuideArticle';
import {comparisonGuides} from '@/lib/comparison-guides';
import {pageMetadata} from '@/lib/seo';
const guide=comparisonGuides["business-line-of-credit"].meta;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata=meta;
export default function Page(){return <ComparisonGuideArticle topic="business-line-of-credit"/>;}
