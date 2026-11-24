# Invoice Factoring Calculator — original model specification

Date: 2026-11-24. One canonical route: /invoice-factoring-calculator. Original implementation; competitor parity is not applicable.

One fully collected invoice, one advance today and all fees deducted at collection. Select invoice-face or advance fee base, a constant per-interval rate, prorated or started intervals and separately entered other fees. No default, recourse, upfront deductions, statutory APR, lender quote or financing approval.

## Advance, Fees & Settlement (`fees`)

Separate cash advanced today, reserve released later and fees under explicit billing rules.

Formula: Advance = invoice × advance rate. Fee = selected fee base × interval rate × chargeable periods + other fees. Settlement = reserve − fees.

| Input | Default | Unit / convention | Limits |
| --- | --- | --- | --- |
| Invoice face value | 10000 | $ | 0.01 to 1000000000000 |
| Advance rate | 80 | % | 0 to 100 |
| Fee rate per billing interval | 2 | % | 0 to 100 |
| Days per billing interval | 30 | days | 1 to 366 |
| Days until full collection | 45 | days | 0 to 3660 |
| Fee period charging | Prorated periods | select |  to  / Prorated periods, Started periods |
| Fee charged on | Invoice face value | select |  to  / Invoice face value, Advance amount |
| Other fees deducted at collection | 50 | $ | 0 to 1000000000000 |

## Verification and scope

Independent Decimal references use daily enumeration for ledger/draw models, rather than copying the implementation’s grouped intervals. 70-digit precision; committed fixtures and script. Tests check errors, conservation, inclusive days, complete example inputs and lazy client/server parity. Browser and visual status is tracked in progress.json. Amounts retain floating-point precision until display; tolerances are 1e-7 for examples and relative 1e-12 for reference outputs, with at most 500 ledger rows and 3660 days. No live rate or jurisdiction is inferred.

Sources checked November 24, 2026:

- 1st Commercial Credit: invoice factoring calculator and input definitions: https://www.1stcommercialcredit.com/invoice-factoring-calculator
