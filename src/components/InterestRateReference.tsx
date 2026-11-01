import SiteLink from './SiteLink';
import GuideDisclosure from './GuideDisclosure';

export default function InterestRateReference({inGuide=false}:{inGuide?:boolean}) {
  return <section aria-labelledby="interest-rate-method">
    <h2 id="interest-rate-method">Find a loan rate from monthly payments</h2>
    <p>The rate is the unknown, rather than an input. Supply the financed balance, the number of monthly payments and the fixed principal-and-interest installment. The model assumes the final installment clears the balance, with no separate balloon or fees.</p>
    <p className="formula">Principal = payment × [1 − (1 + monthly rate)<sup>−months</sup>] / monthly rate</p>
    <p>At a zero rate, principal equals payment × months. For other rates, a numerical solver finds the monthly rate. Nominal annual rate is twelve times that result; the effective annual rate is (1 + monthly rate)<sup>12</sup> − 1. Neither automatically includes borrowing fees.</p>
    <GuideDisclosure title="Check the rate in Excel and compare quote conventions">
      <p>For $10,000 repaid by twelve $900 month-end installments, <code>=RATE(12,-900,10000)*12</code> gives approximately 14.4521% nominal annually. Format the result as a percentage. Excel uses opposing signs for funds received and paid; this calculator asks for a positive payment amount.</p>
      <p>Use <code>=(1+RATE(12,-900,10000))^12-1</code> for the effective annual rate. Actual rounded installments, payment dates, fees and balloon balances can explain differences from a contract quote. This is a reproducible mathematical example, not an observed loan offer.</p>
    </GuideDisclosure>
    <h3>Choose the tool for what you know</h3>
    <ul>
      <li><SiteLink href="/apr-calculator">APR Calculator</SiteLink>: compare its stated borrowing-fee assumptions with the note rate.</li>
      <li><SiteLink href="/loan-calculator">Loan Calculator</SiteLink>: know the rate and need a payment or schedule.</li>
      <li><SiteLink href="/savings-calculator">Savings Calculator</SiteLink>: enter APY or a nominal rate to project deposits and savings goals.</li>
      <li><SiteLink href="/cagr-calculator">CAGR Calculator</SiteLink>: infer endpoint growth without intervening deposits or withdrawals.</li>
      <li><SiteLink href="/compound-interest-calculator">Compound Interest Calculator</SiteLink>: project compound growth or convert rate conventions.</li>
    </ul>
    <p>{inGuide ? <SiteLink href="/interest-rate-calculator">Calculate a loan rate from your own payment →</SiteLink> : <SiteLink href="/guides/how-to-read-amortization-and-loan-payments/">Read the loan payment and implied-rate guide →</SiteLink>}</p>
  </section>;
}
