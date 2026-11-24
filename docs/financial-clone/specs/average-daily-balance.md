# Average Daily Balance Calculator — original model specification

Date: 2026-11-24. One canonical route: /average-daily-balance-calculator. Original implementation; competitor parity is not applicable.

Single-balance, inclusive-date or consecutive segment worksheet. Posting-day changes count that day and same-day changes combine. Signed credit balances are retained. Optional simple interest uses max(ADB, 0), one entered APR and a 360/365 divisor; no grace periods, daily compounding, multiple APR buckets or exact issuer bill.

## Dated Transactions (`ledger`)

Use a starting balance and signed posting-date transactions over an inclusive billing cycle.

Formula: ADB = sum(end-of-day balances) / inclusive cycle days. Posting-day changes count that day.

| Input | Default | Unit / convention | Limits |
| --- | --- | --- | --- |
| Cycle start date | 2026-11-01 | date |  to  |
| Cycle end date | 2026-11-30 | date |  to  |
| Opening balance before cycle starts | 500 | $ | -1000000000000 to 1000000000000 |
| Posting date, signed amount — one per line | 2026-11-10, 200; 2026-11-20, -300 | textarea |  to  |
| Optional annual interest rate (0 for average only) | 24 | % | 0 to 1000 |
| Days per rate year | 365 | select |  to  / 365, 360 |

## Balance & Day Segments (`segments`)

Weight each constant balance by its duration and verify complete cycle coverage.

Formula: ADB = Σ(balance × days at that balance) / cycle days.

| Input | Default | Unit / convention | Limits |
| --- | --- | --- | --- |
| Total billing cycle days | 30 | days | 1 to 3660 |
| Balance, days — one consecutive segment per line | 500, 9; 700, 10; 400, 11 | textarea |  to  |
| Optional annual interest rate (0 for average only) | 24 | % | 0 to 1000 |
| Days per rate year | 365 | select |  to  / 365, 360 |

## Verification and scope

Independent Decimal references use daily enumeration for ledger/draw models, rather than copying the implementation’s grouped intervals. 70-digit precision; committed fixtures and script. Tests check errors, conservation, inclusive days, complete example inputs and lazy client/server parity. Browser and visual status is tracked in progress.json. Amounts retain floating-point precision until display; tolerances are 1e-7 for examples and relative 1e-12 for reference outputs, with at most 500 ledger rows and 3660 days. No live rate or jurisdiction is inferred.

Sources checked November 24, 2026:

- CFPB: how credit-card interest is calculated: https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/
- CFPB: daily periodic rate and 360/365 divisors: https://www.consumerfinance.gov/ask-cfpb/what-is-a-daily-periodic-rate-on-a-credit-card-en-46/
