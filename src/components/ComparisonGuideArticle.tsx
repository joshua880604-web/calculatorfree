import QuestionGuideArticle from './QuestionGuideArticle';
import SiteLink from './SiteLink';
import {comparisonGuides} from '@/lib/comparison-guides';
import {calculatorPresetHref} from '@/lib/preset-links';
export default function ComparisonGuideArticle({topic}:{topic:string}){
 const data=comparisonGuides[topic];
 return <QuestionGuideArticle guide={data.meta} sources={data.sources} lead={<><p><strong>{data.answer}</strong></p><p>{data.intro}</p></>} sections={[...data.sections.map(s=>({id:s.id,label:s.title})),{id:'examples',label:'Reproduce examples'},{id:'questions',label:'Common questions'}]}>
  {data.sections.map(s=><section key={s.id} aria-labelledby={s.id}><h2 id={s.id}>{s.title}</h2>{s.formula&&<p className="formula">{s.formula}</p>}{s.paragraphs.map(p=><p key={p}>{p}</p>)}{s.table&&<div className="guide-table" role="region" aria-label={s.table.caption} tabIndex={0}><table><caption>{s.table.caption}</caption><thead><tr>{s.table.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{s.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}{s.links&&<ul>{s.links.map(l=><li key={l.href}><SiteLink href={l.href}>{l.label}</SiteLink></li>)}</ul>}</section>)}
  <section aria-labelledby="examples"><h2 id="examples">Reproduce the examples and review their limits</h2><p>The original examples use stated hypothetical assumptions, not market quotes or observed investment returns. Arithmetic was checked independently with Python Decimal calculations. Calculator links restore the inputs for the specific part of the example they model; they do not reproduce an entire tax return, combined loan portfolio or historical backtest.</p><ul>{data.presets.map((p,i)=><li key={i}><SiteLink href={calculatorPresetHref(p.path,p.mode,p.values)}>{p.label}</SiteLink></li>)}</ul><p><a href={'/data/comparison-guides/'+topic+'.csv'} download>Download the guide’s example tables as CSV</a>. Full assumptions appear beside each table.</p><ul>{data.limitations.map(l=><li key={l}>{l}</li>)}</ul></section>
  <section aria-labelledby="questions"><h2 id="questions">Common questions</h2>{data.questions.map(q=><section key={q.question}><h3>{q.question}</h3><p>{q.answer}</p></section>)}</section>
  <section className="related"><h2>Related tools and reading</h2><ul>{data.related.map(l=><li key={l.href}><SiteLink href={l.href}>{l.label}</SiteLink></li>)}</ul></section>
 </QuestionGuideArticle>;
}
