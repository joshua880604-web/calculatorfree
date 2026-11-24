# Backdoor Roth IRA Calculator: 2026 — November 24, 2026

Canonical route: /backdoor-roth-ira-calculator. Original worksheet; no competitor parity claimed.

U.S. 2026 ordinary individual traditional-IRA pro-rata allocation using established nondeductible basis, aggregated included December 31 IRA values, eligible outstanding IRA-to-IRA rollovers, conversions and other included distributions. Following-year contributions excluded from current allocation but retained in basis. Published 2026 Form 8606; 2025 instructions for context. No contribution/deduction eligibility engine, special adjustments, inherited/mega-backdoor plan, penalties, five-year withdrawal or full-return calculation.

## Conversions Only (`conversion-only`)

No other included distributions; all current-year nondeductible contributions are made by year end.

Nontaxable fraction = min(1, eligible basis / (December 31 IRA values + included rollovers + conversions)). Taxable conversion = conversion × (1 − fraction).

| Field | Default | Limits |
| --- | --- | --- |
| Scope of this estimate | Ordinary case; basis confirmed | Ordinary case; basis confirmed; Special adjustments or unsure |
| Established nondeductible basis from earlier years | 0 | 0 to 1000000000000 |
| Total nondeductible IRA contributions for tax year 2026 | 7500 | 0 to 1000000000000 |
| All included traditional / SEP / SIMPLE IRA values on December 31, 2026 | 92500 | 0 to 1000000000000 |
| Included outstanding IRA-to-IRA rollovers, not already counted | 0 | 0 to 1000000000000 |
| Total net Roth conversions during calendar 2026 | 7500 | 0 to 1000000000000 |
| Your assumed incremental income-tax rate on conversions | 24 | 0 to 100 |

## Full-Year Basis Allocation (`full-year`)

Separate other included distributions and 2026 contributions made in early 2027.

Eligible basis excludes following-year contributions. Allocate the capped fraction across conversions and other included distributions. Remaining basis = total basis − both nontaxable allocations.

| Field | Default | Limits |
| --- | --- | --- |
| Scope of this estimate | Ordinary case; basis confirmed | Ordinary case; basis confirmed; Special adjustments or unsure |
| Established nondeductible basis from earlier years | 0 | 0 to 1000000000000 |
| Total nondeductible IRA contributions for tax year 2026 | 7500 | 0 to 1000000000000 |
| Of the 2026 contribution above, amount made in early 2027 | 0 | 0 to 1000000000000 |
| All included traditional / SEP / SIMPLE IRA values on December 31, 2026 | 92500 | 0 to 1000000000000 |
| Included outstanding IRA-to-IRA rollovers, not already counted | 0 | 0 to 1000000000000 |
| Total net Roth conversions during calendar 2026 | 7500 | 0 to 1000000000000 |
| Other included 2026 IRA distributions, excluding conversions | 10000 | 0 to 1000000000000 |
| Your assumed incremental income-tax rate on conversions | 24 | 0 to 100 |

## Validation

Independent Decimal references solve a per-calendar-day discount-factor root, separately from the annual-log search, and reconstruct ordinary IRA basis allocation. Tests preserve funding/remittance conservation, actual dates, final caps, zero-cost and display-range states, IRA basis carryforward, following-year contributions and unsupported-case controls. Internal precision is retained until display; legal APR and form-filing rounding are not implemented.

## Sources

- IRS 2026 Form 8606: final published form, ordinary allocation lines: https://www.irs.gov/pub/irs-prior/f8606--2026.pdf
- IRS Form 8606 instructions: 2025 edition, explanatory context: https://www.irs.gov/instructions/i8606
