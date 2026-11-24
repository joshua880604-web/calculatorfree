# Question-led content review — 2026-11-24

Reviewed representative questions and calculation tasks on the first 12 page candidates from the November 24 keyword research. This is not a manual review of all 5,551 positive-volume question candidates. Keyword estimates and classifier suggestions do not establish that a page needs additional copy.

## Changes

- `/guides/how-to-calculate-monthly-budget/`: added a five-step starting workflow before the existing six worked scenarios. It covers a consistent income basis, expense frequencies, avoiding duplicate savings/debt deductions, signed surplus or deficit, and reconciliation with statements and bill dates. The shared calculation-guide renderer supports an optional semantic ordered list. Existing section IDs and example inputs are preserved.
- `/guides/tax-inclusive-prices-sales-tax-and-vat/`: added a direct definition question comparing the same $100 taxable base at a hypothetical 7% rate: $100 exclusive and $107 inclusive. Existing method anchors remain unchanged. The answer separates price terminology from taxability and separate fees.
- `/single-credit-card-payoff-calculator`: replaced the shared generic descriptions for two existing tasks. A fixed monthly payment leads to payoff time and interest (`payment`); a target duration leads to the required monthly payment (`term`). Existing modes, links, formulas and the dedicated minimum-payment page are preserved.

The other nine candidates already explain the representative tasks reviewed: amortization with extra payments, minimum-card payments, multiple-card budgets, both Roth-ladder pages, the minimum-payment guide, sales-tax input selection, compound growth with deposits, and simple versus compound interest. No duplicate FAQ or new URL was added to those pages. This does not imply that every possible question is answered.

## Dates and sources

The two changed guides' arithmetic/model scenarios and cited source context were rechecked before advancing their review dates. Only the three changed pages receive the November 24 content date; numerical-review dates on other tools are preserved. Existing date assertions were updated accordingly.

Sources reopened on November 24:

- [CFPB — Assess your spending](https://www.consumerfinance.gov/owning-a-home/prepare/assess-your-spending/): actual spending records, irregular expenses, saving allocations and reconciliation with take-home pay.
- [GOV.UK — Charging VAT](https://www.gov.uk/charge-reclaim-record-vat): inclusive/exclusive terminology and multiplication/division identities, within UK scope.
- [New York Tax Department — Taxable receipt](https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/taxable_receipt.htm): taxable base, entered rate and jurisdiction-specific treatment of charges. This is an older bulletin, not a claim of universal or newly enacted tax rules.

## Verification

- TypeScript check passed.
- 905 related existing tests passed, covering guide examples, tax-price identities, VAT combinations, card repayment, keywords, editorial metadata and SEO dates.
- Production export built with `SITE_URL=https://www.calculatorfree.io SITE_INDEXABLE=true`.
- Static SEO check passed for 469 maintained pages, 34,372 internal links and 2,985 calculator-state links; maximum contextual depth remains three.
- 15 browser checks passed across 320, 390 and 1440 pixel widths. The new ordered list and definition render without horizontal page overflow; both credit-card task links select the correct modes. Mobile screenshots were visually reviewed.

Machine-readable results: [question-content-review-20261124.json](evidence/question-content-review-20261124.json).

This verification concerns the local production export. It does not test Cloudflare access, establish Google indexing or predict ranking recovery. This batch has not been published.
