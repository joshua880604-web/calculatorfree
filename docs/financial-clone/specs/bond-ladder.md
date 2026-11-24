# Bond & Treasury Bill Ladder Calculator — November 24, 2026

Canonical route: /bond-ladder-calculator. This is an original model; competitor parity is not applicable.

Original USD cash-flow ladder with 1–20 regular-coupon bonds or discount bills. Common settlement, manually entered prices, explicit horizon, no default/call/fees/tax/early sale. Coupon bonds settle just after a coupon; renewals are semiannual at par. Bill renewals use same face and an entered future price. Outstanding cost and face are not market values.

## Coupon Bond Ladder (`coupon-bonds`)

Schedule regular coupons and staggered principal maturities, then compare retained cash with at-par principal renewals.

Formula: Coupon = face × annual coupon rate / payments per year. At maturity receive face; optionally buy the same face at par. Retained cash excludes reinvestment spending.

| Field | Default | Limits / options |
| --- | --- | --- |
| Common settlement just after a coupon date | 2026-12-01 |  to  |
| Face, price per $100, annual coupon %, periods left, payments/year | 10000, 100, 4, 2, 2; 10000, 100, 4, 4, 2; 10000, 100, 4, 6, 2 |  to  |
| Cash-flow horizon | 36 | 1 to 360 |
| Principal at maturity | Retain maturity proceeds |  to  / Retain maturity proceeds, Roll same face amount |
| Renewal term (multiple of 6 months) | 36 | 6 to 360 |
| Assumed annual coupon on par renewals | 4 | 0 to 100 |

## Treasury Bill Ladder (`treasury-bills`)

Track discount-bill redemptions without coupons, with optional same-face rollovers at your assumed purchase price.

Formula: Bill gain at redemption = face − purchase cost. Same-face rollover cash = matured face − new bill purchase cost. No periodic coupon is paid.

| Field | Default | Limits / options |
| --- | --- | --- |
| Common bill settlement date | 2026-12-01 |  to  |
| Face, purchase price per $100, days left | 10000, 99, 28; 10000, 98, 56; 10000, 97, 84 |  to  |
| Cash-flow horizon | 84 | 1 to 3660 |
| Principal at maturity | Retain maturity proceeds |  to  / Retain maturity proceeds, Roll same face amount |
| Term for each renewed bill (calendar days) | 91 |  to  / 28, 42, 56, 91, 119, 182, 364 |
| Assumed renewal purchase price per $100 face | 98.75 | 0.01 to 100 |

## Verification and limitations

Independent Decimal calculations jump between per-rung events rather than copying the calendar-loop implementation. IRMAA expectations use separately transcribed CMS cents tables and boundary scenarios. Fixtures and tests cover every supported year/status/coverage, inclusive intermediate and exclusive final cutoffs, one/two people, exact horizon, loss, no-payment horizons, malformed schedules, client parity and complete presets. Arithmetic retains fractional cents until display; no issuer tax accounting or market marking is inferred. Part B-only hides/ignores the inapplicable Part D plan quote.

Sources:

- TreasuryDirect: Treasury notes and semiannual coupons: https://www.treasurydirect.gov/marketable-securities/treasury-notes/
- TreasuryDirect: bills, discount purchase and face redemption: https://www.treasurydirect.gov/marketable-securities/treasury-bills/
- SEC Investor.gov: bond cash flows and risks: https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds
