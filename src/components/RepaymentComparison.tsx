import content from '@/lib/repayment-comparison-content.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './repayment-comparison.css';

export function hasRepaymentComparison(id:string){return Object.hasOwn(content,id);}
export default function RepaymentComparison({id,inGuide=false}:{id:string;inGuide?:boolean}){
 if(!hasRepaymentComparison(id))return null;
 const data=content[id as keyof typeof content];
 return <section id="practical-model-examples" className="repayment-comparison" aria-labelledby="repayment-comparison-heading">
  <h2 id="repayment-comparison-heading">{data.heading}</h2>
  <p>{data.intro}</p>
  <p>These are hypothetical examples with the same starting principal and annual rate within each table. Every link restores the complete inputs. Scroll the table horizontally on a small screen.</p>
  <div className="repayment-comparison-table" role="region" tabIndex={0} aria-label="Repayment scenarios; scroll horizontally for all columns">
   <table><caption>Independent arithmetic checks of the stated monthly repayment assumptions</caption>
    <thead><tr>{data.columns.map(c=><th key={c} scope="col">{c}</th>)}<th scope="col">Reproduce</th></tr></thead>
    <tbody>{data.rows.map(row=><tr key={row.key}><th scope="row">{row.label}</th>{row.display.map((value,i)=><td key={i}>{value}</td>)}<td><SiteLink href={calculatorPresetHref(row.path,row.mode,row.values)}>Try these inputs</SiteLink></td></tr>)}</tbody>
   </table>
  </div>
  <h3>What stays the same, and what changes?</h3>
  <ul>{data.notes.map(note=><li key={note}>{note}</li>)}</ul>
  <p><a href={data.csvPath} download>Download the comparison and complete inputs (CSV)</a>{!inGuide&&<> · <SiteLink href={data.guidePath}>Read the repayment method and examples</SiteLink></>}</p>
  <p className="content-date">Example arithmetic checked <time dateTime={data.checkedOn}>{data.checkedOn}</time> with an independent 70-digit Decimal calculation. This is not an issuer statement, loan quote or external professional review.</p>
 </section>;
}
