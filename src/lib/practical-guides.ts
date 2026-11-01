import content from './practical-guide-content.json';
import type {EditorialGuide} from './editorial-guides';
export const practicalGuideList:EditorialGuide[]=content.map(g=>({path:'/guides/'+g.slug+'/',title:g.title,heading:g.title,description:g.answer,publishedOn:'2026-11-01',calculatorIds:g.ids,topic:'Financial methods & model examples',breadcrumb:g.title,cardIntro:g.answer,format:'Practical guide & model reproduction'}));
