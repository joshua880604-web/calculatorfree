import {comparisonGuideList} from './comparison-guides';
import {questionGuideList} from './question-guides';
import {practicalGuideList} from './practical-guides';
import {publisherIdentity} from './content-transparency';
import {calculationGuideList} from './calculation-guides';
import {decisionGuideList} from './decision-guides';
import {modelStudyGuides} from './model-study-meta';
import {absoluteURL,directoryPath,siteConfig} from './site';
export const guidesPath='/guides/';
export type EditorialGuide={path:string;title:string;heading:string;description:string;publishedOn:string;updatedOn?:string;calculatorIds:string[];topic:string;breadcrumb:string;cardIntro:string;format?:string};
export const recastGuide:EditorialGuide={
 path:'/guides/mortgage-recast-vs-refinance/',
 title:'Mortgage Recast vs. Refinance: Payments, Costs & Extra Principal',
 heading:'Mortgage Recast vs. Refinance: Payments, Costs, and Extra Principal',
 description:'Compare recasting, refinancing and extra principal with worked mortgage examples, upfront cash, monthly payments, interest, fees and reproducible calculator inputs.',
 publishedOn:'2026-10-27',updatedOn:'2026-10-30',
 calculatorIds:['mortgage-recast','refinance','mortgage-payoff'],
 topic:'Mortgages',breadcrumb:'Mortgage recast vs. refinance',
 cardIntro:'See what a $50,000 principal payment changes, how recasting differs from keeping the old payment, and how to evaluate a separate refinance offer.',
};
export const debtGuide:EditorialGuide={
 path:'/guides/debt-snowball-vs-avalanche/',
 title:'Debt Snowball vs. Avalanche: Cost and Payoff Compared',
 heading:'Debt Snowball vs. Avalanche: A Same-Budget Comparison',
 description:'Compare debt snowball and avalanche using the same balances and monthly budget. See interest costs, payoff milestones, rollover effects and calculator examples.',
 publishedOn:'2026-10-27',updatedOn:'2026-10-30',
 calculatorIds:['debt-payoff','credit-cards-payoff','credit-card','debt-snowball','debt-avalanche'],
 topic:'Loans & debt',breadcrumb:'Debt snowball vs. avalanche',
 format:'Comparison & model check',
 cardIntro:'Compare three debts with the same $400 budget. See the first payoff milestone, final payoff, interest cost and what changes when payments stop rolling forward.',
};
export const cdSavingsGuide:EditorialGuide={
 path:'/guides/cd-vs-savings-account/',
 title:'CD vs. Savings Account: Rates, Access & Examples',
 heading:'CD vs. Savings Account: Rates, Access, and Worked Examples',
 description:'Compare CDs with savings and high-yield savings accounts using equal-deposit examples, changing APYs, early-withdrawal costs and calculator presets.',
 publishedOn:'2026-10-27',updatedOn:'2026-10-30',
 calculatorIds:['cd','savings','emergency-fund'],
 topic:'Savings & investing',breadcrumb:'CD vs. savings account',
 cardIntro:'Compare the same $10,000 over matched periods. See what a rate change or an illustrated early-exit penalty does to the difference in dollars.',
};
export const carPayoffGuide:EditorialGuide={
 path:'/guides/pay-off-car-loan-early/',
 title:'Paying Off a Car Loan Early: Savings, Costs & Examples',
 heading:'Paying Off a Car Loan Early: Savings, Costs, and Examples',
 description:'Compare extra monthly car-loan payments with lump sums using worked examples. Review interest savings, payment timing, contract terms and calculator inputs.',
 publishedOn:'2026-10-27',updatedOn:'2026-10-30',calculatorIds:['repayment','auto-loan'],
 topic:'Loans & debt',breadcrumb:'Paying off a car loan early',
 cardIntro:'See how monthly extras and a $2,000 lump sum affect a $20,000 balance. Compare interest, payoff periods and the cash each plan requires.',
};
export const biweeklyGuide:EditorialGuide={
 path:'/guides/biweekly-vs-monthly-mortgage-payments/',
 title:'Biweekly vs. Monthly Mortgage Payments: A Fair Comparison',
 heading:'Biweekly vs. Monthly Mortgage Payments: A Same-Budget Comparison',
 description:'Compare biweekly mortgage payments with standard monthly and equal-budget monthly plans. See interest, payoff time, partial-payment rules and worked examples.',
 publishedOn:'2026-10-27',updatedOn:'2026-11-01',calculatorIds:['biweekly-mortgage','mortgage-payoff','mortgage'],
 topic:'Mortgages',breadcrumb:'Biweekly vs. monthly mortgage payments',
 format:'Comparison & model check',
 cardIntro:'Separate the extra annual payment from the schedule: compare standard monthly, accelerated biweekly and monthly payments with the same annual budget.',
};
export const pointsGuide:EditorialGuide={
 path:'/guides/are-mortgage-points-worth-it/',
 title:'Are Mortgage Points Worth It? Costs & Break-Even Examples',
 heading:'Are Mortgage Points Worth It? Compare Costs and Break-Even',
 description:'Compare mortgage points using same-loan quotes, monthly payments, cash-flow and balance-aware break-even, holding periods, extra fees and lender credits.',
 publishedOn:'2026-10-27',updatedOn:'2026-10-30',calculatorIds:['discount-points','mortgage','refinance'],
 topic:'Mortgages',breadcrumb:'Are mortgage points worth it?',
 format:'Comparison & model check',
 cardIntro:'Compare a $4,000 points purchase across several holding periods. See why payment recovery and borrowing-cost break-even differ, and how fees can change the result.',
};
export const emergencyGuide:EditorialGuide={
 path:'/guides/how-much-emergency-fund-should-i-have/',
 title:'How Much Emergency Fund Should You Have? Targets & Plans',
 heading:'How Much Emergency Fund Should You Have? Targets and Savings Plans',
 description:'Build an emergency-fund target from essential expenses. Compare reserve months, current savings, monthly deposits and rebuilding with reproducible examples.',
 publishedOn:'2026-10-28',updatedOn:'2026-10-30',calculatorIds:['emergency-fund','budget','savings'],
 topic:'Savings & investing',breadcrumb:'How much emergency fund?',
 cardIntro:'Turn a $3,200 essential-expense budget into three-, six- and nine-month scenarios. Compare the savings gap, deposit schedule and rebuilding time.',
};
export const rentBuyGuide:EditorialGuide={
 path:'/guides/rent-vs-buy-a-house/',
 title:'Rent vs. Buy a House: Costs, Equity & Holding Period',
 heading:'Rent vs. Buy a House: Compare Costs, Equity, and Time',
 description:'Compare renting and buying over matched exit dates with sale costs, mortgage balances and invested savings. Test appreciation, returns and maintenance assumptions.',
 publishedOn:'2026-10-28',updatedOn:'2026-10-30',calculatorIds:['rent-vs-buy','rent','mortgage','house-affordability'],
 topic:'Mortgages',breadcrumb:'Rent vs. buy a house',
 cardIntro:'Compare sale equity with the renter’s invested cash at years 1, 3, 5 and 10. See how one changed assumption can reverse the model result.',
};
export const debtSaveGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 "path": "/guides/should-i-pay-off-debt-or-save/",
 "title": "Should I Pay Off Debt or Save? Cash & Interest Compared",
 "heading": "Should I Pay Off Debt or Save? Compare Interest, Cash Reserves, and Timing",
 "description": "Compare extra debt payments with retaining savings. Work through interest costs, cash reserves, monthly allocations and reproducible repayment examples.",
 "publishedOn": "2026-10-28",
 "calculatorIds": [
  "repayment",
  "emergency-fund",
  "savings",
  "budget"
 ],
 "topic": "Loans & debt",
 "breadcrumb": "Should I pay off debt or save?",
 "cardIntro": "Compare a $6,000 debt and a $200 extra monthly budget. Separate interest savings from cash access and see what a split allocation changes."
};
export const aprGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 "path": "/guides/apr-vs-interest-rate/",
 "title": "APR vs. Interest Rate: Fees, Payments & Loan Cost",
 "heading": "APR vs. Interest Rate: Compare Loan Fees, Payments, and Total Cost",
 "description": "Compare APR and loan interest rates using matched fixed-rate offers. See upfront fees, monthly payments, effective rates and early-payoff costs.",
 "publishedOn": "2026-10-28",
 "calculatorIds": [
  "apr",
  "loan",
  "personal-loan"
 ],
 "topic": "Loans & debt",
 "breadcrumb": "APR vs. interest rate",
 "cardIntro": "Compare two $20,000 loan offers to see why a lower interest rate and smaller payment can still produce a higher APR and total borrowing cost."
};
export const refinanceGuide:EditorialGuide={
 updatedOn:'2026-11-03',
 "path": "/guides/is-refinancing-worth-it/",
 "title": "Is Refinancing Worth It? Fees, Terms & Break-Even",
 "heading": "Is Refinancing Worth It? Compare Fees, Loan Terms, and Your Holding Period",
 "description": "Evaluate mortgage refinancing with matched holding periods, payments, remaining balances, cash or financed fees and explicit break-even examples.",
 "publishedOn": "2026-10-28",
 "calculatorIds": [
  "refinance",
  "mortgage",
  "discount-points"
 ],
 "topic": "Mortgages",
 "breadcrumb": "Is refinancing worth it?",
 "cardIntro": "Compare keeping a 25-year mortgage with replacing it for 25 or 30 years. Include fees and remaining balances before calling a smaller payment a saving."
};
export const iraGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 "path": "/guides/roth-ira-vs-traditional-ira/",
 "title": "Roth IRA vs. Traditional IRA: Equal-Budget Tax Examples",
 "heading": "Roth IRA vs. Traditional IRA: Compare Taxes on the Same Savings Budget",
 "description": "Compare Roth and Traditional IRAs on the same pretax budget with tax-rate examples, 2026 contribution limits, eligibility checks and model limitations.",
 "publishedOn": "2026-10-28",
 "calculatorIds": [
  "ira",
  "roth-ira",
  "retirement"
 ],
 "topic": "Retirement",
 "breadcrumb": "Roth IRA vs. Traditional IRA",
 "cardIntro": "Compare the same $6,000 pretax annual budget at three retirement tax rates. Distinguish equal contributions from equal cash cost and review eligibility."
};
export const marginMarkupGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 path:'/guides/margin-vs-markup/',
 title:'Margin vs. Markup: Formulas, Pricing & Worked Examples',
 heading:'Margin vs. Markup: Calculate Selling Price Without Mixing the Percentages',
 description:'Compare margin and markup with the same cost and selling price. Convert percentages, set target prices and test discounts or cost changes with calculator examples.',
 publishedOn:'2026-10-28',calculatorIds:['margin','markup','break-even'],
 topic:'Business finance',breadcrumb:'Margin vs. markup',
 cardIntro:'See why a 30% markup does not produce a 30% margin. Compare selling prices, discounts and cost increases with the same stated unit-cost assumptions.',
};
export const coastFireGuide:EditorialGuide={
 updatedOn:'2026-10-31',
 path:'/guides/how-to-calculate-coast-fire/',
 title:'How to Calculate Coast FIRE: Formula, Age & Examples',
 heading:'How to Calculate Coast FIRE: Your Number, Age, and Assumptions',
 description:'Calculate your Coast FIRE number with an inflation-adjusted formula. Compare age and return scenarios, monthly saving, and Coast FIRE versus Barista FIRE.',
 publishedOn:'2026-10-28',calculatorIds:['coast-fire','fire','retirement','compound-interest'],
 topic:'Retirement',breadcrumb:'How to calculate Coast FIRE',format:'Planning guide',
 cardIntro:'Work from your retirement budget to today’s required portfolio, compare ages and returns, and see why reaching a Coast milestone is different from retiring today.',
};
export const snowballMethodGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 path:'/guides/how-to-calculate-debt-snowball/',
 title:'How to Calculate Debt Snowball: Steps & Payment Worksheet',
 heading:'How to Calculate a Debt Snowball Plan',
 description:'Build a debt snowball repayment worksheet with minimums, a total budget, monthly interest and payoff milestones. Follow a checked example and open the calculator.',
 publishedOn:'2026-10-29',calculatorIds:['debt-snowball','debt-payoff'],
 topic:'Loans & debt',breadcrumb:'Calculate debt snowball',format:'Step-by-step guide',
 cardIntro:'Work from a debt list to a smallest-balance-first plan, carry freed payments forward and track real payoff milestones.',
};
export const avalancheMethodGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 path:'/guides/how-to-calculate-debt-avalanche/',
 title:'How to Calculate Debt Avalanche: Steps & Payment Worksheet',
 heading:'How to Calculate a Debt Avalanche Plan',
 description:'Build a debt avalanche repayment worksheet with minimums, a total budget, monthly interest and payoff milestones. Follow a checked example and open the calculator.',
 publishedOn:'2026-10-29',calculatorIds:['debt-avalanche','debt-payoff'],
 topic:'Loans & debt',breadcrumb:'Calculate debt avalanche',format:'Step-by-step guide',
 cardIntro:'Rank debts by APR, separate minimums from extra payments and audit the monthly interest and payment allocation.',
};
export const baristaCoastGuide:EditorialGuide={
 updatedOn:'2026-10-30',
 path:'/guides/barista-fire-vs-coast-fire/',
 title:'Barista FIRE vs. Coast FIRE: Income, Withdrawals & Examples',
 heading:'Barista FIRE vs. Coast FIRE: Compare the Cash Flows',
 description:'Compare Barista FIRE and Coast FIRE using a dated part-time income bridge, portfolio withdrawals and a full-retirement target, with reproducible calculator examples.',
 publishedOn:'2026-10-29',calculatorIds:['barista-fire','coast-fire','fire','lean-fire','fat-fire'],
 topic:'Retirement',breadcrumb:'Barista FIRE vs. Coast FIRE',format:'Comparison guide',
 cardIntro:'See why part-time income, its stop date and pre-retirement withdrawals change the assets you need. Compare a checked zero-growth example.',
};
export const editorialGuides=[...comparisonGuideList,...questionGuideList,...practicalGuideList,...calculationGuideList,...decisionGuideList,...modelStudyGuides,baristaCoastGuide,snowballMethodGuide,avalancheMethodGuide,coastFireGuide,recastGuide,debtGuide,cdSavingsGuide,carPayoffGuide,biweeklyGuide,pointsGuide,emergencyGuide,rentBuyGuide,debtSaveGuide,aprGuide,refinanceGuide,iraGuide,marginMarkupGuide];
export function editorialSchema(article:boolean|EditorialGuide=false,config=siteConfig()){
 const entry=article===true?recastGuide:typeof article==='object'?article:undefined;
 const url=absoluteURL(entry?entry.path:guidesPath,config);
 const graph:Record<string,unknown>[]=[entry?{
  '@type':'Article',headline:entry.heading,description:entry.description,
  datePublished:entry.publishedOn,dateModified:entry.updatedOn??entry.publishedOn,
  author:publisherIdentity(config),
  publisher:publisherIdentity(config),inLanguage:'en-US',
  ...(url?{'@id':url+'#article',url,mainEntityOfPage:url}:{}),
 }:{'@type':'CollectionPage',name:'Financial guides',description:'Worked comparisons for financial decisions, with explicit assumptions, sources and calculator examples.',...(url?{'@id':url,url,hasPart:editorialGuides.map(guide=>({'@type':'Article',headline:guide.heading,url:absoluteURL(guide.path,config)}))}:{})}];
 if(url)graph.push({'@type':'BreadcrumbList',itemListElement:[
  {'@type':'ListItem',position:1,name:'Calculators',item:absoluteURL(directoryPath,config)},
  {'@type':'ListItem',position:2,name:'Guides',item:absoluteURL(guidesPath,config)},
  ...(entry?[{'@type':'ListItem',position:3,name:entry.breadcrumb,item:url}]:[])
 ]});
 return {'@context':'https://schema.org','@graph':graph};
}
