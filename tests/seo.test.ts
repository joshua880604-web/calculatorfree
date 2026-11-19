const businessReviewPaths=['/inventory-turnover-calculator.html','/sba-loan-calculator.html','/guides/how-to-calculate-inventory-turnover/','/guides/sba-7a-vs-504-loan-payments/','/business-calculators.html','/financial-calculator.html','/guides/','/glossary/','/glossary/inventory-turnover/','/glossary/sba-guaranty-fee/'];
const latestGuidePaths=["/guides/how-are-heloc-payments-calculated/", "/guides/how-to-calculate-home-equity-loan-payments/", "/guides/how-to-calculate-personal-loan-payments/", "/guides/how-to-compare-debt-consolidation-loans/", "/guides/roth-conversion-ladder/", "/guides/roth-conversion-taxes/", "/guides/gross-margin-vs-net-margin/", "/guides/heloc-vs-home-equity-loan/", "/guides/balance-transfer-vs-personal-loan/", "/home-equity-loan-calculator.html", "/heloc-calculator.html", "/ira-calculator.html", "/single-credit-card-payoff-calculator.html", "/debt-consolidation-calculator.html", "/margin-calculator.html", "/personal-loan-calculator.html", "/markup-calculator.html", "/break-even-calculator.html", "/roth-conversion-ladder-calculator.html", "/guides/", "/retirement-calculators.html", "/business-calculators.html", "/real-estate-calculator.html", "/loan-calculators.html"];
latestGuidePaths.push('/fha-loan-calculator.html','/mortgage-calculator.html','/irr-calculator.html','/present-value-calculator.html','/glossary/internal-rate-of-return/','/glossary/net-present-value/','/glossary/lease-residual-value/','/glossary/money-factor/');
latestGuidePaths.push('/guides/fha-vs-conventional-loan/','/guides/irr-vs-npv/','/guides/how-to-calculate-fha-loan-payments/','/guides/how-to-calculate-irr/','/guides/how-to-calculate-present-value/','/glossary/');
latestGuidePaths.push("/auto-loan-calculator.html","/retirement-calculator.html","/401k-calculator.html","/emergency-fund-calculator.html","/budget-calculator.html");
latestGuidePaths.push("/guides/leasing-vs-buying-a-car/","/guides/roth-vs-traditional-401k/","/guides/lump-sum-vs-dollar-cost-averaging/","/guides/50-30-20-rule/","/guides/how-to-calculate-auto-loan-payments/","/guides/how-to-calculate-auto-lease-payments/","/guides/how-401k-matching-works/","/guides/compound-interest-with-monthly-contributions/","/guides/how-to-calculate-monthly-budget/","/guides/401k-vs-roth-ira/","/investment-calculator.html","/compound-interest-calculator.html","/savings-investment-calculators.html");
latestGuidePaths.push("/auto-lease-calculator.html");
const contentGuidePaths=['/guides/apr-vs-apy/','/guides/hsa-vs-fsa/','/guides/simple-interest-vs-compound-interest/','/guides/401k-vs-roth-ira/','/guides/cash-out-refinance-vs-heloc/','/guides/15-vs-30-year-mortgage/','/guides/how-much-money-do-i-need-to-retire/','/guides/4-percent-rule/','/guides/cd-ladder/','/guides/how-to-calculate-monthly-mortgage-payment/','/guides/compound-interest-with-monthly-contributions/','/guides/how-long-will-retirement-savings-last/','/guides/how-does-an-hsa-work/','/guides/how-401k-matching-works/','/guides/how-to-calculate-cap-rate/','/guides/how-to-calculate-rental-property-cash-flow/','/guides/how-are-heloc-payments-calculated/','/guides/how-much-house-can-i-afford/','/guides/how-to-calculate-simple-interest/','/mortgage-calculator.html','/mortgage-payoff-calculator.html','/refinance-calculator.html','/apr-calculator.html','/home-equity-loan-calculator.html','/heloc-calculator.html','/compound-interest-calculator.html','/savings-calculator.html','/simple-interest-calculator.html','/cd-calculator.html','/retirement-calculator.html','/401k-calculator.html','/social-security-calculator.html','/roth-ira-calculator.html','/ira-calculator.html','/coast-fire-calculator.html','/fire-calculator.html','/hsa-calculator.html','/cap-rate-calculator.html','/real-estate-calculator.html','/retirement-calculators.html','/savings-investment-calculators.html',"/guides/how-soon-can-you-refinance-a-mortgage/", "/guides/are-reinvested-dividends-taxable/", "/guides/should-you-reinvest-dividends/", "/guides/how-much-house-can-i-afford/", "/guides/how-to-calculate-rental-property-cash-flow/", "/guides/is-refinancing-worth-it/", "/guides/", "/refinance-calculator.html", "/drip-calculator.html", "/stock-profit-calculator.html", "/mortgage-calculator.html"];
const followupReviewPaths=['/biweekly-mortgage-calculator.html','/mortgage-recast-calculator.html','/emergency-fund-calculator.html','/paycheck-calculator.html','/roth-ira-calculator.html'];
const depthReviewPaths=['/loan-calculator.html','/finance-calculator.html','/bond-calculator.html','/average-return-calculator.html','/margin-calculator.html','/mortgage-payoff-calculator.html','/depreciation-calculator.html','/lease-calculator.html'];
followupReviewPaths.push(...depthReviewPaths);
followupReviewPaths.push('/financial-calculator.html','/about.html','/privacy.html','/methodology.html','/covered-call-calculator.html');
const remainingReviewPaths=["/amortization-calculator.html", "/debt-ratio-calculator.html", "/down-payment-calculator.html", "/interest-calculator.html", "/finance-calculator.html", "/interest-rate-calculator.html", "/bond-calculator.html", "/mutual-fund-calculator.html", "/payback-period-calculator.html", "/tax-calculator.html", "/salary-calculator.html", "/marriage-calculator.html", "/estate-tax-calculator.html", "/paycheck-calculator.html", "/payment-calculator.html", "/currency-converter.html", "/inflation-calculator.html", "/college-cost-calculator.html", "/sales-tax-calculator.html", "/vat-calculator.html", "/depreciation-calculator.html", "/discount-calculator.html", "/lease-calculator.html", "/commission-calculator.html", "/cagr-calculator.html", "/investment-fee-calculator.html", "/real-return-calculator.html", "/tax-equivalent-yield-calculator.html", "/treasury-bill-calculator.html", "/quick-ratio-calculator.html", "/current-ratio-calculator.html", "/self-employment-tax-calculator.html", "/covered-call-calculator.html", "/credit-card-minimum-payment-calculator.html", "/guides/how-to-read-amortization-and-loan-payments/", "/guides/how-to-calculate-debt-to-income-ratio/", "/guides/down-payment-and-closing-cost-cash/", "/guides/bond-price-coupon-and-yield/", "/guides/mutual-fund-fees-and-investment-costs/", "/guides/simple-and-discounted-payback/", "/guides/federal-income-tax-vs-paycheck-estimate/", "/guides/hourly-to-salary-and-paid-time-off/", "/guides/marriage-tax-penalty-or-bonus/", "/guides/federal-estate-tax-exclusion-and-gifts/", "/guides/currency-conversion-rate-direction-and-spread/", "/guides/inflation-and-real-investment-return/", "/guides/college-costs-and-saving-before-enrollment/", "/guides/tax-inclusive-prices-sales-tax-and-vat/", "/guides/book-depreciation-methods-and-salvage/", "/guides/discounts-and-sales-commission-bases/", "/guides/lease-payment-and-residual-value/", "/guides/cagr-and-annualized-growth/", "/guides/tax-equivalent-yield-and-after-tax-income/", "/guides/treasury-bill-discount-vs-investment-yield/", "/guides/current-ratio-vs-quick-ratio/", "/guides/self-employment-tax-net-profit-and-wages/", "/guides/covered-call-expiry-profit-and-downside/", "/guides/credit-card-minimum-payment-and-payoff-time/"];
import { test } from "node:test";
import assert from "node:assert/strict";
import { siteConfig, serializeSchema, absoluteURL } from "../src/lib/site";
import {
  sitemapEntries,
  calculatorMetadata,
  calculatorSchema,
  contentUpdatedOn,
} from "../src/lib/seo";
import { guides } from "../src/lib/guides";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
// Later wording reviews supersede the historical content dates asserted below.
const wordingReviewDates:Record<string,string>={
 ...Object.fromEntries(["/wacc-calculator.html", "/capm-calculator.html", "/cd-early-withdrawal-penalty-calculator.html", "/burn-rate-calculator.html", "/bond-duration-calculator.html", "/glossary/weighted-average-cost-of-capital/", "/glossary/capital-asset-pricing-model/", "/glossary/bond-duration/", "/glossary/cd-early-withdrawal-penalty/", "/glossary/burn-rate/", "/guides/how-to-calculate-wacc/", "/guides/capm-cost-of-equity-and-market-risk-premium/", "/guides/macaulay-vs-modified-duration/", "/guides/how-to-calculate-cd-early-withdrawal-penalty/", "/guides/gross-vs-net-burn-rate-and-cash-runway/"].map(path=>[path,'2026-11-16'])),
 ...Object.fromEntries(['/capital-gains-tax-calculator.html','/credit-utilization-calculator.html','/auto-lease-calculator.html','/present-value-calculator.html','/annuity-calculator.html','/glossary/apy/','/compound-interest-calculator.html','/cd-calculator.html','/glossary/internal-rate-of-return/','/irr-calculator.html','/rental-property-calculator.html','/mirr-calculator.html','/glossary/net-present-value/','/payback-period-calculator.html','/npv-calculator.html','/glossary/gross-vs-net-pay/','/salary-calculator.html','/paycheck-calculator.html','/budget-calculator.html','/glossary/roth-ira-five-year-rules/','/roth-conversion-ladder-calculator.html'].map(path=>[path,'2026-11-10'])),
 ...Object.fromEntries(['/glossary/','/glossary/down-payment/','/down-payment-calculator.html','/mortgage-calculator.html','/auto-loan-calculator.html','/house-hacking-calculator.html'].map(path=>[path,'2026-11-14'])),
 ...Object.fromEntries(['/credit-card-minimum-payment-calculator.html','/boat-loan-calculator.html'].map(path=>[path,'2026-11-15'])),
 ...Object.fromEntries(['/guides/','/guides/balance-transfer-vs-personal-loan/','/guides/compound-interest-with-monthly-contributions/','/guides/how-to-read-amortization-and-loan-payments/','/guides/irr-vs-npv/','/financial-calculator.html','/business-calculators.html','/savings-investment-calculators.html','/glossary/'].map(path=>[path,'2026-11-16'])),
 ...Object.fromEntries(['/financial-calculator.html','/real-estate-calculator.html','/savings-investment-calculators.html','/retirement-calculators.html','/business-calculators.html','/guides/','/glossary/'].map(path=>[path,'2026-11-17'])),
 ...Object.fromEntries(["/mortgage-buydown-calculator.html", "/cash-secured-put-calculator.html", "/profitability-index-calculator.html", "/return-on-equity-calculator.html", "/72t-calculator.html", "/guides/2-1-vs-3-2-1-mortgage-buydown/", "/guides/cash-secured-put-vs-covered-call/", "/guides/profitability-index-vs-npv/", "/guides/roe-dupont-analysis/", "/guides/72t-sepp-methods-and-rules/", "/glossary/temporary-mortgage-buydown/", "/glossary/cash-secured-put/", "/glossary/profitability-index/", "/glossary/return-on-equity/", "/glossary/substantially-equal-periodic-payments/"].map(path=>[path,'2026-11-17'])),
 ...Object.fromEntries(["/credit-card-rewards-calculator.html", "/guides/cash-back-vs-points-and-annual-fees/", "/glossary/credit-card-rewards/", "/accounts-receivable-turnover-calculator.html", "/guides/receivables-turnover-vs-dso/", "/glossary/accounts-receivable-turnover/", "/days-payable-outstanding-calculator.html", "/guides/dpo-credit-purchases-vs-cogs/", "/glossary/days-payable-outstanding/", "/cash-conversion-cycle-calculator.html", "/guides/cash-conversion-cycle-vs-operating-cycle/", "/glossary/cash-conversion-cycle/", "/roic-calculator.html", "/guides/roic-vs-roe-roi-and-wacc/", "/glossary/return-on-invested-capital/", "/interest-coverage-ratio-calculator.html", "/guides/interest-coverage-vs-dscr/", "/glossary/interest-coverage-ratio/", "/single-credit-card-payoff-calculator.html", "/balance-transfer-calculator.html", "/budget-calculator.html", "/inventory-turnover-calculator.html", "/quick-ratio-calculator.html", "/current-ratio-calculator.html", "/burn-rate-calculator.html", "/return-on-equity-calculator.html", "/wacc-calculator.html", "/npv-calculator.html", "/roi-calculator.html", "/dscr-calculator.html", "/business-loan-calculator.html", "/financial-calculator.html", "/loan-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"].map(path=>[path,'2026-11-17'])),
 ...Object.fromEntries(["/stock-split-calculator.html", "/guides/stock-split-vs-reverse-stock-split/", "/glossary/stock-split/", "/customer-acquisition-cost-calculator.html", "/guides/customer-acquisition-cost-vs-roas/", "/glossary/customer-acquisition-cost/", "/dividend-discount-model-calculator.html", "/guides/dividend-discount-model-vs-dividend-reinvestment/", "/glossary/dividend-discount-model/", "/earnings-per-share-calculator.html", "/guides/basic-eps-vs-diluted-eps/", "/glossary/earnings-per-share/", "/sharpe-ratio-calculator.html", "/guides/sharpe-ratio-vs-total-return/", "/glossary/sharpe-ratio/", "/black-scholes-calculator.html", "/guides/option-theoretical-value-vs-expiration-payoff/", "/glossary/black-scholes-model/", "/stock-average-calculator.html", "/stock-profit-calculator.html", "/roas-calculator.html", "/break-even-calculator.html", "/margin-calculator.html", "/drip-calculator.html", "/capm-calculator.html", "/return-on-equity-calculator.html", "/present-value-calculator.html", "/roic-calculator.html", "/average-return-calculator.html", "/real-return-calculator.html", "/covered-call-calculator.html", "/cash-secured-put-calculator.html", "/financial-calculator.html", "/savings-investment-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"].map(path=>[path,'2026-11-17'])),
 ...Object.fromEntries(["/stock-split-calculator.html", "/customer-acquisition-cost-calculator.html", "/dividend-discount-model-calculator.html", "/earnings-per-share-calculator.html", "/sharpe-ratio-calculator.html", "/black-scholes-calculator.html", "/mortgage-buydown-calculator.html", "/cash-secured-put-calculator.html", "/profitability-index-calculator.html", "/return-on-equity-calculator.html", "/72t-calculator.html"].map(path=>[path,'2026-11-18'])),
 ...Object.fromEntries(["/mortgage-buydown-calculator.html", "/profitability-index-calculator.html", "/return-on-equity-calculator.html", "/72t-calculator.html", "/credit-card-rewards-calculator.html", "/accounts-receivable-turnover-calculator.html", "/days-payable-outstanding-calculator.html", "/cash-conversion-cycle-calculator.html", "/roic-calculator.html", "/interest-coverage-ratio-calculator.html", "/stock-split-calculator.html", "/customer-acquisition-cost-calculator.html", "/dividend-discount-model-calculator.html", "/earnings-per-share-calculator.html", "/sharpe-ratio-calculator.html", "/black-scholes-calculator.html", "/cash-secured-put-calculator.html"].map(path=>[path,'2026-11-18'])),
 ...Object.fromEntries(["/basis-point-calculator.html", "/guides/basis-points-vs-percentage-points/", "/glossary/basis-point/", "/prorated-rent-calculator.html", "/guides/how-to-prorate-rent-by-days/", "/glossary/prorated-rent/", "/operating-cash-flow-calculator.html", "/guides/operating-cash-flow-vs-net-income/", "/glossary/operating-cash-flow/", "/interest-rate-calculator.html", "/percentage-calculator.html", "/investment-fee-calculator.html", "/rent-affordability-calculator.html", "/rental-property-calculator.html", "/vacancy-rate-calculator.html", "/cash-conversion-cycle-calculator.html", "/roic-calculator.html", "/burn-rate-calculator.html", "/financial-calculator.html", "/real-estate-calculator.html", "/savings-investment-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"].map(path=>[path,'2026-11-18'])),
 ...Object.fromEntries(["/72t-calculator.html", "/accounts-receivable-turnover-calculator.html", "/average-return-calculator.html", "/black-scholes-calculator.html", "/cash-conversion-cycle-calculator.html", "/cash-secured-put-calculator.html", "/covered-call-calculator.html", "/single-credit-card-payoff-calculator.html", "/credit-card-rewards-calculator.html", "/customer-acquisition-cost-calculator.html", "/days-payable-outstanding-calculator.html", "/dividend-discount-model-calculator.html", "/drip-calculator.html", "/dscr-calculator.html", "/earnings-per-share-calculator.html", "/glossary/", "/glossary/accounts-receivable-turnover/", "/glossary/black-scholes-model/", "/glossary/cash-conversion-cycle/", "/glossary/cash-secured-put/", "/glossary/credit-card-rewards/", "/glossary/customer-acquisition-cost/", "/glossary/days-payable-outstanding/", "/glossary/dividend-discount-model/", "/glossary/earnings-per-share/", "/glossary/interest-coverage-ratio/", "/glossary/profitability-index/", "/glossary/return-on-equity/", "/glossary/return-on-invested-capital/", "/glossary/sharpe-ratio/", "/glossary/stock-split/", "/glossary/substantially-equal-periodic-payments/", "/glossary/temporary-mortgage-buydown/", "/guides/", "/guides/2-1-vs-3-2-1-mortgage-buydown/", "/guides/72t-sepp-methods-and-rules/", "/guides/basic-eps-vs-diluted-eps/", "/guides/cash-back-vs-points-and-annual-fees/", "/guides/cash-conversion-cycle-vs-operating-cycle/", "/guides/cash-secured-put-vs-covered-call/", "/guides/customer-acquisition-cost-vs-roas/", "/guides/dividend-discount-model-vs-dividend-reinvestment/", "/guides/dpo-credit-purchases-vs-cogs/", "/guides/interest-coverage-vs-dscr/", "/guides/option-theoretical-value-vs-expiration-payoff/", "/guides/profitability-index-vs-npv/", "/guides/receivables-turnover-vs-dso/", "/guides/roe-dupont-analysis/", "/guides/roic-vs-roe-roi-and-wacc/", "/guides/sharpe-ratio-vs-total-return/", "/guides/stock-split-vs-reverse-stock-split/", "/interest-coverage-ratio-calculator.html", "/inventory-turnover-calculator.html", "/ira-calculator.html", "/mortgage-buydown-calculator.html", "/mortgage-calculator.html", "/npv-calculator.html", "/profitability-index-calculator.html", "/return-on-equity-calculator.html", "/roas-calculator.html", "/roi-calculator.html", "/roic-calculator.html", "/sharpe-ratio-calculator.html", "/stock-average-calculator.html", "/stock-split-calculator.html"].map(path=>[path,'2026-11-18'])),
 ...Object.fromEntries(["/balance-transfer-calculator.html", "/break-even-calculator.html", "/budget-calculator.html", "/burn-rate-calculator.html", "/business-calculators.html", "/business-loan-calculator.html", "/capm-calculator.html", "/closing-cost-calculator.html", "/current-ratio-calculator.html", "/discount-points-calculator.html", "/irr-calculator.html", "/loan-calculators.html", "/margin-calculator.html", "/mirr-calculator.html", "/mortgage-comparison-calculator.html", "/payback-period-calculator.html", "/present-value-calculator.html", "/quick-ratio-calculator.html", "/real-estate-calculator.html", "/real-return-calculator.html", "/retirement-calculators.html", "/retirement-withdrawal-calculator.html", "/rmd-calculator.html", "/roth-conversion-ladder-calculator.html", "/savings-investment-calculators.html", "/stock-profit-calculator.html", "/wacc-calculator.html"].map(path=>[path,'2026-11-18'])),
 ...Object.fromEntries(["/glossary/weighted-average-cost-of-capital/", "/glossary/capital-asset-pricing-model/", "/glossary/bond-duration/", "/glossary/cd-early-withdrawal-penalty/", "/glossary/burn-rate/", "/glossary/lean-fire/", "/glossary/fat-fire/", "/glossary/", "/wacc-calculator.html", "/capm-calculator.html", "/bond-duration-calculator.html", "/bond-calculator.html", "/cd-early-withdrawal-penalty-calculator.html", "/cd-calculator.html", "/burn-rate-calculator.html", "/current-ratio-calculator.html", "/guides/how-to-calculate-wacc/", "/guides/capm-cost-of-equity-and-market-risk-premium/", "/guides/macaulay-vs-modified-duration/", "/guides/how-to-calculate-cd-early-withdrawal-penalty/", "/guides/gross-vs-net-burn-rate-and-cash-runway/"].map(path=>[path,'2026-11-18'])),
 ...Object.fromEntries(["/boat-loan-calculator.html", "/compound-interest-calculator.html", "/savings-calculator.html", "/guides/how-to-calculate-boat-loan-payments/", "/guides/compound-interest-with-monthly-contributions/", "/guides/how-to-calculate-savings-goal/"].map(path=>[path,'2026-11-19'])),
};
Object.assign(wordingReviewDates,Object.fromEntries(["/1031-exchange-calculator.html", "/apr-calculator.html", "/basis-point-calculator.html", "/burn-rate-calculator.html", "/business-calculators.html", "/business-loan-calculator.html", "/capital-gains-tax-calculator.html", "/dca-calculator.html", "/dscr-calculator.html", "/financial-calculator.html", "/glossary/", "/guides/", "/home-maintenance-cost-calculator.html", "/investment-calculator.html", "/lease-calculator.html", "/loan-calculators.html", "/mortgage-calculator.html", "/mortgage-comparison-calculator.html", "/noi-calculator.html", "/operating-cash-flow-calculator.html", "/prorated-rent-calculator.html", "/real-estate-calculator.html", "/refinance-calculator.html", "/rental-property-calculator.html", "/savings-investment-calculators.html", "/stock-average-calculator.html", "/tax-income-calculators.html", "/vacancy-rate-calculator.html", "/arm-mortgage-calculator.html", "/business-line-of-credit-calculator.html", "/glossary/adjustable-rate-mortgage/", "/glossary/business-line-of-credit/", "/glossary/portfolio-rebalancing/", "/glossary/triple-net-lease/", "/guides/arm-vs-fixed-mortgage-rate-caps/", "/guides/business-line-of-credit-vs-term-loan/", "/guides/nnn-vs-gross-lease-cost/", "/guides/rebalance-with-contributions-vs-selling/", "/portfolio-rebalancing-calculator.html", "/triple-net-lease-calculator.html"].map(path=>[path,'2026-11-18'])));
Object.assign(wordingReviewDates,Object.fromEntries(["/1031-exchange-calculator.html", "/apr-calculator.html", "/average-return-calculator.html", "/business-calculators.html", "/business-loan-calculator.html", "/cap-rate-calculator.html", "/capital-gains-tax-calculator.html", "/cash-on-cash-return-calculator.html", "/coast-fire-calculator.html", "/credit-utilization-calculator.html", "/current-ratio-calculator.html", "/debt-payoff-calculator.html", "/debt-to-equity-ratio-calculator.html", "/dividend-discount-model-calculator.html", "/dscr-calculator.html", "/financial-calculator.html", "/glossary/", "/glossary/sustainable-growth-rate/", "/guides/", "/guides/4-percent-rule/", "/guides/401k-vs-roth-ira/", "/guides/apr-vs-interest-rate/", "/guides/are-mortgage-points-worth-it/", "/guides/balance-transfer-vs-personal-loan/", "/guides/barista-fire-vs-coast-fire/", "/guides/biweekly-vs-monthly-mortgage-payments/", "/guides/cash-out-refinance-vs-heloc/", "/guides/debt-snowball-vs-avalanche/", "/guides/down-payment-and-closing-cost-cash/", "/guides/grm-vs-cap-rate-gross-rent-and-noi/", "/guides/gross-margin-vs-net-margin/", "/guides/how-does-a-1031-exchange-work/", "/guides/how-much-money-do-i-need-to-retire/", "/guides/how-much-to-budget-for-home-maintenance/", "/guides/how-soon-can-you-refinance-a-mortgage/", "/guides/how-to-calculate-capital-gains-tax/", "/guides/how-to-calculate-coast-fire/", "/guides/how-to-calculate-credit-utilization/", "/guides/how-to-calculate-debt-avalanche/", "/guides/how-to-calculate-debt-snowball/", "/guides/how-to-calculate-net-operating-income/", "/guides/how-to-calculate-rental-property-cash-flow/", "/guides/how-to-calculate-rental-vacancy-rate/", "/guides/how-to-calculate-stock-profit/", "/guides/how-to-prorate-rent-by-days/", "/guides/hsa-vs-fsa/", "/guides/is-refinancing-worth-it/", "/guides/nnn-vs-gross-lease-cost/", "/guides/pay-off-mortgage-or-invest/", "/guides/rent-vs-buy-a-house/", "/guides/roth-conversion-taxes/", "/guides/roth-ira-vs-traditional-ira/", "/guides/sba-7a-vs-504-loan-payments/", "/guides/should-i-pay-off-debt-or-save/", "/guides/simple-interest-vs-compound-interest/", "/guides/sustainable-growth-rate-vs-actual-growth/", "/home-maintenance-cost-calculator.html", "/house-affordability-calculator.html", "/investment-calculator.html", "/ira-calculator.html", "/mortgage-calculator.html", "/mortgage-payoff-calculator.html", "/noi-calculator.html", "/operating-cash-flow-calculator.html", "/personal-loan-calculator.html", "/refinance-calculator.html", "/rent-affordability-calculator.html", "/rental-property-calculator.html", "/retirement-calculator.html", "/return-on-equity-calculator.html", "/sustainable-growth-rate-calculator.html", "/vacancy-rate-calculator.html"].map(path=>[path,'2026-11-18'])));
function assertContentDate(path:string,historicalDate:string){
 assert.equal(contentUpdatedOn[path],wordingReviewDates[path]??historicalDate,path);
}

