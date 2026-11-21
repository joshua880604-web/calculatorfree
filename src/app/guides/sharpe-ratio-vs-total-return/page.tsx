import ComparisonGuideArticle from '@/components/ComparisonGuideArticle';
import {comparisonGuides} from '@/lib/comparison-guides';
import {pageMetadata} from '@/lib/seo';
const guide=comparisonGuides["sharpe-ratio"].meta;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata=meta;
export default function Page(){return <ComparisonGuideArticle topic="sharpe-ratio"/>;}
