# Practical-guide question links — 2026-11-24

The practical-guide renderer displayed question text but omitted configured calculator links and question anchors. This affected 21 question blocks across 13 existing guides. Restoring server-rendered anchors lets a reader move from an explanation to its calculation mode or example inputs.

The initial inventory contained 33 destinations. Six question blocks in the covered-call and minimum-payment guides each reused two broad recommendations. These were replaced with six task-specific entries: three complete covered-call examples, two complete minimum-only examples and one entry for manually entering a statement's minimum-payment assumptions. The final inventory contains 27 calculator links. No numerical model or original answer text was changed.

## Implementation

- `PracticalGuideQuestions` renders the question's existing anchor and a list of descriptive calculator links using the established versioned state-fragment helper.
- The six revised destinations directly support profit, premium, net debit, minimum-payment formula, statement-rule inputs and minimum-only payoff tasks. Full example inputs are supplied where a specific example is named.
- Link-review metadata advances only for the 13 affected guides and the guide collection. The visible calculator-link date remains separate from concept-link, numerical and source-context review dates.
- Regression tests check rendered labels, anchors and answers, valid modes and fields, restored preset values, and direct tool ownership for the two revised question families. A missing label is rejected.

The source baseline has the same tree (`d5880bee5ea32c05c8ffc4f14c5a0bf0a1f124e9`) as production commit `89f038b209e249ad9f8adf976dbe0462ac1341f5`. The local parent commit uses a different commit identity; its source content is identical. This batch is prepared on `preview/practical-guide-answer-links-20261124` and is not published.

Validation results, link inventory and publication checkpoint are recorded in `docs/financial-clone/evidence/practical-guide-answer-links-20261124.json` and `/workspace/work/practical-guide-answer-links-20261124/`. Local artifact checks do not establish Google indexing or live Googlebot access.

All 3,161 tests, TypeScript and the production build passed. The 469-page static audit checked 34,404 internal links and 3,017 calculation-state links. Browser verification passed 39 guide/viewport checks and 54 actual calculator-link clicks at mobile and desktop widths, verifying modes and supplied inputs. Selected mobile screenshots were visually inspected. All original answer text and scenario tables were preserved; only the two question families' destination data changed.
