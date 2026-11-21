# Implementation decisions

- Local-only development: no Sites registration, deployment, public hosting, account, or paid service created.
- Next.js 16.4.2 / React, TypeScript; Node.js 24+. package-lock.json pins installed dependencies.
- Reference routes were resolved from the actual directory, including tax-calculator.html and debt-ratio-calculator.html.
- 71 directory entries consist of 70 calculators and the Real Estate directory. Do not invent a formula for the directory.
- Pure numeric functions are separated from UI. Shared components render inputs and outputs; business logic remains specific to each tool.
- Original-site access: text web retrieval available; original DOM computed styles, form default values, option lists, screenshots, and form submission are NOT verified. A query-based attempt to submit a source loan example was inaccessible. No network-policy bypass attempted.
- Browser QA uses portable local Playwright and system Chromium. Its findings apply to the local implementation, not reference-site visual parity.
- Regular loan math retains floating-point precision internally; display uses two decimals. Explicit conservation and terminal-payment fixtures guard accumulated error. This does not establish parity with a lender's cent-rounded daily-interest ledger.
- Data: IRS 2025/2026, SSA 2026, IRS RMD Table II/III, BLS CPI-U through September 2026. No 2026 annual CPI fabricated; October 2025 remains missing.
- Frankfurter v2 daily-reference route; archived USD cross-rate snapshot covers 165 actual currencies and retains each component's date. Feed failure is clearly identified as saved-reference fallback. Coinbase public spot endpoint handles BTC when reachable; no stored BTC value is fabricated.
- Full one-to-one acceptance remains open until reference interactions and visual checks can run. Local route/mode availability is tracked separately from verified completion.

## 2026-10-19: schedule aggregation and documented business-rule corrections

- Added yearly views only for known repayment schemas; sum payments/interest/principal/costs, preserve ending balances and last dates. CSV exports the active view. Year labels are loan years, not calendar years.
- Auto dealer-purchase tax-base rules cover California, Texas, Florida, New York, Illinois, Massachusetts, Michigan and Washington. Rates are never inferred. Other jurisdictions and boat purchases remain manual. Eligibility restrictions and local surtaxes are stated in results. The original source prose lists Michigan as disallowing trade credits, whereas official Michigan rules allow a capped credit; use the official 2026 $12,000 cap and record the disagreement rather than reproducing an obsolete rule. See research/auto-state-rules.json.
- Cash-back comparisons include entered fees, tax, trade equity and upfront cash. Zero default tax/fees preserve an explicit no-tax comparison.
- DDB no longer forces remaining book value to salvage at the end of useful life. This matches independent Microsoft DDB examples; no implicit straight-line switch. Rounding is capped to remaining basis. Fractional useful-life years are rejected rather than silently rounded.
- Actual-days depreciation is independently defined: inclusive service date through first fiscal year end, divided by that fiscal-year length; remaining service-year fractions carry forward. Original convention labels are unverified. No MACRS claim. See research/depreciation-details.json.
- Bond coupon dates are computed from an anchored maturity day, maintaining month ends. Accrued days are exposed. Exact original 30/360 and Actual/Actual variants remain unverified. See research/rent-bond-details.json.

## 2026-10-19: explicit annual 401(k) contribution iteration

User requested annual iteration for Employee contributions. The projection already iterated annually; employee/employer summary totals now derive directly from the annual rows. No monthly contribution model or current-salary-times-years approximation is used. Each year uses its starting salary and starting age cap, grows the opening balance, adds year-end contributions, then increases salary for the next year. English description, formula and result notes state the timing, fixed 2026 caps, excluded existing balance/returns/employer match, and display rounding. Independent fixtures cover rising salaries, matching, age 49-to-50 limits and zero remaining working years. 234 checks, TypeScript and production build passed; no new browser session was run for this wording and aggregation update.

## 2026-10-19: include starting balance in employee contribution summary

