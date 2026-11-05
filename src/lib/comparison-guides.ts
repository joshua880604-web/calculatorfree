import raw from './comparison-guide-content.json';
import companion from './companion-guide-content.json';
import type {EditorialGuide} from './editorial-guides';
export type GuideLink={href:string;label:string};
export type GuideTable={caption:string;headers:string[];rows:string[][]};
export type GuideSection={id:string;title:string;paragraphs:string[];formula?:string;table?:GuideTable;links?:GuideLink[]};
export type ComparisonGuide={meta:EditorialGuide;intro:string;answer:string;sections:GuideSection[];questions:{question:string;answer:string}[];sources:{title:string;url:string;usedFor:string;scope:string}[];related:GuideLink[];presets:{label:string;path:string;mode:string;values:Record<string,string|number|undefined>}[];limitations:string[]};
export const comparisonGuides={...raw,...companion} as Record<string,ComparisonGuide>;
export const comparisonGuideList=Object.values(comparisonGuides).map(g=>g.meta);
