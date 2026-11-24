# Merchant Cash Advance Calculator — November 24, 2026

Canonical route: /merchant-cash-advance-calculator. Original worksheet; no competitor parity claimed.

One USD factor-based advance; one fee withheld at funding; all remittances later than funding. Fixed count or constant eligible-sales/holdback scenario, actual calendar dates and Actual/365 effective annual IRR. At most 1,000 remittances /3,650 days; IRR above 1,000,000% flagged. No legal APR, state disclosures, variable-sales forecast, extra fees, refinancing or actual contract reconciliation.

## Fixed Remittance Count (`fixed-remittances`)

Use a stated count and actual payment calendar, including fees withheld from funding.

Total remittances = gross advance × factor. Net funding = advance − withheld fee. Find effective annual r with net funding = Σ remittance / (1+r)^(calendar days/365).

| Field | Default | Limits |
| --- | --- | --- |
| Gross advance before withheld fees | 50000 | 0 to 1000000000000 |
| Factor rate (1.30 means total remittances of 130% of advance) | 1.3 | 1 to 3 |
| Upfront fees withheld from funding | 1500 | 0 to 1000000000000 |
| Funding date | 2026-12-01 |  to  |
| First remittance date | 2026-12-02 |  to  |
| Assumed remittance calendar | Weekdays (Mon–Fri only) | Every calendar day; Weekdays (Mon–Fri only); Weekly (every 7 days) |
| Number of remittances | 130 | 1 to 1000 |

## Sales & Holdback Scenario (`sales-holdback`)

Assume constant eligible sales per selected interval, with a reduced final remittance.

Assumed normal remittance = eligible sales per interval × holdback. Continue to the contracted total and truncate the final remittance. Annualize the resulting dated cash flows.

| Field | Default | Limits |
| --- | --- | --- |
| Gross advance before withheld fees | 50000 | 0 to 1000000000000 |
| Factor rate (1.30 means total remittances of 130% of advance) | 1.3 | 1 to 3 |
| Upfront fees withheld from funding | 1500 | 0 to 1000000000000 |
| Funding date | 2026-12-01 |  to  |
| First remittance date | 2026-12-02 |  to  |
| Assumed remittance calendar | Weekdays (Mon–Fri only) | Every calendar day; Weekdays (Mon–Fri only); Weekly (every 7 days) |
| Assumed eligible sales per remittance interval | 5000 | 0 to 1000000000000 |
| Share of each interval’s eligible sales remitted | 10 | 0.000001 to 100 |

## Validation

Independent Decimal references solve a per-calendar-day discount-factor root, separately from the annual-log search, and reconstruct ordinary IRA basis allocation. Tests preserve funding/remittance conservation, actual dates, final caps, zero-cost and display-range states, IRA basis carryforward, following-year contributions and unsupported-case controls. Internal precision is retained until display; legal APR and form-filing rounding are not implemented.

## Sources

- Federal Reserve, March 2025: small-business financing and MCA cost context: https://www.federalreserve.gov/publications/2025-march-consumer-community-context.htm
- FTC staff perspective, February 2020: MCA factors, fees and reconciliation concerns: https://www.ftc.gov/business-guidance/blog/2020/02/small-business-financing-staff-perspective-outlines-issues
