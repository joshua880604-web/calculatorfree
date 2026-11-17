import type { Metric, Result } from "./types";

// Complex tax forms, multi-debt entry sheets and the 401(k) story keep their wider flow.
export const workspaceIds = [
  "mortgage-buydown","cash-secured-put","profitability-index","return-on-equity","72t",
  "wacc","capm","cd-early-withdrawal-penalty","burn-rate","bond-duration",
  'stock-profit','stock-average',
  'seller-financing','fix-and-flip',
  "cap-rate", "credit-card-minimum-payment",
  "roth-conversion-ladder",
  "drip",
  "covered-call", "house-hacking", "mortgage-vs-invest", "cash-on-cash-return", "brrrr", "debt-snowball", "debt-avalanche",
  "rmd", "self-employment-tax", "hsa", "noi", "fire", "mirr", "fat-fire", "lean-fire",
  "coast-fire", "barista-fire",
  "roas", "landed-cost", "quick-ratio", "current-ratio",
  "tax-equivalent-yield", "treasury-bill",
  "pmi", "biweekly-mortgage", "discount-points", "mortgage-recast",
  "compound-interest", "investment", "loan",
  "mortgage", "fha-loan", "va-mortgage", "amortization", "mortgage-payoff", "refinance", "home-equity-loan", "heloc",
  "auto-loan", "auto-lease", "boat-loan", "business-loan", "personal-loan", "payment", "credit-card", "debt-consolidation", "repayment", "student-loan",
  "interest", "savings", "cd", "mutual-fund", "investment-fee", "annuity", "annuity-payout", "ira", "roth-ira", "retirement", "depreciation",
  "cagr", "real-return", "emergency-fund", "break-even", "markup", "down-payment", "apr", "roi", "payback-period", "future-value", "present-value",
] as const;
export function hasCalculatorWorkspace(id: string): boolean { return (workspaceIds as readonly string[]).includes(id); }
export function workspaceLayout(id: string, mode: string): "split" | "stacked" | null {
  if (!hasCalculatorWorkspace(id)) return null;
  return id === 'stock-average' || id === 'fix-and-flip' || (id === "cap-rate" && mode === "rental") || id === "roth-conversion-ladder" || id === "drip" || id === "covered-call" || id === "house-hacking" || id === "mortgage-vs-invest" || (id === "cash-on-cash-return" && mode === "property") || id === "brrrr" || (id === "retirement" && mode === "required") || (id === "payback-period" && mode === "irregular") ? "stacked" : "split";
}

