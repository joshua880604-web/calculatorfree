import ComparisonGuideArticle from '@/components/ComparisonGuideArticle';
import {comparisonGuides} from '@/lib/comparison-guides';
import {pageMetadata} from '@/lib/seo';
import {guideContentDate} from '@/lib/editorial-guides';
const guide=comparisonGuides['apr-apy'].meta;
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata=meta;
export default function Page(){return <ComparisonGuideArticle topic="apr-apy"/>;}
