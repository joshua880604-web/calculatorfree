import mcaBackdoorGuides from './mca-backdoor-guide-content.json';
import roaAssumptionGuides from './roa-assumption-guide-content.json';
import rsuEsppGuides from './rsu-espp-guide-content.json';
import ladderIrmaaGuides from './ladder-irmaa-guide-content.json';
import expansionFourGuides from './expansion-four-guide-content.json';
import cashCobraGuides from './cash-cobra-guide-content.json';
import sgrGuides from './sgr-guide-content.json';
import ratioPropertyThreeGuides from './ratio-property-three-guide-content.json';
import specialistFourGuides from './specialist-four-guide-content.json';
import financeThreeGuides from './finance-three-guide-content.json';
import marketsSixGuides from './markets-six-guide-content.json';
import financeSixGuides from './finance-six-guide-content.json';
import financeNextFiveGuides from './finance-next-five-guide-content.json';
import financeFiveGuides from './finance-five-guide-content.json';
import businessGuides from './business-two-guide-content.json';
import raw from './comparison-guide-content.json';
import companion from './companion-guide-content.json';
import taskLinkReview from './five-existing-task-links.json';
import type {LongTailLink} from './long-tail-content';
import type {EditorialGuide} from './editorial-guides';
export type GuideLink={href:string;label:string};
export type GuideTable={caption:string;headers:string[];rows:string[][]};
export type GuideSection={id:string;title:string;paragraphs:string[];formula?:string;table?:GuideTable;links?:GuideLink[]};
export type ComparisonGuide={meta:EditorialGuide;intro:string;answer:string;exampleNote?:string;featuredBeforeIntro?:boolean;sections:GuideSection[];questions:{question:string;answer:string;anchor?:string;links?:LongTailLink[]}[];sources:{title:string;url:string;usedFor:string;scope:string}[];related:GuideLink[];presets:{label:string;path:string;mode:string;values:Record<string,string|number|undefined>;featured?:boolean}[];limitations:string[]};
export const comparisonGuides={...mcaBackdoorGuides,...roaAssumptionGuides,...rsuEsppGuides,...ladderIrmaaGuides,...expansionFourGuides,...raw,...companion,...businessGuides,...financeFiveGuides,...financeNextFiveGuides,...financeSixGuides,...marketsSixGuides,...financeThreeGuides,...specialistFourGuides,...ratioPropertyThreeGuides,...sgrGuides,...cashCobraGuides} as Record<string,ComparisonGuide>;
const newComparisonTools:Record<string,string>={'cd-ladder':'cd-ladder','irr-npv':'npv','lease-buy':'lease-vs-buy-car','mortgage-terms':'mortgage-comparison'};
for(const [topic,id] of Object.entries(newComparisonTools)){const g=comparisonGuides[topic];g.meta={...g.meta,calculatorIds:[...g.meta.calculatorIds,id],updatedOn:[g.meta.updatedOn??'','2026-11-06'].sort().at(-1)!};g.related=[{href:'/'+id+'-calculator',label:({npv:'NPV Calculator — periodic and actual-date cash flows','cd-ladder':'CD Ladder Calculator — maturity and renewal scenarios','lease-vs-buy-car':'Lease vs Buy Car Calculator — same-term net costs','mortgage-comparison':'Mortgage Comparison Calculator — points, fees and balances'} as Record<string,string>)[id]},...g.related];}
// Keep the reviewed answers and numerical dates; link each selected answer to
// its actual calculation task and complete, reproducible inputs.
for (const patch of taskLinkReview.questionPatches) {
  const guide = comparisonGuides[patch.topic];
  const question = guide?.questions.find(question => question.question === patch.question);
  if (!question) throw new Error('Missing reviewed guide question: ' + patch.topic + ' / ' + patch.question);
  question.anchor = patch.anchor;
  question.links = patch.links.map(link => ({...link,
    values:Object.fromEntries(Object.entries(link.values).map(([key, value]) => [key, String(value)])),
  }));
  guide.meta.linksUpdatedOn = taskLinkReview.reviewedOn;
}
export const comparisonGuideList=Object.values(comparisonGuides).map(g=>g.meta);
