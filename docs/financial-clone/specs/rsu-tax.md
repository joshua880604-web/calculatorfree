# RSU Tax & Withholding Calculator — November 24, 2026

Canonical route: /rsu-tax-calculator. Original scoped worksheet; no competitor interface parity is claimed.

U.S. 2026 stock-settled RSU delivery with simultaneous vesting/income recognition and no purchase price, or a single 2026 sale of an already-taxed nonrestricted lot. Optional federal supplemental method or entered actual withholding; other withholding and marginal tax rates are supplied assumptions. No payroll/FICA/state-law engine, deferred/private-company special timing, 83(i), wash sale, full return or final tax determination.

## Delivery & Withholding (`delivery`)

Separate 2026 wage value, optional federal supplemental withholding and a supplied other-withholding amount.

Formula: Wage value = gross delivered shares × payroll FMV. Federal optional withholding = 22% within remaining $1m limit + 37% excess. Retained value = wages − allocated withholding.

| Field | Default | Limits / options |
| --- | --- | --- |
| Nonrestricted share delivery / income date | 2026-11-24 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Gross shares delivered before withholding | 100 | 1e-06 to 100000000 |
| Payroll FMV per share on the income date | 50 | 1e-06 to 100000000 |
| Federal withholding method | 2026 optional supplemental method | 2026 optional supplemental method, Enter actual federal withholding |
| Prior 2026 supplemental wages before this award | 0 | 0 to 1000000000000 |
| Actual federal income tax withholding allocated to award | 1100 | 0 to 1000000000000 |
| Other allocated withholding: enter dollars | 400 | 0 to 1000000000000 |
| Your assumed incremental federal income tax rate | 32 | 0 to 100 |

## Sale & Adjusted Basis (`sale`)

Reconcile one 2026 sale of already-taxed RSU shares to its income-date basis and capital gain or loss.

Formula: Adjusted basis = sold shares × FMV already included as wage income per share. Capital gain = net sale proceeds − adjusted basis. Assumed tax applies only to positive gain.

| Field | Default | Limits / options |
| --- | --- | --- |
| Actual nonrestricted share acquisition date | 2026-01-15 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Sale trade date in 2026 | 2026-11-24 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Shares sold from this known lot | 70 | 1e-06 to 100000000 |
| Income-date FMV basis per share already taxed as wages | 50 | 0 to 100000000 |
| Gross sale price per share | 80 | 0 to 100000000 |
| Selling fees allocated to these shares | 10 | 0 to 1000000000000 |
| Assumed short-term marginal tax rate | 32 | 0 to 100 |
| Assumed long-term marginal tax rate | 15 | 0 to 100 |

## Verification and conventions

Taxable event/sale must be in 2026; dates are real calendar dates, not floating local times. Holding periods use calendar anniversaries, with leap-day clamping and acquisition-day exclusion. Exact ESPP anniversary reliance is explicitly flagged for record review. IRS Publication 15 (2026) governs the optional 22% /37% withholding scenario; special eligibility and other payroll taxes are not inferred. The ATG is context, not an official pronouncement of law. ESPP actual price and grant-date as-if price stay distinct, and the disqualifying wage component is not capped at sale profit. Tax-rate inputs are incremental assumptions, not a complete income-tax engine.

Independent Decimal references include IRS Publication 525 Example 10/11 price arithmetic with new illustrative 2026 dates, supplemental threshold crossings, price direction/loss cases and anniversary boundaries. Tests verify cost/income conservation, loss preservation, complete presets, conditional fields, unsupported plans/years, client parity and export scope. Fractional precision is retained until display; no broker share rounding, tax-return rounding, corporate action or wash sale is inferred.

Sources:

- IRS Publication 15 (2026), section 7: supplemental withholding: https://www.irs.gov/publications/p15
- IRS Publication 5992 (June 2024): equity compensation context: https://www.irs.gov/pub/irs-pdf/p5992.pdf
- IRS Topic 409: capital basis and holding periods: https://www.irs.gov/taxtopics/tc409
