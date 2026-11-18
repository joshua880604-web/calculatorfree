import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { runClientCalculation } from '../src/lib/calculate-client';
import { guides } from '../src/lib/guides';
import { comparisonGuides } from '../src/lib/comparison-guides';
import { glossaryTerms } from '../src/lib/glossary';
import { calculatorPresetHref } from '../src/lib/preset-links';
import { sharedInputs } from '../src/lib/sharing';
import { calculatorCategory } from '../src/lib/calculator-categories';
import { workspaceMetrics } from '../src/lib/workspace-layout';
import type { Result } from '../src/lib/types';
import reference from '../docs/financial-clone/evidence/ratio-property-three-reference-20261118.json';

const ids = ['sortino-ratio', 'gross-rent-multiplier', 'debt-to-equity-ratio'];
const calc = (id: string) => calculators.find(c => c.id === id)!;
const run = (id: string, mode: string, patch: Record<string, string | number | undefined> = {}) => runCalculation(id, mode, { ...defaults(calc(id).modes.find(m => m.id === mode)!), ...Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==undefined).map(([k, v]) => [k, String(v)])) });
const get = (r: Result, label: string) => { const m = r.metrics.find(m => m.label === label); assert.ok(m, label); return m; };
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 1e-12), `${a} != ${b}`);

for (const f of reference.fixtures) test('Independent Decimal reference: ' + f.key, () => {
  const r = run(f.id, f.mode, f.values);
  for (const [label, expected] of Object.entries(f.expected)) { const m = get(r, label); assert.equal(m.displayValue, undefined); near(m.value, Number(expected)); }
  for (const label of f.undefinedMetrics) assert.ok(get(r, label).displayValue, 'Undefined state must be text, not a real zero');
  if (f.id === 'sortino-ratio' && f.mode === 'return-series') {
    assert.equal(r.rows!.length, f.referenceRows.length);
    f.referenceRows.forEach((row, i) => row.forEach((x, j) => near(Number(r.rows![i][j]), Number(x))));
  }
  if (f.id === 'debt-to-equity-ratio') {
    assert.equal(r.rows!.length, f.referenceRows.length);
    f.referenceRows.forEach((row, i) => row.forEach((x, j) => { const actual = r.rows![i][j + 1]; if (x === null) assert.equal(typeof actual, 'string'); else near(Number(actual), Number(x)); }));
  }
});

test('Sortino uses all observations, retains a negative numerator and does not annualize labels', () => {
  const r = run('sortino-ratio', 'return-series');
  near(get(r, 'Downside deviation per period').value, 2);
  near(get(r, 'All observations in denominator').value, 4);
  near(get(r, 'Observations strictly below target').value, 1);
  near(get(r, 'Sortino ratio for one observation period').value, 1);
  assert.ok(get(run('sortino-ratio', 'return-series', { returns: '-3, -1, 0, 0', target: 0 }), 'Sortino ratio for one observation period').value < 0);
  for (const period of ['Monthly', 'Quarterly', 'Annual', 'Weekly', 'Daily']) near(get(run('sortino-ratio', 'return-series', { period }), 'Sortino ratio for one observation period').value, 1);
  assert.equal(r.metrics.some(m => /annualiz/i.test(m.label)), false);
});

test('Sortino rejects malformed, impossible and unsupported return series', () => {
  for (const returns of ['', '3', '-101, 0', '1, NaN', 'Infinity, 0', '0x10, 0', '5%, 0', Array(2001).fill('0').join(',')]) assert.throws(() => run('sortino-ratio', 'return-series', { returns }));
  for (const patch of [{ target: '' }, { target: 1001 }, { period: 'Unspecified' }, { downside_deviation: -1 }]) assert.throws(() => run('sortino-ratio', 'statistics', patch));
});

test('GRM monthly/annual normalization and both inverse calculations reconcile', () => {
  const r = run('gross-rent-multiplier', 'grm');
  near(get(r, 'Gross rent multiplier (annual rent basis)').value, 12.5);
  near(get(r, 'Gross annual rent yield before expenses').value, 8);
  assert.deepEqual(r.metrics, run('gross-rent-multiplier', 'grm', { rent: 28800, rent_period: 'Annual' }).metrics);
  near(get(run('gross-rent-multiplier', 'price'), 'Price implied by entered rent and GRM').value, 360000);
  near(get(run('gross-rent-multiplier', 'rent'), 'Required gross rent (monthly)').value, 2400);
  near(get(run('gross-rent-multiplier', 'rent', { rent_period: 'Annual' }), 'Required gross rent (annual)').value, 28800);
  for (const patch of [{ price: 0 }, { price: -1 }, { rent: 0 }, { rent: '' }, { rent_period: 'Weekly' }]) assert.throws(() => run('gross-rent-multiplier', 'grm', patch));
  for (const mode of ['price', 'rent']) for (const grm of [0, -1, '']) assert.throws(() => run('gross-rent-multiplier', mode, { grm }));
});

