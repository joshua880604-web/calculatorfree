import stockContent from './stock-tool-content.json';
import propertyDealContent from './property-deal-content.json';
import priorityContent from './priority-two-content.json';
import rothLadderContent from './roth-ladder-content.json';
import dripContent from './drip-content.json';
import coveredCallContent from './covered-call-content.json';
import houseHackContent from './house-hacking-content.json';
import mortgageInvestContent from './mortgage-vs-invest-content.json';
import cashReturnContent from './cash-on-cash-content.json';
import brrrrContent from './brrrr-content.json';
import baristaContent from './barista-fire-content.json';
import rmdRefresh from './rmd-refresh-content.json';
import questionFollowup from './question-followup-content.json';
import batchContent from './semrush-five-content.json';
import hsaContent from './hsa-content.json';
import debtStrategyContent from './debt-strategy-content.json';
import { calculatorPresetHref } from './preset-links';
import data from "./long-tail-content.json";
import fireBudgetContent from './fire-budget-content.json';
import strategyContent from './strategy-tools-content.json';
import coastContent from './coast-fire-content.json';
import businessContent from './business-tool-content.json';
import refresh from "./researched-calculator-content.json";
import { routeFor } from "./catalog";

export type LongTailLink = { id: string; mode: string; label: string; values?: Record<string, string> };
export type LongTailQuestion = { anchor: string; queries: string[]; question: string; answer: string; steps?: string[]; links: LongTailLink[]; replacesQuestion?: string };
const original = data as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
const additions = {...stockContent,...propertyDealContent,...priorityContent,...rothLadderContent,...dripContent,...coveredCallContent,...houseHackContent,...mortgageInvestContent,...cashReturnContent,...brrrrContent,...baristaContent,...hsaContent,...debtStrategyContent,...fireBudgetContent,...refresh,...businessContent,...coastContent,...strategyContent} as unknown as Record<string, { updatedOn: string; items: LongTailQuestion[] }>;
for(const [id,entry] of Object.entries(batchContent)) additions[id]={updatedOn:entry.updatedOn,items:[...(additions[id]?.items??[]),...entry.items]};
for(const [id,entry] of Object.entries(rmdRefresh)) additions[id]={updatedOn:entry.updatedOn,items:[...(additions[id]?.items??[]),...entry.items]};
for(const [id,entry] of Object.entries(questionFollowup as unknown as Record<string,{updatedOn:string;items:LongTailQuestion[]}>)) additions[id]={updatedOn:entry.updatedOn,items:[...(additions[id]?.items??[]),...entry.items]};
export const longTailContent = {...original,...Object.fromEntries(Object.entries(additions).map(([id,entry])=>[id,{updatedOn:entry.updatedOn,items:[...(original[id]?.items??[]),...entry.items]}]))};
export function longTailHref(link: LongTailLink) {
  return calculatorPresetHref(routeFor(link.id),link.mode,link.values);
}
