import SourceReferences from '@/components/SourceReferences';
import './term-details.css';

import DecisionCaseTable from '@/components/DecisionCaseTable';
import SiteLink from "@/components/SiteLink";
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {glossaryTerms,glossaryTerm,glossaryPath,glossaryTermPath,glossaryExampleLink,glossarySchema} from '@/lib/glossary';
import {calculators,routeFor} from '@/lib/calculators';
import {pageMetadata} from '@/lib/seo';
import {directoryPath,serializeSchema} from '@/lib/site';

export const dynamicParams=false;
export function generateStaticParams(){return glossaryTerms.map(term=>({term:term.slug}));}
export async function generateMetadata({params}:{params:Promise<{term:string}>}):Promise<Metadata>{
 const entry=glossaryTerm((await params).term);if(!entry)notFound();
 return pageMetadata(glossaryTermPath(entry.slug),entry.title,entry.description);
}
export default async function TermPage({params}:{params:Promise<{term:string}>}){
 const entry=glossaryTerm((await params).term);if(!entry)notFound();
 return <div className="page-wrap glossary-page"><main id="main"><article className="glossary-article">
  <nav className="breadcrumb" aria-label="Breadcrumb"><SiteLink href={directoryPath}>Calculators</SiteLink> / <SiteLink href={glossaryPath}>Glossary</SiteLink> / <span aria-current="page">{entry.name}</span></nav>
  <p className="glossary-category">{entry.category}</p><h1>{entry.name}</h1>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(glossarySchema(entry))}}/>
  <p className="glossary-definition">{entry.definition}</p>
  {entry.scope&&<p className="glossary-scope"><strong>Scope:</strong> {entry.scope}</p>}
  <p className="glossary-aliases">Other names and related labels: {entry.aliases.join('; ')}.</p>
  <nav className="guide-nav" aria-label="Term sections"><SiteLink href="#example">Example</SiteLink>{entry.sections?.map(s=><SiteLink key={s.id} href={'#'+s.id}>{s.title}</SiteLink>)}<SiteLink href="#misunderstanding">Common misunderstanding</SiteLink>{entry.questions?.length&&<SiteLink href="#questions">Common questions</SiteLink>}{entry.tools.length>0&&<SiteLink href="#calculators">Try a calculator</SiteLink>}<SiteLink href="#sources">Sources</SiteLink></nav>
  <section aria-labelledby="meaning"><h2 id="meaning">How it works</h2><p>{entry.explanation}</p><p className="formula">{entry.formula}</p><p>{entry.formulaNote}</p></section>
  <section className="glossary-example" aria-labelledby="example"><h2 id="example">{entry.example.title}</h2><p>{entry.example.intro}</p><ol>{entry.example.steps.map(step=><li key={step}>{step}</li>)}</ol><p className="glossary-example-answer"><strong>{entry.example.answer}</strong></p><p className="glossary-assumptions">{entry.example.assumptions}</p>
   {entry.example.calculator&&<SiteLink className="glossary-cta" href={glossaryExampleLink(entry.example.calculator)}>Try these example inputs <span aria-hidden="true">→</span></SiteLink>}
   {entry.example.calculationNote&&<p className="glossary-assumptions">{entry.example.calculationNote}</p>}
  </section>
  {entry.comparison&&<section className="glossary-comparison" aria-labelledby="financing-comparison"><h2 id="financing-comparison">{entry.comparison.heading}</h2>{entry.comparison.paragraphs.map(p=><p key={p}>{p}</p>)}<figure className="decision-guide-figure"><div className="decision-guide-chart" role="region" aria-label="Scenario chart" tabIndex={0}><img src={'/images/guides/'+entry.comparison.chart+'.png'} width={1350} height={750} loading="lazy" alt="Cap rate stays at six percent while cash-on-cash return changes with loan terms and a capital reserve."/></div><figcaption>Hypothetical annual cases, not market forecasts. Scroll the chart on smaller screens. <a href={'/images/guides/'+entry.comparison.chart+'.svg'}>Open standalone SVG</a></figcaption></figure><DecisionCaseTable topic="cap"/><p><a href="/data/decision-guides/cap-cases.csv" download>Download all five cases and input assumptions</a>. Independently calculated in Python Decimal at 60-digit precision and checked against the calculator within 0.000001 in the stated units.</p>{entry.comparison.questions.map(q=><section key={q.question}><h3>{q.question}</h3><p>{q.answer}</p></section>)}</section>}
  {entry.sections?.map(s=><section key={s.id} aria-labelledby={s.id}><h2 id={s.id}>{s.title}</h2>{s.paragraphs.map(p=><p key={p}>{p}</p>)}{s.table&&<div className="guide-table" role="region" aria-label={s.table.caption} tabIndex={0}><table><caption>{s.table.caption}</caption><thead><tr>{s.table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{s.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}</section>)}
  <section aria-labelledby="misunderstanding"><h2 id="misunderstanding">{entry.pitfall.title}</h2><p>{entry.pitfall.text}</p></section>
  {entry.questions?.length&&<section aria-labelledby="questions"><h2 id="questions">Common questions</h2>{entry.questions.map(q=><section key={q.question}><h3>{q.question}</h3><p>{q.answer}</p></section>)}</section>}
  {entry.tools.length>0&&<section className="glossary-calculators" aria-labelledby="calculators"><h2 id="calculators">Explore with a calculator</h2><ul>{entry.tools.map(tool=><li key={tool.id}><SiteLink href={routeFor(tool.id)}>{calculators.find(calc=>calc.id===tool.id)!.title}</SiteLink><p>{tool.text}</p></li>)}</ul></section>}
  {entry.guides?.length&&<section><h2>Put the concept into practice</h2><ul>{entry.guides.map(guide=><li key={guide.path}><SiteLink href={guide.path}>{guide.title}</SiteLink></li>)}</ul></section>}
  {entry.related.length>0&&<nav className="glossary-related" aria-label="Related terms"><h2>Related terms</h2><ul>{entry.related.map(slug=><li key={slug}><SiteLink href={glossaryTermPath(slug)}>{glossaryTerm(slug)!.name}</SiteLink></li>)}</ul></nav>}
  <section className="glossary-sources" aria-labelledby="sources"><h2 id="sources">Sources and checks</h2><SourceReferences context={'glossary:'+entry.slug} sources={entry.sources}/>
   {entry.updatedOn&&<p className="content-date">Wording updated <time dateTime={entry.updatedOn}>{new Date(entry.updatedOn+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</time>. The example-check date is listed separately below.</p>}
   <p className="content-date">Definition and example arithmetic checked <time dateTime={entry.checkedOn}>{new Date(entry.checkedOn+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</time>. Sources explain the concepts; numerical examples use the assumptions stated above.</p>
   <p><SiteLink href="/methodology.html">Calculation methodology and review status</SiteLink> · <SiteLink href={glossaryPath}>All glossary terms</SiteLink></p>
  </section>
 </article></main></div>;
}
