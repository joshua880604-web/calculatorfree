# Medicare IRMAA Calculator — November 24, 2026

Canonical route: /irmaa-calculator. This is an original model; competitor parity is not applicable.

U.S. full-Part-B and Part-D IRMAA for official premium years 2026/2027, using entered Medicare MAGI or known AGI plus tax-exempt interest. Selected coverage and one person, or two identically covered people on a joint return, annualized for 12 months. No SSA determination, appeal, subsidy, hold-harmless, tax optimization or immunosuppressive-drug-only premium model.

## Known Medicare MAGI (`known-magi`)

Look up 2026 or 2027 Part B and Part D adjustments from the applicable return’s MAGI, status and coverage.

Formula: Monthly IRMAA = selected Part B adjustment + selected Part D adjustment, per covered person. Annualization = monthly × 12.

| Field | Default | Limits / options |
| --- | --- | --- |
| Medicare premium year | 2027 |  to  / 2026, 2027 |
| Tax filing and spouse living arrangement | Single / head of household / qualifying surviving spouse |  to  / Single / head of household / qualifying surviving spouse, Married filing jointly, Married filing separately: lived together, Married filing separately: lived apart all year |
| Coverage to include | Part B + Part D |  to  / Part B + Part D, Part B only, Part D only |
| Covered people (2 requires a joint return) | 1 |  to  / 1, 2 |
| Part D plan premium per person per month (your quote) | 35 | 0 to 1000000000000 |
| Additional MAGI for same-year comparison | 1000 | 0 to 1000000000000 |
| Lookback MAGI: 2024 for 2026; normally 2025 for 2027 | 112000 | -1000000000000 to 1000000000000 |

## AGI + Tax-Exempt Interest (`agi-bridge`)

Build the Medicare MAGI input from an already known AGI and tax-exempt interest, then inspect the same-year tier.

Formula: Medicare IRMAA MAGI = federal AGI + tax-exempt interest; use the selected premium-year and filing-status table.

| Field | Default | Limits / options |
| --- | --- | --- |
| Medicare premium year | 2027 |  to  / 2026, 2027 |
| Tax filing and spouse living arrangement | Single / head of household / qualifying surviving spouse |  to  / Single / head of household / qualifying surviving spouse, Married filing jointly, Married filing separately: lived together, Married filing separately: lived apart all year |
| Coverage to include | Part B + Part D |  to  / Part B + Part D, Part B only, Part D only |
| Covered people (2 requires a joint return) | 1 |  to  / 1, 2 |
| Part D plan premium per person per month (your quote) | 35 | 0 to 1000000000000 |
| Additional MAGI for same-year comparison | 1000 | 0 to 1000000000000 |
| Federal AGI from applicable lookback return | 110000 | -1000000000000 to 1000000000000 |
| Tax-exempt interest from the same return | 2000 | 0 to 1000000000000 |

## Verification and limitations

Independent Decimal calculations jump between per-rung events rather than copying the calendar-loop implementation. IRMAA expectations use separately transcribed CMS cents tables and boundary scenarios. Fixtures and tests cover every supported year/status/coverage, inclusive intermediate and exclusive final cutoffs, one/two people, exact horizon, loss, no-payment horizons, malformed schedules, client parity and complete presets. Arithmetic retains fractional cents until display; no issuer tax accounting or market marking is inferred. Part B-only hides/ignores the inapplicable Part D plan quote.

Sources:

- CMS: official 2027 full Part B premiums and Part D IRMAA: https://www.cms.gov/newsroom/fact-sheets/2027-medicare-parts-b-premiums-deductibles
- CMS: official 2026 full Part B premiums and Part D IRMAA: https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles
- SSA: MAGI, lookback years and higher-income premium rules: https://www.ssa.gov/benefits/medicare/medicare-premiums.html
- SSA POMS: filing separately while living apart all year: https://secure.ssa.gov/apps10/poms.nsf/lnx/0601120060
