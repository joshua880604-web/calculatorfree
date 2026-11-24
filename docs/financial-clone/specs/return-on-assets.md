# Return on Assets Calculator — November 24, 2026

Canonical route: /return-on-assets-calculator. Original worksheet; no competitor parity claimed.

Same-period unadjusted net income / average book total assets in USD. A two-point average or supplied documented average; signed income and target rates, explicit zero-denominator states. No automatic annualization, EBIT/interest adjustments, market asset values, industry benchmarks, forecast or investment rating.

## Beginning & Ending Assets (`balances`)

Use a two-point average of book total assets with same-period net income.

Average assets = (beginning + ending assets) / 2. Period ROA = net income / average assets. Target net income = average assets × entered target ROA.

| Field | Default | Limits |
| --- | --- | --- |
| Net income for the reporting period | 120000 | -1000000000000 to 1000000000000 |
| Beginning total assets | 800000 | 0 to 1000000000000 |
| Ending total assets | 1200000 | 0 to 1000000000000 |
| Revenue for that same period | 1500000 | 0 to 1000000000000 |
| Your target ROA for the same period | 12 | -100 to 100 |

## Known Average Assets (`known-average`)

Use a documented average balance and inspect the matching margin/turnover identity.

Period ROA = net income / supplied average assets. With positive denominators, net profit margin × asset turnover = ROA.

| Field | Default | Limits |
| --- | --- | --- |
| Net income for the reporting period | 120000 | -1000000000000 to 1000000000000 |
| Known average total assets | 1000000 | 0 to 1000000000000 |
| Revenue for that same period | 1500000 | 0 to 1000000000000 |
| Your target ROA for the same period | 12 | -100 to 100 |

## Validation

Independent Python Decimal references use closed-form balances and cumulative interest, separate from the stable remaining-payment present-value balance engine. Tests preserve signed results, defined versus undefined ratios, same-price cash/debt conservation, final payments and zero-gap controls. Internal precision is retained until display; there is no per-cent servicer rounding.

## Sources

- Federal Reserve: ROAA definition, December 2025 report: https://www.federalreserve.gov/publications/2025-december-supervision-and-regulation-report-accessible-version.htm

Percentage metrics use percentage units (12 means 12%); the margin/turnover identity table explicitly labels decimal fractions. Assumed mortgage balances use the present value of the remaining contractual payments to avoid forward-recurrence rounding amplification at high rates over long terms. Cumulative interest reconciles paid P&I to principal reduction.
