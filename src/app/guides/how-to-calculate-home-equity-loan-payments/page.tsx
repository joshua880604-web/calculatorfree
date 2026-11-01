import CalculationGuideArticle from '@/components/CalculationGuideArticle';
import {calculationGuideEntries} from '@/lib/calculation-guides';
import {pageMetadata} from '@/lib/seo';
const guide=calculationGuideEntries.equity;
const page=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...page,openGraph:{...page.openGraph,type:'article' as const,publishedTime:guide.publishedOn}};
export default function Page(){return <CalculationGuideArticle topic="equity"/>;}
