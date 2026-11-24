# Bond ladder and Medicare IRMAA — November 24, 2026

Branch preview/bond-ladder-irmaa-20261124 continues 64bd34ad2399463693c0119683227128e715b592, retaining the four earlier original tools and the pending 13-guide/27-question-link repair. Production remains the previously confirmed 89f038b209e249ad9f8adf976dbe0462ac1341f5. This batch is not published.

| Tool | Implemented modes | Distinct behavior |
| --- | --- | --- |
| /bond-ladder-calculator | Coupon bonds; Treasury bills | Dated coupon/redemption calendar, original maturity distribution and same-face renewal comparison |
| /irmaa-calculator | Known Medicare MAGI; AGI + tax-exempt interest | Official 2026/2027 premium-year tables, filing/living status, exact cutoffs, coverage and one/two-person assumptions |

Eleven complete worked examples, two substantive guides, two glossary definitions and guide CSVs are integrated with related calculators, categories, client loading, exports, canonical metadata, sitemap, legacy redirects and source-use notes. The catalog contains 174 functional tools and 364 modes, with 161 guides and 137 glossary definitions across 487 canonical pages.

The ladder retains fractional cents until display, distinguishes coupon income, returned capital and reinvestment spending, preserves premium-bond losses, and reconciles cash plus outstanding purchase cost against initial cost. No remaining face or cost is represented as market value. The bill model does not copy CD/APY growth, infer auction yields or automatically buy larger face amounts with every dollar.

IRMAA uses separately versioned CMS facts in src/lib/irmaa-data.json. 2027 data was published November 17, 2026; the usual tax-income year is 2025. The usual income year for 2026 premiums is 2024. CMS numeric tables take precedence over the documented inconsistent MFS figure in the SSA overview, with 2026 POMS cross-checking. Full Part B only; no immunosuppressive-drug-only, hold-harmless, subsidy, enrollment, tax-return or appeal determination is modeled.

Independent references: scripts/check-ladder-irmaa-reference.py and evidence/ladder-irmaa-reference-20261124.json. The Decimal oracle treats each rung separately and jumps between events, unlike the application’s global calendar loop. Separately transcribed CMS cents tables supply the IRMAA expectations. It verifies 374 scenarios /3,352 metric checks. Tests cover all supported year/status/coverage boundaries, exact final-tier entry, negative MAGI, selected benefits, two covered joint filers, full preset inputs, late/early horizons, loss, invalid schedules, exports and lazy client parity.

Final verification and browser/visual results are recorded in evidence/ladder-irmaa-verification-20261124.json. Local scripts, logs, source review and screenshots are at /workspace/work/bond-ladder-irmaa-20261124/. Native Safari, live security prices, actual SSA/issuer outcomes, external professional review, remote deployment and Google indexing/ranking are not claimed.

Final verification: all 3,630 tests, TypeScript and the production-configured build passed. The static audit verified 487 pages /161 guides, 35,621 internal links, 3,083 state links, maximum contextual depth 3, 206 redirects and 249 curated llms links. Chromium passed 60 main checks plus five calculator CSV exports (65 total), with no page errors. All four mode form/result screenshots were reviewed at mobile/desktop widths. The previous four-tool implementations and 13-guide/27-link repair were compared with the parent commit and retained unchanged. A discovered income-tax navigation path was corrected to the actual /tax-calculator route; the final static audit has no broken files or fragments.
