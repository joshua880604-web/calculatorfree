import { tool } from './helpers';
import { area, date, metric, money, select, type Result, type Values } from '../types';
import { choose, integer, percentage, usd, value, whole } from './expansion-common';
import { calendarDay, dayLabel, inputRows, numericCell } from './specialist-common';

const simpleNotes = [
  'This is a manual business-credit illustration, not a lender quote, approval, APR disclosure or required minimum payment. Enter the rate, dates, fees and payment assumptions from the applicable agreement.',
  'Daily worksheets use simple interest, with an explicit 360- or 365-day denominator. Interest and entered fees are paid separately and never added to principal. They do not model compounding, variable rates, late charges, grace periods or lender-specific billing rules.',
];
const basis = () => select('basis', 'Simple-interest days per year', ['365', '360']);
const rate = () => percentage('rate', 'Annual interest rate assumption', 12, 0, 100);

export function creditPeriod(v: Values): Result {
  const balance = value(v, 'balance', 0, 1e10), apr = value(v, 'rate', 0, 100);
  const days = integer(v, 'days', 0, 3660), denominator = Number(choose(v, 'basis', ['365', '360']));
  const fees = value(v, 'fees', 0, 1e10), interest = balance * apr / 100 * days / denominator;
  return {
    metrics: [money('Modeled interest for entered period', interest), money('Interest plus entered fees', interest + fees), money('Principal assumed unchanged', balance), metric('Days in modeled period', days)],
    columns: ['Item', 'Amount'], rows: [['Simple interest', interest], ['Fees paid separately', fees], ['Total interest and fees', interest + fees]],
    notes: [...simpleNotes, 'The entered balance stays outstanding for every counted day. Total interest and fees exclude any principal repayment.'],
  };
}

export function creditLedger(v: Values): Result {
  const start = calendarDay(v.start, 'Start date'), end = calendarDay(v.end, 'Exclusive end date');
  const days = end - start;
  if (days < 1 || days > 3660) throw Error('The exclusive end date must be 1 to 3660 days after the start.');
  const opening = value(v, 'opening', 0, 1e10), limit = value(v, 'limit', 0.01, 1e10);
  if (opening > limit) throw Error('Opening principal cannot exceed the entered credit limit.');
  const apr = value(v, 'rate', 0, 100), denominator = Number(choose(v, 'basis', ['365', '360'])), fees = value(v, 'fees', 0, 1e10);
  const events = inputRows(v.transactions, 2, 0, 500).map(([date, amount], i) => {
    const day = calendarDay(date, `Transaction ${i + 1}`), change = numericCell(amount, `Transaction ${i + 1} principal change`, -1e10, 1e10);
    if (day < start || day >= end) throw Error(`Transaction ${i + 1} must fall on or after the start and before the exclusive end.`);
    return { day, change, order: i };
  }).sort((a, b) => a.day - b.day || a.order - b.order);
  let balance = opening, previousDay = start, balanceDays = 0, drawn = 0, repaid = 0;
  const intervals: (string | number)[][] = [], activity: (string | number)[][] = [[dayLabel(start), 'Opening balance', 0, opening]];
  const accrue = (to: number) => {
    if (to === previousDay) return;
    const count = to - previousDay, weighted = balance * count;
    intervals.push([dayLabel(previousDay), dayLabel(to), count, balance, weighted * apr / 100 / denominator]);
    balanceDays += weighted; previousDay = to;
  };
  for (const event of events) {
    accrue(event.day);
    const next = balance + event.change;
    if (next < -1e-7 || next > limit + 1e-7) throw Error(`Transaction ${event.order + 1} would repay more than principal owed or exceed the credit limit.`);
    balance = Math.max(0, Math.min(limit, next));
    if (event.change >= 0) drawn += event.change; else repaid -= event.change;
    activity.push([dayLabel(event.day), event.change >= 0 ? 'Principal draw' : 'Principal repayment', event.change, balance]);
  }
  accrue(end);
  const interest = balanceDays * apr / 100 / denominator;
  return {
    metrics: [money('Modeled interest over selected dates', interest), money('Interest plus entered fees', interest + fees), money('Closing principal balance', balance), money('Average daily principal balance', balanceDays / days), money('Principal drawn', drawn), money('Principal repaid', repaid), money('Unused credit at closing', limit - balance), metric('Days in modeled period', days)],
    columns: ['Date', 'Principal activity', 'Principal change', 'Principal after activity'], rows: activity,
    additionalTables: [{ title: 'Simple-interest accrual intervals', columns: ['From date included', 'Until date excluded', 'Days', 'Principal for interval', 'Unrounded interest'], rows: intervals }],
    notes: [...simpleNotes, 'The start date is included and the end date is excluded. Transactions change principal before interest accrues for that date. Rows on the same date are processed in the entered order after chronological sorting.', 'Negative transaction amounts repay principal only; interest and fees are excluded from those amounts. The credit limit is checked after every transaction. A transaction on the exclusive end date belongs in the next modeled period.'],
  };
}

