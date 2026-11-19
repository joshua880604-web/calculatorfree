import content from '@/lib/tax-price-reference.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './repayment-comparison.css';

export function hasTaxPriceReference(id:string){return id==='sales-tax'||id==='vat';}
export default function TaxPriceReference({id,inGuide=false}:{id?:string;inGuide?:boolean}){
 if(id&&!hasTaxPriceReference(id))return null;
 const rows=content.rows.filter(row=>!id||row.calculatorId===id);
 return <section className="repayment-comparison tax-price-reference" aria-labelledby="tax-price-tasks">
  <h2 id="tax-price-tasks">{id==='sales-tax'?'Add sales tax, remove included tax, or recover a rate':id==='vat'?'One VAT invoice, six supported pairs of known values':'Choose a calculation from the amounts you know'}</h2>
  <p>Start with a price before tax, a total including tax, or a separately stated tax amount. Each link restores every field, including the blank unknowns in the VAT tool. These are hypothetical USD examples using entered rates.</p>
  <div className="repayment-comparison-table" role="region" tabIndex={0} aria-label="Tax price examples; scroll horizontally for all columns"><table>
   <caption>{id==='vat'?'The same $100 net / $120 gross invoice solved from six input pairs':'Independently checked net, tax and gross arithmetic'}</caption>
   <thead><tr><th scope="col">Task</th><th scope="col">Known inputs</th><th scope="col">Before tax / net</th><th scope="col">Tax amount</th><th scope="col">Including tax / gross</th><th scope="col">Rate</th><th scope="col">Reproduce</th></tr></thead>
   <tbody>{rows.map(row=><tr key={row.key}><th scope="row">{row.label}</th><td>{row.known}</td>{row.amounts.map((v,i)=><td key={i}>{v}</td>)}<td><SiteLink href={calculatorPresetHref('/'+row.calculatorId+'-calculator',row.mode,row.values)}>Try these inputs</SiteLink></td></tr>)}</tbody>
  </table></div>
  <h3>Why removing an included percentage uses division</h3>
  <p>At an entered 20% rate, $120 including tax contains $100 before tax and $20 tax: $120 ÷ 1.20 = $100. Multiplying $120 by 20% gives $24 and overstates the included tax by $4. The included tax is 20/120 of gross, about 16.6667%, rather than 20% of gross.</p>
  {inGuide&&<><h3>Why a receipt can differ by one cent</h3><p>For three hypothetical $0.05 items at 7%, rounding each line’s tax to cents gives $0.00 in total; calculating tax on the combined $0.15 and then rounding gives $0.01. This illustrates a rounding difference, not an invoice rule. The calculators apply one aggregate arithmetic calculation; they do not choose a jurisdiction’s line-level rounding policy.</p></>}
  <p>U.S. sales tax and VAT have different legal rules. Select a taxable base and applicable rate from the relevant authority or transaction documents. These tools do not determine exemptions, shipping treatment, registration or a location’s rate. A solved rate is only the relationship between the entered amounts.</p>
  <p><a href="/data/reviewed-scenarios/tax-price-20261119.csv" download>Download complete tax-price examples (CSV)</a>{!inGuide&&<> · <SiteLink href="/guides/tax-inclusive-prices-sales-tax-and-vat/">Read the tax-inclusive price method and rounding example</SiteLink></>}</p>
  <p className="content-date">Example arithmetic checked <time dateTime={content.checkedOn}>{content.checkedOn}</time> with independent 70-digit Decimal identities. This is not a tax-rate lookup or an invoice certification.</p>
 </section>;
}
