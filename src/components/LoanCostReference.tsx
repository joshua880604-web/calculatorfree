import content from '@/lib/calculation-guide-content.json';
import cases from '@/lib/calculation-guide-cases.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
import './loan-cost-reference.css';
export default function LoanCostReference({id}:{id:string}){
 const topic=id==='personal-loan'?'personal':id==='student-loan'?'student':id==='business-loan'?'business':id==='break-even'?'breakeven':id==='annuity'?'annuity':id==='annuity-payout'?'payout':id==='pension'?'pension':id==='social-security'?'social':null;
 if(!topic)return null;
 const data=content[topic];
 return <section className="loan-cost-reference" aria-labelledby="loan-cost-scenarios">
  <h2 id="loan-cost-scenarios">{topic==='breakeven'?'Compare break-even volume and target profit':topic==='annuity'?'Compare contributions, timing and growth':topic==='payout'?'Compare payout terms and final payments':topic==='pension'?'Compare a pension stream and a lump sum':topic==='social'?'Compare benefit quotes and claiming ages':'Compare payments and total borrowing cost'}</h2>
  <p>{data.answer}</p>
  <p>{topic==='breakeven'?'These are hypothetical single-product calculations using one consistent cost period, not sales forecasts.':['pension','social'].includes(topic)?'These are hypothetical entered benefit quotes and deterministic horizons, not official benefit estimates or recommendations.':['annuity','payout'].includes(topic)?'These are hypothetical constant-return calculations, not insurance contract quotes or guaranteed income.':'These are hypothetical fixed monthly calculations, not current rates or loan offers.'} Each link restores all inputs for that example. On a small screen, scroll the table horizontally to see every column.</p>
  <div className="decision-case-table" role="region" aria-label="Calculation scenarios; scroll for all columns" tabIndex={0}><table><caption>Controlled examples under the assumptions in the linked guide</caption><thead><tr>{data.columns.map(c=><th scope="col" key={c}>{c}</th>)}<th scope="col">Reproduce</th></tr></thead><tbody>{cases[topic].map(r=><tr key={r.label}><th scope="row">{r.label}</th>{r.display.map((v,i)=><td key={i}>{v}</td>)}<td><SiteLink href={calculatorPresetHref(data.calculatorPath,r.mode,r.values)}>Try these inputs</SiteLink></td></tr>)}</tbody></table></div>
  <p>{data.chartCaption} <SiteLink href={data.meta.path}>{topic==='breakeven'?'Read the full break-even and target-profit guide':['pension','social'].includes(topic)?'Read the full benefit comparison guide':['annuity','payout'].includes(topic)?'Read the full accumulation or payout guide':'Read the full payment and cost guide'}, with chart, formulas, assumptions and CSV examples →</SiteLink></p>
 </section>;
}
