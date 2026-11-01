import demandIntents from "./demand-intents.json";
import pageIntents from "./page-intents.json";
import catalog from "./catalog-data.json";
export type SearchTask={keyword:string;mode:string;description:string;aliases?:string[];values?:Record<string,string>};
export const searchTasks: Record<string, SearchTask[]> = {
 'mortgage-payoff':[{keyword:'Mortgage calculator with extra payments',mode:'remaining-extra',description:'Use your current balance and regular payment to compare extra monthly, annual or one-time payments. Review interest saved and time to payoff.'}],
 mortgage:[{keyword:'Mortgage calculator with taxes and insurance',mode:'monthly',description:'Estimate principal and interest alongside property tax, homeowners insurance and other entered ownership costs. These costs can change independently of the loan payment.'}],
 amortization:[{keyword:'Amortization calculator with extra payments',mode:'schedule',description:'Build a period-by-period schedule showing interest, principal and the remaining balance after extra payments.'}],
 retirement:[{keyword:'Retirement savings calculator',mode:'saving',description:'Find how much you need to save each month to reach a retirement target. The assumed return is not a guarantee.'},{keyword:'Retirement withdrawal calculator',mode:'withdrawal',description:'Estimate monthly withdrawals over a selected retirement horizon. Use Savings Longevity to explore how long an entered withdrawal can last.'}],
 savings:[{keyword:'Savings goal calculator',mode:'goal-contribution',description:'Enter a target amount, current savings and deadline to calculate the monthly deposit needed. Switch to Time Needed to solve for the first whole month reaching your target.'},{keyword:'Savings calculator with monthly deposits',mode:'accumulation',description:'Project a balance from recurring deposits, the chosen compounding frequency and contribution timing.'}],
 '401k':[{keyword:'401k growth calculator',mode:'projection',description:'Project annual account growth with salary increases, employee contributions and employer matching under the documented annual limits.'},{keyword:'401k contribution calculator',mode:'projection',description:'Review each year’s employee contribution separately from employer additions and account growth. Starting balance is shown separately from new employee contributions.'},{keyword:'401k employer match calculator',mode:'match',description:'Explore matching tiers using the Maximize Employer Match form. Eligibility and plan-specific rules must be checked separately.'}],
 repayment:[{keyword:'Loan payoff calculator with extra payments',mode:'extra-payments',description:'Compare a fixed monthly loan payment with additional principal payments. Review months saved, interest saved and the full repayment schedule.'}],
 'compound-interest':[{keyword:'Compound interest calculator with monthly contributions',mode:'growth',description:'Project the ending balance, total deposits and net earnings. This compound interest calculator with monthly deposits also supports annual contributions and beginning- or end-of-period timing.'}],
};
export const keywordTitles: Record<string,string>={
 'mortgage-payoff':'Mortgage Calculator with Extra Payments - Payoff & Savings',
 mortgage:'Mortgage Calculator with Taxes and Insurance',
 amortization:'Amortization Calculator with Extra Payments',
 retirement:'Retirement Calculator - Savings Goals & Monthly Withdrawals',
 savings:'Savings Calculator - Monthly Deposits & Savings Goals',
 '401k':'401k Calculator - Growth, Contributions & Employer Match',
 repayment:'Loan Payoff Calculator with Extra Payments',
 'compound-interest':'Compound Interest Calculator with Monthly Contributions',
};

// Existing user-researched targets keep ownership; other pages use editorial candidates.
for (const intent of pageIntents) {
  if (!searchTasks[intent.id]) searchTasks[intent.id] = [{keyword:intent.keyword,mode:intent.mode,description:intent.description}];
  if (!keywordTitles[intent.id]) keywordTitles[intent.id] = catalog.find(c=>c.id===intent.id)!.title + " - " + intent.titleSuffix;
}

// Merge researched synonyms into the same useful calculation, rather than duplicate pages/cards.
for (const entry of demandIntents.intents) {
  const values:Record<string,string>|undefined = entry.values ? Object.fromEntries(Object.entries(entry.values).filter(([,value])=>typeof value === "string")) : undefined;
  const description = "description" in entry ? entry.description : undefined;
  const tasks = searchTasks[entry.id];
  const existing = tasks.find(t=>t.keyword.toLowerCase()===entry.keyword.toLowerCase() && !values)
    ?? tasks.find(t=>t.mode===entry.mode && JSON.stringify(t.values)===JSON.stringify(values));
  if (existing) {
    if (existing.keyword.toLowerCase()!==entry.keyword.toLowerCase()) {
      existing.aliases = [...new Set([...(existing.aliases??[]),entry.keyword])];
    }
    if (description) existing.description = description;
  } else tasks.push({keyword:entry.keyword,mode:entry.mode,description:description??tasks[0].description,...(values?{values}:{})});
}
Object.assign(keywordTitles, demandIntents.titles);

