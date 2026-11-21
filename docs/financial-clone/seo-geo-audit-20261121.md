# Sitewide SEO and AI-search readiness audit — 2026-11-21

Baseline: published commit `e3c8070d61eee455fbf03ca9f3861262e6be6e82`. This audit prepares a new preview; it does not publish production or establish the cause of the historical GSC impression loss. GEO means generative-engine discoverability and citation readiness here, not geographic targeting.

## Coverage and findings

The indexable static export contains 469 canonical HTML pages: 168 functioning tools (169 catalog entries include the property directory), 155 guides, 131 glossary terms and 15 other pages. Existing mathematical modes remain 354. All 168 tools have maintained search tasks; 312 task descriptions cover supported inputs/modes, not verified search volumes or rankings.

| Check | Before | Prepared revision |
| --- | --- | --- |
| Missing or duplicate head titles; missing descriptions; H1/canonical/noindex defects | None in canonical HTML | None |
| Duplicate description groups | 2 guide/glossary pairs | 0; glossary definitions describe their separate purpose |
| Article date disagrees with Open Graph update date | 28 guides | 0 |
| Article has no Open Graph update date | 52 guides | 0 |
| Sitemap and Article update date disagree | 5 guides | 0; preserves the already recorded November 18 wording review |
| Main directory collection markup | Absent | CollectionPage + ItemList for the 168 visible tools |
| Explicit catalog `.html` alias coverage | 37 aliases omitted | All 169 catalog aliases covered; 200 redirect rules total |
| Contextual internal graph | No orphan or broken canonical target/section; depth at most 3 | Preserved; 34,341 internal anchor occurrences checked |
| Curated `llms.txt` navigation | 245 links, 243 unique, all targets valid | 243 unique links; checked date updated truthfully |

Two empty glossary alias rows were also removed. SVG `<title>` labels are not additional HTML head titles. The 2,985 calculator state fragments (`#calc=...`) are application presets, not broken section IDs. Neither is counted as an SEO defect.

The 37 omitted explicit alias rules are a portability/consistency gap, not proof that the live host returned an error: Cloudflare may already normalize `.html`. Internal HTML links already use final destinations. Redirect additions preserve existing renamed-route ownership, query strings, GET/HEAD behavior and direct final destinations.

## Content and GEO assessment

The sampled and fully parsed export exposes titles, definitions, formulas, assumptions, worked results, source context and HTML links before client JavaScript. Browser-disabled checks confirm the main text remains readable in each representative template. JSON-LD describes 168 WebApplications, 155 Articles and 131 DefinedTerms, with collection, organization and breadcrumb entities where applicable. No invented reviews, ratings, named expert review or credentials were added. Valid Schema.org markup does not establish eligibility for Google's software-app rich result, which has its own genuine-review requirements.

All 155 guides and 131 glossary pages contain external source links in main content. 162 of 168 tools do too. The six without external links are rent affordability, down payment, percentage, tip splitting, date and scientific calculation. Basic arithmetic need not cite an authority merely to increase a count; rent affordability and down-payment planning should receive the next focused primary-source context review. Link presence does not certify factual accuracy or current availability of all destinations.

Maintained guide dates now feed sharing metadata centrally rather than 151 copied page-level date wrappers. Published dates are retained. Five guide records now carry the November 18 wording-update date already present in sitemap tracking. Related-link updates are visibly distinguished from numerical/source checking; dates are not advanced to the current build time. Publisher, model and professional-review disclosures remain honest.

The wildcard robots allow rule already permits search crawlers, including OAI-SearchBot. GPTBot training policy was not changed. Embed `noindex` is intentional and retained. `llms.txt` is curated navigation, not a complete inventory or a prerequisite for Google AI visibility; no `ai.txt`, fake FAQ eligibility, paid “AI submissions” or fabricated authority was introduced.

## Validation

- Full TypeScript check and indexable static build pass; 3,154 tests pass.
- Replaced the historical subset export checker with a maintained-registry audit of all 469 canonical routes, 155 guide date/schema relationships, internal targets and ordinary fragments, curated links, redirects, duplicates and directory reachability. Existing numerical tests retain financial example coverage.
- All 200 redirect rules pass 403 local HTTP checks, including GET/HEAD, preserved query parameters and no chain.
- Representative browser checks cover 14 routes at 320, 390, 768 and 1440 px, plus 14 JavaScript-disabled checks. Screenshots were inspected for WACC, the minimum-payment tool and COBRA glossary. Separate final checks cover the empty-alias correction.
- Detailed machine evidence: `evidence/seo-geo-audit-20261121.json`. Audit scripts, per-page/link tables, browser screenshots, build/test logs and delivery workbook: `/workspace/work/seo-geo-audit-20261121/`.

## Remaining priorities and boundaries

1. P0: diagnose indexing/visibility using latest complete GSC days and genuine Googlebot CDN/server logs, including WAF status codes and request timelines. An inspection-test fetch is not an indexing fetch. No fresh GSC account access or CDN-log access was available in this audit.
2. P1: classify the latest 195 crawled-not-indexed examples into canonical HTML and CSV/embed/assets before treating every excluded URL as a missing article. The previous 189-row list does not identify the six newer URLs.
3. P1: strengthen contextual usefulness and primary-source explanations in existing priority clusters, especially rent affordability/down payment, then compare query-by-page intent across minimum-payment/payoff, mortgage/amortization and interest tools. Do not merge pages or replace titles using speculative keyword overlap alone.
4. P2: measure indexing, query impressions and actual AI referrals/citations after publication. These changes do not guarantee ranking, indexing, traffic recovery or AI citation.

A public web-reader could read the current directory on November 21. It could not access the queried minimum-payment page, robots or sitemap; that tool failure is not an origin error diagnosis. Earlier user-supplied Google live-test HTML demonstrated readable updated minimum-payment content for one URL, not sitewide indexing. Local export checks cannot verify current live `X-Robots-Tag`, Googlebot IP allowances, CDN caching or manual-action account state.

## Official guidance consulted

- Google AI features: https://developers.google.com/search/docs/appearance/ai-features — ordinary search eligibility and useful content apply; there is no additional AI file or special-schema prerequisite.
- Google software-app structured data: https://developers.google.com/search/docs/appearance/structured-data/software-app — rich-result eligibility must not be pursued by inventing ratings/reviews.
- OpenAI crawlers: https://developers.openai.com/api/docs/bots — OAI-SearchBot search and GPTBot training choices are separate; CDN access matters as well as robots rules.
