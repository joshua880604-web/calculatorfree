# Contextual internal-link improvements — 2026-11-21

This revision continues the approved sitewide internal-link audit. Its baseline is preview `e2a708ad8965b676efff63b04f0ab4ba4eaf8095`; the verified production baseline remains `e3c8070d61eee455fbf03ca9f3861262e6be6e82`. Prepare a new preview, not a production publication.

## Resulting paths

- College-cost planning now leads to a separate savings plan or an entered student-loan repayment scenario. Student-loan repayment links back to pre-enrollment cost planning. Their old identical five-item lists no longer recommend the business-loan worksheet. The text preserves the distinction between fixed-payment estimates and eligibility, income-driven plans or forgiveness.
- Operating cash flow links to book depreciation when explaining an entered noncash adjustment; depreciation links back to the cash-flow reconciliation. The text distinguishes an accounting allocation from cash receipts/payments, market value and tax-return preparation.
- Twenty-four reviewed concept links appear in the actual prose of twenty-two existing guides. Each links once to an existing definition already associated with that guide. The helper handles only approved literal phrases, preserves the exact original text, respects word boundaries, escapes text and keeps render-local state. It never scans or rewrites raw HTML, formulas, inputs or numerical tables. Two static guides have explicit JSX links at their explanations.
- The mortgage page retains all ten associated guide destinations, with one primary payment explanation and task groups for loan choices, existing mortgages and the broader housing budget. Future associated guides remain visible in a fallback list. At a 390 px viewport, the related-reading section falls from 1,842 px to 593 px (about 68% shorter), without hiding any of those ten links or requiring JavaScript.
- Repeated generic method/payment-guide anchor labels now identify the guide being opened. Destinations, complete calculation presets, examples, charts and downloads remain.

The eighteen other guide/definition pairs retain their existing one-way associations in this revision. Reciprocal completion is not a requirement. Their concepts are secondary to the particular worked task, already explained in context, or need a different scope than a short replacement phrase. Reasons are recorded in the delivery workbook and `/workspace/work/internal-link-implementation-20261121/retained-one-way-relationships.json`. They are not recorded as broken links or silently auto-filled using loose synonyms.

## Verification

- All 3,159 tests pass, including new checks for approved guide-term relationships, phrase boundaries, escaping, once-per-render linking, task-specific recommendations and preservation of all mortgage guide destinations.
- Full TypeScript check and indexable static build pass. The export checker validates all 469 canonical pages, 155 guide date/schema relationships and 34,371 internal link occurrences. Existing 200 redirect rules and 243 unique curated navigation links remain covered.
- All 374 tool-guide pairs and 317 tool-definition pairs remain bidirectional. Guide-definition bidirectional associations increase from 130 to 154 of 172 because the selected 24 links were useful in prose, not because all relationships must be symmetric.
- One hundred and five browser checks pass, including 320/390/768/1440 px views, all selected guides with JavaScript disabled, exact once-per-concept rendered links and real no-JavaScript journeys from college cost to student loans and from a minimum-payment example to APR. No page errors or document-wide overflow were observed. Screenshots of the revised mortgage reading block, college-cost task path and minimum-payment guide were inspected locally.
- Mathematical models, default inputs, modes, charts, case values and original numerical/source-review fields were not changed. `inventory.json` and `progress.json` add navigation-only evidence to existing affected entries; their mathematical completion state is preserved.

Machine evidence: `evidence/internal-link-quality-20261121.json`. Detailed graphs, screenshots, commands/logs, before/after review and delivery spreadsheet: `/workspace/work/internal-link-implementation-20261121/`.

## Date semantics

The reviewed guide links have a November 21 editorial-link date. Article JSON-LD, Open Graph and sitemap use that page content date consistently. Original arithmetic/source-review fields retain their prior dates; practical guides no longer label a link-only edit as a fresh numerical/source check. A visible concept-link update date distinguishes this edit where needed. Builds do not automatically refresh content dates.

## Boundaries

This implements navigation and context improvements. It neither establishes the cause of the GSC impression loss nor guarantees indexing, rankings, AI citations or recovery. Internal graph centrality is not Google's PageRank. Do not change robots/training policy, invent authority or add mandatory all-to-all links as a follow-up.

The official guidance used in the audit remains Google Search Central's link best practices and AI-features documentation: crawlable ordinary links, descriptive anchors, relevant context, useful text and normal indexing eligibility. Neither specifies a universal ideal link count or compulsory reciprocal link ratio.
