# Sources and evidence

Accessed 2026-10-19. The source directory and all linked financial pages were read as text. Research files retain exact URLs and limits. Source text access does not verify original DOM defaults, interactive submissions, or visual parity.

- Directory: https://www.calculator.net/financial-calculator.html
- IRS 2025 ordinary tax brackets: https://www.irs.gov/irb/2024-45_IRB
- IRS updated 2025 standard deductions and 2026 inflation adjustments: https://www.irs.gov/irb/2025-45_IRB
- IRS retirement contribution limits: https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500
- IRS owner RMD factors: https://www.irs.gov/publications/p590b
- SSA wage base: https://www.ssa.gov/oact/cola/cbb.html
- SSA retirement-age and early/delayed credit evidence: research/rmd-ssa-details.json
- BLS raw CPI-U series: https://download.bls.gov/pub/time.series/cu/cu.data.1.AllItems
- Frankfurter v2 public API docs: https://frankfurter.dev/
- Actual reference snapshot: https://api.frankfurter.dev/v2/rates?base=USD and https://api.frankfurter.dev/v2/currencies
- Coinbase public spot endpoint docs: https://docs.cdp.coinbase.com/coinbase-app/track-apis/prices
- Child/dependent care 2026: https://uscode.house.gov/us/usc/119-118/t26/s21/
- IRS AMT adjustments, including senior-deduction addback: https://www.irs.gov/instructions/i6251

## Evidence boundaries

- 222 automated checks passed; default-case smoke is not complete formula verification.
- Article worked examples are distinct from submitted source-form cases.
- 71 local routes and 157 local modes passed browser interaction checks.
- Representative mobile/tablet widths: five routes; not every tool was individually tested on every viewport.
- Original form/visual parity remains unverified, and known behavior differences are in remaining-work.md.
- TinyFish was discovered as an available, uninstalled browser integration and suggested for the missing reference-browser capability. No connection has been confirmed and no TinyFish action has been performed.

### Supplemental official rule research — 2026-10-19

See `research/auto-state-rules.json` for state revenue agency statutes/guides and eligibility restrictions; `research/depreciation-details.json` for original observed partial-year controls and independent Microsoft SLN/SYD/DDB/VDB examples; `research/rent-bond-details.json` for bond pricing example and unresolved rent ratios/day-count variants. Text observations do not verify dropdown contents or live form submissions.

### Calculation audit sources — 2026-10-19

71 original page-text accesses are logged in audit-source-access.json. Original retirement/401(k)/annuity/IRR pages and IRS Schedule 1-A, Schedule A, Schedule SE and 2021 Publication 590-B were consulted for current findings; see calculation-audit.md for URLs and evidence types. Parameterized source requests for retirement and loan were inaccessible. Original default fields and live submissions remain unverified.

VAT workflow source: https://www.calculator.net/vat-calculator.html explicitly requests any two of rate/net/gross/tax. Pair formulas follow gross=net+tax and tax=net*rate. Native source submissions and error strings remain unavailable; see specs/vat.md for the independent validation policy.

SEO editorial sources are linked visibly in the ten guides in src/lib/guides.ts: GOV.UK VAT, CFPB amortization/mortgage explanations, SEC Investor.gov compound-interest definitions, IRS retirement limits, Publication 590-B and 2026 revenue procedures. Example arithmetic is independently tested. Google Search Central AI-feature/content/canonical guidance informs technical choices, without claiming special GEO markup or guaranteed inclusion. See seo-geo.md.

## 2026-10-20 content expansion

The 60 additional guides link to project methodology and each existing reference calculator URL as feature provenance, not as certification of mathematical/interaction parity. Added tax examples use already documented 2026 tables from official-rules.json and link their recorded IRS bulletin. No new tax year or policy was inferred. Independently specified elementary arithmetic/closed-form installment cases are checked in tests/seo.test.ts. Content topics are candidate intents; no keyword-volume dataset, live rankings or AI-citation dataset was obtained.

## 2026-10-21 — Independent evergreen additions

