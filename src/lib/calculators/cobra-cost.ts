import { tool } from './helpers';
import { metric, money, type Result, type Values } from '../types';
import { integer, percentage, usd, value, whole } from './expansion-common';

export function cobraCost(v: Values, mode: 'contributions' | 'premium' = 'contributions'): Result {
  const prior = value(v, mode === 'contributions' ? 'employee_share' : 'previous_payment', 0, 1e9);
  const employer = mode === 'contributions' ? value(v,'employer_share',0,1e9) : 0;
  const total = mode === 'contributions' ? prior + employer : value(v,'total_premium',0.01,1e9);
  if (total <= 0) throw Error('Enter a positive total monthly plan premium for the same coverage tier.');
  if (prior > total) throw Error('Previous employee payment exceeds the entered total plan premium. Use matching monthly amounts and coverage tiers.');
  const admin = value(v,'admin_rate',0,2), months = integer(v,'months',1,36);
  const subsidy = value(v,'monthly_subsidy',0,1e9), fee = total * admin / 100, gross = total + fee;
  if (subsidy > gross) throw Error('Monthly subsidy exceeds the modeled premium including the administrative charge. Enter an applicable subsidy no larger than that charge.');
  const monthly = gross - subsidy, change = monthly - prior;
  return {
    metrics: [money('Estimated monthly amount you pay', monthly), money('Estimated cost for selected months', monthly * months), money('Monthly change from previous employee payment', change), money('Total monthly plan premium', total), money('Monthly administrative charge', fee), money('Monthly premium before subsidy', gross), money('Monthly subsidy assumed', subsidy), money('Previous employee payment per month', prior), metric('Selected planning months', months)],
    columns: ['Planning month', 'Premium before subsidy ($)', 'Subsidy assumed ($)', 'Amount you pay ($)', 'Cumulative amount you pay ($)', 'Cumulative change from previous payment ($)'],
    rows: Array.from({length:months},(_,i) => [i+1,gross,subsidy,monthly,monthly*(i+1),change*(i+1)]),
    notes: [
      'A USD premium-only planning worksheet for the ordinary federal COBRA cost rule, assuming unchanged monthly coverage and rates. It does not determine COBRA eligibility, election deadlines, coverage duration, tax treatment or an insurer quote.',
      'Use the full cost for the same person/family coverage tier: the employee and employer contributions together. The ordinary federal ceiling is generally 102% of that applicable cost, not 102% of the employee payroll deduction. The entered administrative charge may be from 0% to 2%; 2% is not a mandatory charge for every plan.',
      'Certain disability-extension months may allow a 150% premium. That extension and state continuation rules are excluded from this ordinary 0–2% worksheet. Ask the plan administrator for the applicable rate and coverage notice.',
      'The selected 1–36 planning months are only arithmetic inputs, not a promise or finding of eligibility for those months. Deductibles, copays, coinsurance, out-of-pocket limits and other medical expenses are not included.',
      'The same entered subsidy is assumed to reduce your payment each selected month, including the administrative charge if applicable. No government subsidy or employer assistance is inferred. If support expires, model the subsidized and unsubsidized periods separately and add their costs.',
      'The change compares monthly premiums paid by you, not equivalent after-tax purchasing power or total healthcare costs. A negative change is possible when an entered subsidy lowers the modeled payment below the prior payroll amount.',
      'Amounts retain internal precision, with rounding only for display. An actual bill may round the monthly premium first or include retroactive months and rate changes; use the plan notice for payment amounts and due dates.',
    ],
  };
}
const shared = () => [percentage('admin_rate','Administrative charge on full premium',2,0,2), usd('monthly_subsidy','Applicable subsidy each planning month',0), whole('months','Months you want to model',6,'months',1,36)];
export const cobraCostCalculator = tool('cobra-cost', [
  {id:'contributions',title:'Employee + Employer Shares',description:'Reconstruct the full premium from matching monthly contributions.',fields:[usd('employee_share','Previous employee monthly premium share',200),usd('employer_share','Previous employer monthly premium share',600),...shared()],formula:'Full plan premium = employee share + employer share. Monthly payment = full premium × (1 + administrative rate / 100) − entered monthly subsidy.',calculate:v=>cobraCost(v)},
  {id:'premium',title:'Known Full Plan Premium',description:'Use the full monthly plan cost and a separate prior employee payment.',fields:[usd('total_premium','Full monthly plan premium before administrative charge',800),usd('previous_payment','Previous employee payment per month',200),...shared()],formula:'Monthly payment = entered full premium × (1 + administrative rate / 100) − entered monthly subsidy. Planning total = monthly payment × selected months.',calculate:v=>cobraCost(v,'premium')},
], 'Estimate monthly COBRA premium costs from the full plan premium or employee and employer shares. Compare your previous premium payment and total costs over your selected planning period.');
