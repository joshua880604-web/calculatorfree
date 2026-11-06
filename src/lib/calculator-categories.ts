// Display taxonomy only. Calculator IDs, source categories, routes and math stay stable.
export type CalculatorCategory = {
  id: string; title: string; popular: string[]; tools: string[]; aliases: string[];
  sections?: { title: string; tools: string[] }[];
};
export const calculatorCategories: CalculatorCategory[] = [
  { id: 'mortgage-housing', title: 'Mortgage & Housing', popular: ['mortgage','pmi','house-affordability','mortgage-payoff'], aliases: ['mortgage-and-real-estate'],
    tools: ['mortgage-comparison','1031-exchange','home-maintenance-cost','vacancy-rate','closing-cost','dscr','seller-financing','fix-and-flip','cap-rate','house-hacking','mortgage-vs-invest','cash-on-cash-return','brrrr','noi','mortgage','amortization','mortgage-payoff','house-affordability','rent','debt-to-income-ratio','real-estate','refinance','rental-property','apr','fha-loan','va-mortgage','home-equity-loan','heloc','down-payment','rent-vs-buy','pmi','biweekly-mortgage','discount-points','mortgage-recast'],
    sections: [
      { title: 'Buying a home & loan costs', tools: ['mortgage-comparison','mortgage','house-affordability','down-payment','closing-cost','seller-financing','debt-to-income-ratio','pmi','discount-points','fha-loan','va-mortgage','apr'] },
      { title: 'Payoff & interest savings', tools: ['mortgage-payoff','mortgage-vs-invest','biweekly-mortgage','amortization'] },
      { title: 'Refinancing & home equity', tools: ['refinance','mortgage-recast','home-equity-loan','heloc'] },
      { title: 'Renting & property investment', tools: ['1031-exchange','home-maintenance-cost','vacancy-rate','dscr','fix-and-flip','cap-rate','rent','rent-vs-buy','house-hacking','rental-property','noi','brrrr','cash-on-cash-return'] },
    ] },
  { id: 'loans-debt', title: 'Loans & Debt', popular: ['loan','auto-loan','credit-card','debt-payoff'], aliases: ['auto','other'],
    tools: ['lease-vs-buy-car','credit-utilization','balance-transfer','credit-card-minimum-payment','loan','payment','auto-loan','cash-back-or-low-interest','auto-lease','credit-card','credit-cards-payoff','debt-payoff','debt-snowball','debt-avalanche','debt-consolidation','repayment','student-loan','personal-loan','boat-loan','lease'],
    sections: [
      {title:'Loans & payments',tools:['loan','payment','personal-loan','student-loan','repayment']},
      {title:'Vehicles & leasing',tools:['lease-vs-buy-car','auto-loan','auto-lease','cash-back-or-low-interest','boat-loan','lease']},
      {title:'Credit cards & debt strategies',tools:['credit-utilization','balance-transfer','credit-card-minimum-payment','credit-card','credit-cards-payoff','debt-payoff','debt-snowball','debt-avalanche','debt-consolidation']},
    ] },
  { id: 'saving-investing', title: 'Savings & Investing', popular: ['compound-interest','savings','investment','cd'], aliases: ['investment'],
    tools: ['cd-ladder','npv','dca','rule-of-72','stock-profit','stock-average','drip','covered-call','mirr','interest','investment','finance','compound-interest','interest-rate','savings','simple-interest','cd','bond','mutual-fund','average-return','irr','roi','payback-period','present-value','future-value','inflation','college-cost','cagr','emergency-fund','investment-fee','real-return','currency','budget','tax-equivalent-yield','treasury-bill'],
    sections: [
      { title: 'Savings & personal planning', tools: ['cd-ladder','savings','cd','treasury-bill','emergency-fund','budget','college-cost'] },
      { title: 'Investment returns & fees', tools: ['npv','dca','stock-profit','stock-average','drip','covered-call','investment','compound-interest','roi','cagr','real-return','mutual-fund','investment-fee','average-return','bond','tax-equivalent-yield','irr','mirr','payback-period'] },
      { title: 'Interest & financial basics', tools: ['rule-of-72','interest','simple-interest','interest-rate','finance','present-value','future-value','inflation','currency'] },
    ] },
  { id: 'retirement', title: 'Retirement', popular: ['retirement','401k','roth-ira','rmd'], aliases: [],
    tools: ['retirement-withdrawal','roth-conversion-ladder','hsa','retirement','fire','coast-fire','barista-fire','lean-fire','fat-fire','401k','pension','social-security','annuity','annuity-payout','roth-ira','ira','rmd'],
    sections: [{"title": "Retirement savings goals", "tools": ["retirement", "fire", "coast-fire", "barista-fire", "lean-fire", "fat-fire"]}, {"title": "Retirement accounts", "tools": ["401k", "roth-ira", "ira", "hsa", "roth-conversion-ladder"]}, {"title": "Income & distributions", "tools": ["retirement-withdrawal", "pension", "social-security", "annuity", "annuity-payout", "rmd"]}] },
  { id: 'tax-salary', title: 'Tax & Income', popular: ['income-tax','take-home-paycheck','salary','sales-tax'], aliases: ['tax-and-salary'],
    tools: ['capital-gains-tax','fsa','self-employment-tax','income-tax','salary','marriage-tax','estate-tax','take-home-paycheck','sales-tax','commission'],
    sections: [{"title": "Income tax & filing scenarios", "tools": ["capital-gains-tax", "fsa", "income-tax", "self-employment-tax", "marriage-tax"]}, {"title": "Paychecks & earnings", "tools": ["take-home-paycheck", "salary", "commission"]}, {"title": "Estate & purchase taxes", "tools": ["estate-tax", "sales-tax"]}] },
  { id: 'business-finance', title: 'Business Finance', popular: ['break-even','margin','markup','business-loan','depreciation'], aliases: [],
    tools: ['break-even','margin','markup','business-loan','depreciation','roas','landed-cost','quick-ratio','current-ratio'],
    sections: [{"title": "Business financing", "tools": ["business-loan"]}, {"title": "Pricing & profitability", "tools": ["break-even", "margin", "markup"]}, {"title": "Advertising & landed costs", "tools": ["roas", "landed-cost"]}, {"title": "Business liquidity", "tools": ["quick-ratio", "current-ratio"]}, {"title": "Asset costs", "tools": ["depreciation"]}] },
  { id: 'everyday', title: 'Everyday Calculators', popular: ['percentage','scientific','date','unit-converter'], aliases: ['everyday-tools'],
    tools: ['percentage','scientific','date','unit-converter','tip-bill-split','discount','vat'],
    sections: [{"title": "Numbers & expressions", "tools": ["percentage", "scientific"]}, {"title": "Dates & units", "tools": ["date", "unit-converter"]}, {"title": "Bills & purchase prices", "tools": ["tip-bill-split", "discount", "vat"]}] },
];
const categoryByTool = new Map(calculatorCategories.flatMap(group => group.tools.map(id => [id, group] as const)));
export function calculatorCategory(id: string) { return categoryByTool.get(id); }
export const categoryPaths: Record<string,string> = {'mortgage-housing':'/real-estate-calculator.html','loans-debt':'/loan-calculators.html','saving-investing':'/savings-investment-calculators.html','retirement':'/retirement-calculators.html','tax-salary':'/tax-income-calculators.html','business-finance':'/business-calculators.html','everyday':'/everyday-calculators.html'};
export function categoryHref(id: string) { return categoryPaths[id] ?? '/financial-calculator.html#' + id; }
export const categoryNavigation = calculatorCategories.map(({id,title}) => ({id,title,href:categoryHref(id)}));
export const overviewTools = ['mortgage','loan','compound-interest','pmi','savings','retirement','income-tax','take-home-paycheck'];
export function sidebarTools(id?: string, categoryId?: string) {
  const group = id ? calculatorCategory(id) : calculatorCategories.find(group=>group.id===categoryId);
  if (!group) return { title: 'Popular financial calculators', href: '/financial-calculator.html', ids: overviewTools };
  const section = group.sections?.find(section => section.tools.includes(id!));
  const related = group.id === 'loans-debt' ? ['apr','amortization','business-loan'] : group.id === 'business-finance' ? ['commission','roi','loan'] : [];
  return { title: group.title, href: categoryHref(group.id), ids: [...new Set([...(section?.tools ?? []),...group.popular,...related,...group.tools])].filter(tool => tool !== id && tool !== 'real-estate').slice(0,8) };
}
