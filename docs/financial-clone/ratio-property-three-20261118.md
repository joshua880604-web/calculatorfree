# Sortino, GRM and corporate debt/equity — 2026-11-18

Three original English-language calculators using the user’s US keyword research. This is a preview development batch; the production branch remains at 95588edf07da2bdd6d89e8f5eed1595065b5d620 until the user asks to publish.

- Sortino: matched statistics or manual simple-return series; fixed target, all-N target downside deviation, undefined zero-downside state, negative numerator retained, period-only output.
- GRM: annual gross scheduled rent normalization, price and required-rent inverses, gross yield explicitly before expenses. No cap-rate or investment-payback relabeling.
- Corporate D/E: selected total-liabilities or interest-bearing-debt numerator, book equity and nonpositive-equity flags. Scenarios distinguish repayment from company cash and new equity retained as cash. The selected numerator/capital share is not automatically debt/assets.

Seven modes, three comparison guides, three glossary definitions and thirteen original calculator examples. Guide links and CSV files retain complete input assumptions. Three synonymous intents have one canonical calculator page each.

## Verification

- Independent Python Decimal reference, 80-digit precision: 22 cases, 118 numeric metrics and 7 undefined metric states. Script: `python scripts/check-ratio-property-three-reference.py`.
- `npm test`: 2,843 passed, zero failed. `npm run typecheck` and static build passed. Production-config export: `SITE_URL=https://www.calculatorfree.io SITE_INDEXABLE=true npm run build`.
- Existing 162 functional tools / 341 modes preserve their fields and default results. Site now contains 165 functional calculators / 348 modes and 460 canonical pages.
- Local Chromium static-export tests at 320, 390, 768 and 1440 pixels: 28 mode/viewport checks, 24 article/viewport checks, 29 complete preset restores, 14 actual tab switches, 6 invalid-input/correction flows, 6 CSV downloads, 12 search checks, 9 pages readable with JavaScript disabled. No page overflow or JavaScript errors. Mobile and desktop screenshots inspected.
- Full sitemap/HTML audit: one H1 and canonical metadata, parseable JSON-LD, no duplicate titles/descriptions, broken internal files or fragments. All nine new pages have contextual incoming links.
- AdSense build coverage and excluded-domain scan passed through the existing build pipeline. No ad integration, privacy setting, analytics, dependency or production-hosting change.

Local browser evidence and detailed logs: `/workspace/work/ratio-property-three-development-20261118/`. Source concept references and their limitations are documented in `src/lib/source-use-notes.json` and the public articles. The JPMorgan formula was available in its search index while direct body access was restricted. BDC’s Canadian definition is not described as a US lending rule.

Independent arithmetic is not an external professional review. Native Safari, live quotes, market forecasts, actual investment recommendations and production crawler access are not verified. Competitor interface parity is not applicable to these original models.