// Keep the largest supported, broad query at the first use-case entry for each researched page.
const primaryQueries:Record<string,string>={
 'auto-loan':'Car payment calculator',salary:'Salary calculator','sales-tax':'Sales tax calculator',rent:'Rent affordability calculator',
 'mortgage-payoff':'Mortgage payoff calculator','home-equity-loan':'Home equity loan calculator',amortization:'Mortgage amortization calculator',
 'house-affordability':'Home affordability calculator',refinance:'Refinance calculator',heloc:'Heloc calculator',savings:'Savings interest calculator',
 investment:'Investment growth calculator',roi:'Return on investment calculator',bond:'Bond price calculator',retirement:'Retirement income calculator',
 'debt-payoff':'Debt payoff calculator','student-loan':'Student loan payoff calculator',margin:'Profit margin calculator','income-tax':'Federal income tax calculator',
};
for(const [id,keyword] of Object.entries(primaryQueries)){
 const tasks=searchTasks[id], task=tasks.find(t=>t.keyword.toLowerCase()===keyword.toLowerCase()||t.aliases?.some(a=>a.toLowerCase()===keyword.toLowerCase()));
 if(!task)continue;
 if(task.keyword.toLowerCase()!==keyword.toLowerCase()){
  task.aliases=[task.keyword,...(task.aliases??[]).filter(a=>a.toLowerCase()!==keyword.toLowerCase())];task.keyword=keyword;
 }
 searchTasks[id]=[task,...tasks.filter(t=>t!==task)];
}

// User-researched evergreen tools own distinct intents; legacy functions remain available.
import evergreenTargets from "./evergreen-targets.json";
for(const [id,entry] of Object.entries(evergreenTargets)){searchTasks[id]=entry.tasks;keywordTitles[id]=entry.title;}

// Dedicated mortgage pages own these intents; retain the older calculation modes.
import mortgageToolTargets from "./mortgage-tools-targets.json";
for (const [id, entry] of Object.entries(mortgageToolTargets)) { searchTasks[id] = entry.tasks; keywordTitles[id] = entry.title; }

// User-provided competitor gap, 2026-10-26: one CD page owns term variants.
keywordTitles.cd = "CD Calculator - Interest, APY & Maturity";
searchTasks.cd[0].description = "Estimate CD maturity value and interest for terms such as 6, 12 or 14 months. Match the entered nominal rate to its compounding frequency; monthly schedule interest is accrued, not a cash payout.";
searchTasks.cd[0].aliases = [...new Set([...(searchTasks.cd[0].aliases ?? []), "12 month CD calculator", "14 month CD calculator", "Monthly CD interest calculator"])];

import investmentDecisionTargets from "./investment-decisions-targets.json";
for (const [id, entry] of Object.entries(investmentDecisionTargets)) {searchTasks[id]=entry.tasks;keywordTitles[id]=entry.title;}

// US research: serve high-yield and goal intents from the existing Savings page.
for (const task of searchTasks.savings) {
  task.aliases = task.aliases?.filter(alias => !["high yield savings calculator", "high yield savings account calculator", "hysa calculator"].includes(alias.toLowerCase()));
  if (task.mode === "accumulation") task.description = "Project savings with deposits and an entered APY or nominal rate. Match the rate type and contribution timing; current bank offers are not fetched.";
}
searchTasks.savings.push({keyword:"High yield savings calculator",mode:"accumulation",description:"Project savings using an entered APY, monthly deposits and term. APY includes compounding; account yields can change and no live rates are fetched.",values:{rate_type:"APY"},aliases:["High yield savings account calculator","HYSA calculator"]});

// User-provided US broad-match and question research, reviewed 2026-10-28.
keywordTitles['house-affordability']='How Much House Can I Afford? Free House Affordability Calculator';
keywordTitles['fha-loan']='FHA Loan Calculator - Payment, Down Payment & MIP';
keywordTitles['va-mortgage']='VA Loan Calculator - Monthly Payment & Funding Fee';
searchTasks['house-affordability'][0].description='Use this free house affordability calculator to estimate how much house you can afford from income or a monthly budget, including entered debts, taxes and insurance.';
searchTasks['fha-loan'][0].description='Estimate FHA monthly payments with down payment, financed upfront MIP, recurring mortgage insurance and entered ownership costs. Eligibility is not determined.';
searchTasks['va-mortgage'][0].description='Estimate a VA purchase loan payment with the funding fee financed or paid upfront, down payment and entered ownership costs. Confirm eligibility separately.';
searchTasks['va-mortgage'][0].aliases=[...new Set([...(searchTasks['va-mortgage'][0].aliases??[]),'VA loan calculator','VA home loan calculator','VA loan payment calculator'])];
searchTasks['fha-loan'][0].aliases=[...new Set([...(searchTasks['fha-loan'][0].aliases??[]),'FHA loan payment calculator','FHA mortgage calculator'])];

