# Repayment content improvement — 2026-11-19

Improves two existing calculators and their existing guides after the user's GSC review. The task is preview only; production remains at bc38ae0f8570b52a3e4159466e9163a1a723d5f0 until a publication instruction.

## Result

- Amortization: four reproducible comparisons covering baseline, monthly extra, annual extra and a one-time extra payment. Explains payment timing and the difference between scheduled principal-and-interest and the actual first payment.
- Credit Card Minimum Payment: minimum-only, minimum plus $50, minimum plus $100, and a comparison with fixed total $250 repayment. The last row restores the separate existing Credit Card Payoff calculator; it is not presented as a minimum-payment mode or an equal lifetime budget.
- All eight links restore complete inputs. Each comparison supplies a CSV with inputs and restore links. Six worked examples were added while preserving all original examples.
- Existing calculator routes, titles and H1 remain. Same-intent long-tail wording maps to real inputs, examples and explanations. No new calculator/guide route or duplicate alias page.
- The two existing guides preserve their original 2026-11-01 publication dates and show 2026-11-19 modification metadata. Only these four content paths have their content review date updated.

## Verification

2,928 tests passed. The production-config static export passed. Eight independent Python Decimal cases provide 155 numeric checks of totals and selected schedule rows. All 169 existing entries / 354 modes retain identical fields and default results.

Chromium checked both calculators and guides at 320, 390, 768 and 1440 px, including actual clicks of all eight restore links, four CSV downloads, invalid-input/reset behavior, no-JavaScript content and zero page script errors. Thirty browser checks passed. Both topic sections were visually inspected at 320 and 1440 px.

The 469 canonical pages have no broken local files, broken fragments or orphan pages. Existing canonical/indexing policy is preserved. The reviewed calculator-to-guide links are reciprocal.

Evidence: evidence/repayment-content-reference-20261119.json and evidence/repayment-content-verification-20261119.json. Local logs/screenshots: /workspace/work/repayment-content-20261119/. Run the independent check with `python scripts/check-repayment-content-reference.py`.

## Practical limits

The examples use explicit hypothetical monthly models and fractional cents internally; issuer statements, actual-day interest, fees and lender/issuer-specific rules can differ. CFPB material supports the conceptual explanation, not certification of the example output. Native Safari and an external professional review are unverified. Technical/content improvement does not establish the cause of the historical GSC drop or guarantee indexing or AdSense approval.
