import SiteLink from './SiteLink';
import {routeFor} from '@/lib/calculators';
import {calculatorPresetHref} from '@/lib/preset-links';

export default function BorrowingPaths({id}:{id:string}){
 if(id==='credit-card-minimum-payment')return <section className="borrowing-paths" aria-labelledby="payment-paths">
  <h2 id="payment-paths">Minimum payment or fixed monthly payment?</h2>
  <p>This form follows a minimum that can change as your balance falls. An extra $50 here means $50 above each recalculated minimum, so your total monthly payment can still change.</p>
  <p>To pay the same total amount each month instead, use the <SiteLink href={calculatorPresetHref(routeFor('credit-card'),'payment')}>fixed monthly payment calculator</SiteLink>. Enter your balance, APR and planned monthly payment there. Neither calculation determines the amount due on your actual statement.</p>
 </section>;
 if(id==='boat-loan')return <section className="borrowing-paths" aria-labelledby="payment-paths">
  <h2 id="payment-paths">Buying a boat or paying off an existing loan?</h2>
  <p>For a new or used boat purchase, use Monthly Payment above with your quoted price, rate and term. Review the payment, total interest and amortization schedule. The entered interest rate is an assumption, not a live quote.</p>
  <ul>
   <li>Have a monthly loan budget instead of a purchase price? <SiteLink href={calculatorPresetHref(routeFor('boat-loan'),'price',{payment:700,down:10000,trade:0,tax:7,fees:500,finance:'Yes',rate:7,years:10})}>Try a $700 monthly-budget example</SiteLink> in Boat Price mode, then enter your own assumptions. Insurance, storage, fuel and maintenance are separate from that loan budget.</li>
   <li>Already have a loan and want to pay extra? <SiteLink href={calculatorPresetHref(routeFor('repayment'),'extra-payments')}>Estimate payoff with extra payments</SiteLink> using your current loan balance, rate and regular payment. The purchase form above has no extra-payment field; check your contract for prepayment charges.</li>
  </ul>
 </section>;
 return null;
}
