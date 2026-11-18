import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { runClientCalculation } from '../src/lib/calculate-client';
import { guides } from '../src/lib/guides';
import { comparisonGuides } from '../src/lib/comparison-guides';
import { glossaryTerms } from '../src/lib/glossary';
import { sharedInputs } from '../src/lib/sharing';
import { calculatorPresetHref } from '../src/lib/preset-links';
import { workspaceMetrics } from '../src/lib/workspace-layout';
import type { Result } from '../src/lib/types';
import reference from '../docs/financial-clone/evidence/sgr-reference-20261118.json';

const id = 'sustainable-growth-rate', c = calculators.find(c => c.id === id)!;
const run = (mode: string, patch: Record<string, string | number | undefined> = {}) => runCalculation(id, mode, { ...defaults(c.modes.find(m => m.id === mode)!), ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])) });
const metric = (r: Result, label: string) => { const m = r.metrics.find(m => m.label === label); assert.ok(m, label); return m; };
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 1e-12), `${a} != ${b}`);

for (const f of reference.fixtures) test('Independent SGR reference: ' + f.key, () => {
  const r = run(f.mode, f.values);
  for (const [label, expected] of Object.entries(f.expected)) near(metric(r, label).value, Number(expected));
});

test('Annual accounting bridge uses average equity, current-year retained earnings and matched scope', () => {
  const r = run('financials');
  near(metric(r, 'Two-point average book equity').value, 1200000);
  near(metric(r, 'Current-year earnings retained').value, 108000);
  near(metric(r, 'Annual ROE used').value, 15);
  near(metric(r, 'Annual SGR under entered assumptions').value, 9);
  near(metric(run('ratios'), 'Annual SGR under entered assumptions').value, 9);
  assert.ok(r.notes!.some(n => n.includes('Debt may increase proportionally')));
  assert.ok(r.notes!.some(n => n.includes('Other formulas')));
});

test('SGR stops rather than assigning healthy growth to losses, nonpositive/crossing equity or excess distributions', () => {
  for (const patch of [{ net_income: 0 }, { net_income: -100 }, { equity_begin: 0 }, { equity_end: -1 }, { equity_begin: -100, equity_end: 200 }, { dividends: 180001 }, { dividends: -1 }]) assert.throws(() => run('financials', patch));
  for (const patch of [{ roe: 0 }, { roe: -1 }, { payout: -1 }, { payout: 101 }, { roe: '' }, { roe: 'NaN' }]) assert.throws(() => run('ratios', patch));
  assert.throws(() => run('target', { target_growth: 15.0001 }), /retention above 100%/);
  assert.throws(() => run('target', { target_growth: -1 }));
  near(metric(run('ratios', { payout: 100 }), 'Annual SGR under entered assumptions').value, 0);
  near(metric(run('target', { target_growth: 0 }), 'Required earnings retention').value, 0);
});

test('SGR table isolates payout at fixed ROE and includes the exact selected case', () => {
  const r = run('ratios');
  const selected = r.rows!.find(row => row[0] === 40)!;
  assert.deepEqual(selected, [40, 60, 15, 9]);
  const target = run('target');
  assert.ok(target.rows!.some(row => row[0] === 20 && row[1] === 80 && row[3] === 12));
  for (const row of target.rows!) { assert.equal(row[2], 15); assert.ok(Number(row[0]) >= 0 && Number(row[0]) <= 100); }
});

for (const mode of c.modes) test('SGR lazy client and primary result: ' + mode.id, async () => {
  const r = run(mode.id);
  assert.deepEqual(await runClientCalculation(id, c.category, mode.id, defaults(mode)), r);
  assert.equal(workspaceMetrics(id, mode.id, r).primary.label, mode.id === 'target' ? 'Required earnings retention' : 'Annual SGR under entered assumptions');
});

test('SGR public calculator, guide and term examples restore complete independently checked inputs', () => {
  const verify = (mode: string, values: Record<string, string | number | undefined>) => {
    const normalized = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]));
    assert.deepEqual(Object.keys(normalized).sort(), c.modes.find(m => m.id === mode)!.fields.map(f => f.key).sort());
    assert.ok(reference.fixtures.some(f => f.mode === mode && JSON.stringify(Object.entries(f.values).sort()) === JSON.stringify(Object.entries(normalized).sort())));
    const url = new URL(calculatorPresetHref('/' + id + '-calculator', mode, values), 'https://www.calculatorfree.io');
    const restored = sharedInputs(c, '', url.hash)!;
    assert.equal(restored.mode.id, mode); assert.deepEqual(restored.values, normalized);
  };
  for (const e of guides[id].examples) { verify(e.mode, e.values); near(metric(run(e.mode, e.values), e.expected.label).value, e.expected.value); }
  assert.deepEqual([...new Set(guides[id].examples.map(e => e.mode))].sort(), c.modes.map(m => m.id).sort());
  const article = comparisonGuides[id];
  const csv = readFileSync(new URL('../public/data/comparison-guides/' + id + '.csv', import.meta.url), 'utf8');
  for (const e of article.presets) { verify(e.mode, e.values); assert.ok(csv.includes(e.label)); }
  const term = glossaryTerms.find(t => t.slug === id)!; const e = term.example.calculator!;
  verify(e.mode, e.values);
  for (const related of term.related) assert.ok(glossaryTerms.some(t => t.slug === related), related);
});
