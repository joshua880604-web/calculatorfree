import { tool } from './helpers';
import { area, metric, money, select, type Field, type Result, type Values } from '../types';
import { choose, integer, percentage, usd, value, whole } from './expansion-common';
import { inputRows, monthlyPayment, numericCell } from './specialist-common';

type PaymentRow = { month: number; rate: number; payment: number; interest: number; principal: number; balance: number; reset: boolean };

function fixedSchedule(principal: number, annualRate: number, months: number): PaymentRow[] {
  let balance = principal;
  const payment = monthlyPayment(principal, annualRate, months), rows: PaymentRow[] = [];
  for (let month = 1; month <= months; month++) {
    const interest = balance * annualRate / 1200;
    const paid = month === months ? balance + interest : Math.min(payment, balance + interest);
    const reduction = paid - interest;
    balance = month === months ? 0 : Math.max(0, balance - reduction);
    rows.push({ month, rate: annualRate, payment: paid, interest, principal: reduction, balance, reset: false });
  }
  return rows;
}

export function armMortgage(v: Values, upwardStress = false): Result {
  const principal = value(v, 'principal', 0.01, 1e10), years = integer(v, 'term_years', 2, 50), months = years * 12;
  const fixedYears = integer(v, 'fixed_years', 1, 49), fixedMonths = fixedYears * 12;
  if (fixedMonths >= months) throw Error('The initial fixed period must end before the amortization term.');
  const initialRate = value(v, 'initial_rate', 0, 50), firstCap = value(v, 'first_cap', 0, 50), periodicCap = value(v, 'periodic_cap', 0, 50), lifeCap = value(v, 'lifetime_cap', 0, 50);
  const resetMonths = Number(choose(v, 'reset_months', ['12', '6']));
  const margin = upwardStress ? 0 : value(v, 'margin', 0, 30), floor = upwardStress ? 0 : value(v, 'floor', 0, 100);
  const ceiling = initialRate + lifeCap;
  if (floor > ceiling) throw Error('The rate floor exceeds the entered lifetime rate ceiling.');
  const indices = upwardStress ? [] : inputRows(v.indices, 1, 1, 100).map(([n], i) => numericCell(n, `Index assumption ${i + 1}`, -50, 100));
  const fixedRate = value(v, 'fixed_compare_rate', 0, 50), holdingMonths = integer(v, 'holding_years', 1, years) * 12;
  let balance = principal, rate = initialRate, payment = monthlyPayment(principal, rate, months), resetNumber = 0;
  const rows: PaymentRow[] = [], resets: (string | number)[][] = [];
  for (let month = 1; month <= months; month++) {
    const reset = month > fixedMonths && (month - fixedMonths - 1) % resetMonths === 0;
    if (reset) {
      const cap = resetNumber === 0 ? firstCap : periodicCap;
      const low = Math.max(floor, rate - cap), high = Math.min(ceiling, rate + cap);
      if (low > high + 1e-10) throw Error(`Reset in month ${month}: the selected floor and rate caps leave no feasible rate. Review the model assumptions.`);
      const index = upwardStress ? null : indices[Math.min(resetNumber, indices.length - 1)];
      const target = upwardStress ? high : index! + margin;
      rate = upwardStress ? high : Math.max(low, Math.min(high, target));
      payment = monthlyPayment(balance, rate, months - month + 1);
      resets.push([month, upwardStress ? 'Upward-cap assumption' : index!, upwardStress ? 'Not used' : margin, upwardStress ? 'Permitted upper rate' : target, low, high, rate, payment]);
      resetNumber++;
    }
    const interest = balance * rate / 1200;
    const paid = month === months ? balance + interest : Math.min(payment, balance + interest), reduction = paid - interest;
    balance = month === months ? 0 : Math.max(0, balance - reduction);
    rows.push({ month, rate, payment: paid, interest, principal: reduction, balance, reset });
  }
  const fixed = fixedSchedule(principal, fixedRate, months), held = rows.slice(0, holdingMonths), heldFixed = fixed.slice(0, holdingMonths);
  const sum = (rs: PaymentRow[], key: 'interest' | 'payment') => rs.reduce((n, row) => n + row[key], 0);
  const armInterest = sum(held, 'interest'), fixedInterest = sum(heldFixed, 'interest');
  const annual = Array.from({ length: years }, (_, y) => {
    const yr = rows.slice(y * 12, (y + 1) * 12);
    return [y + 1, sum(yr, 'payment'), sum(yr, 'interest'), yr.reduce((n, r) => n + r.principal, 0), yr.at(-1)!.balance];
  });
  return {
    metrics: [money('Initial monthly principal and interest', rows[0].payment), money('First-reset monthly principal and interest', rows[fixedMonths].payment), money('Highest modeled monthly principal and interest', Math.max(...rows.map(r => r.payment))), money('ARM interest through holding period', armInterest), money('ARM principal after holding period', held.at(-1)!.balance), money('Fixed-loan interest through holding period', fixedInterest), money('Fixed-loan principal after holding period', heldFixed.at(-1)!.balance), money('ARM minus fixed interest through holding period', armInterest - fixedInterest), money('Full-model ARM interest', sum(rows, 'interest')), { ...metric('Lifetime rate ceiling entered', ceiling), format: 'percent' as const }, metric('Holding period in months', holdingMonths)],
    columns: ['Month', 'Annual interest rate (%)', 'Principal and interest', 'Interest', 'Principal repaid', 'Closing principal', 'Rate reset'],
    rows: rows.map(r => [r.month, r.rate, r.payment, r.interest, r.principal, r.balance, r.reset ? 'Reset before payment' : '']),
    annualColumns: ['Loan year', 'Principal and interest paid', 'Interest', 'Principal repaid', 'Closing principal'], annualRows: annual,
    additionalTables: [
      { title: 'Rate-reset assumptions and constraints', columns: ['First payment month at new rate', 'Index assumption (%)', 'Margin (points)', 'Uncapped target (%)', 'Permitted lower rate (%)', 'Permitted upper rate (%)', 'Rate used (%)', 'New monthly P&I'], rows: resets },
      { title: 'Same-principal holding-period comparison', columns: ['Measure', 'Modeled ARM', 'Entered fixed-rate alternative'], rows: [['Interest paid', armInterest, fixedInterest], ['Principal remaining', held.at(-1)!.balance, heldFixed.at(-1)!.balance], ['Principal and interest paid', sum(held, 'payment'), sum(heldFixed, 'payment')]] },
    ],
    notes: [
      'The loan is fully amortizing with monthly payments and the nominal annual rate / 12 for monthly interest. After the initial fixed years, the rate resets before that month’s accrual and the payment is recalculated over the remaining months. This is an explicit illustration, not a lender disclosure or quote.',
      upwardStress ? 'Upward-cap stress assumes the maximum permitted upward move at every reset until the entered lifetime ceiling is reached. It does not predict an index path or assert that a borrower will experience those rates.' : 'Each index entry is an annual percentage assumption for one successive reset; the last entry is reused for every remaining reset. Index plus margin is bounded by the chosen floor, the per-reset caps and the lifetime ceiling. These manually entered future indices are scenarios, not a market forecast or live SOFR feed.',
      'The first-reset and subsequent-reset limits are percentage-point changes applied symmetrically up or down in scenario mode. The lifetime cap is an increase above the initial rate; a separate floor is used. There is no unused-cap carryover, payment cap, negative amortization, interest-only phase or contract-specific rounding rule.',
      'The fixed-rate comparison uses the same starting principal, term and month-end horizon. Interest and remaining principal are separate measures. Taxes, insurance, PMI, closing fees, sale costs and refinancing are excluded, so the interest difference is not a complete cost or suitability ranking.',
      '5/1, 7/1 and 10/1 refer here to initial fixed years followed by 12-month resets. Six-month resets can be selected explicitly. Rate changes apply on loan-month boundaries; actual reset notices, lookbacks and contracts can use different conventions.',
    ],
  };
}

