import content from '@/lib/refinance-payoff-rentbuy-content.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
import './loan-cost-reference.css';
export function hasRefinancePayoffRentBuyReference(id:string){return Object.hasOwn(content,id);}
export default function RefinancePayoffRentBuyReference({id,inGuide=false}:{id:string;inGuide?:boolean}){
 if(!hasRefinancePayoffRentBuyReference(id))return null;
 const data=content[id as keyof typeof content],heading='reviewed-'+id+'-scenarios';
 return <section className="loan-cost-reference reviewed-housing-reference" data-calculator={id} aria-labelledby={heading}>
  <h2 id={heading}>{data.heading}</h2><p>{data.intro}</p>
  <p>Each example restores every input. Scroll the table horizontally to compare all columns. These are hypothetical monthly models, not current offers or personal recommendations.</p>
  <figure className="decision-guide-figure"><div className="decision-guide-chart" role="region" tabIndex={0} aria-label="Scenario chart; scroll on small screens"><img src={data.chartPath} width={1350} height={750} loading="lazy" alt={data.chartAlt}/></div><figcaption>{data.chartCaption}</figcaption></figure>
  <div className="decision-case-table" role="region" tabIndex={0} aria-label="Complete scenario inputs and checked results; scroll for all columns"><table>
   <caption>Hypothetical USD results under the complete stated assumptions</caption>
   <thead><tr>{data.columns.map(c=><th key={c} scope="col">{c}</th>)}<th scope="col">Reproduce</th></tr></thead>
   <tbody>{data.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{row.display.map((value,i)=><td key={i}>{value}</td>)}<td><SiteLink href={calculatorPresetHref('/'+id+'-calculator',row.mode,Object.fromEntries(Object.entries(row.values).map(([key,value])=>[key,String(value)])))}>Try these inputs</SiteLink></td></tr>)}</tbody>
  </table></div>
  <h3>Read the assumptions before comparing</h3><ul>{data.notes.map(note=><li key={note}>{note}</li>)}</ul>
  <p><a href={data.csvPath} download>Download these complete scenario inputs (CSV)</a>{!inGuide&&<> · <SiteLink href={data.guidePath}>Read the method and limitations</SiteLink></>}</p>
  <p className="content-date">Example arithmetic checked <time dateTime={data.checkedOn}>{data.checkedOn}</time> using an independent 70-digit Decimal calculation. This is not an external professional review.</p>
 </section>;
}
