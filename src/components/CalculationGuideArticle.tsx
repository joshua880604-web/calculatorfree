import PmiRateReference from './PmiRateReference';
import GuideGlossaryLinks from './GuideGlossaryLinks';
import HouseIncomeReference from './HouseIncomeReference';
import ContentReviewNotice from '@/components/ContentReviewNotice';
import content from '@/lib/calculation-guide-content.json';
import cases from '@/lib/calculation-guide-cases.json';
import {calculationGuideEntries,type CalculationGuideTopic} from '@/lib/calculation-guides';
import {editorialSchema} from '@/lib/editorial-guides';
import {calculatorPresetHref} from '@/lib/preset-links';
import {serializeSchema,directoryPath} from '@/lib/site';
import SiteLink from './SiteLink';
import './decision-guide.css';
export default function CalculationGuideArticle({topic}:{topic:CalculationGuideTopic}){
 const data=content[topic],guide=calculationGuideEntries[topic];
 const checkedOn=guide.updatedOn??guide.publishedOn;
 const checkedLabel=new Date(checkedOn+'T00:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
 return <div className="page-wrap glossary-page guides-page"><main id="main"><article className="editorial-article">
  <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <SiteLink href="/guides/">Guides</SiteLink> / <span aria-current="page">{guide.breadcrumb}</span></nav>
  <p className="glossary-category">{guide.topic} · {guide.format}</p><h1>{guide.heading}</h1>
  <p className="guide-byline">By <SiteLink href="/about">CalculatorFree.io</SiteLink> · Arithmetic and source context checked <time dateTime={checkedOn}>{checkedLabel}</time>. Educational examples, not personalized advice.</p><ContentReviewNotice kind="guide"/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema(guide))}}/>
  <p>{data.intro}</p><p>{data.answer}</p><p><SiteLink className="glossary-cta" href={data.calculatorPath}>Open the {data.calculatorLabel} →</SiteLink></p>
  <nav className="guide-nav" aria-label="Guide sections">{data.sections.map(s=><a key={s.id} href={'#'+s.id}>{s.title}</a>)}<a href="#checked-cases">Checked examples</a><a href="#questions">Questions</a><a href="#sources">Sources & limits</a></nav>
  {topic==='afford' && <HouseIncomeReference/>}
  {data.sections.map(s=><section key={s.id} aria-labelledby={s.id}><h2 id={s.id}>{s.title}</h2>{s.formula&&<p className="formula">{s.formula}</p>}{s.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}
  {topic==='pmi' && <PmiRateReference/>}
  <section aria-labelledby="checked-cases"><h2 id="checked-cases">Checked scenarios you can reproduce</h2><p>These are controlled hypothetical calculations, not market experiments or historical performance. Each case changes only the inputs stated in its label; complete assumptions are included in the CSV and calculator preset.</p>
   <figure className="decision-guide-figure"><div className="decision-guide-chart" role="region" aria-label="Comparison chart; scroll horizontally on small screens" tabIndex={0}><img src={'/images/guides/'+data.chart+'.svg'} width={1350} height={750} loading="lazy" alt={data.chartAlt}/></div><figcaption>{data.chartCaption} <a href={'/images/guides/'+data.chart+'.svg'}>Open the chart</a>.</figcaption></figure>
   <div className="decision-case-table" role="region" aria-label="Checked results and example inputs" tabIndex={0}><table><caption>Rounded results under the stated assumptions</caption><thead><tr>{data.columns.map(c=><th key={c} scope="col">{c}</th>)}<th scope="col">Reproduce</th></tr></thead><tbody>{cases[topic].map(row=><tr key={row.label}><th scope="row">{row.label}</th>{row.display.map((v,i)=><td key={i}>{v}</td>)}<td><SiteLink href={calculatorPresetHref(data.calculatorPath,row.mode,row.values)}>Try these inputs</SiteLink></td></tr>)}</tbody></table></div>
   <p><a href={'/data/calculation-guides/'+topic+'-cases.csv'} download>Download all cases and assumptions as CSV</a>. Calculations retain precision before display rounding.</p>
  </section>
  <section aria-labelledby="questions"><h2 id="questions">Common questions</h2>{data.questions.map(q=><section key={q.question}><h3>{q.question}</h3><p>{q.answer}</p></section>)}</section>
  <section aria-labelledby="sources"><h2 id="sources">Sources, checks and limitations</h2><ul>{data.limitations.map(p=><li key={p}>{p}</li>)}</ul><p>The {cases[topic].length} cases in this guide were independently calculated using Python Decimal at 60-digit precision and checked against the website models within 0.000001 in the stated units, before display rounding. This checks arithmetic under the stated inputs; it is not a professional review or a validation of real-world outcomes.</p><ul>{data.sources.map(s=><li key={s.href}><SiteLink href={s.href}>{s.label}</SiteLink></li>)}</ul><p>External sources explain concepts and do not endorse these calculators or hypothetical rates. Read our <SiteLink href="/methodology">methodology and model limitations</SiteLink>.</p></section>
  <GuideGlossaryLinks path={guide.path}/>
  <section className="related"><h2>Related tools and reading</h2><ul>{data.related.map(s=><li key={s.href}><SiteLink href={s.href}>{s.label}</SiteLink></li>)}</ul><p><SiteLink href={data.calculatorPath}>{data.calculatorLabel}</SiteLink> · <SiteLink href="/guides/">All financial guides</SiteLink></p></section>
 </article></main></div>;
}