const common = (): Field[] => [usd('principal', 'Starting loan principal', 300000), whole('term_years', 'Original amortization term', 30, 'years', 2, 50), percentage('initial_rate', 'Initial annual rate', 5, 0, 50), whole('fixed_years', 'Initial fixed-rate years', 5, 'years', 1, 49), select('reset_months', 'Months between later rate resets', ['12', '6']), percentage('first_cap', 'First-reset limit in percentage points', 2, 0, 50), percentage('periodic_cap', 'Later per-reset limit in percentage points', 2, 0, 50), percentage('lifetime_cap', 'Lifetime increase above initial rate in points', 5, 0, 50)];
const comparison = () => [percentage('fixed_compare_rate', 'Fixed-rate comparison annual rate', 6, 0, 50), whole('holding_years', 'Whole years to compare', 7, 'years', 1, 50)];
export const armMortgageCalculator = tool('arm-mortgage', [
  { id: 'scenario', title: 'Entered Index Path & Rate Caps', description: 'Model entered reset-index assumptions and compare with a fixed-rate loan.', fields: [...common(), percentage('margin', 'Annual margin added to each index in points', 2.5, 0, 30), percentage('floor', 'Minimum annual rate after resets', 2.5, 0, 100), area('indices', 'Successive annual index assumptions, one per reset', '5', 'One percentage per line. The last value repeats for all remaining resets; no future rate feed is used.'), ...comparison()], formula: 'At each reset: target rate = entered index + margin, constrained by floor, first/later change caps and initial rate + lifetime increase. New payment amortizes remaining principal over remaining months.', calculate: v => armMortgage(v) },
  { id: 'upward-caps', title: 'Upward Rate-Cap Stress', description: 'Apply every permitted upward rate step as a defined stress assumption.', fields: [...common(), ...comparison()], formula: 'At each reset: stressed rate = min(previous rate + applicable upward cap, initial rate + lifetime increase). Re-amortize remaining principal and compare equal holding periods.', calculate: v => armMortgage(v, true) },
], 'Calculate ARM mortgage payment changes from an entered index path or an upward-cap stress scenario. Inspect rate resets, remaining balances and a fixed-rate comparison.');
