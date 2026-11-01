import PracticalGuideArticle from '@/components/PracticalGuideArticle';
import {practicalGuideList} from '@/lib/practical-guides';
import {pageMetadata} from '@/lib/seo';
const guide=practicalGuideList.find(g=>g.path==='/guides/down-payment-and-closing-cost-cash/')!;
const page=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...page,openGraph:{...page.openGraph,type:'article' as const,publishedTime:guide.publishedOn}};
export default function Page(){return <PracticalGuideArticle slug="down-payment-and-closing-cost-cash"/>;}
