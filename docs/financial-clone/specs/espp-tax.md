# ESPP Tax Calculator — November 24, 2026

Canonical route: /espp-tax-calculator. Original scoped worksheet; no competitor interface parity is claimed.

One U.S. 2026 sale of a confirmed Section 423 ESPP lot, with exercise and nonrestricted share transfer together. Actual purchase/grant-date-as-if prices or a stated 0–15% discount formula; ordinary compensation, adjusted basis and separate capital term. Entered tax rates are assumptions. No plan/employment qualification, $25,000 accrual test, nonqualified plan, ISO, deferral, gift/death, wash sale, tax return or filing.

## Actual Purchase & Grant Prices (`known-price`)

Use known Section 423 purchase data to separate disposition compensation, adjusted basis and capital gain/loss.

Formula: Qualifying compensation uses the smaller of grant-date hypothetical discount and sale-price gain. Disqualifying compensation uses exercise-date spread. Adjusted basis = purchase cost + compensation.

| Field | Default | Limits / options |
| --- | --- | --- |
| Plan treatment confirmed by your records | Section 423 plan confirmed | Section 423 plan confirmed, Nonqualified plan or unsure |
| Grant / offering date | 2023-12-01 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Exercise and share transfer date | 2024-06-01 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Sale trade date in 2026 | 2026-11-24 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Shares sold from this lot | 100 | 1e-06 to 100000000 |
| FMV per share on grant date (Form 3922 box 3) | 100 | 1e-06 to 100000000 |
| FMV per share on exercise date (box 4) | 80 | 1e-06 to 100000000 |
| Sale price per share; assumed sale-date FMV | 120 | 0 to 100000000 |
| Selling fees for this lot | 10 | 0 to 1000000000000 |
| Assumed incremental tax rate on compensation | 32 | 0 to 100 |
| Assumed short-term capital-gain rate | 32 | 0 to 100 |
| Assumed long-term capital-gain rate | 15 | 0 to 100 |
| Actual purchase price per share (box 5) | 68 | 1e-06 to 100000000 |
| Grant-date option price as if exercised (box 8 or fixed price) | 85 | 1e-06 to 100000000 |

## Discount & Lookback Formula (`discount-price`)

Derive prices under a stated 0–15% discount formula, then apply the same Section 423 sale/basis split.

Formula: Actual purchase price = selected FMV base × (1 − discount). Grant-date as-if option price = grant FMV × (1 − discount). Apply the separate disposition and capital-term tests.

| Field | Default | Limits / options |
| --- | --- | --- |
| Plan treatment confirmed by your records | Section 423 plan confirmed | Section 423 plan confirmed, Nonqualified plan or unsure |
| Grant / offering date | 2023-12-01 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Exercise and share transfer date | 2024-06-01 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Sale trade date in 2026 | 2026-11-24 | Real date, 2000–2100; taxable delivery/sale limited to 2026 |
| Shares sold from this lot | 100 | 1e-06 to 100000000 |
| FMV per share on grant date (Form 3922 box 3) | 100 | 1e-06 to 100000000 |
| FMV per share on exercise date (box 4) | 80 | 1e-06 to 100000000 |
| Sale price per share; assumed sale-date FMV | 120 | 0 to 100000000 |
| Selling fees for this lot | 10 | 0 to 1000000000000 |
| Assumed incremental tax rate on compensation | 32 | 0 to 100 |
| Assumed short-term capital-gain rate | 32 | 0 to 100 |
| Assumed long-term capital-gain rate | 15 | 0 to 100 |
| Purchase discount under selected formula | 15 | 0 to 15 |
| FMV base for actual purchase price | Lower of grant / purchase FMV | Lower of grant / purchase FMV, Purchase-date FMV only |

## Verification and conventions

Taxable event/sale must be in 2026; dates are real calendar dates, not floating local times. Holding periods use calendar anniversaries, with leap-day clamping and acquisition-day exclusion. Exact ESPP anniversary reliance is explicitly flagged for record review. IRS Publication 15 (2026) governs the optional 22% /37% withholding scenario; special eligibility and other payroll taxes are not inferred. The ATG is context, not an official pronouncement of law. ESPP actual price and grant-date as-if price stay distinct, and the disqualifying wage component is not capped at sale profit. Tax-rate inputs are incremental assumptions, not a complete income-tax engine.

Independent Decimal references include IRS Publication 525 Example 10/11 price arithmetic with new illustrative 2026 dates, supplemental threshold crossings, price direction/loss cases and anniversary boundaries. Tests verify cost/income conservation, loss preservation, complete presets, conditional fields, unsupported plans/years, client parity and export scope. Fractional precision is retained until display; no broker share rounding, tax-return rounding, corporate action or wash sale is inferred.

Sources:

- IRS Publication 525: Section 423 ESPP compensation and basis: https://www.irs.gov/publications/p525
- IRS Form 3922 instructions: actual price and grant-date hypothetical price: https://www.irs.gov/instructions/i3921
- Treasury regulation 1.423-1: holding and employment conditions: https://www.govinfo.gov/content/pkg/CFR-2025-title26-vol7/xhtml/CFR-2025-title26-vol7-sec1-423-1.html
- IRS employment-tax guidance: statutory option disposition treatment: https://www.irs.gov/irm/part4/irm_04-023-005r
- IRS Topic 409: capital holding periods: https://www.irs.gov/taxtopics/tc409
