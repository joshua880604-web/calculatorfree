# Boat, compound growth and savings content — 2026-11-19

Developed from preview commit 33bd384d1df28dbd233d2dbca404af05d2d14e1b. This preview retains the preceding Amortization / Credit Card Minimum Payment improvement. Production remains bc38ae0f8570b52a3e4159466e9163a1a723d5f0; publication is pending a user instruction.

## Result

- Fixed a concrete intent/interaction mismatch: daily and monthly compound-growth task entry links and shortcut buttons now restore the promised compounding and complete example inputs. Repeating an explicit preset after editing restores it again. Other calculators retain their original mode-switch behavior.
- Three pages now have nine purposeful task entries. Removed their rendered synonym-only lists while preserving researched aliases in data. Same-intent phrases remain owned by existing URLs; no new route or keyword-volume claim.
- Extended existing controlled tables instead of adding duplicate ones: Compound Interest has seven cases; Boat Loan six; Savings Goal eight. Twenty-one table cases and one rate conversion are independently computed with 70-digit Python Decimal.
- Boat: added a $20,000 down-payment case and financed-principal column. Under the same $50,000 purchase and assumed 7% loan rate, upfront cash increases while financed principal and future interest fall. Removed two redundant tool FAQs; retained detailed anchored answers and all prior worked examples.
- Compound growth: added fixed-nominal daily compounding, converted daily nominal rate with equal effective yield, and inflation purchasing power. Monthly deposits remain monthly. The equal-yield and fixed-nominal comparisons are explicitly distinguished.
- Savings: added a 36-month deadline and $400 fixed monthly budget. The former solves the required contribution; the latter solves the first qualifying month. Existing APY, timing, modeled-tax and already-covered cases remain.
- Added six detailed worked examples; preserved all fourteen previous examples. Updated the three existing guides, CSVs with complete restore URLs, and standalone SVG charts. Original publication dates remain. Only the six affected calculator/guide content dates advance to 2026-11-19.

## Validation

2,946 tests passed, with zero failures. TypeScript and the production-config export passed. The independent script verifies 22 cases / 189 numerical values. All 169 original entries / 354 modes retain their fields, defaults and default outputs. Unrelated calculation-guide content and case data are unchanged.

Chromium passed 72 checks: six pages at four widths, 21 comparison preset clicks, nine task links, nine shortcut buttons (including repeated daily preset after edits), three invalid-input/reset flows and six no-JavaScript pages. Six CSV downloads verified complete inputs and restore URLs. No page script errors or window overflow. Mobile/desktop sections and all three charts were visually inspected.

The 469 canonical pages have no broken local files, broken fragments or orphan pages. Calculator/guide links remain reciprocal; canonical and indexing policy are preserved.

Evidence: evidence/growth-savings-boat-reference-20261119.json and evidence/growth-savings-boat-verification-20261119.json. Run `python scripts/check-growth-savings-boat-reference.py` for the independent reference. Local logs/screenshots are in /workspace/work/growth-savings-boat-content-20261119/.

## Sources and limits

Reviewed SEC Investor.gov compound-interest and savings-goal definitions and BoatUS loan/payment context on 2026-11-19. These explain inputs and boundaries; they do not certify the hypothetical numbers or imply available offers. Monthly equivalents and fractional cents can differ from bank/issuer statement conventions. Interest tax is an entered model haircut. Native Safari and external professional review are unverified. This work does not establish the cause of the earlier GSC decline or guarantee indexing, rankings or AdSense acceptance.