User requested adding Current 401(k) balance to the Employee contributions result. This supersedes the previous summary definition. Label now reads “Employee contributions + current balance” and equals entered starting balance plus the annual employee-contribution sum. Yearly Employee rows remain new contributions only. Starting balance is included once, not added to each annual contribution or added again to projected balance. Notes clarify historical employer funds/returns may already be in starting balance, while future employer matching and future returns are excluded from this summary. Added a two-year $100,000 starting-balance fixture (summary $116,240; projected balance $131,588), zero-contribution and retirement-boundary checks. All 235 tests, typecheck and production build pass. Browser interactions were not rerun for this result/wording change.

## 2026-10-19: calculation accuracy audit

Audited all 71 directory URLs for text accessibility, cross-checked original prose/annuity schedule cases and IRS forms, and reviewed shared numerical code plus key retirement/tax business rules. Reproduced and fixed eight groups: annual retirement contribution labeling; first-year annual and first-month withdrawal inflation timing; investment zero/already-met/month-count solver errors; stationary/nearby IRR roots; RMD table effective-year mismatch and negative projections; ordinary SE earnings below $400; and MFS eligibility for qualified vehicle-interest deduction. See calculation-audit.md and tests/audit.test.ts. Retain confirmed IRS floor rounding for tips/overtime and final-half MFS SALT computation. Full same-input original submissions remain inaccessible. User-customized 401(k) starting-balance summary is preserved.

## 2026-10-19: VAT matches the documented any-two workflow

Replaced four separate VAT modes with one four-field optional-input form and a pure solver for all six known-value pairs. Zero is a real supplied value. Exact-two input checks, inconsistent price/tax detection and indeterminate zero-case errors are explicit. Clear empties all fields. Query hydration clears defaults before reading supplied VAT fields, preserving new/legacy shared links. Main financial mode count decreases by three (157 to 154) because four limited forms became one broader form; no known-value pair was removed. Original defaults/error handling/screenshot parity remain unverified. See specs/vat.md.

## 2026-10-19: SEO and AI-search readiness

Use explicit SITE_URL and SITE_INDEXABLE configuration; no guessed domain, training-bot bypass or fictional expert identity. Default previews emit noindex/follow, with an empty unadvertised sitemap. Public canonical origin and indexing require an intentional production build; Vercel preview remains noindex. Consolidate root directory via 308. All calculator models/formulas are server-visible, ten guides contain twelve tested examples and official/contextual sources, and related links are topic-specific. Schema describes actual WebApplication/WebPage/BreadcrumbList content without fake reviews or a guaranteed rich-result claim. See seo-geo.md. Financial model limitations are made visible, not concealed by SEO copy.

## 2026-10-19: usability and category loading

Retain financial math and compact layout. Improve mobile controls, accessible matching descriptions, year-end table terminology and Reset naming. Serialize form definitions/default results from the server, and dynamically load only the requested calculation category. Directory search uses the metadata catalog, not the calculation registry. See ui-performance.md for measured bytes and validation limits.

## 2026-10-19: Marriage Tax paired layout

Replace positional first-eight-field display with semantic paired sections. Keep both partners’ essential inputs visible, retain all 71 fields, group optional inputs and promote the signed tax difference as clearly labeled savings/additional tax. No tax model or defaults changed. See marriage-layout.md.

## 2026-10-20: remaining calculator guides

Add specific guides, two contextual questions and reproducible arithmetic fixtures to each of the remaining 60 functional tools. Preserve all financial engines and current UI. Keep examples server-rendered; retain honest scope for fixed 30-year rent/buy, simplified Social Security and paycheck models, manual currency quotes and program eligibility. Search intent candidates are documented without invented search-volume claims. See content-expansion.md.

## 2026-10-20 keyword ownership and feature alignment

Use the user-provided global/US English, rolling-12-month Keyword Planner screenshots to prioritize intent. Each intent has an existing primary page; no near-duplicate landing URLs are created. Add compound growth, savings-goal modes and monthly loan extra-payment comparison before claiming these capabilities in metadata. Retain conversion and original mode IDs. Directory intent search and visible shortcut buttons make the features discoverable. See keyword-implementation.md.

## 2026-10-20: globally applicable everyday tools

