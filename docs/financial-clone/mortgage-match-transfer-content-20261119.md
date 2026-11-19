# Mortgage, 401(k) matching and balance transfers — 2026-11-19

Developed from preview d99fec9de63c85129ba5c89a7bbcc4f50c7000aa. Retains the preceding five-page repayment/growth/savings/boat preview work. Production remains bc38ae0f8570b52a3e4159466e9163a1a723d5f0; publication is pending a user instruction.

## Result

Three existing calculator URLs and three existing guides are strengthened without new routes, models or duplicate keyword pages. Ten task entries restore complete input presets through both links and shortcut buttons. Rendered synonym lists are omitted for these reviewed pages; existing keyword ownership is retained, and a phrase promoted to a task is removed from the redundant alias list.

- Mortgage: the existing controlled table now has five cases, cash down payment and month-13 housing totals. New cases separate lower down payment/manual PMI from tax/insurance growth with fixed scheduled P&I. Added complete loan-amount and manual-PMI task entries. Manual PMI is a hypothetical entered cost, not a lender estimate.
- 401(k): the existing matching table now has five hypothetical plan formulas. The added 50%-of-first-3% case distinguishes the employee band ($2,400 at $80,000 pay) from employer matching ($1,200). The existing high-salary cap case remains. No contribution-limit or tax-rule code is changed.
- Balance transfer: five controlled rows compare promo duration, payment budget, financed versus separately paid fees, and two transfer offers. Their $6,000 card comparisons are explicitly distinct from the existing guide's $10,000 transfer-versus-personal-loan cases. The original guide tables and CSV remain; the new transfer table has its own complete-input CSV. Negative savings are displayed with the normal leading minus sign.

Five detailed worked examples are added while preserving all fourteen original examples. Two existing SVG charts and two guide CSVs are updated; the new transfer CSV supplies every fee/APR/input and restore link. Only these six content paths receive new review dates. Original guide publication dates and previous link-review dates are retained.

## Validation

2,976 tests passed, zero failures. TypeScript and the production-config static export passed. The standalone 70-digit Decimal reference verifies 15 cases / 199 values, including mortgage month-13 costs and transfer promo-boundary rows. The reference includes the 2026 $24,500 deferral, $360,000 compensation and $72,000 additions constants already used by the site; these were checked against IRS material.

All 169 entries / 354 modes retain identical fields, defaults and default outputs. Unrelated calculation-guide content and cases are unchanged; unrelated comparison-guide data is unchanged. All fourteen previous worked examples remain.

Chromium passed 68 checks: six pages at four widths, fifteen table presets, ten task links, ten shortcut buttons repeated after edits, three invalid-input/reset flows and six no-JavaScript pages. All preset URL parameters and all rendered fields were verified; conditional fields absent from the DOM are additionally covered by the complete-preset unit checks and model results. Six CSV downloads succeeded, with no page script errors or window overflow. Both lazy-loaded chart images decoded successfully and were visually inspected after decoding.

The 469 canonical pages have no broken local files, broken fragments or orphan pages. Calculator/guide links are reciprocal and canonical/indexing policy is preserved.

Evidence: evidence/mortgage-match-transfer-reference-20261119.json and evidence/mortgage-match-transfer-verification-20261119.json. Run `python scripts/check-mortgage-match-transfer-reference.py`. Local logs, browser scripts and screenshots: /workspace/work/mortgage-match-transfer-content-20261119/.

## Source boundaries

CFPB sources explain mortgage note-rate/P&I/ownership costs and transfer fee/promotional terms. IRS 2026 contribution and COLA tables support the retained rule constants; hypothetical matching rates come from the stated examples. These sources do not endorse the site, certify its arithmetic, guarantee an offer or establish vested rights. Monthly planning conventions can differ from issuer/lender statements. Native Safari and external professional review are unverified. This content work does not establish the cause of the earlier GSC decline or guarantee indexing or advertising approval.