// User-provided retirement US keyword research, reviewed 2026-10-28.
keywordTitles['401k']='401k Calculator - Contributions, Match & Growth';
keywordTitles['roth-ira']='Roth IRA Calculator - Growth & Contributions';
keywordTitles.rmd='RMD Calculator - Required Minimum Distributions';
const withdrawalTask=searchTasks.retirement.find(task=>task.mode==='withdrawal')!;
withdrawalTask.aliases=[...new Set([withdrawalTask.keyword,...(withdrawalTask.aliases??[])])].filter(keyword=>keyword.toLowerCase()!=='retirement withdrawal calculator');
withdrawalTask.keyword='Retirement withdrawal calculator';
withdrawalTask.description='Estimate before-tax monthly withdrawals with entered return, inflation and lifespan assumptions. Constant-return results are not guaranteed income or safe withdrawal rates.';
searchTasks['roth-ira'][0].description='Project Roth IRA growth with year-end contributions and a simplified taxable comparison. Contribution eligibility and qualified tax-free distributions require separate checks.';
searchTasks['roth-ira'][0].aliases=[...new Set([...(searchTasks['roth-ira'][0].aliases??[]),'Roth IRA calculator','Roth IRA growth calculator'])];
searchTasks.rmd[0].aliases=[...new Set([...(searchTasks.rmd[0].aliases??[]),searchTasks.rmd[0].keyword,'Required minimum distribution calculator'])];
searchTasks.rmd[0].keyword='RMD calculator';

// User-provided US student/personal loan keyword research, reviewed 2026-10-28.
keywordTitles['personal-loan']='Personal Loan Calculator - Payments, Fees & APR';
const studentMonthly=searchTasks['student-loan'].find(task=>task.mode==='normal')!;
studentMonthly.aliases=[...new Set([studentMonthly.keyword,...(studentMonthly.aliases??[]),'Student loan calculator','Student loan repayment calculator'])];
studentMonthly.keyword='Student loan payment calculator';
studentMonthly.description='Estimate fixed monthly student loan payments and interest from an entered balance, rate and term. Daily accrual, income-driven plans and forgiveness are not calculated.';
searchTasks['student-loan']=[studentMonthly,...searchTasks['student-loan'].filter(task=>task!==studentMonthly)];
searchTasks['personal-loan'][0].aliases=[...new Set([...(searchTasks['personal-loan'][0].aliases??[]),'Personal loan calculator','Personal loan payment calculator','Personal loan APR calculator'])];
searchTasks['personal-loan'][0].description='Estimate monthly installments, fees, net proceeds and an illustrative cash-flow APR. Enter actual offer terms; approval and current lender rates are not determined.';

// User-provided US equity borrowing research, reviewed 2026-10-28.
keywordTitles['home-equity-loan']='Home Equity Loan Calculator - Payments, Fees & APR';
searchTasks.heloc[0].keyword='HELOC payment calculator';
searchTasks.heloc[0].description='Compare a modeled interest-only draw period with later amortizing repayment at one entered rate. Annual fees apply during draw only; actual rate resets and additional draws are not simulated.';
searchTasks.heloc[0].aliases=[...new Set([...(searchTasks.heloc[0].aliases??[]),'HELOC calculator','HELOC repayment calculator'])];
searchTasks.heloc.push({keyword:'HELOC borrowing limit calculator',mode:'maximum-credit',description:'Estimate potential additional credit from home value, existing mortgage and an entered combined-LTV ceiling. This does not determine lender approval.',aliases:['How much HELOC can I get','HELOC credit limit calculator']});
searchTasks['home-equity-loan'][0].aliases=[...new Set([...(searchTasks['home-equity-loan'][0].aliases??[]),'Home equity loan payment calculator'])];
searchTasks['home-equity-loan'][0].description='Estimate fixed home equity loan payments, closing-cost treatment and an illustrative cash-flow APR. Existing mortgage and ownership costs are separate.';

