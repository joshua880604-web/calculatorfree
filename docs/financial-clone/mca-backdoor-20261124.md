# Merchant cash advance and backdoor Roth IRA — November 24, 2026

Two original canonical tools add four modes, thirteen complete worked presets, two guides, two definitions and CSV exports. Paths are `/merchant-cash-advance-calculator` and `/backdoor-roth-ira-calculator`. Business-financing and retirement-account sections, related tools, guides, glossary and curated navigation link to the new pages. Synonym queries share these task pages rather than creating duplicate calculators.

This branch continues local `77448a63f4d6dc86dddc3ae39257bae6351ee016` and preserves its pending ROA and assumable-mortgage tools. All 106 prior calculation files and the guide-answer-link repair remain unchanged. The last confirmed published eight-tool release is `af78857371ef9e2974dc9132c92cb9bf40bc2d08`; its source tree equals local `5d8cf5438dcebb6b9502fc57b57c3e993e54129d`. This batch is unpublished. Together with the prior two tools, four tools await publication. The original twelve-family expansion plan is now implemented locally.

## Merchant cash advance

Fixed-count mode places explicit remittances after the funding date; sales/holdback mode assumes constant eligible sales per chosen interval and reduces the final remittance to the remaining contract amount. Both distinguish gross advance, fee withheld from funding, net cash received, factor-based total and financing cash cost.

Dates use actual calendar offsets: every day, weekdays skipping weekends only, or exact seven-day spacing. No public-holiday calendar or guessed annual business-day count is substituted. The first remittance is entered explicitly and must follow funding. The scope supports at most 1,000 remittances /3,650 days.

Effective annual IRR solves the one-inflow/later-outflows cash-flow equation using Actual/365. The engine bisects a log-annual discount rate, while the independent reference solves a one-calendar-day discount factor. The factor is not an APR, and this effective annual IRR is not a state-law or nominal APR disclosure. The nonnegative rate is unique under the supported signs/timing. Values above 1,000,000% are explicitly flagged instead of shown as a real zero. A 50,000 advance at factor 1.30 with 1,500 withheld leaves 48,500 net funding and 65,000 remittances: 16,500 cash cost. The stated 130-weekday-remittance example has about 243.3222% effective annual IRR, not 30% APR.

Actual variable sales, reconciliation rights, additional charges, refunds, refinancing, legal classification, early-payoff provisions and approval are outside the model. No financing product is recommended.

## Backdoor Roth IRA

The ordinary 2026 worksheet aggregates established basis, the person's included December 31 traditional/SEP/SIMPLE IRA values, included outstanding IRA-to-IRA rollovers, net Roth conversions and other included distributions. It does not isolate a newly opened account or combine spouses.

Conversion-only mode assumes current-year nondeductible contributions were made by December 31 and there were no other included distributions. Full-year mode distinguishes other distributions and contributions made in early 2027 for 2026. Following-year contributions stay in total basis but are excluded from the 2026 allocation numerator. The capped fraction is applied separately to conversion and other distributions; both basis uses are deducted once from total basis. Zero pools and unused basis are explicit. Tax is only a supplied incremental-rate illustration on the taxable conversion.

The published final 2026 Form 8606 is the calculation reference. Its linked narrative instructions were still the 2025 edition when checked and are labeled as explanatory context; draft 2026 instructions are not treated as final. No annual contribution-limit/MAGI or deduction engine is inferred. Inputs require established eligible nondeductible amounts and the ordinary-case scope. Selecting special adjustments/uncertainty stops calculation. Inherited accounts, special repayments/distributions, deduction worksheets, returned/excess contributions, SIMPLE waiting-period eligibility, mega-backdoor employer plans, penalties, RMD eligibility, five-year withdrawals and full return filing are excluded. Carrying unused basis does not assert a deductible investment loss.

## Validation

All 3,946 tests, TypeScript and the public-domain production build passed. Independent 70-digit Decimal references cover 50 scenarios /595 metrics, including fees, timing calendars, leap/weekend dates, truncated final payments, zero cost, extreme annual-rate flags, aggregate basis, following-year contributions, other distributions, capped fractions and carryforward.

Chromium passed 64 mode/width/preset/reading/validation/scope/no-JavaScript/guide-CSV checks plus twelve calculator-table CSV downloads: 76 total. Every one of thirteen example links was clicked at mobile and desktop sizes. Four modes were checked at 320/390/768/1440 pixels with no page errors or horizontal overflow. Long select labels observed clipping on mobile; shortened labels and explicit explanatory hints were added and the final checks repeated. Full mobile/desktop forms and results were visually inspected. Guide CSVs identify USD, count and effective-annual-percent units.

Static audit passed for 505 canonical pages /167 guides: 36,891 internal links, 3,181 scenario links, maximum contextual depth 3, 212 redirects and 255 curated llms links. Candidate totals are 180 functional tools /376 modes /143 glossary terms. Previous registry data and formatting were preserved while appending entries; inventory count assertions were updated narrowly.

## Sources and evidence

Federal Reserve March 2025 Consumer & Community Context and FTC February 2020 staff perspective support MCA terminology, fees, sales-based remittances and limits. They do not certify this original dated cash-flow equation as a legal APR formula. IRS final 2026 Form 8606, ordinary lines 1–14 /16–18, supplies the basis allocation mechanics. IRS 2025 instructions provide explicitly dated context and special-case exclusions. No commercial site, draft tax form or copied promotional rate supplies a result.

See `evidence/mca-backdoor-{verification,reference,public-examples}-20261124.json`, `specs/{merchant-cash-advance,backdoor-roth-ira}.md` and `src/lib/backdoor-roth-rules.json`. Detailed source review, preservation proof, logs, scripts and screenshots are in `/workspace/work/mca-backdoor-20261124/`. Native Safari, external professional review, actual lender/custodian outcomes, remote deployment and Google indexing/ranking remain unverified. Later publication should inspect the real production head and verify the tested source tree; the new local parent includes the preceding unpublished tools.
