import businessGuides from './business-two-guide-content.json';
import raw from './comparison-guide-content.json';
import companion from './companion-guide-content.json';
import type {EditorialGuide} from './editorial-guides';
export type GuideLink={href:string;label:string};
export type GuideTable={caption:string;headers:string[];rows:string[][]};
export type GuideSection={id:string;title:string;paragraphs:string[];formula?:string;table?:GuideTable;links?:GuideLink[]};
export type ComparisonGuide={meta:EditorialGuide;intro:string;answer:string;sections:GuideSection[];questions:{question:string;answer:string}[];sources:{title:string;url:string;usedFor:string;scope:string}[];related:GuideLink[];presets:{label:string;path:string;mode:string;values:Record<string,string|number|undefined>}[];limitations:string[]};
export const comparisonGuides={...raw,...companion,...businessGuides} as Record<string,ComparisonGuide>;
const newComparisonTools:Record<string,string>={'cd-ladder':'cd-ladder','irr-npv':'npv','lease-buy':'lease-vs-buy-car','mortgage-terms':'mortgage-comparison'};
for(const [topic,id] of Object.entries(newComparisonTools)){const g=comparisonGuides[topic];g.meta={...g.meta,calculatorIds:[...g.meta.calculatorIds,id],updatedOn:'2026-11-06'};g.related=[{href:'/'+id+'-calculator',label:({npv:'NPV Calculator — periodic and actual-date cash flows','cd-ladder':'CD Ladder Calculator — maturity and renewal scenarios','lease-vs-buy-car':'Lease vs Buy Car Calculator — same-term net costs','mortgage-comparison':'Mortgage Comparison Calculator — points, fees and balances'} as Record<string,string>)[id]},...g.related];}
export const comparisonGuideList=Object.values(comparisonGuides).map(g=>g.meta);
