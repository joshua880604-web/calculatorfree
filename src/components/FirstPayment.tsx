import { firstPaymentParts } from '@/lib/first-payment';
import type { Result } from '@/lib/types';
import './repayment-help.css';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function FirstPayment({ id, result }: { id: string; result: Result }) {
  const parts = firstPaymentParts(id, result);
  if (!parts) return null;
  return <section className="first-payment-explanation" aria-labelledby="first-payment-heading">
    <h3 id="first-payment-heading">Your first monthly payment</h3>
    <p>Of the {usd.format(parts.payment)} payment, <strong>{usd.format(parts.interest)} is interest</strong> and <strong>{usd.format(parts.principal)} reduces principal</strong>. The balance after this payment is {usd.format(parts.balance)}.</p>
    <p>This includes any extra payment due in the first month. Amounts are rounded to cents.</p>
  </section>;
}