const priorities: Record<string, string[]> = {
  'mortgage-buydown': ['First-year borrower monthly P&I','Contract monthly P&I at note rate','Total temporary subsidy funding','Monthly P&I after buydown'],
  'cash-secured-put': ['Modeled expiration profit / loss','Cash secured at strike × shares','Expiration breakeven per share','Maximum expiration loss at zero stock price'],
  '72t': ['Estimated first-year annual SEPP amount','Annual amount / 12 for budgeting','Earliest general duration milestone'],
  'return-on-equity:dupont': ['Return on equity','Net profit margin','Asset turnover','Equity multiplier'],
 'stock-profit':['Net profit / loss before income tax','Net return on purchase cost','Break-even sale price per share','Total trading fees'],
 'stock-average':['Average cost per share including buy fees','Total shares held','Total purchase cost including fees','Unrealized gain / loss before sale fees and tax'],
 'seller-financing':['Regular monthly payment','Balloon principal after final installment','Total due in final month','Total interest through maturity'],
 'fix-and-flip':['Net project profit before income tax','Total cash required before sale','Net sale cash after loan payoff','Project cash-on-cash ROI'],
  'cap-rate':['Capitalization rate','Annual net operating income','Indicated value at target cap rate','NOI surplus / shortfall versus target'],
  'credit-card-minimum-payment':['Initial modeled minimum payment','Initial payment including extra','Months to repay','Total interest'],
  'roth-conversion-ladder':['Bridge cash required for this modeled path','Additional bridge cash needed','Modeled funding status','Estimated conversion tax'],
  drip:['Ending portfolio with DRIP','Ending wealth without reinvestment (shares + cash)','DRIP minus cash-dividend wealth','External money invested'],
  'covered-call':['Covered call profit / loss at your expiry price','Maximum expiry profit (may be negative)','Worst-case loss at zero stock price','Break-even stock price'],
  'house-hacking':['Monthly net housing cash cost','Monthly budget difference versus renting','Initial cash required','Effective monthly tenant rent'],
  'mortgage-vs-invest':['Invest-first advantage at horizon','Paydown-first investments minus mortgage','Invest-first investments minus mortgage','Modeled comparison'],
  'cash-on-cash-return':['Cash-on-cash return','Annual cash flow used','Cash invested','Monthly cash flow equivalent'],
  brrrr:['Cash remaining in deal (signed)','Net refinance cash to you (signed)','Monthly cash flow after reserve','Post-refinance cash-on-cash return'],
  'barista-fire':['Required portfolio at part-time start','Projected portfolio at part-time start','Shortfall at part-time start','Modeled plan status','Unfunded bridge spending'],
  rmd:['Annual RMD','Remaining RMD for selected year','Monthly budgeting equivalent of annual RMD','Distribution period','Required starting age'],
  'credit-card:minimum':['Initial modeled minimum payment','Initial payment including extra','Months to repay','Total interest','Total payments'],
  'self-employment-tax':['Self-employment tax including SE Additional Medicare','Regular Social Security SE tax','Regular Medicare SE tax','Additional Medicare tax on SE income','Deductible half of regular SE tax'],
  "debt-snowball": ["Months until debt-free", "Total interest", "First debt cleared in month", "First target for extra payment"],
  "debt-avalanche": ["Months until debt-free", "Total interest", "First debt cleared in month", "First target for extra payment"],
  noi: ["Annual net operating income", "Monthly net operating income", "Annual operating expenses"],
  "fat-fire": ["FIRE portfolio target", "Age at modeled FIRE target", "Current gap to FIRE target", "Annual portfolio-funded budget"],
  "lean-fire": ["FIRE portfolio target", "Age at modeled FIRE target", "Current gap to FIRE target", "Annual portfolio-funded budget"],
  fire: ["FIRE portfolio target", "Age at modeled FIRE target", "Time to modeled FIRE target", "Modeled target status"],
  mirr: ["Effective annual MIRR", "MIRR per cash-flow period", "Present value of outflows"],
  "coast-fire": ["Coast FIRE number today", "Age at Coast FIRE", "Time until Coast FIRE", "Modeled Coast status"],
  "tax-equivalent-yield": ["Tax-equivalent taxable yield", "Tax-exempt option after-tax yield", "Taxable option after-tax yield"],
  "treasury-bill": ["Net profit at maturity after fee and tax", "Purchase price before fee", "Gross discount interest at maturity"],
  "mortgage-recast": ["New monthly P&I after recast", "Monthly P&I reduction", "Recast net interest savings after fee"],
  "pmi": ["Initial monthly PMI", "Original loan-to-value ratio", "Initial total loan payment"],
  "pmi:cancellation": ["Modeled current monthly PMI", "Cancellation status", "LTV using original value"],
  "biweekly-mortgage": ["Biweekly payment", "Interest saved versus standard monthly", "Years to payoff with biweekly payments"],
  "discount-points": ["Net borrowing-cost savings at horizon (B vs A)", "Monthly payment saving (A minus B)", "First net-cost break-even month"],
  "mortgage:biweekly": ["Biweekly payment", "Total interest", "Years to payoff"],
  "fha-loan:biweekly": ["Biweekly payment", "Total interest", "Years to payoff"],
  "va-mortgage:biweekly": ["Biweekly payment", "Total interest", "Years to payoff"],
  "mortgage": ["Monthly principal & interest", "Initial monthly total", "Initial monthly PMI", "Total interest"],
  "fha-loan": ["Initial monthly total", "Monthly principal & interest", "Initial monthly FHA MIP", "Total interest"],
  "va-mortgage": ["Monthly principal & interest", "Initial monthly total", "Total interest"],
  "mortgage-payoff": ["Current principal balance", "Interest saved", "Years to payoff"],
  "refinance": ["New monthly payment", "Current monthly payment", "Monthly payment reduction"],
  "auto-loan:payment": ["Payment per period", "Vehicle price", "Total interest"],
  "auto-loan:price": ["Vehicle price", "Payment per period", "Total interest"],
  "boat-loan:payment": ["Payment per period", "Boat price", "Total interest"],
  "boat-loan:price": ["Boat price", "Payment per period", "Total interest"],
  "auto-lease:payment": ["Monthly lease payment", "Vehicle price", "Total lease cash outlay"],
  "auto-lease:price": ["Vehicle price", "Monthly lease payment", "Total lease cash outlay"],
  "business-loan": ["Payment including insurance", "Total interest", "Net proceeds after fees"],
  "personal-loan": ["Payment including insurance", "Total interest", "Net proceeds after fees"],
  "student-loan:projection": ["Payment per period", "Balance entering repayment", "Capitalized interest"],
  "student-loan:solve-payment": ["Monthly payment", "Loan balance", "Annual interest rate", "Term in months"],
  "student-loan:solve-rate": ["Annual interest rate", "Loan balance", "Term in months", "Monthly payment"],
  "student-loan:solve-term": ["Term in months", "Loan balance", "Annual interest rate", "Monthly payment"],
  "cd": ["After-tax balance", "Interest earned", "Maturity balance", "Tax on interest"],
  "down-payment:price": ["Home price", "Cash needed", "Loan amount", "Monthly mortgage payment"],
  "down-payment:cash": ["Cash needed", "Down payment", "Loan amount", "Monthly mortgage payment"],
  "down-payment:percent": ["Down payment percentage", "Cash needed", "Loan amount", "Monthly mortgage payment"],
  "markup": ["Selling price", "Markup on cost", "Profit margin"],
  "interest": ["Ending balance", "Total contributions", "Net investment earnings"],
  "savings:accumulation": ["Ending balance", "Total contributions", "Net investment earnings"],
  "savings:goal-contribution": ["Required monthly deposit", "Ending balance", "Net investment earnings"],
  "savings:goal-time": ["Years to savings goal", "Ending balance", "Net investment earnings"],
  "payback-period": ["Payback period (years)", "Discounted payback (years)", "Net present value"],
  "depreciation": ["Ending book value", "Total depreciation", "Depreciable basis"],
  "retirement:required": ["Required savings at retirement", "Required monthly saving", "Projected surplus / shortfall"],
  "retirement:withdrawal": ["Initial monthly withdrawal", "Monthly withdrawal in today’s dollars", "Balance at retirement"],
};
export function workspaceMetrics(id: string, mode: string, result: Result): { primary: Metric; highlights: Metric[]; details: Metric[] } {
  const labels = id === "mortgage" && mode === "monthly"
    ? ["Monthly principal & interest", "Initial monthly total", "Total interest", "Interest saved with extra payments", "Payments avoided", "Years to payoff"]
    : priorities[id + ":" + mode] ?? priorities[id];
  // Preserve the three published pilots' original primary/breakdown presentation.
  const pilot = ["compound-interest", "investment", "loan"].includes(id);
  const selected = labels?.map(label => result.metrics.find(metric => metric.label === label)).filter((metric): metric is Metric => Boolean(metric)) ?? [];
  const shown = selected.length ? selected : result.metrics.slice(0, pilot ? 1 : result.metrics.length <= 4 ? 4 : 3);
  const primary = shown[0] ?? result.metrics[0];
  return { primary, highlights: shown.slice(1), details: result.metrics.filter(metric => !shown.includes(metric)) };
}
