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


## Internal-link implementation evidence — 2026-11-21

The approved relationships come from the existing guide/definition registries and the rendered prose reviewed in the internal-link audit; no new financial rates, legal rules or numerical examples were introduced. Existing model scope supports the education and noncash-adjustment task descriptions. Google link best practices (https://developers.google.com/search/docs/crawling-indexing/links-crawlable) and AI features (https://developers.google.com/search/docs/appearance/ai-features) inform navigation and discoverability only. See internal-link-quality-implementation-20261121.md.

## Original expansion four — 2026-11-24

SEC non-GAAP interpretations section 103 (https://www.sec.gov/rules-regulations/staff-guidance/corporation-finance-interpretations/non-gaap-financial-measures) supports a net-income reconciliation and clear distinction from other adjusted measures. The operating-income bridge explicitly includes other nonoperating income/expense excluding interest and tax; it is not assumed to equal EBIT without that reconciliation.

CFPB credit-card interest (https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/) and daily-rate definitions (https://www.consumerfinance.gov/ask-cfpb/what-is-a-daily-periodic-rate-on-a-credit-card-en-46/) support daily-balance context and issuer-dependent day divisors. The implemented single-APR simple-interest estimate deliberately excludes daily compounding, grace periods and allocation. Posting-day inclusion and negative-balance treatment are stated model choices, not universal issuer rules.

CFPB construction lending (https://www.consumerfinance.gov/ask-cfpb/what-is-a-construction-loan-en-108/) establishes staged advances and a distinct permanent-loan stage; it does not prescribe a universal day convention. Actual calendar days with selected 360/365 divisor, separately paid interest and fees, no repayments and a commitment cap are explicit worksheet assumptions.

The provider input definitions at https://www.1stcommercialcredit.com/invoice-factoring-calculator inform face amount/advance/fees/reserve concepts only. Its displayed total-cash formula appears to double count the advance; that formula and all promotional rates/claims were not copied. The original model enforces advance + signed settlement = invoice face − fees, with explicit billing intervals and fee base. All five pages were read November 24. Independent Decimal arithmetic and source-use notes distinguish conceptual references from our example checks; no competitor UI or numerical parity is claimed.

## Bond ladder and Medicare IRMAA — 2026-11-24

TreasuryDirect notes (https://www.treasurydirect.gov/marketable-securities/treasury-notes/) and bills (https://www.treasurydirect.gov/marketable-securities/treasury-bills/) establish regular coupons versus discount/face redemption. Investor.gov bond FAQs (https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds) inform the risk and returned-capital distinction. Calendar anniversaries, date clamping, same-face renewals and future quoted purchase inputs are explicitly original scenario assumptions, not copied auction mechanics or live security prices.

CMS published the 2026 full Part B/Part D tables on November 14, 2025 (https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles), and the 2027 tables on November 17, 2026 (https://www.cms.gov/newsroom/fact-sheets/2027-medicare-parts-b-premiums-deductibles). Both were read in full and transcribed with provenance in src/lib/irmaa-data.json on November 24, 2026. Standard Part B is 202.90 /209.40 respectively; the MFS-lived-together top threshold is 391,000 /388,000, not a shared timeless threshold. CMS data is authoritative for the numeric tables here; immunosuppressive-drug-only Part B tables are intentionally excluded.

SSA overview (https://www.ssa.gov/benefits/medicare/medicare-premiums.html) supports AGI + tax-exempt interest, usual lookback context and determination limits. SSA POMS HI 01120.060 (https://secure.ssa.gov/apps10/poms.nsf/lnx/0601120060) supports the individual schedule for separate filers living apart all year, subject to SSA attestation. SSA POMS HI 01101.020 (https://secure.ssa.gov/apps10/poms.nsf/lnx/0601101020) cross-checks the 2026 tables. A discrepancy in the SSA consumer overview’s MFS top adjustment (487.90) was not copied: CMS and POMS establish 689.90 total /202.90 standard, i.e. 487.00 adjustment. The 2027 Federal Register PDF was opened and confirms the standard premium; no full second-source transcription of its remaining tables is claimed. Detailed source review is under /workspace/work/bond-ladder-irmaa-20261124/source-review.json.

## RSU and Section 423 ESPP — 2026-11-24

IRS Publication 15 (2026), section 7 (https://www.irs.gov/publications/p15) supports the conditional 22% optional supplemental method and 37% annual excess method; withholding is not final liability. IRS Publication 525, 2025 edition (https://www.irs.gov/publications/p525), supports Section 423 compensation and basis treatment and distinct qualifying/disqualifying formulas. Its Example 10/11 prices were independently recomputed with explicitly new illustrative 2026 dates. Form 3922 instructions, April 2025 (https://www.irs.gov/instructions/i3921), distinguish actual purchase price from grant-date hypothetical exercise price. Treasury regulation 1.423-1 (https://www.govinfo.gov/content/pkg/CFR-2025-title26-vol7/xhtml/CFR-2025-title26-vol7-sec1-423-1.html) supports the holding/employment conditions; dates alone do not certify qualification.

IRS Topic 409 (https://www.irs.gov/taxtopics/tc409) informs the separate capital holding test. IRS IRM employment-tax guidance (https://www.irs.gov/irm/part4/irm_04-023-005r) supports keeping statutory-option disposition compensation separate from RSU supplemental payroll withholding. IRS Publication 5992, June 2024 (https://www.irs.gov/pub/irs-pdf/p5992.pdf), provides RSU context but expressly is not an official pronouncement of law. All were reviewed November 24. Calendar/date conventions and entered-rate scenarios are stated model assumptions. Detailed review: /workspace/work/rsu-espp-20261124/source-review.json.

## Return on assets and mortgage assumption — 2026-11-24

The Federal Reserve December 2025 report (https://www.federalreserve.gov/publications/2025-december-supervision-and-regulation-report-accessible-version.htm), Figure 10 note, defines ROAA as net income /average assets. It supports the denominator definition, not a universal benchmark, choice of weighting or automatic annualization. Beginning/ending averaging and a supplied documented average are explicitly stated worksheet choices.

CFPB Regulation Z 1026.37(m)(2) (https://www.consumerfinance.gov/rules-policy/regulations/1026/37/) describes the assumption disclosure and possible conditions for transfer on original terms. CFPB rate/APR explanation (https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/) distinguishes the entered note rate from an APR incorporating charges. VA Form 26-6381, January 2024 revision (https://www.va.gov/forms/26-6381/), establishes an application process for assumption approval and release; it does not certify any scenario's eligibility, entitlement or charges. All were opened and reviewed November 24. No tax/fee table or actual lender quote was inferred. Independent 70-digit Decimal references check the original examples and fixed-loan mechanics.

## Merchant cash advance and backdoor Roth — 2026-11-24

Federal Reserve Consumer & Community Context, March 2025 (https://www.federalreserve.gov/publications/2025-march-consumer-community-context.htm), and FTC February 2020 staff perspective (https://www.ftc.gov/business-guidance/blog/2020/02/small-business-financing-staff-perspective-outlines-issues) support factor/remittance/fee terminology and variable-sales/reconciliation concerns. Their example rates and promotional descriptions were not copied as current offers or a statutory APR method. The original effective annual IRR uses explicit dates and Actual/365, independently checked via a per-day discount-factor root.

The final published 2026 Form 8606 (https://www.irs.gov/pub/irs-prior/f8606--2026.pdf) was opened, its ordinary allocation lines and part-II links read, and page one captured on November 24. Lines 1–5 distinguish total basis from following-year contributions; lines 6–14 aggregate the ordinary pool, cap the fraction, allocate both uses and preserve remaining basis. IRS narrative instructions (https://www.irs.gov/instructions/i8606) were the 2025 edition when checked and are labeled as context only. No 2026 draft instructions, contribution/deduction table or full-filing certification is used. Special adjustments and contribution eligibility remain outside the calculator.

## 2026-11-25 — minimum-payment navigation evidence

User-provided GSC live-test screenshots (displayed test time 2026-11-25 09:12:58) show HTTP200, allowed crawling/indexing and Calculation formula, Worked examples, Sources and Related calculators in rendered body elements. Three inaccessible resources are Google advertising requests on third-party hosts. User browser screenshots independently show the $200/138-month/$4,625.07 card example, $20 zero-interest final cap and $1,110.21/$33,224.60 amortization example. These are access/rendering and example evidence, not proof of indexing, penalty status or the cause of November 7–9 changes. No new external financial assumptions were introduced in the navigation change.
