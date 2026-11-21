import CalculationGuideArticle from '@/components/CalculationGuideArticle';
import {calculationGuideEntries} from '@/lib/calculation-guides';
import {pageMetadata} from '@/lib/seo';
import {guideContentDate} from '@/lib/editorial-guides';
const guide=calculationGuideEntries.compound;
const page=pageMetadata(guide.path,guide.title,guide.description);
export const metadata=page;
export default function Page(){return <CalculationGuideArticle topic="compound"/>;}