Add percentage, tip/bill splitting, calendar dates and unit conversion as a separate Everyday Tools category. Preserve the financial baseline of 71 entries. Support explicit display currencies, exact minor-unit share allocation, timezone-independent dates and dimension-safe metric/US/Imperial conversion. No tipping custom, currency rate or business-day calendar is inferred. See everyday-tools.md.

## 2026-10-20: HELOC annual fee

Model annual account-maintenance fees during draw only. Correct repayment, fee totals and APR cash flows; preserve the charge query key and explicitly disclose monthly averaging/pro-rating rather than claiming exact annual billing. See heloc-annual-fee.md.

## 2026-10-20: IRR numerical and timing review

Use signed log-scaled evaluation with exact same-time decimal netting, finite-input limits and conventional-flow bracketing. Preserve the bounded multiple-root search and disclose numerical limits. Reject silently rounded payment periods; label effective annual rates and period/time schedule correctly. Preserve existing mode IDs and raw numeric reference expectations. See irr-review.md.

## Scientific calculator — 2026-10-20

Added a safe expression parser, keypad, degree/radian modes and three worked examples. 431 tests and production build pass; 12 dedicated browser checks pass. See scientific-calculator.md. Public upload remains pending explicit authorization, including the preceding IRR update.

## Homepage layout — 2026-10-20

Homepage alone now uses full width with search, eight quick links, category jumps and responsive category sections. No dependency or formula changes. Production build, 11 dedicated browser checks, 20 UI regression checks and 80-page SEO build checks pass. See homepage-layout.md. Scientific/IRR upload was completed in 60ecb290; the user has explicitly authorized this homepage update for synchronization.

## Retirement parity batch — 2026-10-20

443 tests and production build pass. Added separate 401(k) retirement schedule/CSV, safe matching-rate window and infeasibility warning, early-withdrawal qualification fields, and separate annual deposits in Retirement monthly withdrawals. Three examples bring the total to 103. Source form numerical parity remains unverified; no hosted deployment; the user explicitly authorized GitHub synchronization after validation. See retirement-parity-improvements.md.

## Reference-first functionality with expert fallback — 2026-10-20

User superseded the custom 401(k) summary preference with source-first functionality, and explicitly authorized independent expert models when original behavior cannot be observed. Added a 71-entry reference-function-map.json, refreshed all corresponding specs, restored Compound Interest converter as default, and exposed documented controls/outputs across property, investment, retirement, tax, paycheck and commission. 469 tests and production build pass; 76 routes / 173 modes and all 107 examples pass browser checks. Exact original-source result parity remains unverified. No upload or hosted deployment in this batch. See strict-functionality-policy.md.

## 2026-10-21 — Six independent evergreen tools

User authorized six fixed-formula calculators based on their US Keyword Planner research. Preserve existing overlapping modes, transfer broad Markup and Investment Fee search targets to the new pages, and link rather than duplicate historical inflation or annualized-return content. Implement fee timing and net-return handling explicitly, not as a claim of daily expense-ratio precision. Keep noindex, static export and no API. See evergreen-additions-2026-10-21.md.

## 2026-10-22 — Small glossary section

User approved eight concise, source-checked glossary pages, a /glossary/ index and contextual calculator links. Dedicated definitions answer informational intent; existing guides retain operational calculation detail. Preserve calculator URLs and indexability environment gates. Finalize only glossary exports to directory indexes for the requested URL shape. No mass content pipeline or unrelated eCPM article; no rankings/citation guarantees. Evidence and scope: glossary-2026-10-22.md.

## 2026-10-22 — Methodology transparency

User requested an Omni-informed methodology improvement. Preserve the established page/canonical and distinguish actual validation from unsupported authority claims. Generate example default values from real field configurations; explain that future returns/inflation are editable illustrative presets with no recorded empirical calibration. Keep official rules, historical observations and stored FX dates separate. Publish actual review scope, reproducible examples, rounding and explicit issue-reporting path. No invented professional reviewers or AdSense approval claims; no runtime AI/API service. See methodology-review-2026-10-22.md.

## 2026-10-22 — Public domain exclusion