export function creditPaydown(v: Values): Result {
  const opening = value(v, 'balance', 0, 1e10), apr = value(v, 'rate', 0, 100), payment = value(v, 'payment', 0.01, 1e10), fee = value(v, 'monthly_fee', 0, 1e10);
  const maxMonths = integer(v, 'max_months', 1, 1200), r = apr / 1200;
  if (opening > 0 && payment <= opening * r + fee) throw Error('Payment must exceed first-month interest plus the monthly fee. This model does not capitalize unpaid charges.');
  let balance = opening, totalInterest = 0, totalFees = 0, totalPayments = 0;
  const rows: number[][] = [];
  for (let month = 1; month <= maxMonths && balance > 0; month++) {
    const interest = balance * r, paid = Math.min(payment, balance + interest + fee), principal = paid - interest - fee;
    const next = paid === balance + interest + fee ? 0 : Math.max(0, balance - principal);
    rows.push([month, balance, interest, fee, paid, principal, next]);
    totalInterest += interest; totalFees += fee; totalPayments += paid; balance = next;
  }
  return {
    metrics: [{ ...metric('Modeled payoff time in months', rows.length), ...(balance > 0 ? { displayValue: `Not paid off within ${maxMonths} modeled months` } : {}) }, money('Interest over modeled payments', totalInterest), money('Total payments including fees', totalPayments), money('Principal remaining at model end', balance), money('Monthly fees over modeled payments', totalFees), metric('Payments modeled', rows.length)],
    columns: ['Month', 'Opening principal', 'Interest', 'Monthly fee', 'Payment', 'Principal repaid', 'Closing principal'], rows,
    notes: ['This separate fixed-payment model uses the entered nominal annual interest rate / 12 for each complete monthly period, with no new draws, rate changes or payment delays. It does not use daily dates or imply that a lender requires the entered payment.', 'Each active month charges the entered fee; payment covers that fee, then interest, then principal. The final payment is reduced to the amount owed. A zero opening balance incurs no modeled payments or fees.', 'A maximum-month horizon can end with principal outstanding. Read the remaining balance rather than interpreting the number of rows as a payoff date. Fees are paid, not added to principal; this is not a contractual APR or an amortization promise.'],
  };
}

export const businessLineOfCreditCalculator = tool('business-line-of-credit', [
  { id: 'interest', title: 'Constant-Balance Interest', description: 'Estimate simple interest for a stated balance, day count and separately paid fees.', fields: [usd('balance', 'Principal outstanding for every day', 25000), rate(), whole('days', 'Days interest accrues', 30, 'days', 0, 3660), basis(), usd('fees', 'Fees paid separately for this period', 50)], formula: 'Simple interest = constant principal × annual rate × counted days / selected year basis. Principal is not included in interest plus fees.', calculate: creditPeriod },
  { id: 'ledger', title: 'Dated Draws & Principal Repayments', description: 'Track manual principal activity and daily simple-interest intervals.', fields: [date('start', 'Start date (included)', '2026-12-01'), date('end', 'End date (excluded)', '2027-01-01'), usd('opening', 'Principal at start before listed transactions', 10000), usd('limit', 'Entered credit limit', 50000), rate(), basis(), { ...area('transactions', 'Date, signed principal change', '2026-12-10, 5000\n2026-12-20, -3000', 'Positive draws; negative principal-only repayments. Transactions take effect before that day’s accrual. No currency signs or thousands separators; leave blank for no activity.'), optional: true }, usd('fees', 'Period fees paid separately', 50)], formula: 'Interest = sum of principal × days in each interval × annual rate / selected year basis; closing principal = opening + draws − principal repayments.', calculate: creditLedger },
  { id: 'paydown', title: 'Fixed Monthly Payment, No Redraws', description: 'Model a chosen monthly payment and report any principal left at the chosen horizon.', fields: [usd('balance', 'Starting principal', 25000), rate(), usd('payment', 'Chosen total monthly payment', 1000), usd('monthly_fee', 'Fee charged each active month', 0), whole('max_months', 'Maximum modeled months', 600, 'months', 1, 1200)], formula: 'Monthly interest = opening principal × annual rate / 12. Principal repaid = payment − interest − fee, with a reduced final payment.', calculate: creditPaydown },
], 'Estimate business line-of-credit interest, dated draws and principal repayments, or a chosen fixed-payment plan. Inspect timing, fees and any remaining principal.');
