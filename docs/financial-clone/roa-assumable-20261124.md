# ROA and assumable-mortgage expansion — November 24, 2026

Two original tools add four modes, eleven complete presets, two worked guides, two glossary definitions and CSV exports. Routes are `/return-on-assets-calculator` and `/assumable-mortgage-calculator`. They join the business/housing directories and related-tool journeys. The mortgage reading groups retain every prior destination and add the assumption guide once.

The parent local tree is the eight-tool release published as `af78857371ef9e2974dc9132c92cb9bf40bc2d08`; the local parent commit is `5d8cf5438dcebb6b9502fc57b57c3e993e54129d`. Those commit identities differ but source trees match. All 104 prior calculation files and the guide-answer-link repair are preserved. This new batch remains unpublished.

## Implemented behavior

ROA offers a two-point beginning/ending average or a documented supplied average. It divides same-period net income by average book total assets, preserves losses and flags zero denominators explicitly. Revenue supports a separately identified margin/turnover identity; zero revenue does not invalidate a defined direct ROA. The target-income gap holds average assets fixed. There is no automatic annualization, EBIT/interest adjustment, industry benchmark or investment rating. Percentage metrics use percentage units; the identity table describes its decimal fractions explicitly.

Mortgage assumption has cash-gap and financed-gap modes. Both compare the same purchase price, cash contribution and holding horizon. The assumed loan keeps its actual remaining term. A gap loan has a separate note rate, term and entered fees; a zero gap hides and ignores those fields. Fees are paid at closing, not silently financed. Positive new-loan cost minus assumption cost favors assumption only under the entered assumptions; negative results are retained.

Monthly schedules track P&I, interest and debt remaining. The acquisition-cash table adds closing cash, payments and horizon debt payoff; it reconciles to common purchase price plus interest and fees. This prevents an unpaid balance from being mistaken for savings. The primary cost comparison excludes housing appreciation, insurance/escrow, taxes, opportunity cost and other ownership expenses. Assumability, release of liability and VA entitlement are not determined; no program fee schedule is invented.

## Validation

All 3,844 tests passed, as did TypeScript and the production-origin build. Independent 70-digit Python Decimal references cover 58 scenarios /708 metrics. The reference uses a forward closed-form balance; the engine uses present value of remaining payments. Added large-principal/high-rate/long-term tests exposed rounding amplification in a forward monthly recurrence. The stable balance calculation resolves that issue without editing earlier loan engines. Tests also cover zero/tiny rates, completed terms, one-month loans, losses, zero revenue/assets, target income, signed cost differences and cash/debt conservation.

Chromium passed 60 mode/width/preset/reading/validation/conditional-control/no-JavaScript/guide-CSV checks plus ten calculator CSV downloads, totaling 70. All eleven actual preset links were clicked at mobile and desktop widths. Four modes were checked at 320, 390, 768 and 1440 pixels, with no page errors or horizontal overflow. Full forms and result screenshots for all modes were visually inspected at mobile and desktop sizes. Final browser checks followed the final production build.

Static audit passed: 499 canonical pages, 165 guides, 36,460 internal links, 3,147 calculation-state links, maximum contextual depth 3, 210 redirects and 253 curated llms links. The site now contains 178 functional tools /372 modes /141 glossary terms. Original registry formatting and data were preserved while appending new entries; inventory-count assertions were updated narrowly.

## Sources and evidence

Federal Reserve December 2025 report defines ROAA as net income divided by average assets. The worksheet does not reuse that report's bank performance series or infer that its own period result is annualized. CFPB Regulation Z 1026.37(m)(2), its note-rate/APR explanation and VA Form 26-6381 provide assumption/approval context, not certification of hypothetical loan terms or fees. Sources were checked November 24, 2026 and are linked in each tool, guide and definition.

Repository evidence is in `evidence/roa-assumption-{verification,reference,public-examples}-20261124.json` and `specs/{return-on-assets,assumable-mortgage}.md`. Detailed source review, preservation report, logs, scripts and screenshots are at `/workspace/work/roa-assumable-20261124/`. Native Safari, external professional review, lender approval and Google indexing/ranking remain unverified. This development does not establish the cause or recovery of earlier GSC visibility changes.