User explicitly requested removal of the reference domain from the website. Remove visible mentions, outbound exits and unused serialized runtime provenance; keep research provenance only in documentation that is not copied to the public export. Preserve genuine official source links. Enforce the requirement on the complete static export at build time, including JavaScript and RSC payloads. Internal provenance is not a source for public-model fields.

## 2026-10-26 — Dedicated PMI, biweekly and discount-points tools

User explicitly requested these three priorities after FNCalculator review. Implement independently scoped models, preserve earlier Mortgage calculations and layout, and add distinct searchable pages instead of duplicate keyword variants. Keep PMI request/automatic/midpoint logic distinct, date/disclose the estimate card, and offer actual quotes. Compare biweekly with an equal-annual-budget monthly alternative. Points compare entered quote rates and both cash-flow and balance-aware horizon costs. Do not infer keyword revenue, live reference numeric parity, actual cancellation approval or Safari-device verification.

## 2026-10-26 — Category organization

User approved six financial categories plus supporting general tools, consistent desktop/mobile navigation, scenario subgroups and contextual sidebars. Preserve every old page URL and category fragment. Use a separate display taxonomy so calculation-engine source categories and policy/form behavior remain intact.


### 2026-11-18 — Sortino, GRM and corporate D/E
Developing three original tools in preview/ratio-property-three-20261118; seven modes. Explicit matching-period/all-N Sortino, gross-rent-only screening, and corporate book-equity leverage definitions. Production remains at the existing specialist-four release. Verification evidence and status will be recorded in ratio-property-three-20261118.md.

Verification complete for the three-tool batch: 2,843 tests, production-config static export, 22 independent reference cases, 28 mode/viewport checks and 460-page structural/link audit passed. See ratio-property-three-20261118.md. Remote preview pending; production unchanged.


### 2026-11-18 — SGR and reviewed internal links
Added one original SGR calculator (3 modes), guide and term. Restored 15 curated links, added 35 explained guide/tool links and removed 27 weak associations. All 366 retained pairs reciprocal. 2,872 tests and 463-page static audit passed; 165 old tools /348 mode defaults unchanged. See sgr-internal-links-20261118.md. Combined four-tool preview pending deployment; production unchanged.

## Cash advance and COBRA — 2026-11-18

User continued the agreed two-tool priority. Keep one page for credit-card cash-advance fee/interest variants; exclude MCA and statutory APR claims. COBRA uses the ordinary federal premium basis, explicit subsidy and user-selected arithmetic months; no eligibility, disability extension or state-rule inference. Preserve existing calculations and publication settings. Preview first; await publication instruction.

## Repayment content review — 2026-11-19

Keep one core calculation task per existing URL. Cover matching long-tail needs through actual scenarios and complete-input presets. Minimum plus a constant extra and a fixed total monthly payment remain separate tasks: identical first payments do not imply identical later budgets. Preserve all existing engines, fields, defaults, original worked examples and indexing policy. Extend the two existing guides instead of adding overlapping pages. Deployment is a preview; production publication remains pending.

## Boat, compound growth and savings review — 2026-11-19

Use complete-input task entries for three existing pages, including shortcut buttons; a daily-growth label must restore Daily rather than merely select the unchanged Growth mode. Preserve other pages' mode navigation. Remove rendered synonym lists only on the three reviewed pages, retaining researched aliases in data. Extend existing comparison tables/guides and preserve prior examples. Distinguish nominal rate from equal yield, upfront cash from loan interest, and fixed deadline from fixed contribution. No new routes, engines or indexing-policy changes. Preview only; production publication pending.

## Mortgage, matching and balance-transfer review — 2026-11-19

Preserve current engines, routes, titles and all prior worked examples. Extend existing mortgage/matching tables and add a separately scoped transfer table to the existing transfer-versus-loan guide. Distinguish down payment from loan/housing costs; employer match percentage from employee salary band; and original-card/offer comparisons from personal loans. Retain full assumptions in ten task entries and fifteen controlled presets. Remove an alias where it is already an explicit task to preserve unique keyword ownership. Keep 2026 rule constants and original publication dates. Preview only; publication pending.

