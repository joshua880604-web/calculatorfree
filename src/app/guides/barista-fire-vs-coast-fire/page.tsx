import SourceReferences from '@/components/SourceReferences';
import ContentReviewNotice from '@/components/ContentReviewNotice';
import RemainingGuideReview,{RemainingGuideSummary} from '@/components/RemainingGuideReview';
import SiteLink from '@/components/SiteLink';
import {baristaCoastGuide as guide,editorialSchema} from '@/lib/editorial-guides';
import {pageMetadata} from '@/lib/seo';
import {directoryPath,serializeSchema} from '@/lib/site';
import {calculatorPresetHref} from '@/lib/preset-links';
const meta=pageMetadata(guide.path,guide.title,guide.description);
export const metadata={...meta,openGraph:{...meta.openGraph,type:'article' as const,publishedTime:guide.publishedOn,modifiedTime:guide.updatedOn??guide.publishedOn}};
const example={age:45,start_age:45,income_end:55,retire_age:65,balance:760000,monthly:0,spending:36000,income:24000,full_spending:24000,return:0,inflation:0,withdrawal:4};
export default function BaristaCoastComparison(){return <div className="page-wrap glossary-page guides-page"><main id="main"><article className="glossary-article editorial-article">
 <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <SiteLink href="/guides/">Guides</SiteLink> / <span aria-current="page">{guide.breadcrumb}</span></nav>
 <p className="glossary-category">Retirement · Comparison guide</p><h1>{guide.heading}</h1>
 <p className="guide-byline">Prepared by <SiteLink href="/about">CalculatorFree.io</SiteLink> · Published <time dateTime="2026-10-29">October 29, 2026</time> · Updated <time dateTime={guide.updatedOn}>October 30, 2026</time></p><ContentReviewNotice kind="guide"/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema(guide))}}/>
 <p><strong>Barista FIRE combines earned income with portfolio withdrawals before full retirement. Coast FIRE, as modeled here, leaves the retirement portfolio invested while earned income covers current living costs.</strong> The difference is who pays today’s bills and when income stops. Use the <SiteLink href="/barista-fire-calculator">Barista FIRE calculator</SiteLink> for an income-and-withdrawal bridge or the <SiteLink href="/coast-fire-calculator">Coast FIRE calculator</SiteLink> for a no-withdrawal accumulation path.</p>
 <RemainingGuideSummary id="barista"/>
  <RemainingGuideReview id="barista"/>
  <h2>Compare the actual money flows</h2>
 <div className="table-scroll" role="region" tabIndex={0} aria-label="Barista FIRE and Coast FIRE differences"><table><thead><tr><th>Planning question</th><th>Barista FIRE model</th><th>Coast FIRE model</th></tr></thead><tbody>
 <tr><th>What pays pre-retirement bills?</th><td>After-tax earnings plus any portfolio-funded gap</td><td>Earned income or resources outside the modeled portfolio</td></tr>
 <tr><th>Are there early portfolio withdrawals?</th><td>Yes, when spending exceeds earnings</td><td>No</td></tr>
 <tr><th>What is the milestone?</th><td>Assets that fund a dated bridge and a later full target</td><td>Assets that can grow to a later full target without further deposits</td></tr>
 <tr><th>What needs a separate check?</th><td>Income end date, withdrawal access, taxes and healthcare</td><td>How living costs will be paid while assets remain untouched</td></tr>
 </tbody></table></div>
 <p>Neither label requires a particular job, age or universal dollar amount. <SiteLink href="/glossary/barista-fire/">Barista FIRE</SiteLink> may involve consulting, seasonal work or another source of earnings. “Coasting” does not mean all work can stop: the living-cost budget still needs funding.</p>
 <h2>A worked example: why the income-stop age matters</h2>
 <p>Consider a person starting part-time work at 45 and aiming for full retirement at 65. Bridge spending is $36,000 a year; after-tax part-time earnings are $24,000 until age 55. The full-retirement portfolio budget is $24,000 a year. For arithmetic clarity, assume zero investment return, zero inflation and a 4% terminal withdrawal assumption.</p>
 <ol><li>Ages 45–55: the portfolio pays $12,000 a year, totaling $120,000.</li><li>Ages 55–65: earnings have stopped, so the portfolio pays $36,000 a year, totaling $360,000.</li><li>At 65: the sizing target is $24,000 ÷ 0.04 = $600,000.</li></ol>
 <p>The required portfolio at 45 is therefore <strong>$1,080,000</strong>: $120,000 + $360,000 + $600,000. Starting with $760,000 would leave $280,000 at 65 under these assumptions, a $320,000 terminal shortfall. No investment growth is available to close it.</p>
 <p><SiteLink href={calculatorPresetHref('/barista-fire-calculator.html','plan',example)}>Open this exact Barista FIRE example</SiteLink>. With earnings instead covering the entire $36,000 bridge budget until 65, the portfolio has no bridge withdrawals and the zero-growth starting requirement becomes $600,000.</p>
 <h2>How this compares with a Coast FIRE number</h2>
 <p>At the same zero real return, a $600,000 full-retirement target also requires $600,000 at 45 on a Coast path. But that comparison assumes the portfolio pays none of the $36,000 annual bridge living costs. Earnings or separate resources must cover them. A lower portfolio threshold does not mean the household needs less total support.</p>
 <p>With positive assumed real growth, both calculations discount the later target. The Barista calculation additionally discounts each dated spending gap. Simply dividing today’s $12,000 gap by 4% gives $300,000; it ignores the end of earnings and the different later budget.</p>
 <h2>Which assumptions should you test?</h2>
 <ul><li>Lower after-tax earnings and an earlier income-stop date.</li><li>Higher healthcare, insurance, housing and tax allowances.</li><li>Lower investment returns after fees and higher inflation.</li><li>A different withdrawal assumption for the full-retirement target.</li></ul>
 <p>Run matched scenarios rather than choosing whichever label produces the smallest number. The <SiteLink href="/fire-calculator">full FIRE calculator</SiteLink> sizes a completely portfolio-funded target; Lean FIRE and Fat FIRE describe different spending approaches rather than a guarantee about work or withdrawals.</p>
 <h2>Does either result prove a plan is safe?</h2>
 <p>No. These are deterministic illustrations, not market backtests or success probabilities. Investment losses can occur, and losses while withdrawing can matter more than the same average return during accumulation. The Barista projection stops at full retirement; it does not test spending through the rest of life. A 4% sizing assumption is not a promise of safety.</p>
 <p>Before relying on assets, review how they can be accessed. IRS rules generally impose an additional tax on early retirement-account distributions unless an exception applies. Also verify healthcare arrangements directly; a part-time job does not automatically provide insurance. Taxes, benefit eligibility, account access and emergency reserves require separate planning.</p>
 <h2>Sources and model boundaries</h2>
 <SourceReferences context="guide:/guides/barista-fire-vs-coast-fire/" sources={[{"title": "WalletBurst: Barista FIRE concept and planning inputs", "url": "https://walletburst.com/tools/barista-fire-calc/"}, {"title": "Investor.gov: mutual fund risks and expenses", "url": "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs/mutual-funds"}, {"title": "IRS: early-distribution rules and exceptions", "url": "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions"}]}/>
 <p>Cash-flow examples are independently calculated under the stated assumptions. Educational estimates only; not financial, tax or investment advice. See our <SiteLink href="/methodology">calculation methodology</SiteLink>.</p>
 </article></main></div>;}