// User-provided US boat financing and auto-offer research, reviewed 2026-10-28.
searchTasks['boat-loan'][0].aliases=[...new Set([...(searchTasks['boat-loan'][0].aliases??[]),searchTasks['boat-loan'][0].keyword,'Boat payment calculator','Boat loan payment calculator','Used boat loan calculator'])];
searchTasks['boat-loan'][0].keyword='Boat loan calculator';
searchTasks['boat-loan'][0].description='Estimate boat loan payments with down payment, trade credit and entered tax and fees, or solve a boat price from a monthly financing budget. Rates and lender eligibility are not determined.';
searchTasks['auto-lease'][0].aliases=[...new Set([...(searchTasks['auto-lease'][0].aliases??[]),searchTasks['auto-lease'][0].keyword,'Car lease payment calculator','Auto lease payment calculator'])];
searchTasks['auto-lease'][0].keyword='Auto lease calculator';
searchTasks['auto-lease'][0].description='Estimate car lease payments from negotiated price, residual, capitalized fees and a money factor, or solve price from payment. Monthly tax is an entered assumption; buyout costs are separate.';
searchTasks['cash-back-or-low-interest'][0].aliases=[...new Set([...(searchTasks['cash-back-or-low-interest'][0].aliases??[]),'Cash rebate vs low interest calculator','Cash back or low interest calculator'])];
searchTasks['cash-back-or-low-interest'][0].description='Compare an automotive cash rebate with standard financing against a low-rate offer over the same term. Include entered tax, fees and upfront cash; current deals and eligibility are not fetched.';

// User-researched business tools share one page per distinct calculation task.
import businessTargets from './business-tool-targets.json';
for (const [id, entry] of Object.entries(businessTargets)) {searchTasks[id]=entry.tasks;keywordTitles[id]=entry.title;}

// US Coast FIRE research: one task-specific page, independent from full retirement drawdown.
keywordTitles['coast-fire']='Coast FIRE Calculator - Your Number & Time to Coast';
searchTasks['coast-fire']=[{keyword:'Coast FIRE calculator',mode:'coast',description:'Estimate your Coast FIRE number and time to the threshold in today’s dollars, with monthly investments that stop when it is reached. Constant-return scenario, not guaranteed retirement income.',aliases:['CoastFIRE calculator','Coast fire number calculator','Coast fire calculator with inflation']}];

// Original, user-researched NOI, FIRE and MIRR tasks.
searchTasks["noi"][0].aliases=["Net operating income calculator", "Real estate NOI calculator", "Rental property NOI calculator"];
searchTasks["fire"][0].aliases=["FIRE number calculator", "Financial independence calculator", "Early retirement FIRE calculator"];
searchTasks["mirr"][0].aliases=["Modified internal rate of return calculator", "MIRR formula calculator"];

// Semrush US paired broad and question exports, batch 1, reviewed 2026-10-28.
keywordTitles["rental-property"]="Rental Property Calculator - Cash Flow & Returns";
searchTasks["rental-property"][0].keyword="Rental property calculator";
searchTasks["rental-property"][0].description="Project rental-property cash flow, cap rate, cash-on-cash and sale proceeds under entered financing and operating assumptions. Before tax.";
searchTasks["rental-property"][0].aliases=[...new Set([...(searchTasks["rental-property"][0].aliases??[]),...["Rental property ROI calculator", "Rental cash flow calculator", "Investment property calculator"]])];
keywordTitles["debt-consolidation"]="Debt Consolidation Calculator - Payments & Savings";
searchTasks["debt-consolidation"][0].keyword="Debt consolidation calculator";
searchTasks["debt-consolidation"][0].description="Compare current-debt payoff with a fixed-rate consolidation loan, including fees, term and future interest. No approval or rate quote.";
searchTasks["debt-consolidation"][0].aliases=[...new Set([...(searchTasks["debt-consolidation"][0].aliases??[]),...["Debt consolidation loan calculator", "Debt consolidation payment calculator", "Debt consolidation savings calculator"]])];
keywordTitles["business-loan"]="Business Loan Calculator - Payments, Fees & APR";
searchTasks["business-loan"][0].keyword="Business loan calculator";
searchTasks["business-loan"][0].description="Estimate business term-loan payments, net proceeds and modeled APR with entered fees and insurance. No automatic SBA eligibility or current rates.";
searchTasks["business-loan"][0].aliases=[...new Set([...(searchTasks["business-loan"][0].aliases??[]),...["Small business loan payment calculator", "Business loan interest calculator", "Business loan repayment calculator"]])];
keywordTitles["budget"]="Budget Calculator - Monthly Income, Spending & Savings";
searchTasks["budget"][0].keyword="Budget calculator";
searchTasks["budget"][0].description="Build a household budget with monthly, annual, weekly or biweekly entries, an entered tax assumption, savings allocations and surplus or deficit.";
searchTasks["budget"][0].aliases=[...new Set([...(searchTasks["budget"][0].aliases??[]),...["Monthly budget calculator", "Personal budget calculator", "Household budget calculator", "Family budget calculator"]])];
keywordTitles["break-even"]="Break-Even Calculator - Units, Sales & Target Profit";
searchTasks["break-even"][0].keyword="Break even calculator";
searchTasks["break-even"][0].description="Calculate single-product break-even units, revenue, target profit or required selling price with entered fixed and variable costs.";
searchTasks["break-even"][0].aliases=[...new Set([...(searchTasks["break-even"][0].aliases??[]),...["Break even point calculator", "Break even analysis calculator", "Break even sales calculator"]])];
keywordTitles["roi"]="ROI Calculator - Return on Investment & Annualized ROI";
searchTasks["roi"][0].keyword="ROI calculator";
searchTasks["roi"][0].description="Calculate total and annualized return from an initial investment and terminal returned amount. Use entered years or actual dates.";
searchTasks["roi"][0].aliases=[...new Set([...(searchTasks["roi"][0].aliases??[]),...["Return on investment calculator", "Annualized ROI calculator", "ROI percentage calculator"]])];

