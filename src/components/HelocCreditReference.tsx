import content from '@/lib/heloc-credit-scenarios.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
const usd=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
export default function HelocCreditReference({inGuide=false}:{inGuide?:boolean}){
 return <section className="heloc-credit-reference" aria-labelledby="heloc-credit-scenarios">
  <h2 id="heloc-credit-scenarios">Check the borrowing ceiling separately from payments</h2>
  <p>These two examples hold home value at $500,000 and an assumed combined loan-to-value ceiling at 80%. The ceiling is an entered assumption, not a universal lending rule. Credit available is different from the balance you actually borrow.</p>
  <div className="decision-case-table" role="region" tabIndex={0} aria-label="Separate HELOC borrowing-ceiling scenarios; scroll for all columns"><table>
   <caption>Additional credit under an assumed 80% ceiling; no eligibility determination</caption>
   <thead><tr><th scope="col">Scenario</th><th scope="col">Home value</th><th scope="col">Entered mortgage</th><th scope="col">Maximum total secured debt</th><th scope="col">Estimated additional credit</th><th scope="col">Reproduce</th></tr></thead>
   <tbody>{content.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th><td>{usd(Number(row.values.value))}</td><td>{usd(Number(row.values.mortgage))}</td><td>{usd(row.metrics['Maximum total secured debt'])}</td><td>{usd(row.metrics['Estimated maximum HELOC'])}</td><td><SiteLink href={calculatorPresetHref('/heloc-calculator',row.mode,row.values)}>Try these inputs</SiteLink></td></tr>)}</tbody>
  </table></div>
  <p>Maximum additional credit = max(0, home value × entered ceiling − entered mortgage). The second row has no positive headroom. This simple single-mortgage input does not discover other liens, verify an appraisal or determine approval. A lender can use different terms and additional underwriting checks.</p>
  <p>The two scenarios were independently checked using 70-digit Decimal arithmetic on <time dateTime="2026-11-19">November 19, 2026</time>. They are separate from the draw/repayment comparisons and do not automatically populate those borrowed balances.</p>
  <p><a href={content.csvPath} download>Download borrowing-limit inputs (CSV)</a>{!inGuide&&<> · <SiteLink href={content.guidePath}>Read the HELOC method and limits</SiteLink></>}</p>
 </section>;
}
