import content from '@/lib/calculation-guide-content.json';
import cases from '@/lib/calculation-guide-cases.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
export default function LoanCostReference({id}:{id:string}){
 const topic=id==='personal-loan'?'personal':id==='student-loan'?'student':id==='business-loan'?'business':null;
 if(!topic)return null;
 const data=content[topic];
 return <section aria-labelledby="loan-cost-scenarios">
  <h2 id="loan-cost-scenarios">Compare payments and total borrowing cost</h2>
  <p>{data.answer}</p>
  <p>These are hypothetical fixed monthly calculations, not current rates or loan offers. Each link restores all inputs for that example. On a small screen, scroll the table horizontally to see every column.</p>
  <div className="decision-case-table" role="region" aria-label="Loan cost scenarios; scroll for all columns" tabIndex={0}><table><caption>Controlled examples under the assumptions in the linked guide</caption><thead><tr>{data.columns.map(c=><th scope="col" key={c}>{c}</th>)}<th scope="col">Reproduce</th></tr></thead><tbody>{cases[topic].map(r=><tr key={r.label}><th scope="row">{r.label}</th>{r.display.map((v,i)=><td key={i}>{v}</td>)}<td><SiteLink href={calculatorPresetHref(data.calculatorPath,r.mode,r.values)}>Try these inputs</SiteLink></td></tr>)}</tbody></table></div>
  <p>{data.chartCaption} <SiteLink href={data.meta.path}>Read the full payment and cost guide, with chart, formulas, assumptions and CSV examples →</SiteLink></p>
 </section>;
}
