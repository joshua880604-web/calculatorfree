import content from '@/lib/transfer-scenario-content.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
import './loan-cost-reference.css';

export default function TransferScenarioReference({inGuide=false}:{inGuide?:boolean}){
 return <section className="loan-cost-reference transfer-scenario-reference" aria-labelledby="transfer-scenario-comparison">
  <h2 id="transfer-scenario-comparison">{content.heading}</h2><p>{content.intro}</p>
  <p>Scroll horizontally to compare all columns. Every example link restores the complete inputs.</p>
  <div className="decision-case-table" role="region" aria-label="Transfer scenarios; scroll for all columns" tabIndex={0}>
   <table><caption>Hypothetical transfer costs with complete fee, APR and repayment assumptions</caption>
    <thead><tr>{content.columns.map(c=><th key={c} scope="col">{c}</th>)}<th scope="col">Reproduce</th></tr></thead>
    <tbody>{content.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{row.display.map((value,i)=><td key={i}>{value}</td>)}<td><SiteLink href={calculatorPresetHref('/balance-transfer-calculator',row.mode,Object.fromEntries(Object.entries(row.values).map(([key,value])=>[key,String(value)])))}>Try these inputs</SiteLink></td></tr>)}</tbody>
   </table>
  </div>
  <h3>Keep the comparison consistent</h3><ul>{content.notes.map(note=><li key={note}>{note}</li>)}</ul>
  <p><a href={content.csvPath} download>Download complete transfer inputs (CSV)</a>{!inGuide&&<> · <SiteLink href={content.guidePath}>Compare a transfer with a personal loan</SiteLink></>}</p>
  <p className="content-date">Example arithmetic checked <time dateTime={content.checkedOn}>{content.checkedOn}</time>. These are monthly planning illustrations, not issuer statements or available offers.</p>
 </section>;
}
