import { tool } from './helpers';
import { metric, money, num, select, type Result, type Values } from '../types';
import { choose, value } from './expansion-common';

const periods = ['Monthly', 'Annual'] as const;
const positive = (key: string, label: string, initial: number, unit: string) => ({ ...num(key, label, initial, unit, 0.000001), max: 1e12 });
const rentFields = () => [positive('rent', 'Total property gross scheduled rent (before expenses)', 2400, '$'), select('rent_period', 'Entered gross-rent period', [...periods])];
const grmField = () => positive('grm', 'Selected gross rent multiplier (annual rent basis)', 12.5, '×');

export function grossRentMultiplier(v: Values, solve: 'grm' | 'price' | 'rent' = 'grm'): Result {
  const period = choose(v, 'rent_period', periods);
  let price: number, annual: number, grm: number;
  if (solve === 'rent') {
    price = value(v, 'price', 0.000001, 1e12); grm = value(v, 'grm', 0.000001, 1e12); annual = price / grm;
  } else {
    annual = value(v, 'rent', 0.000001, 1e12) * (period === 'Monthly' ? 12 : 1);
    if (solve === 'price') { grm = value(v, 'grm', 0.000001, 1e12); price = annual * grm; }
    else { price = value(v, 'price', 0.000001, 1e12); grm = price / annual; }
  }
  const yieldPercent = annual / price * 100;
  const metrics = [
    { ...metric('Gross rent multiplier (annual rent basis)', grm), digits: 4 },
    money(solve === 'price' ? 'Price implied by entered rent and GRM' : 'Property price used', price),
    money('Annual gross scheduled rent', annual), money('Monthly equivalent gross scheduled rent', annual / 12),
    metric('Gross annual rent yield before expenses', yieldPercent, 'percent'),
  ];
  if (solve === 'price') metrics.unshift(metrics.splice(1, 1)[0]);
  if (solve === 'rent') metrics.unshift(money(`Required gross rent (${period.toLowerCase()})`, annual / (period === 'Monthly' ? 12 : 1)));
  return {
    metrics,
    columns: ['Gross-rent screening quantity', 'Amount', 'Unit or basis'],
    rows: [['Property price', price, 'USD'], ['Annual gross scheduled rent', annual, 'USD/year'], ['Monthly equivalent gross scheduled rent', annual / 12, 'USD/month'], ['Gross rent multiplier', grm, 'Price / annual gross scheduled rent'], ['Gross annual rent yield', yieldPercent, '% before expenses']],
    notes: [
      'GRM = property price / annual gross scheduled rent. Use the whole property’s rent on the same basis as the entered price; monthly gross rent is multiplied by 12. The multiplier always uses annual rent, regardless of the input selector.',
      'Gross annual rent yield = annual gross scheduled rent / price × 100 = 100 / GRM. This is before vacancy, nonpayment, operating expenses, capital expenditure, financing and tax. It is not cap rate, net rental yield or cash-on-cash return.',
      'The rent input is scheduled gross rent before those deductions. Do not substitute NOI or combine collected-rent and scheduled-rent definitions when comparing properties. Additional non-rent income is outside this rent-only worksheet.',
      'Reverse modes solve an arithmetic price or rent from your selected GRM; that chosen multiplier is not a market comparable, independent appraisal, achievable rent, lender approval or recommended offer.',
      'A GRM of 12.5 is 12.5 times one year’s gross rent. It does not establish a 12.5-year investment payback because it ignores expenses, vacancy, financing, future rent changes and sale proceeds. No universal good-GRM threshold is assigned.',
    ],
  };
}

export const grossRentMultiplierCalculator = tool('gross-rent-multiplier', [
  { id: 'grm', title: 'Calculate GRM & Gross Yield', description: 'Normalize monthly or annual gross scheduled rent before dividing the property price.', fields: [positive('price', 'Property price for the same property', 360000, '$'), ...rentFields()], formula: 'GRM = price / annual gross scheduled rent; gross annual rent yield (%) = 100 / GRM.', calculate: v => grossRentMultiplier(v) },
  { id: 'price', title: 'Price from Rent & Selected GRM', description: 'Solve the price implied by your annual gross rent and chosen multiplier.', fields: [...rentFields(), grmField()], formula: 'Implied price = annual gross scheduled rent × selected GRM.', calculate: v => grossRentMultiplier(v, 'price') },
  { id: 'rent', title: 'Required Rent from Price & GRM', description: 'Solve annual gross rent and its monthly equivalent for a selected price and multiplier.', fields: [positive('price', 'Property price for the same property', 360000, '$'), grmField(), select('rent_period', 'Required gross-rent output period', [...periods])], formula: 'Required annual gross rent = price / selected GRM; monthly equivalent = annual rent / 12.', calculate: v => grossRentMultiplier(v, 'rent') },
], 'Calculate gross rent multiplier (GRM) and gross annual rent yield, or reverse the formula for property price or required rent. Keep scheduled rent separate from expenses and NOI.');
