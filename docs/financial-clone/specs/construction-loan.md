# Construction Loan Calculator: Draws & Interest — original model specification

Date: 2026-11-24. One canonical route: /construction-loan-calculator. Original implementation; competitor parity is not applicable.

Constant-rate, interest-paid-separately construction period with dated nonnegative draws, opening principal and a commitment ceiling. Includes draw day and final day; actual calendar days divided by chosen 360/365. No principal repayments, interest capitalization, land equity, approval or permanent mortgage stage.

## Draw Schedule & Interest (`draws`)

Accrue simple interest only on amounts actually drawn, with dated advances and an explicit commitment ceiling.

Formula: Interval interest = drawn principal × annual rate × actual interval days / selected day basis. Sum intervals; do not charge interest on undrawn commitment.

| Input | Default | Unit / convention | Limits |
| --- | --- | --- | --- |
| Loan commitment ceiling | 200000 | $ | 0.01 to 1000000000000 |
| Principal outstanding before start date | 0 | $ | 0 to 1000000000000 |
| First interest day | 2026-11-01 | date |  to  |
| Last interest day (included) | 2026-11-30 | date |  to  |
| Draw date, amount — one per line | 2026-11-01, 50000; 2026-11-16, 50000 | textarea |  to  |
| Constant annual interest rate | 12 | % | 0 to 100 |
| Days per rate year | 365 | select |  to  / 365, 360 |
| Total fees paid separately | 1000 | $ | 0 to 1000000000000 |

## Verification and scope

Independent Decimal references use daily enumeration for ledger/draw models, rather than copying the implementation’s grouped intervals. 70-digit precision; committed fixtures and script. Tests check errors, conservation, inclusive days, complete example inputs and lazy client/server parity. Browser and visual status is tracked in progress.json. Amounts retain floating-point precision until display; tolerances are 1e-7 for examples and relative 1e-12 for reference outputs, with at most 500 ledger rows and 3660 days. No live rate or jurisdiction is inferred.

Sources checked November 24, 2026:

- CFPB: construction loan advances and repayment choices: https://www.consumerfinance.gov/ask-cfpb/what-is-a-construction-loan-en-108/