// Paired Semrush US retirement and investment research, reviewed 2026-10-28.
keywordTitles["investment"]="Investment Calculator - Growth, Contributions & Goals";
searchTasks["investment"][0].keyword="Investment calculator";
searchTasks["investment"][0].description="Project investment growth with monthly and annual deposits, or solve starting amount, required return, contribution or time to a target.";
searchTasks["investment"][0].aliases=[...new Set([...(searchTasks["investment"][0].aliases??[]),...["Investment growth calculator", "Investment calculator with monthly contributions", "Investment goal calculator"]])];
keywordTitles["irr"]="IRR Calculator - Internal Rate of Return & Cash Flows";
searchTasks["irr"][0].keyword="IRR calculator";
searchTasks["irr"][0].description="Calculate effective annual IRRs for recurring or unequal year-end cash flows. Review signs, timing and possible multiple roots.";
searchTasks["irr"][0].aliases=[...new Set([...(searchTasks["irr"][0].aliases??[]),...["Internal rate of return calculator", "IRR cash flow calculator", "Annual IRR calculator"]])];
keywordTitles["social-security"]="Social Security Calculator - Compare Claiming Ages";
searchTasks["social-security"][0].keyword="Social Security calculator";
searchTasks["social-security"][0].description="Compare Social Security retirement claiming ages using entered benefit estimates, lifespan, COLA and discount assumptions. No earnings-record benefit determination.";
searchTasks["social-security"][0].aliases=[...new Set([...(searchTasks["social-security"][0].aliases??[]),...["Social Security claiming age calculator", "Social Security retirement comparison calculator"]])];
keywordTitles["pension"]="Pension Calculator - Lump Sum & Survivor Comparisons";
searchTasks["pension"][0].keyword="Pension calculator";
searchTasks["pension"][0].description="Compare quoted pension payments with a lump sum, single-life with joint-survivor income, or earlier and later retirement starts.";
searchTasks["pension"][0].aliases=[...new Set([...(searchTasks["pension"][0].aliases??[]),...["Pension lump sum calculator", "Pension present value calculator", "Joint survivor pension calculator"]])];
keywordTitles["annuity"]="Annuity Calculator - Future Value & Contributions";
searchTasks["annuity"][0].keyword="Annuity calculator";
searchTasks["annuity"][0].description="Project annuity accumulation with starting principal, monthly and annual additions and selected timing. No insurance quote or guaranteed return.";
searchTasks["annuity"][0].aliases=[...new Set([...(searchTasks["annuity"][0].aliases??[]),...["Annuity future value calculator", "Annuity accumulation calculator"]])];
keywordTitles["annuity-payout"]="Annuity Payout Calculator - Payments & Duration";
searchTasks["annuity-payout"][0].keyword="Annuity payout calculator";
searchTasks["annuity-payout"][0].description="Estimate fixed-term annuity payouts or how long an entered payment lasts under a constant return. Review the final payout and earnings.";
searchTasks["annuity-payout"][0].aliases=[...new Set([...(searchTasks["annuity-payout"][0].aliases??[]),...["Monthly annuity payout calculator", "Payout annuity calculator", "Annuity payout duration calculator"]])];

// Keep the updated research aliases unique without moving existing preset tasks.
{ const updated=new Set(['rental-property','debt-consolidation','business-loan','budget','break-even','roi','investment','irr','social-security','pension','annuity','annuity-payout']);
  const reserved=new Set(Object.values(searchTasks).flatMap(tasks=>tasks.map(task=>task.keyword.toLowerCase())));
  const aliases=new Set(Object.entries(searchTasks).filter(([id])=>!updated.has(id)).flatMap(([,tasks])=>tasks.flatMap(task=>(task.aliases??[]).map(alias=>alias.toLowerCase()))));
  for(const [id,tasks] of Object.entries(searchTasks)) if(updated.has(id)) for(const task of tasks) task.aliases=(task.aliases??[]).filter(alias=>{const key=alias.toLowerCase();if(reserved.has(key)||aliases.has(key))return false;aliases.add(key);return true;});
}

