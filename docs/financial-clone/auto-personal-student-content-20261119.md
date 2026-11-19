# Auto, personal and student loan content — 2026-11-19

Extends preview 4cc2a4e2d81da7d2d034fc3f04e8d24c464c7a3c, retaining the preceding eleven improved calculator pages. Production remains bc38ae0f8570b52a3e4159466e9163a1a723d5f0. Production publication awaits a user instruction.

## Result

Three existing calculator pages and their three existing guides receive nineteen reproducible scenarios, nine complete task presets, five additional detailed worked examples, three complete-input CSVs and three accessible standalone charts. All thirteen prior unique worked examples and thirteen previous comparison inputs remain. Auto comparison presets now explicitly restore purchase year as well as manual tax flags. No routes, engines, fields, default values or program/tax constants are changed.

- Auto Loan: seven cases retain term, cash-fee and down-payment comparisons, distinguish unpaid trade debt from a manual trade-tax credit, and solve vehicle price from a $600 monthly financing budget. Vehicle price is added beside financed amount in the table. Every case is explicitly Manual; no state tax entitlement is asserted. The reverse-budget case changes the purchase price and excludes ownership expenses.
- Personal Loan: six cases distinguish deducted, financed and separately prepaid fees, with a separate $20-per-payment insurance example. Net initial cash after a separately paid fee is not necessarily the gross deposit. Table outflow and modeled cash-flow APR include insurance; the principal-and-interest schedule does not. Outflow minus net cash already captures an upfront fee, so it must not be added again. Fee treatments do not all hold net proceeds constant. Modeled APR does not classify regulatory finance charges.
- Student Loan: six cases retain normal, extended-term and monthly-extra comparisons, adding $1,200 annually and a single $1,200 extra in month one. Annual extras start at month twelve; the one-time case applies after first-month interest. The contractual installment remains fixed, and final payments are capped. Loan-group allocation, daily payoff quotes, income-driven payments and forgiveness are excluded.

Sources support definitions and limits; the original examples use hypothetical rates. Original guide publication dates remain November 1. Only these six content paths advance to November 19. Existing keyword ownership is retained and reviewed long-tail tasks load complete input sets rather than rendering synonym lists.

## Verification

All 3,036 tests, full non-incremental TypeScript checking and the production-config static export passed. The independent 70-digit Decimal implementation verifies nineteen cases and 406 numeric values, including first, twelfth and final schedule rows. Run `python scripts/check-auto-personal-student-reference.py`. JSON-normalized field/result snapshots confirm all 169 entries and 354 modes retain existing fields, defaults and default results; thirteen prior worked examples remain exactly represented.

Chromium passed 70 checks over six pages at 320, 390, 768 and 1440 pixels, including nineteen scenario links, nine task links, nine shortcut actions repeated after edits, three invalid-input/reset flows and six no-JavaScript views. Six CSV downloads passed with zero page script errors or window overflow. All three decoded charts and desktop/mobile scenario screenshots were visually inspected. The static audit found zero broken files, broken fragments or orphan pages across 469 canonical pages, with reciprocal calculator/guide links and existing indexing policy preserved. Evidence is recorded in evidence/auto-personal-student-verification-20261119.json. Logs and reproducible browser/static-audit scripts are in /workspace/work/auto-personal-student-content-20261119/.

## Sources and limits

Read CFPB guidance on unpaid trade-in debt, personal installment-loan fees and student-loan payment allocation. An attempted guessed negative-equity FAQ URL could not be opened; the actual CFPB trade-in FAQ was found through search and read instead. No guessed source is published. No live offers, state-law updates or federal repayment-program rules are added. External references do not certify the hypothetical figures. Native Safari, professional review and remote HTTP bodies remain unverified; indexing, ranking and AdSense approval are not guaranteed. Preview deployment evidence is stored separately.
