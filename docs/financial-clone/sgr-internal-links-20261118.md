# SGR and internal-link repairs — 2026-11-18

Preview branch: preview/sgr-internal-links-20261118, based on da0078158588ebc84707d2a264433f1613bbcd18. Production remains at 95588edf07da2bdd6d89e8f5eed1595065b5d620. The previous Sortino, GRM and corporate D/E tools remain in this combined preview.

## Final behavior

- Explicit curated related-calculator lists render in full; automatic same-category suggestions retain their eight-item limit. Restores the 15 truncated links in the prior preview, preserving the earlier valid first-eight links.
- Reviewed 62 audited guide/tool gaps: added 35 task-specific links with explanations, and removed 27 weak declared relationships. No indiscriminate reciprocal linking. In particular tenant-rent guides no longer inherit unrelated 1031 exchange recommendations from a broad category rule.
- Retained 366 declared guide/tool relationships all have forward and reverse rendered links; category/tool and term/tool relationships are intact. Existing guide-to-tool links were preserved; only explicitly reviewed weak reverse associations were removed.
- Related guides use one readable heading/list per calculator rather than repeated headings. Presentation-only changes do not automatically refresh every old page date. Reviewed contextual-link/content changes have dated metadata; original publication and arithmetic-check dates remain separate.
- Added /sustainable-growth-rate-calculator, /guides/sustainable-growth-rate-vs-actual-growth/ and /glossary/sustainable-growth-rate/. Three modes, six complete public examples, downloadable input/reference CSV. One page owns the SGR intent.
- SGR uses an explicit positive-earnings annual ROE × retention approximation. It does not silently mix ROE denominator/timing conventions, forbid all borrowing, predict growth or supply a perpetual valuation growth assumption. Losses, nonpositive equity, excess payout and infeasible targets get clear errors.

## Verification

- python scripts/check-sgr-reference.py: 12 independent Decimal cases / 60 numeric metrics, at 80-digit precision.
- npm test: 2,872 passed, zero failed. Production-config build and TypeScript validation passed: SITE_URL=https://www.calculatorfree.io SITE_INDEXABLE=true npm run build.
- Existing 165 functional calculators / 348 modes retain exactly their fields and default results. Totals: 166 functional calculators / 351 modes and 463 canonical pages.
- Local Chromium: 12 mode/viewport checks, 28 page/viewport checks (including edited legacy pages), 13 full preset restores, 6 tab switches, 2 invalid-input/correction flows, 2 CSV downloads, 3 pages readable without JavaScript. Widths 320,390,768,1440; no page overflow or JS errors. Mobile and desktop screenshots inspected.
- Static rendered HTML audit: no broken internal files, broken fragments, orphan pages or old-route redirect links; all canonical pages reachable from the directory within two clicks. Explicit conservation checks verify retained old relevant links, all 35 additions and restoration of all 15 prior truncated links.
- Existing AdSense coverage and excluded-domain build scans passed. No ad/CMP, dependency, hosting or production indexing configuration change.

Detailed local evidence: /workspace/work/sgr-internal-links-20261118/. Concept citations: Wall Street Prep and CFI, as scoped in source-use-notes.json. Competitor interface parity is not applicable to this original model. No external professional review is claimed. Native Safari, live company data, production HTTP/crawler access and Google indexing/ranking are unverified. Remote preview deployment is recorded separately after it succeeds.
