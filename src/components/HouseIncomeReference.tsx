import rows from '@/lib/house-affordability-income-cases.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
const usd=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
export default function HouseIncomeReference(){
 return <section aria-labelledby="house-income-comparison">
  <h2 id="house-income-comparison">How much house can I afford based on income?</h2>
  <p>Compare $60k, $80k, $100k, $150k and $200k gross annual household incomes under the same assumptions. Each example uses $500 monthly other debt, entered 28% housing / 36% total-debt limits, 20% down, a hypothetical 6% fixed rate for 30 years, annual property tax of 1.2% of home value and $1,500 annual insurance.</p>
  <p>These are planning examples, not lender limits or current rate quotes. HOA and maintenance are set to zero to isolate income; allow for actual costs. PMI is not calculated. The down payment shown excludes closing costs, moving, repairs and reserves, and the model does not verify available savings.</p>
  <div className="decision-case-table" role="region" aria-label="Home affordability by income; scroll horizontally for all columns" tabIndex={0}><table>
   <caption>Same assumptions, different income — hypothetical USD results</caption>
   <thead><tr><th scope="col">Gross annual income</th><th scope="col">Monthly housing budget</th><th scope="col">Estimated home price</th><th scope="col">20% down payment</th><th scope="col">Reproduce</th></tr></thead>
   <tbody>{rows.map(r=><tr key={r.income}><th scope="row">{usd(r.income)}</th><td>{usd(r.metrics['Monthly housing budget'])}</td><td>{usd(r.metrics['Estimated home price'])}</td><td>{usd(r.metrics['Down payment'])}</td><td><SiteLink href={calculatorPresetHref('/house-affordability-calculator',r.mode,r.values)}>Try ${r.income/1000}k income</SiteLink></td></tr>)}</tbody>
  </table></div>
  <figure className="decision-guide-figure"><div className="decision-guide-chart" role="region" aria-label="Income comparison chart; scroll horizontally on small screens" tabIndex={0}><img src="/images/guides/house-income-guide.svg" width={1350} height={750} loading="lazy" alt="Modeled home prices rise from approximately $202,712 at $60,000 gross annual income to $783,532 at $200,000 under the stated assumptions."/></div><figcaption>Income alone does not determine affordability. Fixed debt and ownership costs also affect the result. <a href="/images/guides/house-income-guide.svg">Open the chart</a>.</figcaption></figure>
  <p><a href="/data/calculation-guides/house-income-cases.csv" download>Download income examples and complete assumptions as CSV</a>. These five cases were independently calculated with Python Decimal at 60-digit precision and checked against the calculator within 0.000001 before display rounding.</p>
 </section>;
}
