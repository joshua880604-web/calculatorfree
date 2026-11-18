import type { Calculator, Values } from './types';
const loaders: Record<string, () => Promise<Calculator[]>> = {
  'Mortgage and Real Estate': () => import('./calculators/property').then(m => m.propertyCalculators),
  Auto: () => import('./calculators/property').then(m => m.propertyCalculators),
  Investment: () => import('./calculators/investment').then(m => m.investmentCalculators),
  Retirement: () => import('./calculators/retirement-core').then(m => m.retirementCoreCalculators),
  'Tax and Salary': () => import('./calculators/tax-salary').then(m => m.taxCalculators),
  'Everyday Tools': () => import('./calculators/everyday').then(m => m.everydayCalculators),
  Other: () => import('./calculators/other-core').then(m => m.otherCoreCalculators),
};
const businessTools = () => import('./calculators/business-tools').then(m => m.businessTools);
const strategyTools=()=>import('./calculators/debt-strategies').then(m=>[m.debtSnowball,m.debtAvalanche]);
const dataTools: Record<string, () => Promise<Calculator[]>> = {
  'sortino-ratio':()=>import('./calculators/sortino-ratio').then(m=>[m.sortinoRatioCalculator]),
  'gross-rent-multiplier':()=>import('./calculators/gross-rent-multiplier').then(m=>[m.grossRentMultiplierCalculator]),
  'debt-to-equity-ratio':()=>import('./calculators/debt-to-equity-ratio').then(m=>[m.debtToEquityRatioCalculator]),

  'business-line-of-credit':()=>import('./calculators/business-line-of-credit').then(m=>[m.businessLineOfCreditCalculator]),
  'triple-net-lease':()=>import('./calculators/triple-net-lease').then(m=>[m.tripleNetLeaseCalculator]),
  'arm-mortgage':()=>import('./calculators/arm-mortgage').then(m=>[m.armMortgageCalculator]),
  'portfolio-rebalancing':()=>import('./calculators/portfolio-rebalancing').then(m=>[m.portfolioRebalancingCalculator]),

  'basis-point':()=>import('./calculators/basis-point').then(m=>[m.basisPointCalculator]),
  'prorated-rent':()=>import('./calculators/prorated-rent').then(m=>[m.proratedRentCalculator]),
  'operating-cash-flow':()=>import('./calculators/operating-cash-flow').then(m=>[m.operatingCashFlowCalculator]),

  'stock-split':()=>import('./calculators/stock-split').then(m=>[m.stockSplitCalculator]),
  'customer-acquisition-cost':()=>import('./calculators/customer-acquisition-cost').then(m=>[m.customerAcquisitionCostCalculator]),
  'dividend-discount-model':()=>import('./calculators/dividend-discount-model').then(m=>[m.dividendDiscountModelCalculator]),
  'earnings-per-share':()=>import('./calculators/earnings-per-share').then(m=>[m.earningsPerShareCalculator]),
  'sharpe-ratio':()=>import('./calculators/sharpe-ratio').then(m=>[m.sharpeRatioCalculator]),
  'black-scholes':()=>import('./calculators/black-scholes').then(m=>[m.blackScholesCalculator]),

  'credit-card-rewards':()=>import('./calculators/credit-card-rewards').then(m=>[m.creditCardRewardsCalculator]),
  'accounts-receivable-turnover':()=>import('./calculators/receivables-turnover').then(m=>[m.receivablesTurnoverCalculator]),
  'days-payable-outstanding':()=>import('./calculators/days-payable-outstanding').then(m=>[m.daysPayableOutstandingCalculator]),
  'cash-conversion-cycle':()=>import('./calculators/cash-conversion-cycle').then(m=>[m.cashConversionCycleCalculator]),
  'roic':()=>import('./calculators/roic').then(m=>[m.roicCalculator]),
  'interest-coverage-ratio':()=>import('./calculators/interest-coverage-ratio').then(m=>[m.interestCoverageCalculator]),

  'mortgage-buydown':()=>import('./calculators/mortgage-buydown').then(m=>[m.mortgageBuydownCalculator]),
  'cash-secured-put':()=>import('./calculators/cash-secured-put').then(m=>[m.cashSecuredPutCalculator]),
  'profitability-index':()=>import('./calculators/profitability-index').then(m=>[m.profitabilityIndexCalculator]),
  'return-on-equity':()=>import('./calculators/return-on-equity').then(m=>[m.returnOnEquityCalculator]),
  '72t':()=>import('./calculators/sepp').then(m=>[m.seppCalculator]),

  'wacc':()=>import('./calculators/wacc').then(m=>[m.waccCalculator]),
  'capm':()=>import('./calculators/capm').then(m=>[m.capmCalculator]),
  'cd-early-withdrawal-penalty':()=>import('./calculators/cd-penalty').then(m=>[m.cdPenaltyCalculator]),
  'burn-rate':()=>import('./calculators/burn-rate').then(m=>[m.burnRateCalculator]),
  'bond-duration':()=>import('./calculators/bond-duration').then(m=>[m.bondDurationCalculator]),

  'inventory-turnover':()=>import('./calculators/inventory-turnover').then(m=>[m.inventoryTurnoverCalculator]),
  'sba-loan':()=>import('./calculators/sba-loan').then(m=>[m.sbaLoanCalculator]),

  'cd-ladder':()=>import('./calculators/cd-ladder').then(m=>[m.cdLadderCalculator]),
  'npv':()=>import('./calculators/npv').then(m=>[m.npvCalculator]),
  'lease-vs-buy-car':()=>import('./calculators/lease-vs-buy-car').then(m=>[m.leaseVsBuyCarCalculator]),
  'mortgage-comparison':()=>import('./calculators/mortgage-comparison').then(m=>[m.mortgageComparisonCalculator]),

  '1031-exchange':()=>import('./calculators/1031-exchange').then(m=>[m.exchangeCalculator]),
  'home-maintenance-cost':()=>import('./calculators/home-maintenance-cost').then(m=>[m.maintenanceCalculator]),
  'vacancy-rate':()=>import('./calculators/vacancy-rate').then(m=>[m.vacancyCalculator]),
  'credit-utilization':()=>import('./calculators/credit-utilization').then(m=>[m.creditUtilizationCalculator]),
  'dca':()=>import('./calculators/dca').then(m=>[m.dcaCalculator]),
  'rule-of-72':()=>import('./calculators/rule-of-72').then(m=>[m.rule72Calculator]),
  'capital-gains-tax':()=>import('./calculators/capital-gains-tax').then(m=>[m.capitalGainsCalculator]),
  'retirement-withdrawal':()=>import('./calculators/retirement-withdrawal').then(m=>[m.retirementWithdrawalCalculator]),
  'balance-transfer':()=>import('./calculators/balance-transfer').then(m=>[m.balanceTransferCalculator]),
  dscr:()=>import('./calculators/dscr').then(m=>[m.dscrCalculator]),
  fsa:()=>import('./calculators/fsa').then(m=>[m.fsaCalculator]),
  'closing-cost':()=>import('./calculators/closing-cost').then(m=>[m.closingCostCalculator]),
  'stock-profit':()=>import('./calculators/stock-trades').then(m=>[m.stockProfitCalculator]),
  'stock-average':()=>import('./calculators/stock-trades').then(m=>[m.stockAverageCalculator]),
  'seller-financing':()=>import('./calculators/property-deals').then(m=>[m.sellerFinancingCalculator]),
  'fix-and-flip':()=>import('./calculators/property-deals').then(m=>[m.fixFlipCalculator]),
  'cap-rate':()=>import('./calculators/cap-rate').then(m=>[m.capRateCalculator]),
  'credit-card-minimum-payment':()=>import('./calculators/credit-card-minimum-payment').then(m=>[m.cardMinimumCalculator]),
  'roth-conversion-ladder':()=>import('./calculators/roth-conversion-ladder').then(m=>[m.rothLadderCalculator]),
  drip: () => import('./calculators/drip').then(m => [m.dripCalculator]),
  'covered-call': () => import('./calculators/covered-call').then(m => [m.coveredCallCalculator]),
  'house-hacking': () => import('./calculators/house-hacking').then(m => [m.houseHackingCalculator]),
  'mortgage-vs-invest': () => import('./calculators/mortgage-vs-invest').then(m => [m.mortgageInvestCalculator]),
  'cash-on-cash-return': () => import('./calculators/cash-on-cash').then(m => [m.cashOnCashCalculator]),
  brrrr: () => import('./calculators/brrrr').then(m => [m.brrrrCalculator]),
  'barista-fire': () => import('./calculators/barista-fire').then(m => [m.baristaFireCalculator]),
  'debt-snowball':strategyTools, 'debt-avalanche':strategyTools,
  'self-employment-tax': () => import('./calculators/self-employment-tax').then(m => [m.selfEmploymentTaxCalculator]),
  hsa: () => import('./calculators/hsa').then(m => [m.hsaCalculator]),
  noi: () => import('./calculators/noi').then(m => [m.noiCalculator]),
  'fat-fire': () => import('./calculators/fire-budgets').then(m => [m.fatFireCalculator]),
  'lean-fire': () => import('./calculators/fire-budgets').then(m => [m.leanFireCalculator]),
  fire: () => import('./calculators/fire').then(m => [m.fireCalculator]),
  mirr: () => import('./calculators/mirr').then(m => [m.mirrCalculator]),
  'coast-fire': () => import('./calculators/coast-fire').then(m => [m.coastFire]),
  roas: businessTools, 'landed-cost': businessTools, 'quick-ratio': businessTools, 'current-ratio': businessTools,
  'tax-equivalent-yield': () => import('./calculators/investment-decisions').then(m => m.investmentDecisions),
  'treasury-bill': () => import('./calculators/investment-decisions').then(m => m.investmentDecisions),
  'mortgage-recast': () => import('./calculators/mortgage-recast').then(m => [m.mortgageRecast]),
  pmi: () => import('./calculators/mortgage-tools').then(m => m.mortgageTools),
  'biweekly-mortgage': () => import('./calculators/mortgage-tools').then(m => m.mortgageTools),
  'discount-points': () => import('./calculators/mortgage-tools').then(m => m.mortgageTools),
  currency: () => import('./calculators/currency').then(m => [m.currencyCalculator]),
  inflation: () => import('./calculators/inflation').then(m => [m.inflationCalculator]),
  rmd: () => import('./calculators/rmd').then(m => [m.rmdCalculator]),
};
export async function runClientCalculation(id: string, category: string, mode: string, values: Values) {
  const load = dataTools[id] ?? (['markup','cagr','emergency-fund','break-even','investment-fee','real-return'].includes(id)
    ? () => import('./calculators/evergreen').then(m => m.evergreenCalculators)
    : loaders[category]);
  if (!load) throw new Error('Unknown calculator category.');
  let loaded: [Calculator[], typeof import('./calculate-mode')];
  try { loaded = await Promise.all([load(), import('./calculate-mode')]); }
  catch { throw new Error('The calculator could not load. Check your connection and reload this page.'); }
  const [calculators, {calculateMode}] = loaded;
  const calc = calculators.find(c => c.id === id);
  if (!calc) throw new Error('Unknown calculator.');
  return calculateMode(calc, mode, values);
}
