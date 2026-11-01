import {pmiRateComparison as example} from '@/lib/pmi-rate-comparison';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './pmi-rate-reference.css';
export default function PmiRateReference(){return <section className="pmi-rate-reference" aria-labelledby="pmi-rate-comparison">
 <h2 id="pmi-rate-comparison">Compare illustrative PMI rates</h2>
 <p>PMI rates vary by insurer, loan-to-value ratio (LTV), credit score, loan characteristics and required coverage. Estimate mode uses a National MI base-rate card effective March 1, 2022, with disclosed assumptions. It is an illustration, not a current market quote or a government-set rate. Use <SiteLink href={calculatorPresetHref('/pmi-calculator','quote',example.values)}>Use My Quote</SiteLink> for your lender’s actual annual PMI rate.</p>
 <p>For the same <strong>$360,000 original loan principal</strong>, these hypothetical annual rates give different monthly premiums:</p>
 <table><caption>Fixed quote comparison: original principal × annual percentage / 100 / 12</caption><thead><tr><th scope="col">Annual rate</th><th scope="col">Monthly PMI</th><th scope="col">Try inputs</th></tr></thead><tbody>{example.rates.map(r=><tr key={r.annual}><th scope="row">{r.annual.toFixed(2)}%</th><td>${r.monthly.toFixed(2)}</td><td><SiteLink href={calculatorPresetHref('/pmi-calculator','quote',{...example.values,annual_pmi:r.annual})}>Try rate →</SiteLink></td></tr>)}</tbody></table>
 <p>The $6 monthly difference is $72 over twelve premium payments. Both examples use a constant annual quote on original principal; neither is an insurer offer. Compare the same loan amount, premium basis and cancellation assumptions before treating another website’s result as a calculation error.</p>
 </section>;}
