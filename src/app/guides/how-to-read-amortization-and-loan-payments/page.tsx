import PracticalGuideArticle from '@/components/PracticalGuideArticle';
import {practicalGuideList} from '@/lib/practical-guides';
import {pageMetadata} from '@/lib/seo';
import {guideContentDate} from '@/lib/editorial-guides';
const guide=practicalGuideList.find(g=>g.path==='/guides/how-to-read-amortization-and-loan-payments/')!;
const page=pageMetadata(guide.path,guide.title,guide.description);
export const metadata=page;
export default function Page(){return <PracticalGuideArticle slug="how-to-read-amortization-and-loan-payments"/>;}
