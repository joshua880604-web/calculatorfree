# EBITDA & Margin Calculator — original model specification

Date: 2026-11-24. One canonical route: /ebitda-calculator. Original implementation; competitor parity is not applicable.

Unadjusted same-period earnings reconciliation in one currency. Signed losses, net-interest income and tax benefits are supported. Operating-income mode includes separately entered other nonoperating income or expense, excluding interest and tax. No cash-flow forecast, valuation or discretionary adjusted-EBITDA addbacks.

## Net Income Reconciliation (`net-income`)

Reconcile net income to EBIT and EBITDA, including signed tax and net-interest adjustments.

Formula: EBITDA = net income + net interest expense + income tax expense + depreciation + amortization. Margin = EBITDA / revenue × 100%.

| Input | Default | Unit / convention | Limits |
| --- | --- | --- | --- |
| Net income (loss) | 80000 | $ | -1000000000000 to 1000000000000 |
| Net interest expense (income) | 10000 | $ | -1000000000000 to 1000000000000 |
| Income tax expense (benefit) | 20000 | $ | -1000000000000 to 1000000000000 |
| Depreciation deducted in earnings | 20000 | $ | 0 to 1000000000000 |
| Amortization deducted in earnings | 10000 | $ | 0 to 1000000000000 |
| Revenue for the same period | 500000 | $ | -1000000000000 to 1000000000000 |

## Operating Income Bridge (`operating-income`)

Include other nonoperating items before adding deducted D&A and comparing the same-period margin.

Formula: EBITDA = operating income + other nonoperating income excluding interest/tax + deducted depreciation + deducted amortization.

| Input | Default | Unit / convention | Limits |
| --- | --- | --- | --- |
| Operating income (loss) | 110000 | $ | -1000000000000 to 1000000000000 |
| Other nonoperating income (expense), excluding interest and tax | 0 | $ | -1000000000000 to 1000000000000 |
| Depreciation deducted in earnings | 20000 | $ | 0 to 1000000000000 |
| Amortization deducted in earnings | 10000 | $ | 0 to 1000000000000 |
| Revenue for the same period | 500000 | $ | -1000000000000 to 1000000000000 |

## Verification and scope

Independent Decimal references use daily enumeration for ledger/draw models, rather than copying the implementation’s grouped intervals. 70-digit precision; committed fixtures and script. Tests check errors, conservation, inclusive days, complete example inputs and lazy client/server parity. Browser and visual status is tracked in progress.json. Amounts retain floating-point precision until display; tolerances are 1e-7 for examples and relative 1e-12 for reference outputs, with at most 500 ledger rows and 3660 days. No live rate or jurisdiction is inferred.

Sources checked November 24, 2026:

- SEC: Non-GAAP Financial Measures, section 103: https://www.sec.gov/rules-regulations/staff-guidance/corporation-finance-interpretations/non-gaap-financial-measures