The six new tools use independently stated algebra/recurrences and local fixtures, not claimed source-site submissions. User screenshots supply keyword research (research/evergreen-keywords-2026-10-21.json); no organic-ranking difficulty is inferred from ad competition. Models and limits: evergreen-additions-2026-10-21.md and specs/{markup,cagr,emergency-fund,break-even,investment-fee,real-return}.md. Public source and test code are linked as implementation evidence rather than fabricated external review.

## 2026-10-22 — Glossary sources

Sources read with web tools for definitions and scope; examples independently computed. No claim of professional review. See glossary-2026-10-22.md.
- https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest
- https://openstax.org/books/principles-finance/pages/7-4-applications-of-tvm-in-finance
- https://syndication.finra.org/content/how-are-your-investments-doing-returns-explained
- https://www.stlouisfed.org/publications/page-one-economics/2023/01/03/adjusting-for-inflation
- https://www.investor.gov/introduction-investing/investing-basics/glossary/expense-ratio
- https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated
- https://www.investor.gov/introduction-investing/investing-basics/glossary/dollar-cost-averaging
- https://syndication.finra.org/content/benefits-and-limitations-dollar-cost-averaging
- https://www.irs.gov/retirement-plans/plan-participant-employee/401k-resource-guide-plan-participants-401k-plan-overview
- https://www.irs.gov/retirement-plans/retirement-plans-faqs-on-designated-roth-accounts
- https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits
- https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/
- https://www.consumerfinance.gov/ask-cfpb/on-a-mortgage-whats-the-difference-between-my-principal-and-interest-payment-and-my-total-monthly-payment-en-1941/
- https://www.business.qld.gov.au/running-business/marketing-sales/marketing/calculators/mark-up
- https://www.business.qld.gov.au/running-business/finance/improve-performance/ratios

## 2026-10-22 — Methodology presentation and policy references

Read current source modules/data metadata and selected documentation. Omni's editorial policy informs presentation of sources/checks/dates, not a claim of matching its personnel or peer-review process. No current-market forecast was inferred for existing defaults.

- https://www.omnicalculator.com/editorial-policies
- https://support.google.com/adsense/answer/7299563?hl=en
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://www.bls.gov/cpi/questions-and-answers.htm
- https://www.irs.gov/irb/2025-45_IRB

Existing financial source records and data dates remain unchanged. See methodology-review-2026-10-22.md for the actual scope of validation and the repository feedback check.

## 2026-10-26 — Three mortgage scenario tools

Text accessed: https://www.fncalculator.com/ ; https://www.fncalculator.com/financialcalculator?type=loanPointCalculator ; https://www.fncalculator.com/financialcalculator?type=loanBiweeklyCalculator . Observed catalog and form labels, not live numeric/visual parity. Homepage did not show a dedicated PMI entry.

Primary rules: https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/ ; https://ncua.gov/regulation-supervision/manuals-guides/federal-consumer-financial-protection-guide/compliance-management/lending-regulations/homeowners-protection-act-pmi-cancellation-act ; https://www.consumerfinance.gov/ask-cfpb/how-should-i-use-lender-credits-and-points-also-called-discount-points-en-136/ ; https://www.consumerfinance.gov/owning-a-home/compare/compare-loan-estimates/ . PMI estimate retains https://www.nationalmi.com/wp-content/uploads/2022/02/MA.MN_.BP_.2022-03.pdf (effective2022-03-01, reviewed2026-10-26), disclosed dated base estimate, not a live rate.

## 2026-10-26 — Category organization

This change uses the authorized classification proposal and the existing source catalog, captured routes/modes/default-result hashes, canonical/sitemap and redirect artifacts. No new financial or policy sources are needed because mathematical models and rules are unchanged.


### 2026-11-18 — Sortino, GRM and corporate D/E
- https://rpc.cfainstitute.org/sites/default/files/-/media/documents/code/gips/the-sortino-ratio.pdf — The role of a target return, downside deviation, denominator conventions and limitations of cross-period scaling. Concept reference. This worksheet explicitly chooses all N observations and reports a period ratio only. The source does not validate our original examples or professionally review this site.
- https://www.jpmorgan.com/insights/real-estate/commercial-term-lending/what-is-a-gross-rent-multiplier-grm — Property price divided by annual gross rent and comparison with similar properties. Concept reference; the indexed source supplied the formula, while direct body access was restricted during research. No local market multiplier, appraisal or achievable rent is supplied.
- https://www.bdc.ca/en/articles-tools/entrepreneur-toolkit/financial-tools/debt-to-equity-ratio — A documented total-liabilities / shareholders’ equity definition and the need to interpret leverage in context. BDC is a Canadian institution. Its definition is background, not a US lending requirement, unique industry standard, endorsement or professional review. Our narrower borrowing definition is identified separately.


