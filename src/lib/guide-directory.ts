import {editorialGuides, type EditorialGuide} from './editorial-guides';
import {calculatorCategory} from './calculator-categories';
export const guideTopics = [
 {id:'mortgage-housing',title:'Mortgage & housing',description:'Buying, borrowing, insurance and mortgage payments.'},
 {id:'property-investing',title:'Property investing',description:'Rental income, investment returns and refinancing a deal.'},
 {id:'retirement',title:'Retirement & FIRE',description:'Financial independence, retirement accounts and income.'},
 {id:'saving-investing',title:'Savings & investing',description:'Saving goals, investment returns and financial methods.'},
 {id:'loans-debt',title:'Loans & debt',description:'Loan costs, credit cards and repayment strategies.'},
 {id:'tax-income',title:'Tax & income',description:'Tax estimates, paychecks and earnings.'},
 {id:'business-finance',title:'Business finance',description:'Pricing, advertising, operating costs and liquidity.'},
] as const;
export type GuideTopicId=typeof guideTopics[number]['id'];
const propertyTools=new Set(['brrrr','noi','cap-rate','rental-property','cash-on-cash-return','house-hacking','fix-and-flip']);
// One browsing home per guide; cross-topic calculator links stay unchanged.
export function guideTopic(guide:EditorialGuide):GuideTopicId {
 const primary=guide.calculatorIds[0];
 if(propertyTools.has(primary))return 'property-investing';
 if(primary==='apr')return 'loans-debt';
 if(['discount','commission','depreciation'].includes(primary))return 'business-finance';
 if(['sales-tax','vat','self-employment-tax'].includes(primary))return 'tax-income';
 const category=calculatorCategory(primary)?.id;
 if(category==='tax-salary')return 'tax-income';
 if(category==='mortgage-housing'||category==='retirement'||category==='loans-debt'||category==='business-finance')return category;
 return 'saving-investing';
}
export const guideDirectoryGroups=guideTopics.map(topic=>({...topic,guides:editorialGuides.filter(guide=>guideTopic(guide)===topic.id)}));
export const featuredGuidePaths=['/guides/how-to-calculate-coast-fire/','/guides/how-to-calculate-monthly-mortgage-payment/','/guides/brrrr-refinance-cash-flow-analysis/','/guides/debt-snowball-vs-avalanche/'];