test('D/E separates cash repayment from new book equity and does not label debt/capital as debt/assets', () => {
  const r = run('debt-to-equity-ratio', 'changes');
  assert.deepEqual(r.rows!.map(row => row.slice(1, 4)), [[240000, 160000, 1.5], [200000, 160000, 1.25], [240000, 200000, 1.2], [200000, 200000, 1]]);
  const narrower = run('debt-to-equity-ratio', 'snapshot', { debt_basis: 'Interest-bearing debt', debt: 160000 });
  near(get(narrower, 'Selected numerator / (numerator + book equity)').value, 50);
  assert.equal(narrower.metrics.some(m => /assets/i.test(m.label)), false);
  for (const equity of [0, -20000]) assert.ok(get(run('debt-to-equity-ratio', 'snapshot', { equity }), 'Debt-to-equity ratio').displayValue);
  const restored = run('debt-to-equity-ratio', 'changes', { debt: 100000, equity: -20000, repayment: 0, equity_injection: 70000 });
  near(get(restored, 'Debt-to-equity after entered changes').value, 2);
  assert.ok(get(restored, 'Debt-to-equity before entered changes').displayValue);
  for (const patch of [{ debt: -1 }, { equity: '' }, { debt_basis: 'Income' }, { repayment: 240001 }, { equity_injection: -1 }]) assert.throws(() => run('debt-to-equity-ratio', 'changes', patch));
});

for (const id of ids) test('Every new mode works through the lazy client and its primary result matches the task: ' + id, async () => {
  assert.ok(calculatorCategory(id));
  for (const m of calc(id).modes) {
    const server = run(id, m.id), client = await runClientCalculation(id, calc(id).category, m.id, defaults(m));
    assert.deepEqual(client, server);
    const primary = workspaceMetrics(id, m.id, server).primary;
    assert.ok(primary);
    if (m.id === 'price') assert.equal(primary.label, 'Price implied by entered rent and GRM');
    if (m.id === 'rent') assert.equal(primary.label, 'Required gross rent (monthly)');
    if (id === 'debt-to-equity-ratio' && m.id === 'changes') assert.equal(primary.label, 'Debt-to-equity after entered changes');
  }
});

for (const id of ids) test('Published examples, guide CSV and term restore complete independently checked inputs: ' + id, () => {
  const c = calc(id), guide = guides[id], article = comparisonGuides[id];
  const verify = (mode: string, values: Record<string, string | number | undefined>) => {
    const normalized = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]));
    assert.deepEqual(Object.keys(normalized).sort(), c.modes.find(m => m.id === mode)!.fields.map(f => f.key).sort());
    assert.ok(reference.fixtures.some(f => f.id === id && f.mode === mode && JSON.stringify(Object.entries(f.values).sort()) === JSON.stringify(Object.entries(normalized).sort())));
    const link = calculatorPresetHref('/' + id + '-calculator', mode, values);
    const restored = sharedInputs(c, '', new URL(link, 'https://www.calculatorfree.io').hash)!;
    assert.equal(restored.mode.id, mode); assert.deepEqual(restored.values, normalized);
  };
  for (const e of guide.examples) { verify(e.mode, e.values); near(get(run(id, e.mode, e.values), e.expected.label).value, e.expected.value); }
  assert.deepEqual([...new Set(guide.examples.map(e => e.mode))].sort(), c.modes.map(m => m.id).sort());
  for (const p of article.presets) verify(p.mode, p.values);
  const term = glossaryTerms.find(t => t.slug === id)!;
  assert.ok(term); verify(term.example.calculator!.mode, term.example.calculator!.values);
  for (const related of term.related) assert.ok(glossaryTerms.some(t => t.slug === related), related);
  const csv = readFileSync(new URL('../public/data/comparison-guides/' + id + '.csv', import.meta.url), 'utf8');
  for (const p of article.presets) assert.ok(csv.includes(p.label));
});

test('GRM companion cap-rate comparison uses stated NOI, not gross yield', () => {
  for (const [expense, noi] of [[8800, 20000], [14800, 14000]]) {
    assert.equal(28800 - expense, noi);
    assert.ok(noi / 360000 * 100 < 8);
  }
  const csv = readFileSync(new URL('../public/data/comparison-guides/gross-rent-multiplier.csv', import.meta.url), 'utf8');
  assert.ok(csv.includes('5.555555')); assert.ok(csv.includes('3.888888'));
});
