# Four original financial tools — November 24, 2026

Branch: preview/finance-expansion-four-20261124. Based on the unpublished practical-guide answer-link repair (83ce63b1a9ebbb77313f3db9f3f48efa6805d1c4). Production remains the previously confirmed 89f038b209e249ad9f8adf976dbe0462ac1341f5; this batch has not been published.

| Canonical tool | Modes | Intended task |
| --- | --- | --- |
| /ebitda-calculator | Net income; operating income bridge | Earnings reconciliation and same-period margin, not cash flow |
| /invoice-factoring-calculator | Advance, fees and settlement | Contract-selected fee base and period charging with signed reserve shortfall |
| /average-daily-balance-calculator | Dated ledger; balance/day segments | Fully covered weighted balance and optional simple-interest estimate |
| /construction-loan-calculator | Dated draws | Interest on actual advances within a commitment ceiling; separately paid fees/interest |

Each tool has three complete reproducible examples, one substantive worked guide, one glossary definition, a guide CSV and reciprocal related-tool links. Category sections, mortgage reading tasks, lazy client loaders, enhanced share/export, scope/disclaimer/source notes, canonical metadata, sitemap and legacy redirects are integrated. Existing examples, models, routes, advertisements, deployment configuration and robots policy are preserved.

The original models have bounded plain-decimal/date input, explicit USD display, signed earnings/settlement/credit-balance behavior and no hidden live rates. The SEC source motivates a net-income reconciliation: the operating bridge includes other nonoperating income/expense excluding interest/tax. The factoring provider’s potentially inconsistent displayed formula is not copied; conservation is checked independently. The daily models use inclusive dates and fixed actual-day divisors; they do not imply universal lender/issuer conventions.

Verification evidence: evidence/expansion-four-reference-20261124.json (25 independent 70-digit Decimal scenarios /120 metrics), scripts/check-expansion-four-reference.py (daily enumeration oracle), tests/expansion-four.test.ts and evidence/expansion-four-verification-20261124.json. Full command logs, browser script and screenshots are in /workspace/work/finance-expansion-four-20261124/. Final counts and actual browser status are recorded in the evidence JSON, not inferred from source generation.

No claim of competitor parity, professional review, native Safari, actual issuer/lender outcome, live deployment, Googlebot access, indexing or ranking recovery follows from local checks. These are original educational tools; adding them is not evidence that the earlier GSC decline has been diagnosed.

Final verified result: 3,226 tests passed; TypeScript and the production-configured build passed. The static audit verified 481 canonical pages, 159 guides, 35,200 internal links, 3,053 calculator-state links, contextual depth 3, 204 redirects and 247 curated llms links. Chromium passed 93 checks (88 main checks plus five calculator CSV downloads). Screenshots of all six mode forms/results were generated at 390 and 1440 widths, with 320/768 geometry checked interactively. Native Safari and remote deployment remain unverified. The prior 13-guide/27-link repair is retained in branch ancestry and its implementation files are unchanged by this batch.
