import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation, routeFor } from '../src/lib/calculators';
import { visibleCalculatorModes, minimumPaymentHref, legacyMinimumPaymentHref } from '../src/lib/mode-handoffs';
import { calculatorPresetHref, legacyCreditMinimumDefaults } from '../src/lib/preset-links';
import { sharedInputs } from '../src/lib/sharing';
import { searchTasks, keywordTitles } from '../src/lib/keyword-targets';
import { calculatorSchema } from '../src/lib/seo';

const credit = calculators.find(calc => calc.id === 'credit-card')!;
const minimum = calculators.find(calc => calc.id === 'credit-card-minimum-payment')!;
const origin = 'https://www.calculatorfree.io';
function restored(href: string) {
  const url = new URL(href, origin);
  assert.equal(url.pathname, '/credit-card-minimum-payment-calculator');
  assert.equal(url.search, '');
  return sharedInputs(minimum, url.search, url.hash)!;
}

test('Single-card payoff presents fixed payment and deadline tasks; legacy arithmetic remains available', () => {
  assert.deepEqual(visibleCalculatorModes(credit).map(mode => mode.id), ['payment', 'term']);
  assert.deepEqual(visibleCalculatorModes(minimum), minimum.modes);
  assert.ok(credit.modes.some(mode => mode.id === 'minimum'));
  assert.ok(searchTasks['credit-card'].every(task => task.mode !== 'minimum'));
  assert.ok(searchTasks[minimum.id].some(task => task.mode === 'minimum'));
  assert.match(keywordTitles['credit-card'], /Fixed Payment/);
  const schema = calculatorSchema(credit, {origin, indexable: true});
  assert.ok(!JSON.stringify(schema).includes('Variable minimum payment payoff estimate'));
});

test('Old query-only minimum links retain the old defaults rather than the dedicated defaults', () => {
  const oldDefaults = defaults(credit.modes.find(mode => mode.id === 'minimum')!);
  assert.deepEqual({...oldDefaults, extra: oldDefaults.extra || '0'}, legacyCreditMinimumDefaults);
  const href = legacyMinimumPaymentHref(credit, '?mode=minimum', '')!;
  assert.deepEqual(restored(href).values, legacyCreditMinimumDefaults);
  const old = runCalculation(credit.id, 'minimum', oldDefaults);
  const next = restored(href);
  assert.deepEqual(runCalculation(minimum.id, next.mode.id, next.values).rows, old.rows);
});

test('Versioned fragments take precedence and preserve every entered minimum-payment input', () => {
  const values = {principal:'6000', rate:'20', minimum:'2', floor:'30', interest_extra:'Yes', extra:'50'};
  const hash = '#calc=' + new URLSearchParams({share_version:'1', mode:'minimum', ...values});
  const href = legacyMinimumPaymentHref(credit, '?mode=payment&principal=1', hash)!;
  assert.deepEqual(restored(href).values, values);
  assert.deepEqual(runCalculation(minimum.id, 'minimum', restored(href).values).rows,
    runCalculation(credit.id, 'minimum', values).rows);
});

test('Optional legacy extra is zero and ordinary anchors retain query input restoration', () => {
  const href = legacyMinimumPaymentHref(credit, '?mode=minimum&principal=1200&extra=', '#sources')!;
  assert.equal(restored(href).values.principal, '1200');
  assert.equal(restored(href).values.extra, '0');
});

test('All newly generated historical-route minimum presets point straight to the dedicated page', () => {
  for (const path of ['/single-credit-card-payoff-calculator.html', '/credit-card-calculator', '/credit-card-calculator.html']) {
    const href = calculatorPresetHref(path, 'minimum', {principal:6000, interest_extra:'Yes', extra:undefined});
    const next = restored(href);
    assert.equal(next.values.principal, '6000');
    assert.equal(next.values.rate, '20');
    assert.equal(next.values.interest_extra, 'Yes');
    assert.equal(next.values.extra, '0');
  }
});

test('The visible handoff carries current balance and APR without leaking fixed-payment or unrelated state', () => {
  const next = restored(minimumPaymentHref({principal:'4321', rate:'17', payment:'350', token:'discard'}));
  assert.equal(next.values.principal, '4321');
  assert.equal(next.values.rate, '17');
  assert.equal(next.values.interest_extra, 'Yes');
  assert.ok(!('payment' in next.values));
  assert.ok(!minimumPaymentHref({principal:'4321', rate:'17', token:'discard'}).includes('discard'));
});

test('Fixed-payment links, dedicated presets and invalid share versions are not silently migrated', () => {
  assert.equal(legacyMinimumPaymentHref(credit, '?mode=payment&payment=250', ''), null);
  assert.equal(legacyMinimumPaymentHref(credit, '', '#sources'), null);
  assert.equal(legacyMinimumPaymentHref(minimum, '?mode=minimum', ''), null);
  assert.equal(legacyMinimumPaymentHref(credit, '?mode=minimum', '#calc=share_version=1&mode=term&years=3'), null);
  assert.throws(() => legacyMinimumPaymentHref(credit, '', '#calc=share_version=2&mode=minimum'), /unsupported/);
  const href = calculatorPresetHref('/single-credit-card-payoff-calculator.html', 'payment', {payment:250});
  assert.equal(new URL(href, origin).pathname, '/single-credit-card-payoff-calculator');
});

test('Saved scenarios beyond the dedicated limits keep the working legacy model', () => {
  for (const patch of [
    {principal:'5000', rate:'150', interest_extra:'Yes'},
    {principal:'2000000000', rate:'0', interest_extra:'Yes'},
    {principal:'5000', rate:'0', minimum:'0', floor:'2'},
  ]) {
    const values = {...legacyCreditMinimumDefaults, ...patch};
    const query = '?' + new URLSearchParams({mode:'minimum', ...values});
    assert.equal(legacyMinimumPaymentHref(credit, query, ''), null);
    const href = calculatorPresetHref(routeFor(credit.id), 'minimum', values);
    const url = new URL(href, origin);
    assert.equal(url.pathname, '/single-credit-card-payoff-calculator');
    const next = sharedInputs(credit, '', url.hash)!;
    assert.deepEqual(next.values, values);
    assert.ok(runCalculation(credit.id, next.mode.id, next.values).rows!.length > 0);
  }
});
