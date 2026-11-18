import ComparisonGuideArticle from '@/components/ComparisonGuideArticle';
import {comparisonGuides} from '@/lib/comparison-guides';
import {pageMetadata} from '@/lib/seo';
const g=comparisonGuides['cash-advance-fee'].meta;
export const metadata=pageMetadata(g.path,g.title,g.description);
export default function Page(){return <ComparisonGuideArticle topic="cash-advance-fee"/>;}
