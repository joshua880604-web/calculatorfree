import cases from '@/lib/calculation-guide-cases.json';
import './decision-guide.css';
import './loan-cost-reference.css';
import SiteLink from './SiteLink';
import { calculatorPresetHref } from '@/lib/preset-links';
import { routeFor } from '@/lib/catalog';
import GuideDisclosure from './GuideDisclosure';


// Static worked comparisons: no client bundle, requests or calculation dependency.
export default function RoiReference() {
  return (
    <section className="loan-cost-reference" aria-labelledby="roi-formulas">
      <h2 id="roi-formulas">How to calculate ROI and annualized ROI</h2>
      <p>
        First define the amount invested and the full amount returned on the same cost basis.
        Subtract invested capital to find the gain, then divide by the invested amount.
        Include relevant fees once. A zero initial investment does not give a defined ROI percentage.
      </p>
      <dl className="result-definitions">
        <div><dt>Investment gain or loss</dt><dd>Amount returned − amount invested</dd></div>
        <div><dt>Total ROI (%)</dt><dd>(Amount returned − amount invested) / amount invested × 100</dd></div>
        <div><dt>Annualized ROI (%)</dt><dd>((Amount returned / amount invested)^(1 / years) − 1) × 100</dd></div>
      </dl>
      <p>
        Amount returned includes the principal recovered, not just the profit.
        Annualization uses compound growth, so dividing total ROI by years usually gives a different answer.
        For a positive starting and ending value with no intermediate cash flows, this is the same
        endpoint calculation used for <SiteLink href="/glossary/cagr/">CAGR</SiteLink>.
      </p>
      <GuideDisclosure id="roi-holding-period-comparison" title="Compare costs, losses and holding periods">
      <p>These hypothetical examples have no intermediate cash flows. The fee-adjusted case includes $100 at entry and $100 at exit; do not deduct fees again if already included. Scroll horizontally on small screens to see every column.</p>
      <div className="decision-case-table" role="region" aria-label="ROI comparison by holding period" tabIndex={0}>
        <table>
          <caption>Total vs. annualized ROI</caption>
          <thead><tr><th scope="col">Scenario</th><th scope="col">Initial cost</th><th scope="col">Returned</th><th scope="col">Years</th><th scope="col">Total ROI</th><th scope="col">Annualized ROI</th></tr></thead>
          <tbody>{cases.roi.map(r=><tr key={r.label}><th scope="row"><SiteLink href={calculatorPresetHref(routeFor('roi'),r.mode,r.values)}>{r.label}</SiteLink></th><td>${r.values.cost.toLocaleString('en-US')}</td><td>${r.values.returned.toLocaleString('en-US')}</td><td>{r.values.years}</td><td>{r.display[1]}</td><td>{r.display[2]}</td></tr>)}</tbody>
        </table>
      </div>
      <p>
        The five-year investment earns more dollars overall; the two-year investment has the
        higher compound annual equivalent. Neither percentage measures risk, liquidity or whether
        the shorter investment can be repeated. Open either scenario to inspect its inputs.
      </p>
      <p><SiteLink href="/guides/how-to-calculate-roi/">Read the ROI cost and loss guide, with a comparison chart and downloadable case inputs →</SiteLink></p>
      <h3>When a simple investment ROI calculation is insufficient</h3>
      <p>
        Fees paid at purchase can be included in the initial cost, and exit fees can reduce
        the final returned amount. Receipts, expenses or deposits at other times need their timing
        considered. Use <SiteLink href={calculatorPresetHref(routeFor('average-return'), 'cashflows')}>dated cash flows</SiteLink> for
        actual transactions, <SiteLink href={calculatorPresetHref(routeFor('investment'), 'end')}>Investment</SiteLink> for
        deposit-and-growth projections, or <SiteLink href={calculatorPresetHref(routeFor('rental-property'), 'projection')}>Rental Property</SiteLink> for
        operating income, financing and sale proceeds. Advertising ROAS measures revenue against ad spend;
        it does not automatically measure net-profit ROI.
      </p>
      </GuideDisclosure>
    </section>
  );
}
