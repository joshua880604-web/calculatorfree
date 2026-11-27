import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { firstPaymentParts } from '../src/lib/first-payment';
import type { Values } from '../src/lib/types';

function run(id: string, patch: Values = {}) {
  const mode = calculators.find(c => c.id === id)!.modes[0];
  return firstPaymentParts(id, runCalculation(id, mode.id, { ...defaults(mode), ...patch }))!;
}
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('Amortization first row explains interest and principal, including immediate extras only', () => {
  const regular = run('amortization', { principal: '12000', years: '1', months: '0', rate: '0' });
  assert.deepEqual(regular, { payment: 1000, interest: 0, principal: 1000, balance: 11000 });
  const immediate = run('amortization', { principal: '12000', years: '1', months: '0', rate: '0', extra_monthly: '100' });
  assert.deepEqual(immediate, { payment: 1100, interest: 0, principal: 1100, balance: 10900 });
  const delayed = run('amortization', { principal: '12000', years: '1', months: '0', rate: '0', extra_once: '2000', extra_once_month: '12' });
  assert.deepEqual(delayed, regular);
});

test('Positive-rate row reconciles first-month interest and remaining principal', () => {
  const row = run('amortization', { principal: '100000', years: '10', months: '0', rate: '6', extra_monthly: '100' });
  near(row.interest, 500);
  near(row.payment, 100000 * .005 / (1 - Math.pow(1.005, -120)) + 100);
  near(row.principal, row.payment - 500);
  near(row.balance, 100000 - row.principal);
});

test('Changing-minimum result shows principal rather than treating all payment as interest', () => {
  assert.deepEqual(run('credit-card-minimum-payment'), { payment: 200, interest: 100, principal: 100, balance: 4900 });
  assert.deepEqual(run('credit-card-minimum-payment', { extra: '50' }), { payment: 250, interest: 100, principal: 150, balance: 4850 });
  assert.deepEqual(run('credit-card-minimum-payment', { interest_extra: 'No', minimum: '4' }), { payment: 200, interest: 100, principal: 100, balance: 4900 });
});

test('Small balances and oversize extra payments retain final-payment caps', () => {
  assert.deepEqual(run('credit-card-minimum-payment', { principal: '20', rate: '0', extra: '1000' }), { payment: 20, interest: 0, principal: 20, balance: 0 });
  const row = run('amortization', { principal: '1000', years: '1', months: '0', rate: '12', extra_once: '10000', extra_once_month: '1' });
  assert.deepEqual(row, { payment: 1010, interest: 10, principal: 1000, balance: 0 });
});

test('An empty schedule or unrelated calculator never receives invented first-payment figures', () => {
  const empty = { metrics: [], columns: ['Payment', 'Interest', 'Principal', 'Balance'], rows: [] };
  assert.equal(firstPaymentParts('credit-card-minimum-payment', empty), null);
  assert.equal(firstPaymentParts('mortgage', empty), null);
  assert.equal(firstPaymentParts('amortization', { metrics: [], rows: [[1, 2]] }), null);
  assert.equal(firstPaymentParts('amortization', { ...empty, rows: [[NaN, 0, 0, 0]] }), null);
});
