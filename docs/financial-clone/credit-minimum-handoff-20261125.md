# Credit-card minimum-payment task handoff — 2026-11-25

The user continued the proposed task-ownership improvement after supplying GSC render evidence and browser calculation examples. This is a local candidate; it has not been published. The previously confirmed production commit is `0f964463d0ba40bac03f70ac08ddea1cc80221ed`.

## Result

- The single-card payoff page presents Fixed Monthly Payment and Payoff by Deadline. Its title, introduction, scope, question links and formula listing describe those tasks.
- A visible link opens the existing dedicated minimum-payment calculator and transfers the current balance and APR in a versioned fragment. The user reviews the minimum rule there.
- Newly generated historical single-card minimum presets within the dedicated tool's range point straight to its canonical document. All previously published examples remain reproducible.
- Older query and fragment links restore the historical mode defaults before migration. In particular, the older $10,000 balance, 20% APR and interest-add-on No must not become the dedicated defaults of $5,000, 24% and Yes. Explicit inputs, the extra amount and fragment precedence are preserved; an empty optional extra means zero.
- Older valid cases outside the dedicated tool's amount, APR or 1,200-month bounds stay in the original compatibility model with an explanation and a link for a new estimate. Invalid share versions still show an error.
- The numerical registry retains 180 functional tools and 376 modes, including the compatibility mode. Ordinary navigation presents 375 tasks. All 505 canonical documents, canonical tags and indexing policies remain.

## Evidence and verification

User-provided GSC live-test HTML contains Calculation formula, Worked examples, Sources and Related calculators in body elements. The visible failed resources are third-party Google advertising requests. Two older URL inspections show successful real Googlebot crawls on November 23 while the URLs remain unindexed. Those observations do not establish the reason for the historical search-visibility collapse.

The source changes do not change financial formulas. All 3,954 tests, TypeScript and the production-config export pass. This includes explicit migration cases for old defaults, full entered rules, ordinary query anchors, fragment precedence, optional empty extra, invalid sharing versions and the retained wider-range compatibility model.

Browser verification uses Chromium against the local production-config static export at 320, 390 and 1440 px. It checks mode visibility, direct input-preserving handoff, old query/HTML-alias/fragment links, fixed-payment and deadline calculations, keyboard navigation, no horizontal overflow, unsupported share versions and no-JavaScript content. All 40 browser checks pass with no page script errors.

Static verification covers 505 pages, 167 guides, contextual depth 3 and all maintained internal links. Numerical and arithmetic-review dates are preserved; only the visibly updated single-card document receives the November 25 wording date.

Evidence: `evidence/credit-minimum-handoff-verification-20261125.json`. Complete logs, scripts and screenshots are retained in `/workspace/work/gsc-content-review-20261125/`.

## Limits

This is task and navigation cleanup. It does not prove that functional overlap caused the November 7–9 decline, guarantee indexing or ranking, or establish publication. Browser checks are local Chromium, not a fresh production/GSC crawl or native Safari validation. The earlier GSC export's November 16 cutoff must not be confused with today's per-URL screenshots.
