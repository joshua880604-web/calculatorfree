import { tool } from './helpers';
import { metric, money, select, type Result, type Values } from '../types';
import { choose, integer, percentage, usd, value, whole } from './expansion-common';

export function cashAdvanceCost(v: Values): Result {
  const amount = value(v, 'amount', 0.01, 1e9);
  const feeRate = value(v, 'fee_rate', 0, 100), minimum = value(v, 'minimum_fee', 0, 1e9);
  const atm = value(v, 'atm_fee', 0, 1e9), apr = value(v, 'apr', 0, 100);
  const days = integer(v, 'days', 0, 3650);
  const basis = Number(choose(v, 'day_basis', ['365', '360']));
  const method = choose(v, 'interest_method', ['Simple daily', 'Daily compound']);
  const treatment = choose(v, 'fee_treatment', ['Pay upfront', 'Finance fees']);
  const advanceFee = Math.max(amount * feeRate / 100, minimum), fees = advanceFee + atm;
  const financed = treatment === 'Finance fees';
  const base = amount + (financed ? fees : 0), daily = apr / 100 / basis;
  const interestAt = (d: number) => method === 'Simple daily' ? base * daily * d : base * Math.expm1(d * Math.log1p(daily));
  const interest = interestAt(days), cost = fees + interest;
  const horizons = [...new Set([0, 7, 14, 30, 60, 90, days])].sort((a,b) => a-b);
  return {
    metrics: [money('Total modeled cost', cost), money('Estimated interest', interest), money('Total fees', fees), money('Advance fee after minimum', advanceFee), money('ATM fee', atm), money('Total cash needed including repayment', amount + cost), money('Ending card balance before repayment', base + interest), money('Interest-bearing starting balance', base), metric('Selected days until full repayment', days), {...metric('Simple annualized cost / cash received', days > 0 ? cost / amount * basis / days * 100 : 0, 'percent'), ...(days === 0 ? {displayValue: 'Undefined: zero-day horizon'} : {})}],
    columns: ['Full repayment after days', 'Fees ($)', 'Interest ($)', 'Total cost ($)', 'Cash needed including repayment ($)'],
    rows: horizons.map(d => [d, fees, interestAt(d), fees + interestAt(d), amount + fees + interestAt(d)]),
    notes: [
      'One credit-card cash advance in USD, followed by one full repayment after the selected number of accrued days. No intervening payments, purchases, variable APR, grace period, payment allocation, trailing interest or merchant cash advance is modeled.',
      `Advance fee = max(amount × fee rate / 100, minimum fee). The ATM fee is added once. Selected fee treatment: ${treatment}. This applies to both entered fees; check your card agreement because fees may have different treatment.`,
      `Interest convention: ${method}, using APR / ${basis} for the daily rate. Simple daily holds the starting interest-bearing balance fixed; daily compounding capitalizes interest every day. A card that capitalizes monthly or uses statement average daily balances can differ from both approximations.`,
      'Cash advances generally accrue interest from the transaction date. Enter the number of days your issuer actually charges; zero days is a fee-only boundary calculation, not a promised interest-free period.',
      'The comparison table changes only the full-repayment date. It is not an installment or minimum-payment schedule. Financed fees are included once in total cash needed; separately paid fees remain an upfront cash outflow.',
      'The simple annualized cost divides total modeled fees and interest by cash received and scales by the selected day basis / days. It is not an IRR, effective annual yield, statutory APR or an issuer quote. It is undefined at a zero-day horizon.',
      'Illustrative inputs are not typical rates or product recommendations. Internal calculations retain precision; displayed amounts are rounded at presentation, not at every daily step.',
    ],
  };
}

export const cashAdvanceFeeCalculator = tool('cash-advance-fee', [{id: 'cost', title: 'Fees & Interest', description: 'Estimate one credit-card cash advance repaid in full after a selected number of days.', fields: [usd('amount','Cash advance amount received',1000), percentage('fee_rate','Cash advance fee rate',5), usd('minimum_fee','Minimum cash advance fee',10), usd('atm_fee','Additional ATM fee',3), percentage('apr','Cash advance APR',30), whole('days','Accrued days until full repayment',30,'days',0,3650), select('day_basis','Daily-rate year basis',['365','360']), select('interest_method','Interest approximation',['Simple daily','Daily compound']), select('fee_treatment','Treatment of both entered fees',['Pay upfront','Finance fees'])], formula: 'Fees = max(cash received × fee rate, minimum fee) + ATM fee. Interest = selected interest-bearing balance × daily rate × days (simple), or balance × [(1 + daily rate)^days − 1] (daily compounding).', calculate: cashAdvanceCost}], 'Estimate credit-card cash advance fees, interest and total repayment cash. Compare repayment dates with explicit day-count, compounding and fee-financing assumptions.');