### 2026-11-18 — SGR and reviewed internal links
- https://www.wallstreetprep.com/knowledge/sustainable-growth-rate/ — The annual ROE × retention approximation, average-equity ROE convention, and distinction between SGR at stable capital structure and internal growth without external funding. Concept background. Our fixed assumptions and original arithmetic are not a company forecast, credit approval, source endorsement or professional review.
- https://corporatefinanceinstitute.com/resources/valuation/sustainable-growth-rate/ — The retention = (net income − dividends) / net income relation and the commonly used ROE × retention formula. Concept background only. Equity-denominator conventions must be reconciled; no source certifies our implementation or the future sustainability of a company’s growth.

## Cash advance and COBRA — 2026-11-18

CFPB grace-period guidance and CMS federal COBRA facts were read as concept/rule references. Source roles and exclusions are recorded per tool/guide/term in src/lib/source-use-notes.json. They do not validate individual agreements or certify the original implementation.

## Repayment content review — 2026-11-19

Reviewed CFPB explanations of [amortization](https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/), [mortgage paydown](https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/) and the [three-year fixed payment versus minimum-payment disclosure](https://www.consumerfinance.gov/ask-cfpb/a-box-on-my-credit-card-bill-says-that-i-will-pay-off-the-balance-in-three-years-if-i-pay-a-certain-amount-what-does-that-mean-do-i-have-to-pay-that-much-if-i-pay-that-much-and-make-new-purchases-will-i-still-owe-nothing-after-three-years-en-36/). These are background explanations; the eight hypothetical numeric examples are independently recomputed with 70-digit Python Decimal. Existing Reg Z and card-agreement references remain. See repayment-content-20261119.md.

## Boat, compound growth and savings review — 2026-11-19

Read [SEC compound-interest inputs](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator), [SEC savings-goal inputs](https://www.investor.gov/financial-tools-calculators/calculators/savings-goal-calculator), and [BoatUS payment and ownership context](https://www.boatus.com/products-and-services/boat-loans). Source use is limited to definitions and boundaries, with no current-rate or underwriting promise. All 21 table cases and one rate conversion are independently recomputed with 70-digit Decimal; see growth-savings-boat-content-20261119.md.

## Mortgage, matching and balance-transfer review — 2026-11-19

Reviewed [CFPB note rate versus APR](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/), [CFPB mortgage-payment context](https://www.consumerfinance.gov/ask-cfpb/how-do-mortgage-lenders-calculate-monthly-payments-en-1965/), [IRS contributions](https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-contributions), [IRS 2026 COLA tables](https://www.irs.gov/retirement-plans/cola-increases-for-dollar-limitations-on-benefits-and-contributions), [CFPB transfer fees](https://www.consumerfinance.gov/ask-cfpb/what-is-a-balance-transfer-fee-can-a-balance-transfer-fee-be-charged-on-a-zero-percent-interest-rate-offer-en-53/) and [CFPB introductory terms](https://www.consumerfinance.gov/ask-cfpb/how-long-can-i-keep-a-low-rate-on-a-balance-transfer-or-other-introductory-rate-en-15/). Retained 2026 limits; no tax/rule engine change. Fifteen independently computed cases /199 values support the new controlled comparisons. No source certifies the hypothetical results. See mortgage-match-transfer-content-20261119.md.

## Fund fees and CD content review — 2026-11-19

Read [SEC mutual-fund fee categories](https://www.investor.gov/introduction-investing/investing-basics/glossary/mutual-fund-fees-and-expenses), [SEC fees and expenses bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/updated), and [CFPB Regulation DD definitions](https://www.consumerfinance.gov/rules-policy/regulations/1030/2/). These support fee/return-basis and APY/nominal distinctions, not current quotes, product-specific load formulas, tax treatment or external numeric certification. Fifteen hypothetical scenarios /192 numeric checks use independent 70-digit Decimal arithmetic. See fund-fees-cd-content-20261119.md.

## Auto, personal and student loan content — 2026-11-19

Read [CFPB unpaid trade-in debt](https://www.consumerfinance.gov/ask-cfpb/should-i-trade-in-my-car-if-its-not-paid-off-en-2045/), [personal installment-loan fees](https://www.consumerfinance.gov/ask-cfpb/do-personal-installment-loans-have-fees-en-2120/) and [student payment allocation](https://www.consumerfinance.gov/ask-cfpb/how-is-my-student-loan-payment-applied-to-my-account-en-605/). Concept references only: no state tax entitlement, regulatory APR classification, live quote, program eligibility or professional certification. The nineteen original examples /406 values use independent 70-digit Decimal arithmetic.

## HELOC, home equity and consolidation content — 2026-11-19

Read [CFPB HELOC features](https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-107/), [home equity loans](https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-loan-en-106/), [consolidation terms and risks](https://www.consumerfinance.gov/ask-cfpb/what-do-i-need-to-know-if-im-thinking-about-consolidating-my-credit-card-debt-en-1861/), and [loan versus HELOC](https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-home-equity-loan-and-a-home-equity-line-of-credit-heloc-en-247/). Concept references only, not certification of hypothetical figures. No universal LTV cap, actual offer, tax benefit, eligibility or regulatory APR classification is introduced. Twenty-three independent examples /601 values use 70-digit Decimal arithmetic.

## FHA, VA and affordability content — 2026-11-19

Read [HUD Mortgagee Letter 2023-05](https://www.hud.gov/sites/dfiles/OCHCO/documents/2023-05hsgml.pdf), [HUD premium calculation](https://www.hud.gov/hud-partners/housing-premium-calculation), [VA funding fees](https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/), and [CFPB housing budgets](https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/). Retained model terms are explicit: ordinary FHA table, original scheduled premium rounding and April 7, 2023 VA purchase chart. Historical HUD example rates are not reused as current rules. The new FHA examples stay within the lower base-loan band. Sources do not certify the original hypothetical arithmetic or determine eligibility. Independent Decimal references check 21 cases /732 values.

## Refinance, payoff and rent/buy content — 2026-11-19

Read [CFPB no-closing-cost refinance](https://www.consumerfinance.gov/ask-cfpb/is-there-such-a-thing-as-a-no-cost-or-no-closing-loan-or-refinancing-en-141/), [CFPB prepayment penalties](https://www.consumerfinance.gov/ask-cfpb/what-is-a-prepayment-penalty-en-1957/) and [Fannie Mae rent/buy responsibilities and costs](https://yourhome.fanniemae.com/buy/rent-vs-buy-whats-right-you). Concept references only, not certification of the original hypothetical figures. New rent/buy cases disable income-tax benefits and make no current deduction claims. Seventeen independent Decimal cases /461 numerical or absence checks cover the new comparisons and original-loan entry points.

## Priority-page remediation sources — 2026-11-19

Google traffic-drop and helpful-content documentation informed the audit boundaries; no specific algorithmic cause is asserted. New York taxable-receipt guidance (https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/taxable_receipt.htm) is scoped to that jurisdiction. GOV.UK VAT pricing guidance (https://www.gov.uk/charge-reclaim-record-vat) is scoped to UK VAT. Tax-price arithmetic is independently checked by scripts/check-tax-price-reference.py; entered example rates do not imply taxability or a current local rate. See gsc-priority-remediation-20261119.md.


## SEO/GEO guidance checked — 2026-11-21

Google AI features (https://developers.google.com/search/docs/appearance/ai-features), Google software-app structured data (https://developers.google.com/search/docs/appearance/structured-data/software-app), and OpenAI crawler documentation (https://developers.openai.com/api/docs/bots) inform the sitewide audit. These are discoverability/markup sources, not financial-model validation or evidence of search penalties. See seo-geo-audit-20261121.md.
