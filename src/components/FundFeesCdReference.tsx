import content from '@/lib/fund-fees-cd-content.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
import './loan-cost-reference.css';

export function hasFundFeesCdReference(id:string){return Object.hasOwn(content,id);}
export default function FundFeesCdReference({id,inGuide=false}:{id:string;inGuide?:boolean}){
 if(!hasFundFeesCdReference(id))return null;
 const data=content[id as keyof typeof content];
 const heading='reviewed-'+id+'-scenarios';
 return <section className="loan-cost-reference reviewed-scenario-reference" data-calculator={id} aria-labelledby={heading}>
  {!inGuide&&id!=='cd'&&<span id="practical-model-examples"/>}
  <h2 id={heading}>{data.heading}</h2><p>{data.intro}</p>
  <p>Each link restores the complete assumptions. Scroll the table horizontally to compare all columns.</p>
  {id==='investment-fee'&&<figure className="decision-guide-figure"><div className="decision-guide-chart" role="region" tabIndex={0} aria-label="Model-charged fees and balance reduction; scroll on small screens"><img src="/images/guides/reviewed-investment-fee-20261119.svg" width={1350} height={750} loading="lazy" alt="The same twenty-year pre-fee-return scenarios compare model-charged fees with the larger balance reduction that includes foregone growth."/></div><figcaption>The chart shows only the first two rows, which share the same return basis. It does not rank the rows whose entered return already includes fund expenses.</figcaption></figure>}
  <div className="decision-case-table" role="region" tabIndex={0} aria-label="Independently checked scenarios; scroll for all columns"><table>
   <caption>Hypothetical USD scenarios under the complete stated inputs</caption>
   <thead><tr>{data.columns.map(c=><th scope="col" key={c}>{c}</th>)}<th scope="col">Reproduce</th></tr></thead>
   <tbody>{data.rows.map(row=><tr key={row.label}><th scope="row">{row.label}</th>{row.display.map((value,i)=><td key={i}>{value}</td>)}<td><SiteLink href={calculatorPresetHref('/'+id+'-calculator',row.mode,Object.fromEntries(Object.entries(row.values).map(([key,value])=>[key,String(value)])))}>Try these inputs</SiteLink></td></tr>)}</tbody>
  </table></div>
  <h3>Read the assumptions before comparing</h3><ul>{data.notes.map(note=><li key={note}>{note}</li>)}</ul>
  <p><a href={data.csvPath} download>Download these complete scenario inputs (CSV)</a>{!inGuide&&<> · <SiteLink href={data.guidePath}>Read the method and limitations</SiteLink></>}</p>
  <p>{data.related.map((link,i)=><span key={link.href}>{i>0?' · ':''}<SiteLink href={link.href}>{link.label}</SiteLink></span>)}</p>
  <p className="content-date">Example arithmetic checked <time dateTime={data.checkedOn}>{data.checkedOn}</time>. Hypothetical assumptions, not product quotes or an external professional review.</p>
 </section>;
}
