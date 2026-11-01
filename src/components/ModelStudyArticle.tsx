import SourceReferences from './SourceReferences';
import ContentReviewNotice from '@/components/ContentReviewNotice';
import GuideGlossaryLinks from './GuideGlossaryLinks';
import SiteLink from './SiteLink';
import StudyChart from './StudyChart';
import type {ModelStudy} from '@/lib/model-study-articles';
import {editorialSchema} from '@/lib/editorial-guides';
import {directoryPath,serializeSchema} from '@/lib/site';
import './model-study.css';
export default function ModelStudyArticle({study}:{study:ModelStudy}){
 const {meta}=study;
 return <div className="page-wrap glossary-page guides-page"><main id="main"><article className="glossary-article editorial-article model-study">
 <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <SiteLink href="/guides/">Guides</SiteLink> / <span aria-current="page">{meta.breadcrumb}</span></nav>
 <p className="glossary-category">{meta.topic} · Model scenario analysis</p><h1>{meta.heading}</h1>
 <p className="guide-byline">Prepared by <SiteLink href="/about">CalculatorFree.io</SiteLink> · Model calculations checked <time dateTime={meta.publishedOn}>October 30, 2026</time></p><ContentReviewNotice kind="guide"/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(editorialSchema(meta))}}/>
 <p className="study-scope-label"><strong>What this is:</strong> a controlled arithmetic comparison using hypothetical inputs. It is not a market backtest, user study, randomized experiment or financial recommendation.</p>
 {study.intro.map(p=><p key={p}>{p}</p>)}
 <nav className="guide-nav" aria-label="Analysis sections">{[['key-findings','Key findings'],['question','Question'],['method','Method'],['charts','Charts'],['interpretation','Interpretation'],['data','Data & reproduction'],['limitations','Limitations'],['sources','Sources']].map(([anchor,label])=><SiteLink key={anchor} href={'#'+anchor}>{label}</SiteLink>)}</nav>
 <section aria-labelledby="key-findings"><h2 id="key-findings">What we found</h2><ul>{study.takeaways.map(t=><li key={t}>{t}</li>)}</ul></section>
 <section aria-labelledby="question"><h2 id="question">The question we tested</h2><p>{study.question}</p></section>
 <section aria-labelledby="method"><h2 id="method">Method: what changed, and what stayed fixed</h2>{study.method.map(p=><p key={p}>{p}</p>)}<h3>Controls and input definitions</h3><ul>{study.controls.map(p=><li key={p}>{p}</li>)}</ul></section>
 <section aria-labelledby="charts"><h2 id="charts">The results in charts</h2><p>Read these as model relationships within the stated assumptions. The axes include zero; the tables retain unrounded numerical outputs in CSV. On a small screen, scroll a chart horizontally if needed.</p>{study.figures.map(f=><StudyChart key={f.id} figure={f}/>)}</section>
 <section aria-labelledby="interpretation"><h2 id="interpretation">What the results mean</h2>{study.findings.map(f=><section key={f.heading}><h3>{f.heading}</h3>{f.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}</section>
 <section aria-labelledby="data"><h2 id="data">Full data and reproducible inputs</h2><p>The table includes every selected case, not a sample of favorable outcomes. Figures use full internal precision and are rounded for display. The CSV contains numerical model outputs with additional digits; those digits do not imply forecast accuracy.</p><p><a href={study.dataPath} download>Download all {study.rows.length} cases as CSV</a>. Use the calculator links to inspect or change each case. Future model changes can alter results; these figures describe the model checked on the date above.</p>
 <div className="guide-table" role="region" aria-label={meta.breadcrumb+' full data'} tabIndex={0}><table><caption>{study.tableCaption}</caption><thead><tr>{study.columns.map(c=><th scope="col" key={c}>{c}</th>)}<th scope="col">Reproduce</th></tr></thead><tbody>{study.rows.map(row=><tr key={row.key}>{row.cells.map((cell,i)=>i===0?<th scope="row" key={i}>{cell}</th>:<td key={i}>{cell}</td>)}<td>{row.links.map(link=><SiteLink className="study-case-link" key={link.href} href={link.href}>{link.label}</SiteLink>)}</td></tr>)}</tbody></table></div></section>
 <section aria-labelledby="limitations"><h2 id="limitations">What this analysis does not establish</h2><ul>{study.limits.map(p=><li key={p}>{p}</li>)}</ul><p>These calculations test internal model relationships, not whether the assumptions will occur. They do not establish causation in real markets or validate a personal plan. See our <SiteLink href="/methodology">methodology and model review status</SiteLink>.</p></section>
 <section aria-labelledby="sources"><h2 id="sources">Sources and calculation checks</h2><p>The figures are our own model calculations. An independent Python Decimal implementation checked the stated equations at 60-digit precision; the permitted numerical difference was 0.0000001 before display rounding. This is a numerical cross-check, not an external audit or independent financial review.</p><SourceReferences context={'guide:'+meta.path} sources={study.sources}/><p>References support concepts and scope; they do not supply the hypothetical scenario outcomes or endorse these tools. No historical return series or user financial records was used.</p></section>
 <GuideGlossaryLinks path={meta.path}/>
 <section className="related" aria-labelledby="related-tools"><h2 id="related-tools">Explore the calculation</h2><ul>{study.related.map(link=><li key={link.href}><SiteLink href={link.href}>{link.label}</SiteLink></li>)}</ul><p><SiteLink href="/guides/">Browse all financial guides</SiteLink></p></section>
 </article></main></div>;
}