keywordTitles['fat-fire']='Fat FIRE Calculator - Lifestyle Budget & Retirement Target';
keywordTitles['lean-fire']='Lean FIRE Calculator - Essential Budget & FIRE Number';
searchTasks['fat-fire'][0].aliases=['FatFIRE calculator','Fat FIRE number calculator','How to calculate Fat FIRE number'];
searchTasks['lean-fire'][0].aliases=['LeanFIRE calculator','Lean FIRE number calculator','What is my Lean FIRE number'];

keywordTitles['debt-snowball']='Debt Snowball Calculator - Payoff Plan & Milestones';
keywordTitles['debt-avalanche']='Debt Avalanche Calculator - Payoff Plan & Interest';
searchTasks['debt-snowball'][0].aliases=['Snowball debt calculator','Snowball method debt calculator','Free debt snowball calculator'];
searchTasks['debt-avalanche'][0].aliases=['Avalanche debt calculator','Debt avalanche method calculator','Debt avalanche calculator with extra payments'];
// Standalone strategy pages own their head terms; the established tool owns comparison intent.
searchTasks['debt-payoff'][0].aliases=(searchTasks['debt-payoff'][0].aliases??[]).filter(alias=>alias.toLowerCase()!=='debt avalanche calculator with extra payments');
const snowballComparison=searchTasks['debt-payoff'].find(task=>task.mode==='snowball')!;
snowballComparison.keyword='Compare debt snowball and avalanche';
snowballComparison.aliases=['Debt snowball vs avalanche calculator','Debt avalanche vs snowball calculator','Debt snowball vs debt avalanche calculator'];

searchTasks['debt-snowball'][0].aliases!.push('Debt payoff calculator snowball');

keywordTitles.hsa='HSA Calculator - Contribution Limits, Tax Savings & Growth';
searchTasks.hsa=[{keyword:'HSA contribution calculator',mode:'contribution',description:'Estimate personal contribution room after employer deposits and potential tax savings.'},{keyword:'HSA growth calculator',mode:'growth',description:'Project HSA investment growth after fees and qualified medical spending.'}];

keywordTitles['self-employment-tax']='Self-Employment Tax Calculator - 2025 & 2026 SE Tax';
searchTasks['self-employment-tax']=[{keyword:'Self employment tax calculator',mode:'annual',description:'Estimate regular SE tax, W-2 wage coordination and Additional Medicare separately.',aliases:['Self employed tax calculator','Employed and self employed tax calculator','1099 self employment tax calculator']}];
keywordTitles.cd='CD Calculator - Interest, APY & Maturity Value';
keywordTitles.apr='APR Calculator - Loan Fees, Interest Rate & Borrowing Cost';
searchTasks['401k'].push({keyword:'401k contribution tax savings calculator',mode:'tax-savings',description:'Estimate the income-tax saving and paycheck effect of traditional and Roth employee deferrals under 2026 limits.'});
const minimumTask=searchTasks['credit-card'].find(t=>t.mode==='minimum');
if(minimumTask){minimumTask.aliases=[...new Set([...(minimumTask.aliases??[]),minimumTask.keyword,'Minimum credit card payment calculator','Minimum payment credit card calculator'])];minimumTask.keyword='Credit card minimum payment calculator';minimumTask.aliases=minimumTask.aliases.filter(alias=>alias.toLowerCase()!==minimumTask.keyword.toLowerCase());minimumTask.description='Calculate the first modeled minimum payment, payoff time and interest, then compare adding a fixed extra amount each month.';}

keywordTitles.rmd='RMD Calculator - 2026 IRA Distributions & IRS Table';
searchTasks.rmd[0].aliases=[...new Set([...(searchTasks.rmd[0].aliases??[]),'RMD calculator 2026','RMD calculator 2025','IRA RMD calculator','RMD calculator 2026 table'])];
searchTasks.rmd[0].description='Calculate an eligible original-owner RMD from the prior December 31 balance. Review IRS factors, gross monthly equivalent and the remaining amount after credited distributions.';

keywordTitles['barista-fire']='Barista FIRE Calculator - Your Number & Part-Time Plan';
searchTasks['barista-fire']=[{keyword:'Barista FIRE calculator',mode:'plan',description:'Estimate the assets required for a part-time bridge and later full retirement.',aliases:['Barista FIRE number calculator','How to calculate Barista FIRE']}];

