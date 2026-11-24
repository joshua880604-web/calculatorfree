# Assumable Mortgage Calculator — November 24, 2026

Canonical route: /assumable-mortgage-calculator. Original worksheet; no competitor parity claimed.

One hypothetical USD purchase with an assumed fixed-rate amortizing loan and optional fixed-rate gap financing; compare with one new loan at the same cash contribution and monthly horizon. Fees paid separately. No underwater transaction, escrow/insurance, FHA/VA fee table, eligibility, APR, entitlement/release decision, appreciation or cash opportunity return.

## Pay the Gap in Cash (`cash-gap`)

Compare assumption with a new mortgage using the same cash contribution and the real remaining loan term.

Cash gap = price − assumed balance. Same-horizon financing cost = separately paid fees + interest through horizon. Debt still owed is shown separately.

| Field | Default | Limits |
| --- | --- | --- |
| Home purchase price | 450000 | 0 to 1000000000000 |
| Existing loan balance to assume | 300000 | 0 to 1000000000000 |
| Assumed loan annual note rate | 3 | 0 to 30 |
| Assumed loan remaining term | 240 | 1 to 600 |
| Assumption fees paid at closing | 3000 | 0 to 1000000000000 |
| Alternative new mortgage annual note rate | 6.5 | 0 to 30 |
| Alternative new mortgage term | 360 | 1 to 600 |
| New mortgage fees paid at closing | 6000 | 0 to 1000000000000 |
| Same comparison horizon | 60 | 1 to 600 |

## Finance Part of the Gap (`financed-gap`)

Add a separately amortizing gap loan and compare combined cash flows with one new mortgage.

Gap loan = price − assumed balance − buyer cash. New-loan principal = price − the same buyer cash. Compare both paths after identical monthly payment dates.

| Field | Default | Limits |
| --- | --- | --- |
| Home purchase price | 450000 | 0 to 1000000000000 |
| Existing loan balance to assume | 300000 | 0 to 1000000000000 |
| Assumed loan annual note rate | 3 | 0 to 30 |
| Assumed loan remaining term | 240 | 1 to 600 |
| Assumption fees paid at closing | 3000 | 0 to 1000000000000 |
| Buyer cash toward purchase price, excluding fees | 50000 | 0 to 1000000000000 |
| Gap loan annual note rate (ignored for zero gap loan) | 9 | 0 to 30 |
| Gap loan term (ignored for zero gap loan) | 120 | 1 to 600 |
| Gap loan fees paid at closing (ignored for zero gap loan) | 2000 | 0 to 1000000000000 |
| Alternative new mortgage annual note rate | 6.5 | 0 to 30 |
| Alternative new mortgage term | 360 | 1 to 600 |
| New mortgage fees paid at closing | 6000 | 0 to 1000000000000 |
| Same comparison horizon | 60 | 1 to 600 |

## Validation

Independent Python Decimal references use closed-form balances and cumulative interest, separate from the stable remaining-payment present-value balance engine. Tests preserve signed results, defined versus undefined ratios, same-price cash/debt conservation, final payments and zero-gap controls. Internal precision is retained until display; there is no per-cent servicer rounding.

## Sources

- CFPB Regulation Z: Loan Estimate assumption disclosure, 1026.37(m)(2): https://www.consumerfinance.gov/rules-policy/regulations/1026/37/
- CFPB: note interest rate versus APR: https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-mortgage-interest-rate-and-an-apr-en-135/
- VA Form 26-6381: assumption approval and release application: https://www.va.gov/forms/26-6381/

Percentage metrics use percentage units (12 means 12%); the margin/turnover identity table explicitly labels decimal fractions. Assumed mortgage balances use the present value of the remaining contractual payments to avoid forward-recurrence rounding amplification at high rates over long terms. Cumulative interest reconciles paid P&I to principal reduction.
