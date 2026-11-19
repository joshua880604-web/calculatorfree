# Mutual funds, investment fees and CDs — 2026-11-19

Extends preview 9ddf0ca27c531ed1a378f978b3a9e6733cbe1dee and retains the preceding eight calculator improvements. Production remains bc38ae0f8570b52a3e4159466e9163a1a723d5f0. Publication awaits a user instruction.

## Result

Three existing calculator URLs and two existing guides now provide fifteen independently checked comparison presets, ten complete task entries and seven additional worked examples. Seven unique previous worked examples remain; one identical six-month CD example is merged into the retained example with the same complete inputs and result. No new routes, models, fields or defaults are introduced.

- Mutual Fund separates entry loads, annual expenses and exit charges. Entry loads apply to every deposit; the stated exit-charge example applies to the entire pre-exit balance. The no-charge balance gap includes lost growth and is not a billed-fee total. Monthly contributions and simplified annual-expense timing remain explicit.
- Investment Fee distinguishes model-charged fees from lost future growth, and gross-return inputs from returns already after fund expenses. Equivalent 8% gross and 7.784% net examples prevent duplicate deduction of a 0.20% fund fee. A separate advisor-fee task and fund-fee comparison restore complete inputs. The chart compares only the first two gross-return cases. This annual-contribution model is not ranked against Mutual Fund's monthly-contribution model.
- CD provides functional six-, twelve- and fourteen-month presets, plus nominal monthly-compounding and hypothetical maturity-tax comparisons. APY and nominal rate are separate conventions. Accrued interest is not a monthly cash payout; taxes are an entered maturity haircut. Actual quotes, penalties, renewal and insurance eligibility are outside these examples.

Both existing guides link back to their tools. Complete-input CSVs and an accessible SVG support reproduction. Only these three calculator and two guide content dates change; original guide publication dates remain.

## Verification

TypeScript, all 3,002 tests and the production-config static export passed. A standalone 70-digit Python Decimal implementation checked fifteen cases and 192 numeric values, including selected schedule rows. Run `python scripts/check-fund-fees-cd-reference.py`.

All 169 entries and 354 modes retain their fields, defaults and default results. Chromium passed 68 checks over five unique pages, with topic views at 320, 390, 768 and 1440 pixels; fifteen scenario links; ten task links; ten repeated shortcut actions after edits; three invalid-input/reset flows; and six no-JavaScript topic views. Six CSV downloads passed. Complete URL parameters and visible fields were checked; conditional hidden fields are also covered by unit tests. No page script errors or window overflow occurred. Desktop/mobile screenshots and the decoded fee chart were visually inspected.

The static audit covers 469 canonical pages: zero broken files, broken fragments or orphan pages. New guide/tool links are reciprocal; prior indexing policy is preserved. Evidence: evidence/fund-fees-cd-reference-20261119.json and evidence/fund-fees-cd-verification-20261119.json. Logs and screenshots: /workspace/work/fund-fees-cd-content-20261119/.

## Source boundaries

SEC Investor.gov material explains fee categories, prospectus context and compounding effects. CFPB Regulation DD definitions explain APY versus interest rate. These are concept references, not certification of the original hypothetical arithmetic or product recommendations. No live rates or tax rules are introduced. Native Safari, external professional review and remote HTTP response bodies are unverified. This work does not establish the cause of earlier GSC changes or guarantee indexing, rankings or advertising approval. Deployment evidence is recorded separately when available.