keywordTitles.brrrr='BRRRR Calculator - Cash Left, Refinance & Rental Cash Flow';
searchTasks.brrrr=[{keyword:'BRRRR calculator',mode:'deal',description:'Estimate cash recovered, remaining cash and post-refinance rental cash flow.',aliases:['BRRRR method calculator','Free BRRRR calculator','BRRRR refinance calculator']}];

keywordTitles['cash-on-cash-return']='Cash-on-Cash Return Calculator - Rental Cash Yield';
searchTasks['cash-on-cash-return']=[{keyword:'Simple cash-on-cash return calculator',mode:'simple',description:'Calculate a cash yield from known cash flow and cash invested.',aliases:['Cash on cash return calculator','How to calculate cash on cash return']},{keyword:'Real estate cash-on-cash return calculator',mode:'property',description:'Include rental income, expenses, financing, repairs and cash reserves.'}];

keywordTitles['mortgage-vs-invest']='Pay Off Mortgage vs. Invest Calculator - Compare Both Paths';
searchTasks['mortgage-vs-invest']=[{keyword:'Pay off mortgage vs invest calculator',mode:'compare',description:'Compare the same funds and timeframe, including investing freed mortgage payments.',aliases:['Invest vs pay off mortgage calculator','Paying off mortgage vs investing calculator']}];

keywordTitles['house-hacking']='House Hacking Calculator - Your Net Housing Cost';
searchTasks['house-hacking']=[{keyword:'House hacking calculator',mode:'living',description:'Estimate owner-occupied cash costs after tenant rent and compare a renting budget.',aliases:['House hack calculator','House hacking calculator for rooms','Duplex house hacking calculator']}];

keywordTitles['covered-call']='Covered Call Calculator - Profit, Break-Even & Payoff';
searchTasks['covered-call']=[{keyword:'Covered call calculator',mode:'expiry',description:'Calculate expiry profit, break-even, downside and a shares-only comparison with manual premium and fees.',aliases:['Covered calls calculator','Covered call option calculator','Free covered call calculator','Covered call profit calculator']}];

// Mother-page copy reviewed against the implemented models, 2026-10-29.
searchTasks['coast-fire'][0].description="Free Coast FIRE calculator for individuals and couples. Estimate your Coast FI number and time to coast in today’s dollars using editable return assumptions.";
searchTasks['rent-vs-buy'][0].description="Compare renting and buying over a fixed 30-year projection, including home equity after sale, invested cash-flow differences and ownership costs.";
searchTasks['credit-cards-payoff'][0].description="Plan repayment across multiple credit cards with one total monthly budget. Estimate payoff time, interest and payments using fixed APR assumptions.";
searchTasks['brrrr'][0].description="Estimate cash left in a BRRRR deal, refinance proceeds and rental cash flow. Compare ARV and loan-rate scenarios using your own assumptions.";
searchTasks['roas'][0].description="Calculate ROAS as a multiple or percentage, then check break-even and target margins using your advertising spend, revenue and entered costs.";

keywordTitles['drip']='DRIP Calculator - Dividend Reinvestment vs. Cash';
searchTasks['drip']=[{keyword:'DRIP calculator',mode:'projection',description:'Compare dividend reinvestment and cash dividends with the same monthly contributions, payout frequency, per-share growth and flat tax assumption.',aliases:['Dividend DRIP calculator','Dividend reinvestment calculator','Monthly DRIP calculator','Dividend snowball calculator','Dividend calculator with DRIP','Stock DRIP calculator','ETF DRIP calculator']}];

keywordTitles['roth-conversion-ladder']='Roth Conversion Ladder Calculator - Five-Year Bridge';
searchTasks['roth-conversion-ladder']=[{keyword:'Roth conversion ladder calculator',mode:'bridge',description:'Plan a Roth conversion ladder for early retirement. Track five-year dates, conversion taxes, bridge cash and funding gaps with a free yearly schedule.',aliases:['Roth IRA conversion ladder calculator','Roth conversion ladder five year rule','Roth ladder calculator']}];

keywordTitles['cap-rate']='Cap Rate Calculator - NOI, Rental Income & Property Value';
searchTasks['cap-rate']=[{keyword:'Cap rate calculator',mode:'noi',description:'Calculate cap rate from annual NOI and property value. Build rental NOI from expenses or compare values at your target cap rate.',aliases:['Capitalization rate calculator','Calculate cap rate']},{keyword:'Rental property cap rate calculator',mode:'rental',description:'Build annual NOI from rent, vacancy and itemized operating costs before financing.'}];
keywordTitles['credit-card-minimum-payment']='Credit Card Minimum Payment Calculator - Payoff & Interest';
searchTasks['credit-card-minimum-payment']=[{keyword:'Credit card minimum payment calculator',mode:'minimum',description:'Estimate your first minimum payment, payoff time and interest. Compare paying only the minimum with adding extra each month.',aliases:['Minimum credit card payment calculator','Minimum payment credit card calculator']}];
// Preserve the old calculation mode and saved links; the dedicated page owns the exact minimum-payment query.
if(minimumTask){minimumTask.keyword='Variable minimum payment payoff estimate';minimumTask.aliases=[];}

