import ContentReviewNotice from '@/components/ContentReviewNotice';
import GuideGlossaryLinks from './GuideGlossaryLinks';
import content from '@/lib/decision-guide-content.json';
import {decisionGuideEntries,type DecisionGuideTopic} from '@/lib/decision-guides';
import {editorialSchema} from '@/lib/editorial-guides';
import {serializeSchema,directoryPath} from '@/lib/site';
import SiteLink from './SiteLink';
import DecisionCaseTable from './DecisionCaseTable';
export default function DecisionGuideArticle({topic}:{topic:DecisionGuideTopic}){
 const data=content[topic],guide=decisionGuideEntries[topic];return <div className="page-wrap glossary-page guides-page"><main id="main"><article className="editorial-article">
 <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <SiteLink href="/guides/">Guides</SiteLink> / <span aria-current="page">{guide.breadcrumb}</span></nav>
 <p className="glossary-category">{guide.topic} · {guide.format}</p><h1>{guide.heading}</h1><p className="guide-byline">By <SiteLink href="/about#publisher">CalculatorFree.io</SiteLink> · Sources and example arithmetic checked <time dateTime="2026-10-31">October 31, 2026</time>. Educational model scenarios, not personalized advice.</p><ContentReviewNotice kind="guide"/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema(guide))}}/>
 <p>{data.intro}</p><p><SiteLink className="glossary-cta" href={data.calculatorPath}>Open the {data.calculatorLabel} →</SiteLink></p>
 <nav className="guide-nav" aria-label="Guide sections">{[['findings','Findings'],['method','Assumptions'],['scenarios','Results & inputs'],['questions','Questions'],['sources','Sources & limits']].map(([id,label])=><a key={id} href={'#'+id}>{label}</a>)}</nav>
 <section aria-labelledby="findings"><h2 id="findings">What the scenarios show</h2><ul>{data.findings.map(p=><li key={p}>{p}</li>)}</ul></section>
 <section aria-labelledby="method"><h2 id="method">Method: what changed and what stayed fixed</h2><p>{data.method}</p><p>These are controlled hypothetical cash-flow calculations. They use no historical price series or personal records and do not estimate a probability of success.</p></section>
 <figure className="decision-guide-figure"><div className="decision-guide-chart" role="region" aria-label="Scenario chart" tabIndex={0}><img src={'/images/guides/'+data.chart+'.png'} width={1350} height={750} loading="lazy" alt={data.chartAlt}/></div><figcaption>{data.chartCaption} Scroll the chart on smaller screens. <a href={'/images/guides/'+data.chart+'.svg'}>Open standalone SVG</a></figcaption></figure>
 <section aria-labelledby="scenarios"><h2 id="scenarios">Full results and inputs you can reproduce</h2><DecisionCaseTable topic={topic}/><p><a href={'/data/decision-guides/'+topic+'-cases.csv'} download>Download all cases and input assumptions as CSV</a>. Results are rounded for display. The equal-growth mortgage case uses the unrounded equivalent rate in its preset.</p></section>
 {data.sections.map(section=><section key={section.id} aria-labelledby={section.id}><h2 id={section.id}>{section.title}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}{section.links.length>0&&<ul>{section.links.map(link=><li key={link.href}><SiteLink href={link.href}>{link.label}</SiteLink></li>)}</ul>}</section>)}
 <section aria-labelledby="questions"><h2 id="questions">Common questions</h2>{data.questions.map(q=><section key={q.question}><h3>{q.question}</h3><p>{q.answer}</p></section>)}</section>
 <section aria-labelledby="sources"><h2 id="sources">Sources, arithmetic checks and limitations</h2><ul>{data.limitations.map(p=><li key={p}>{p}</li>)}</ul><p>The 19 scenarios across these three guides and the cap-rate comparison were independently calculated in Python Decimal at 60-digit precision and checked against the website models within 0.000001 in the stated units before display rounding. This checks the stated arithmetic, not real-world suitability or an external professional review. Reproduction scripts and CSV assumptions describe this model version; future changes may alter outputs.</p><ul>{data.sources.map(s=><li key={s.href}><SiteLink href={s.href}>{s.label}</SiteLink></li>)}</ul><p>Sources explain rules and concepts, not our hypothetical outcomes, and do not endorse the calculators. Read our <SiteLink href="/methodology">methodology and limitations</SiteLink>.</p></section>
 <GuideGlossaryLinks path={guide.path}/>
 <section className="related"><h2>Related tools and concepts</h2><ul>{data.related.map(link=><li key={link.href}><SiteLink href={link.href}>{link.label}</SiteLink></li>)}</ul><p><SiteLink href={data.calculatorPath}>{data.calculatorLabel}</SiteLink> · <SiteLink href="/guides/">All guides</SiteLink></p></section>
 </article></main></div>;
}