test("SEO defaults never invent a public origin or enable preview indexing", () => {
  assert.deepEqual(siteConfig({}), { origin: undefined, indexable: false });
  assert.equal(
    siteConfig({
      SITE_URL: "https://finance.example",
      SITE_INDEXABLE: "true",
      VERCEL_ENV: "preview",
    }).indexable,
    false,
  );
  assert.equal(
    siteConfig({ SITE_URL: "https://finance.example", SITE_INDEXABLE: "true" })
      .indexable,
    true,
  );
  assert.throws(() => siteConfig({ SITE_INDEXABLE: "true" }), /SITE_URL/);
  for (const url of [
    "http://finance.example",
    "https://finance.example/path",
    "https://user:pass@finance.example",
    "https://finance.example/?q=1",
    "https://finance.example/#x",
  ])
    assert.throws(() => siteConfig({ SITE_URL: url }));
});
const ratioPropertyPaths=['/sortino-ratio-calculator.html','/gross-rent-multiplier-calculator.html','/debt-to-equity-ratio-calculator.html','/guides/sortino-vs-sharpe-target-and-downside/','/guides/grm-vs-cap-rate-gross-rent-and-noi/','/guides/debt-to-equity-definitions-and-capital-changes/','/glossary/sortino-ratio/','/glossary/gross-rent-multiplier/','/glossary/debt-to-equity-ratio/'];
for(const path of ratioPropertyPaths)wordingReviewDates[path]='2026-11-18';
test("Production sitemap lists canonical pages and only reviewed content dates", () => {
  const config = siteConfig({
    SITE_URL: "https://finance.example/",
    SITE_INDEXABLE: "true",
  });
  const entries = sitemapEntries(config);
  assert.equal(entries.length,469);
  for(const [path,date] of Object.entries(wordingReviewDates))assert.equal(contentUpdatedOn[path],date,path);
  for(const path of depthReviewPaths)assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':'2026-11-02');
  assert.ok(entries.some(e=>new URL(e.url).pathname==='/disclaimer.html'));
  assertContentDate('/fat-fire-calculator.html','2026-10-29');
  assertContentDate('/lean-fire-calculator.html','2026-10-29');
  assert.equal(new Set(entries.map((e) => e.url)).size, entries.length);
  assert.ok(
    entries.every(
      (e) =>
        e.url.startsWith("https://finance.example/") &&
        !e.url.includes("?") && !e.url.includes("#") &&
        e.lastModified === contentUpdatedOn[new URL(e.url).pathname],
    ),
  );
  assert.ok(
    !entries.some(
      (e) => e.url === "https://finance.example/" || e.url.includes("/api/"),
    ),
  );
  assert.equal(sitemapEntries(siteConfig({})).length, 0);
  assert.equal(entries.filter(e=>e.lastModified).length,Object.keys(contentUpdatedOn).length);
  assertContentDate('/mortgage-calculator.html','2026-11-04');
  assertContentDate('/guides/','2026-11-06');
  for(const path of ['/seller-financing-calculator.html','/fix-and-flip-calculator.html','/pmi-calculator.html','/house-affordability-calculator.html','/glossary/interest-only-and-balloon-loans/','/glossary/private-mortgage-insurance/','/glossary/debt-to-income-ratio/','/glossary/down-payment/'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-01');
  for(const path of ['/stock-profit-calculator.html','/stock-average-calculator.html','/irr-calculator.html','/mirr-calculator.html','/glossary/return-on-investment/','/glossary/internal-rate-of-return/','/glossary/modified-internal-rate-of-return/'])assertContentDate(path,path==='/stock-average-calculator.html'?'2026-11-05':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-01');
  for(const path of ['/noi-calculator.html','/cap-rate-calculator.html','/rental-property-calculator.html','/heloc-calculator.html','/glossary/net-operating-income/','/glossary/cap-rate-vs-cash-on-cash-return/','/glossary/home-equity-and-heloc/'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-01');
  for(const path of ['/guides/pay-off-mortgage-or-invest/','/guides/should-you-reinvest-dividends/','/guides/roth-conversion-ladder/'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-10-31');
  assertContentDate('/privacy.html','2026-11-02');
  assertContentDate('/about.html','2026-11-02');
  assertContentDate('/methodology.html','2026-11-02');
  assertContentDate('/401k-calculator.html','2026-11-04');
  assertContentDate('/rmd-calculator.html','2026-11-01');
  assertContentDate('/guides/debt-snowball-vs-avalanche/','2026-10-30');
  assertContentDate('/guides/mortgage-recast-vs-refinance/','2026-10-30');
  for (const path of ['/investment-calculator.html','/irr-calculator.html','/social-security-calculator.html','/pension-calculator.html','/annuity-calculator.html','/annuity-payout-calculator.html','/rental-property-calculator.html','/debt-consolidation-calculator.html','/business-loan-calculator.html','/budget-calculator.html','/break-even-calculator.html','/roi-calculator.html','/noi-calculator.html','/fire-calculator.html','/mirr-calculator.html','/guides/how-to-calculate-coast-fire/','/coast-fire-calculator.html','/roas-calculator.html','/landed-cost-calculator.html','/quick-ratio-calculator.html','/current-ratio-calculator.html','/boat-loan-calculator.html','/auto-lease-calculator.html','/cash-back-or-low-interest-calculator.html','/heloc-calculator.html','/home-equity-loan-calculator.html','/student-loan-calculator.html','/personal-loan-calculator.html','/retirement-calculator.html','/roth-ira-calculator.html','/house-affordability-calculator.html','/fha-loan-calculator.html','/va-mortgage-calculator.html','/pmi-calculator.html']) assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02': remainingReviewPaths.includes(path)?'2026-11-01':['/budget-calculator.html','/rent-affordability-calculator.html','/savings-calculator.html','/simple-interest-calculator.html','/fha-loan-calculator.html','/va-mortgage-calculator.html','/auto-lease-calculator.html','/cash-back-or-low-interest-calculator.html','/auto-loan-calculator.html','/boat-loan-calculator.html','/home-equity-loan-calculator.html','/debt-consolidation-calculator.html','/pension-calculator.html','/social-security-calculator.html','/annuity-calculator.html','/annuity-payout-calculator.html','/roi-calculator.html','/break-even-calculator.html','/personal-loan-calculator.html','/student-loan-calculator.html','/business-loan-calculator.html','/pmi-calculator.html','/house-affordability-calculator.html','/irr-calculator.html','/mirr-calculator.html','/retirement-calculator.html','/noi-calculator.html','/rental-property-calculator.html','/heloc-calculator.html'].includes(path) ? '2026-11-01' : ['/guides/how-to-calculate-coast-fire/','/coast-fire-calculator.html','/roi-calculator.html','/landed-cost-calculator.html'].includes(path) ? '2026-10-31' : path.startsWith('/guides/') || ['/coast-fire-calculator.html','/roas-calculator.html'].includes(path) ? '2026-10-30' : ['/coast-fire-calculator.html','/roi-calculator.html','/roas-calculator.html','/retirement-calculators.html','/loan-calculators.html'].includes(path) ? '2026-10-29' : '2026-10-28');
  for(const path of ['/coast-fire-calculator.html','/roi-calculator.html','/rent-vs-buy-calculator.html','/multiple-credit-card-payoff-calculator.html','/brrrr-calculator.html','/roas-calculator.html'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':path==='/roi-calculator.html'?'2026-11-01':path==='/coast-fire-calculator.html'?'2026-10-31':['/brrrr-calculator.html','/roas-calculator.html'].includes(path)?'2026-10-30':'2026-10-29');
  for(const path of ['/savings-calculator.html','/simple-interest-calculator.html','/glossary/apy/','/glossary/simple-interest/'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-01');
  for(const path of ['/budget-calculator.html','/rent-affordability-calculator.html','/glossary/budget-and-savings-rate/','/glossary/debt-to-income-ratio/'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-01');
  for(const path of ['/future-value-calculator.html','/present-value-calculator.html','/glossary/time-value-of-money/'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-01');
  for(const path of remainingReviewPaths)assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':['/salary-calculator.html','/ira-calculator.html','/refinance-calculator.html'].includes(path)?'2026-11-02':'2026-11-01');
  for(const path of ['/salary-calculator.html','/ira-calculator.html','/refinance-calculator.html'])assertContentDate(path,businessReviewPaths.includes(path)?'2026-11-06':latestGuidePaths.includes(path)?'2026-11-04':contentGuidePaths.includes(path)?'2026-11-03':followupReviewPaths.includes(path)?'2026-11-02':'2026-11-02');
  assert.ok(Object.entries(contentUpdatedOn).filter(([path])=>!wordingReviewDates[path]).filter(([path])=>!businessReviewPaths.includes(path)).filter(([path])=>!['/cd-ladder-calculator.html','/npv-calculator.html','/lease-vs-buy-car-calculator.html','/mortgage-comparison-calculator.html','/financial-calculator.html'].includes(path)).filter(([path])=>!['/retirement-withdrawal-calculator.html','/balance-transfer-calculator.html','/dscr-calculator.html','/fsa-calculator.html','/closing-cost-calculator.html'].includes(path)).filter(([path])=>!latestGuidePaths.includes(path)).filter(([path])=>!contentGuidePaths.includes(path)).filter(([path])=>!followupReviewPaths.includes(path)).filter(([path])=>!['/salary-calculator.html','/ira-calculator.html','/refinance-calculator.html'].includes(path)).filter(([path])=>!remainingReviewPaths.includes(path)).filter(([path])=>!['/future-value-calculator.html','/present-value-calculator.html','/guides/how-to-calculate-future-value/','/guides/how-to-calculate-present-value/'].includes(path)).filter(([path])=>!['/budget-calculator.html','/rent-affordability-calculator.html','/guides/how-to-calculate-monthly-budget/','/guides/how-to-calculate-rent-affordability/'].includes(path)).filter(([path])=>!['/savings-calculator.html','/simple-interest-calculator.html'].includes(path)).filter(([path])=>!['/about.html','/methodology.html','/house-hacking-calculator.html','/cash-on-cash-return-calculator.html','/guides/what-is-house-hacking/','/guides/how-to-calculate-cash-on-cash-return/','/guides/how-to-calculate-landed-cost/','/compound-interest-calculator.html','/guides/annualized-return-vs-total-return/','/guides/compound-interest-with-monthly-contributions/','/guides/how-to-calculate-monthly-mortgage-payment/'].includes(path)).filter(([path])=>!['/guides/coast-fire-inflation-sensitivity/','/guides/brrrr-refinance-cash-flow-analysis/','/guides/roas-profit-margin-analysis/'].includes(path)&&!['/stock-profit-calculator.html','/stock-average-calculator.html','/seller-financing-calculator.html','/fix-and-flip-calculator.html','/cap-rate-calculator.html','/credit-card-minimum-payment-calculator.html','/roth-conversion-ladder-calculator.html','/drip-calculator.html','/embed-resources','/rent-vs-buy-calculator.html','/covered-call-calculator.html','/house-hacking-calculator.html','/pay-off-mortgage-vs-invest-calculator.html','/cash-on-cash-return-calculator.html','/brrrr-calculator.html','/barista-fire-calculator.html','/guides/barista-fire-vs-coast-fire/','/self-employment-tax-calculator.html','/apr-calculator.html','/hsa-calculator.html','/debt-snowball-calculator.html','/debt-avalanche-calculator.html','/guides/how-to-calculate-debt-snowball/','/guides/how-to-calculate-debt-avalanche/','/fat-fire-calculator.html','/lean-fire-calculator.html','/investment-calculator.html','/irr-calculator.html','/social-security-calculator.html','/pension-calculator.html','/annuity-calculator.html','/annuity-payout-calculator.html','/rental-property-calculator.html','/debt-consolidation-calculator.html','/business-loan-calculator.html','/budget-calculator.html','/break-even-calculator.html','/roi-calculator.html','/noi-calculator.html','/fire-calculator.html','/mirr-calculator.html','/guides/how-to-calculate-coast-fire/','/coast-fire-calculator.html','/roas-calculator.html','/landed-cost-calculator.html','/quick-ratio-calculator.html','/current-ratio-calculator.html','/boat-loan-calculator.html','/auto-lease-calculator.html','/cash-back-or-low-interest-calculator.html','/heloc-calculator.html','/home-equity-loan-calculator.html','/student-loan-calculator.html','/personal-loan-calculator.html','/retirement-calculator.html','/401k-calculator.html','/roth-ira-calculator.html','/rmd-calculator.html','/house-affordability-calculator.html','/fha-loan-calculator.html','/va-mortgage-calculator.html','/guides/margin-vs-markup/','/salary-calculator.html','/paycheck-calculator.html','/single-credit-card-payoff-calculator.html','/multiple-credit-card-payoff-calculator.html','/loan-repayment-calculator.html','/rent-affordability-calculator.html','/currency-converter.html','/margin-calculator.html','/markup-calculator.html','/guides/should-i-pay-off-debt-or-save/','/guides/apr-vs-interest-rate/','/guides/is-refinancing-worth-it/','/guides/roth-ira-vs-traditional-ira/','/guides/how-much-emergency-fund-should-i-have/','/guides/rent-vs-buy-a-house/','/guides/are-mortgage-points-worth-it/','/guides/pay-off-car-loan-early/','/guides/biweekly-vs-monthly-mortgage-payments/','/guides/cd-vs-savings-account/','/retirement-calculators.html','/tax-income-calculators.html','/business-calculators.html','/everyday-calculators.html','/privacy.html','/guides/debt-snowball-vs-avalanche/','/guides/','/guides/mortgage-recast-vs-refinance/','/mortgage-calculator.html','/pmi-calculator.html','/biweekly-mortgage-calculator.html','/discount-points-calculator.html','/real-estate-calculator.html','/loan-calculators.html','/savings-investment-calculators.html','/cd-calculator.html','/mortgage-recast-calculator.html','/tax-equivalent-yield-calculator.html','/treasury-bill-calculator.html'].includes(path)).filter(([path])=>!['/guides/how-long-will-retirement-savings-last/','/guides/how-does-an-hsa-work/','/guides/how-to-calculate-rmd/','/guides/how-401k-matching-works/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-net-operating-income/','/guides/how-to-calculate-cap-rate/','/guides/how-to-calculate-rental-property-cash-flow/','/guides/how-are-heloc-payments-calculated/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-stock-profit/','/guides/how-to-calculate-average-stock-price/','/guides/how-to-calculate-irr/','/guides/how-to-calculate-mirr/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-seller-financing/','/guides/how-to-calculate-house-flipping-profit/','/guides/how-to-calculate-pmi-and-cancellation/','/guides/how-much-house-can-i-afford/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-personal-loan-payments/','/guides/how-to-calculate-student-loan-payments/','/guides/how-to-calculate-business-loan-payments/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-roi/','/guides/how-to-calculate-break-even-point/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-annuity-future-value/','/guides/how-to-calculate-annuity-payouts/'].includes(path)).filter(([path])=>!['/guides/pension-lump-sum-vs-monthly-payments/','/guides/how-to-compare-social-security-claiming-ages/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-home-equity-loan-payments/','/guides/how-to-compare-debt-consolidation-loans/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-auto-loan-payments/','/guides/how-to-calculate-boat-loan-payments/'].includes(path)).filter(([path])=>path!=='/auto-loan-calculator.html').filter(([path])=>!['/guides/how-to-calculate-auto-lease-payments/','/guides/cash-rebate-vs-low-interest-financing/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-fha-loan-payments/','/guides/how-to-calculate-va-loan-payments/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-savings-goal/','/guides/how-to-calculate-simple-interest/'].includes(path)).filter(([path])=>!path.startsWith('/glossary/')&&!['/guides/pay-off-mortgage-or-invest/','/guides/should-you-reinvest-dividends/','/guides/roth-conversion-ladder/'].includes(path)).filter(([path])=>!["/1031-exchange-calculator.html", "/home-maintenance-cost-calculator.html", "/vacancy-rate-calculator.html", "/credit-utilization-calculator.html", "/dca-calculator.html", "/rule-of-72-calculator.html", "/capital-gains-tax-calculator.html"].includes(path)).filter(([path])=>!["/guides/how-does-a-1031-exchange-work/", "/guides/how-much-to-budget-for-home-maintenance/", "/guides/how-to-calculate-rental-vacancy-rate/", "/guides/how-to-calculate-credit-utilization/", "/guides/how-to-calculate-capital-gains-tax/"].includes(path)).every(([,date])=>date==='2026-10-25'));
  assert.ok(!entries.some(e=>e.url.endsWith('/llms.txt')||e.url.endsWith('/sitemap.xml')));
});
test("Calculator canonicals consolidate shared query variants and schema matches the real app", () => {
  const calc = calculators.find((c) => c.id === "vat")!,
    config = siteConfig({
      SITE_URL: "https://finance.example",
      SITE_INDEXABLE: "true",
    });
  const metadata = calculatorMetadata(calc, config);
  assert.equal(
    metadata.alternates?.canonical,
    "https://finance.example/vat-calculator.html",
  );
  const schema = calculatorSchema(calc, config);
  assert.equal(schema["@graph"][0].name, calc.title);
  assert.ok(schema["@graph"].some((x) => x["@type"] === "BreadcrumbList"));
  const text = serializeSchema(schema);
  assert.ok(!text.includes("aggregateRating") && !text.includes("reviewedBy"));
  assert.ok(
    !serializeSchema({ value: "</script><script>alert(1)</script>" }).includes(
      "<",
    ),
  );
  assert.ok(
    !JSON.stringify(calculatorMetadata(calc, siteConfig({}))).includes(
      "finance.example",
    ),
  );
});
for (const [id, guide] of Object.entries(guides))
  for (const example of guide.examples)
    test("Published worked example: " + id + " / " + example.title, () => {
      const mode = calculators
        .find((c) => c.id === id)!
        .modes.find((m) => m.id === example.mode)!;
      assert.ok(mode);
      const result = runCalculation(id, mode.id, {
        ...defaults(mode),
        ...Object.fromEntries(
          Object.entries(example.values).map(([k, v]) => [k, String(v)]),
        ),
      });
      const metric = result.metrics.find(
        (m) => m.label === example.expected.label,
      );
      assert.ok(metric);
      assert.ok(
        Math.abs(metric.value - example.expected.value) <=
          (example.expected.tolerance ?? 0.005),
        `${metric.value} != ${example.expected.value}`,
      );
      assert.ok(guide.scope.length > 50 && guide.sources.length > 0);
    });

import { relatedCalculatorIds } from "../src/lib/guides";
test("Contextual related tools are real, distinct and not self-links", () => {
  for (const [id, related] of Object.entries(relatedCalculatorIds)) {
    assert.ok(calculators.some((c) => c.id === id));
    assert.equal(new Set(related).size, related.length);
    for (const link of related) {
      assert.notEqual(link, id);
      assert.ok(
        calculators.some((c) => c.id === link),
        link,
      );
    }
  }
});

test("Every functional calculator has a unique guide, reproducible examples and specific questions", () => {
  const tools=calculators.filter(c=>!c.directory);
  assert.equal(tools.length,168);
  assert.equal(Object.keys(guides).length,168);
  assert.equal(new Set(Object.values(guides).map(g=>g.summary)).size,168);
  for(const tool of tools){
    const guide=guides[tool.id];assert.ok(guide,tool.id);
    assert.ok(guide.summary.length>80 && guide.scope.length>50,tool.id);
    assert.ok(guide.questions.length>=2 && guide.examples.length>=1,tool.id);
    assert.equal(new Set(guide.questions.map(q=>q.question)).size,guide.questions.length);
    for(const e of guide.examples){
      const mode=tool.modes.find(m=>m.id===e.mode)!;
      for(const [key,value] of Object.entries(e.values)){
        const field=mode.fields.find(f=>f.key===key);assert.ok(field,tool.id+key);
        if(field.options)assert.ok(field.options.includes(String(value)),tool.id+key);
      }
    }
  }
});


test("Production SEO follows the confirmed www extensionless destination while old routes stay intact", () => {
 for (const origin of ["https://calculatorfree.io", "https://www.calculatorfree.io"]) {
  const config=siteConfig({SITE_URL:origin,SITE_INDEXABLE:"true"});
  assert.equal(config.origin,"https://www.calculatorfree.io");
  assert.equal(absoluteURL("/cd-calculator.html",config),"https://www.calculatorfree.io/cd-calculator");
  assert.equal(absoluteURL("/glossary/",config),"https://www.calculatorfree.io/glossary/");
  const entries=sitemapEntries(config);
  assert.equal(entries.length,469);
  for(const [path,date] of Object.entries(wordingReviewDates))assert.equal(contentUpdatedOn[path],date,path);
  assert.equal(new Set(entries.map(e=>e.url)).size,entries.length);
  assert.ok(entries.every(e=>e.url.startsWith("https://www.calculatorfree.io/")&&!e.url.endsWith(".html")&&!e.url.includes("?")));
  for (const calc of calculators.filter(c=>!c.directory)) {
   const app=calculatorSchema(calc,config)["@graph"][0];
   assert.equal(app.url,calculatorMetadata(calc,config).alternates?.canonical);
   assert.deepEqual(app.offers,{"@type":"Offer",price:"0",priceCurrency:"USD",url:app.url});
   assert.ok(!("aggregateRating" in app)&&!("review" in app));
  }
 }
 assert.equal(absoluteURL("/cd-calculator.html",siteConfig({SITE_URL:"https://finance.example",SITE_INDEXABLE:"true"})),"https://finance.example/cd-calculator.html");
});

Object.assign(wordingReviewDates,Object.fromEntries(["/cash-advance-fee-calculator.html", "/cobra-cost-calculator.html", "/guides/cash-advance-fees-vs-interest/", "/guides/cobra-premium-vs-payroll-deduction/", "/glossary/cash-advance-fee/", "/glossary/cobra-cost/"].map(path=>[path,'2026-11-18'])));

Object.assign(wordingReviewDates,Object.fromEntries(["/amortization-calculator.html", "/credit-card-minimum-payment-calculator.html", "/guides/how-to-read-amortization-and-loan-payments/", "/guides/credit-card-minimum-payment-and-payoff-time/"].map(path=>[path,'2026-11-19'])));
