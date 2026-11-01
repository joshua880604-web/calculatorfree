import SiteLink from './SiteLink';
import {calculatorPresetHref} from '@/lib/preset-links';

export default function DiscountReference({inGuide=false}:{inGuide?:boolean}) {
  return <section aria-labelledby="discount-method">
    <h2 id="discount-method">Calculate the sale price and what you save</h2>
    <p>For one percentage reduction, savings = original price × discount / 100, and sale price = original − savings. For two successive discounts, sale price = original × (1 − first / 100) × (1 − additional / 100). The second percentage applies to the remaining price.</p>
    <p>On $100, 20% off gives $80. Taking another 10% off that $80 gives $72, with $28 saved overall. The combined discount is 28%, not 30%. Use the Stacked Discounts tab for this scenario; a promotion must actually allow both reductions.</p>
    <p><SiteLink href={calculatorPresetHref('/discount-calculator','stacked',{before:'100',first:'20',second:'10'})}>Try 20% off, then another 10% off</SiteLink></p>
    <h3>Keep tax and seller profit separate</h3>
    <p>The calculator does not add tax, shipping or fees. If the entire $72 sale price is taxable at an illustrative 7%, tax is $5.04 and total is $77.04. Taxability, coupon treatment and actual rates need separate confirmation.</p>
    <p><SiteLink href={calculatorPresetHref('/sales-tax-calculator','after',{before:'72',rate:'7'})}>Check the separate 7% tax example</SiteLink> · <SiteLink href="/margin-calculator">Check profit margin</SiteLink> · <SiteLink href="/markup-calculator">Compare markup and selling price</SiteLink></p>
    <p>{inGuide ? <SiteLink href="/discount-calculator">Calculate your own discount →</SiteLink> : <SiteLink href="/guides/discounts-and-sales-commission-bases/">Read the discount and price-base guide →</SiteLink>}</p>
  </section>;
}