## Fund fees and CD content review — 2026-11-19

Keep the three existing calculator pages and two existing guides. Use full-input tasks for fund loads, advisor fees and exact CD terms; promote six/twelve/fourteen-month terms to executable presets without duplicate keyword pages. Separate gross/net return basis and charged fees/lost growth. Do not rank the different fund models together. Preserve seven unique prior worked examples and merge one exact CD duplicate. Update only five substantive content dates. Engines, defaults, indexing policy and production remain unchanged; preview publication only.

## Auto, personal and student loan content — 2026-11-19

Retain the three existing calculator pages and guides, all thirteen comparison inputs and all thirteen worked examples. Add actual full-input tasks for trade equity, reverse vehicle price, personal financed fees/insurance and annual student extras. Explain net initial cash and insurance outside the loan schedule. Manual auto taxes remain assumptions. Distinguish monthly, annual and one-time extra timing. Engines and defaults stay unchanged. Preview only; production publication awaits user instruction.

## HELOC, home equity and consolidation content — 2026-11-19

Keep the existing three tools and guides, all fifteen prior comparison inputs and all fifteen worked examples. Expose the HELOC phase table on the calculator and keep credit-ceiling checks separate from borrowed balances. Explain gross versus net cash and draw-only fees. Preserve a zero-interest loan fee and signed consolidation losses. Mark the single- and two-debt groups and current/new budget differences explicitly; do not call contract comparisons equal-budget optimization. Engines and defaults stay unchanged. Preview only; production publication awaits user instruction.

## FHA, VA and affordability content — 2026-11-19

Preserve existing FHA/VA engines and policy constants. Clarify price down payment versus lower-appraisal premium LTV, original MIP baselines versus extra principal, and scheduled payment versus actual first-month outlay. Keep VA exemption and prior-use categories separate from fee payment and property costs. Add maintenance and fixed cash down to affordability while preserving its five-income comparison. Retain all old worked examples and complete original presets. Preview only; production publication awaits user instruction.

## Refinance, payoff and rent/buy content — 2026-11-19

Preserve the existing three calculators and guides, including every old chart/table/CSV and nine worked examples. Add fifteen separately identified comparisons and eleven complete task presets. Distinguish payment recovery from matched-date borrowing cost, cash-out borrowing from saving, prepayment timing from equal-budget investment comparisons, and annual checkpoints from the fixed thirty-year rent/buy horizon. Retain signed losses, missing recovery/crossing metrics and negative renter funding shortfalls without calling them feasible portfolios. Engines/defaults stay unchanged. Preview only; production publication awaits user instruction.

## GSC priority-page corrections — 2026-11-19

Keep the confirmed broad visibility decline separate from unproved causal hypotheses. Fix the selected tax metric, align visible/structured review dates, add complete known-input pricing tasks and an explicit legacy minimum-payment redirect. Preserve routes, calculation modes/defaults, prior comparison work and publication dates. Include the pending housing-comparison work in the consolidated preview. Production publication still follows the existing user-request workflow.


## 2026-11-21 — shared editorial metadata and AI-search scope

Use existing editorial dates as one source for Article, sitemap and sharing metadata; distinguish link updates from mathematical checking. The five November 18 wording reviews are historical edits, not new November 21 arithmetic validation. Add the main directory as CollectionPage/ItemList rather than a fake application. Complete explicit legacy aliases without altering canonical routing. Preserve OAI search access, existing training policy and embed noindex. Treat llms.txt as optional curated navigation, not an AI-ranking requirement. Source: seo-geo-audit-20261121.md.


## 2026-11-21 — contextual links by next task

Replace the duplicated student/college generic-loan recommendations with education cost, savings and repayment journeys. Connect noncash depreciation to operating-cash-flow reconciliation with explicit model limits. Link 24 approved concept occurrences in prose once per guide; retain 18 other one-way pairs rather than forcing a reciprocity target. Preserve every mortgage guide destination while ranking and grouping the reading tasks. Keep original numerical/source-review dates separate from November 21 link edits. See internal-link-quality-implementation-20261121.md.
