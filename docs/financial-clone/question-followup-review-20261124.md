# Question research follow-up — 2026-11-24

Completed representative task and visible-content review for all 54 existing URL candidates in the keyword plan. This does not establish that every keyword has been manually reviewed, every financial statement rechecked, or every US Google result set compared. The first batch changed three pages; this follow-up changes three more. Both batches remain unpublished.

## This batch

- Loan Repayment: added task cards for `payment` (known payment → duration) and `term` (known duration → payment), preserving the existing extra-payment task first. Added a direct payoff-time answer with complete preset links for both modes.
- Loan: added a period-interest explanation using the existing $100,000, 6% nominal annual, monthly-compounding example. Interest applies to each opening balance; the first month's interest is $500. The linked preset opens the existing amortized mode.
- Currency conversion guide: added derivation of target units per source unit from two known amounts, spreadsheet formulas `=B2/A2` and `=A2*C2`, reciprocal direction, and the distinction between a fee-inclusive effective transaction rate and a reference quote. Existing method anchors are preserved.

No calculation algorithm, canonical route or robots directive changed. Existing long-tail merging and preset-link machinery supply the tool answers and links. Only the changed pages' content dates advance.

## Planning corrections

The remaining candidates already cover the representative tasks inspected. Their copy was preserved. The revised planning workbook records five proposed primary-topic changes:

- APR vs APY: discard the unrelated, malformed "feature apy compound interest initial rob the coins" candidate.
- 1031 exchange: a DST marketplace ranking request does not match a gain/boot calculator. Discard that candidate as its primary keyword.
- CAGR, Present Value, and the 50/30/20 guide: keep comparison, mixed FV/PV, or calculator variants as secondary intents pending SERP review; use page-specific primary-topic candidates.

The uploaded dataset has no exact metrics for those five proposed topics. Their volume and KD remain blank; the previous candidates' metrics are not carried over.

A separate rule-screened list holds 495 possible currency-pair/quote requests previously placed in the exchange-rate definition group. These are intent-review candidates, not 495 individually verified SERPs. Definition/meaning queries are excluded from this screening. The original complete keyword CSV remains unchanged for provenance; the revised workbook and review list supplement it.

## Validation

- TypeScript check and 866 related existing tests passed, including keyword mode links, complete long-tail presets, repayment examples, editorial dates and SEO consistency.
- Independently iterated Python Decimal arithmetic at 70-digit precision: $20,000 at 6% nominal annual interest, monthly compounding, $400 monthly payments → 58 payments, $3,072.271326987981… interest and a $272.271326987981… final payment. The five-year alternative requires $386.656030588558… monthly. Website outputs agree before display rounding.
- Production build: `SITE_URL=https://www.calculatorfree.io SITE_INDEXABLE=true npm run build`.
- `python scripts/check-seo-build.py https://www.calculatorfree.io`: 469 pages, 34,377 internal links, 2,990 calculation-state links, maximum contextual depth three.
- 51 browser checks passed across the second batch's 12 pages at 320, 390 and 1440 pixel widths. Checked canonical/indexable markup, page overflow, mode switching, preset inputs and displayed repayment results. Mobile screenshots were visually reviewed. Third-party requests were blocked for this local export test.

CFPB amortization, ECB reference-rate conventions and Frankfurter documentation were reopened for the new explanations. The website's bundled snapshot remains historical; this work does not introduce a live FX feed.

Detailed results and all 54 review decisions: [question-followup-review-20261124.json](evidence/question-followup-review-20261124.json). These checks concern local artifacts and interactions, not Cloudflare access, Google indexing or ranking recovery.