keywordTitles['seller-financing']='Seller Financing Calculator - Owner Finance & Balloon';
searchTasks['seller-financing']=[{keyword:'Seller financing calculator',mode:'amortized',description:'Estimate owner-financed monthly payments, amortization and the balloon due at maturity.',aliases:['Owner financing calculator','Owner finance calculator','Seller finance calculator','Seller financing with balloon payment calculator']},{keyword:'Interest-only seller financing calculator',mode:'interest-only',description:'Separate monthly interest from the principal due at maturity.'}];
keywordTitles['fix-and-flip']='Fix and Flip Calculator - House Flipping Profit & Costs';
searchTasks['fix-and-flip']=[{keyword:'Fix and flip calculator',mode:'project',description:'Reconcile renovation, holding, financing and sale costs to estimate house flipping profit and cash required.',aliases:['House flipping calculator','House flip calculator','Flip house calculator','House flipping profit calculator']}];

keywordTitles['stock-profit']='Stock Profit Calculator - Profit, Loss, Fees & Break-Even';
searchTasks['stock-profit']=[{keyword:'Stock profit calculator',mode:'trade',description:'Estimate stock profit or loss after trading fees and optional cash dividends. Find the break-even sale price using your own prices.',aliases:['Stock calculator','Stock gain calculator','Stock profit and loss calculator','Stock calculator profit']}];
keywordTitles['stock-average']='Stock Average Calculator - Weighted Cost & Purchases';
searchTasks['stock-average']=[{keyword:'Stock average calculator',mode:'purchases',description:'Add purchase quantities, prices and fees to calculate weighted stock cost. Compare averaging down without assuming a future recovery.',aliases:['Stock average cost calculator','Stock average down calculator','Average stock price calculator','Average down stock calculator']}];

// Loan payment and total-cost examples checked 2026-11-01.
keywordTitles['student-loan']='Student Loan Calculator - Payments & Extra Repayment';
keywordTitles['business-loan']='Business Loan Calculator - Payments, Fees & Total Cost';
searchTasks['personal-loan'][0].description='Calculate personal loan payments, fees and net proceeds. Compare repayment terms and modeled cash-flow APR using your own loan inputs.';
searchTasks['business-loan'][0].description='Calculate business loan payments and total cost with entered fees, insurance and repayment terms. Compare net proceeds; no automatic SBA terms or approval.';

// Accumulation and finite-payout examples checked 2026-11-01.
keywordTitles['annuity']='Annuity Calculator - Future Value & Contributions';
keywordTitles['annuity-payout']='Annuity Payout Calculator - Amount & Duration';
searchTasks['annuity'][0].description='Calculate annuity future value with starting principal, monthly and annual additions. Compare deposit timing using an entered effective annual return.';
searchTasks['annuity-payout'][0].description='Calculate a finite annuity payout or how long a chosen payment lasts. Compare terms and frequencies; this model does not price an insurance contract.';

// Entered pension and Social Security quote comparisons checked 2026-11-01.
keywordTitles['pension']='Pension Calculator - Lump Sum vs Monthly Payments';
keywordTitles['social-security']='Social Security Calculator - Compare Claiming Ages';
searchTasks['pension'][0].description='Compare an entered pension lump sum with monthly benefits. Test horizon, discount rate and COLA; this is not plan-specific benefit or actuarial pricing.';
searchTasks['social-security'][0].description='Compare Social Security claiming-age scenarios with entered benefits, horizon, discount and COLA assumptions. Use official SSA resources for earnings-based estimates.';

// Home equity and consolidation fixed-rate cost comparisons checked 2026-11-01.
keywordTitles['home-equity-loan']='Home Equity Loan Calculator - Payments & Closing Costs';
keywordTitles['debt-consolidation']='Debt Consolidation Calculator - Payments, Fees & Savings';
searchTasks['home-equity-loan'][0].description='Calculate fixed home equity loan payments and closing-cost effects. Compare terms and upfront or financed fees; existing mortgage and property costs are separate.';
searchTasks['debt-consolidation'][0].description='Compare debt consolidation payments, interest and origination fees with continued repayment. A smaller payment can cost more over a longer term.';
