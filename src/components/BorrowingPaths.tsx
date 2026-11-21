import SiteLink from './SiteLink';
import {routeFor} from '@/lib/calculators';
import {calculatorPresetHref} from '@/lib/preset-links';

export default function BorrowingPaths({id}:{id:string}){
 if(id==='college-cost')return <section className="borrowing-paths" aria-labelledby="education-next-step">
  <h2 id="education-next-step">Saving before college or estimating loan payments?</h2>
  <p>Use the cost projection above to compare your entered tuition-growth and saving assumptions. To explore a separate deposit plan, use the <SiteLink href={routeFor('savings')}>savings calculator</SiteLink>. If you expect to borrow part of the cost, enter that assumed balance in the <SiteLink href={routeFor('student-loan')}>student loan payment calculator</SiteLink>.</p>
  <p>The loan worksheet models fixed payments under an entered rate and term; it does not determine eligibility, income-driven payments or forgiveness.</p>
 </section>;
 if(id==='student-loan')return <section className="borrowing-paths" aria-labelledby="education-next-step">
  <h2 id="education-next-step">Planning college costs or repaying a balance?</h2>
  <p>For costs and savings before enrollment, use the <SiteLink href={routeFor('college-cost')}>college cost and savings planner</SiteLink>. For an existing loan, use the balance, rate and term above to estimate fixed payments. Income-driven plans and forgiveness are outside this model.</p>
 </section>;
 if(id==='operating-cash-flow')return <section className="borrowing-paths" aria-labelledby="noncash-next-step">
  <h2 id="noncash-next-step">Check noncash depreciation separately</h2>
  <p>When reconciling profit to operating cash flow, depreciation already included as an expense may be part of the entered noncash adjustment. Review a separate <SiteLink href={routeFor('depreciation')}>book depreciation schedule</SiteLink> if you need to compare methods. Add an included expense back only once; its accounting allocation is not a new cash receipt.</p>
 </section>;
 if(id==='depreciation')return <section className="borrowing-paths" aria-labelledby="noncash-next-step">
  <h2 id="noncash-next-step">Book expense and cash flow are different</h2>
  <p>This schedule allocates an entered asset cost over time. To reconcile profit with entered noncash and working-capital adjustments, use the <SiteLink href={routeFor('operating-cash-flow')}>operating cash flow worksheet</SiteLink>. Depreciation is not a cash payment or a market-value forecast; neither worksheet prepares a tax return.</p>
 </section>;
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
