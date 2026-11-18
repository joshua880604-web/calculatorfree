import test from 'node:test';
import assert from 'node:assert/strict';
import { calculators, defaults, runCalculation } from '../src/lib/calculators';
import { runClientCalculation } from '../src/lib/calculate-client';
import { sharedInputs } from '../src/lib/sharing';
import { calculatorPresetHref } from '../src/lib/preset-links';
import { allocateCents } from '../src/lib/calculators/portfolio-rebalancing';
import { guides } from '../src/lib/guides';
import { comparisonGuides } from '../src/lib/comparison-guides';
import { glossaryTerms, glossaryExampleLink } from '../src/lib/glossary';
import { readFileSync } from 'node:fs';
import reference from '../docs/financial-clone/evidence/specialist-four-reference-20261118.json';

const calc = (id: string) => calculators.find(c => c.id === id)!;
const run = (id: string, mode: string, patch: Record<string, string | number | undefined> = {}) => {
  const m = calc(id).modes.find(m => m.id === mode)!;
  return runCalculation(id, mode, { ...defaults(m), ...Object.fromEntries(Object.entries(patch).filter(([,v])=>v!==undefined).map(([k, v]) => [k, String(v)])) });
};
const get = (r: ReturnType<typeof run>, label: string) => { const m = r.metrics.find(m => m.label === label); assert.ok(m, label); return m; };
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) <= Math.max(1e-7, Math.abs(expected) * 2e-12), `${actual} != ${expected}`);

for (const fixture of reference.fixtures) test('Independent specialist reference: ' + fixture.id + ' / ' + fixture.title, async () => {
  const c = calc(fixture.id), mode = c.modes.find(m => m.id === fixture.mode)!;
  const values = Object.fromEntries(Object.entries(fixture.values).map(([k,v])=>[k,String(v)]));
  assert.deepEqual(Object.keys(values).sort(), mode.fields.map(f => f.key).sort());
  const result = runCalculation(c.id, mode.id, values);
  for (const [label, value] of Object.entries(fixture.expected)) near(get(result, label).value, Number(value));
  assert.deepEqual(await runClientCalculation(c.id, c.category, mode.id, values), result);
  const link = calculatorPresetHref('/' + c.id + '-calculator', mode.id, values), restored = sharedInputs(c, '', link.slice(link.indexOf('#')))!;
  assert.equal(restored.mode.id, mode.id); assert.deepEqual(restored.values, values);
  if ('referenceAllocation' in fixture) {
    const allocation = fixture.referenceAllocation!;
    assert.deepEqual(result.rows!.map(row => Math.round(Number(row[4]) * 100)), allocation.targetCents);
    assert.deepEqual(result.rows!.map(row => Math.round(Number(row[5]) * 100)), allocation.changeCents);
    assert.deepEqual(result.rows!.map(row => Math.round(Number(row[6]) * 100)), allocation.afterCents);
  }
});

test('Credit dates, transaction order and principal limits have explicit boundaries', () => {
  const id = 'business-line-of-credit';
  for (const patch of [{ end: '2026-12-01' }, { start: '2026-02-29' }, { transactions: '2027-01-01, 1' }, { transactions: '2026-11-30, 1' }, { transactions: '2026-12-10, -10001' }, { transactions: '2026-12-10, 50000' }, { opening: 50001 }, { transactions: '2026-12-10, 50000\n2026-12-10, -50000' }, { basis: '366' }]) assert.throws(() => run(id, 'ledger', patch));
  const sameDay = run(id, 'ledger', { transactions: '2026-12-10, -10000\n2026-12-10, 10000' });
  near(get(sameDay, 'Closing principal balance').value, 10000);
  near(get(sameDay, 'Modeled interest over selected dates').value, 10000 * .12 * 31 / 365);
  const horizon = run(id, 'paydown', { balance: 1000, rate: 12, payment: 200, monthly_fee: 5, max_months: 2 });
  assert.match(get(horizon, 'Modeled payoff time in months').displayValue!, /Not paid off/); assert.ok(get(horizon, 'Principal remaining at model end').value > 0);
  for (const patch of [{ payment: 10, balance: 1000, rate: 12 }, { payment: 15, balance: 1000, rate: 12, monthly_fee: 5 }, { max_months: 2.5 }]) assert.throws(() => run(id, 'paydown', patch));
  const zero = run(id, 'paydown', { balance: 0, monthly_fee: 20 }); assert.equal(zero.rows!.length, 0); assert.equal(get(zero, 'Total payments including fees').value, 0);
});

test('Credit ledgers and repayment rows conserve principal and distinguish paid charges', () => {
  const r = run('business-line-of-credit', 'ledger');
  near(10000 + get(r, 'Principal drawn').value - get(r, 'Principal repaid').value, get(r, 'Closing principal balance').value);
  near(r.additionalTables![0].rows.reduce((sum, row) => sum + Number(row[4]), 0), get(r, 'Modeled interest over selected dates').value);
  const paid = run('business-line-of-credit', 'paydown', { monthly_fee: 5 });
  for (const row of paid.rows!) { near(Number(row[1]) - Number(row[5]), Number(row[6])); near(Number(row[2]) + Number(row[3]) + Number(row[5]), Number(row[4])); }
  near(get(paid, 'Total payments including fees').value, 25000 + get(paid, 'Interest over modeled payments').value + get(paid, 'Monthly fees over modeled payments').value);
});

test('NNN units, base-rent abatement and deposit remain separate in monthly and annual totals', () => {
  const a = run('triple-net-lease', 'quoted'), b = run('triple-net-lease', 'building');
  for (const m of a.metrics) near(get(b, m.label).value, m.value);
  const abated = run('triple-net-lease', 'quoted', { years: 1, free_months: 12, base_growth: 0, nnn_growth: 0 });
  assert.ok(abated.rows!.every(row => row[2] === 0 && Number(row[3]) > 0));
  near(abated.rows!.reduce((s, row) => s + Number(row[5]) + Number(row[6]), 0), get(abated, 'Total modeled nonrefundable occupancy cost').value);
  near(abated.annualRows!.reduce((s, row) => s + Number(row[6]), 0), get(abated, 'Total modeled nonrefundable occupancy cost').value);
  const largerDeposit = run('triple-net-lease', 'quoted', { deposit: 15000 });
  near(get(largerDeposit, 'Total modeled nonrefundable occupancy cost').value, get(a, 'Total modeled nonrefundable occupancy cost').value);
  near(get(largerDeposit, 'First-month cash including deposit and upfront cost').value - get(a, 'First-month cash including deposit and upfront cost').value, 10000);
  for (const patch of [{ area: 0 }, { years: 1, free_months: 13 }, { years: 1.5 }, { base_growth: -100 }, { nnn_basis: 'Yearly total' }]) assert.throws(() => run('triple-net-lease', 'quoted', patch));
  assert.throws(() => run('triple-net-lease', 'building', { building_area: 1000 }));
});

test('ARM reset timing, caps and complete amortization match the stated rate convention', () => {
  const r = run('arm-mortgage', 'scenario');
  assert.equal(r.rows![59][1], 5); assert.equal(r.rows![60][1], 7); assert.equal(r.rows![71][1], 7); assert.equal(r.rows![72][1], 7.5);
  assert.equal(r.rows![60][6], 'Reset before payment');
  near(r.rows!.reduce((s, row) => s + Number(row[4]), 0), 300000); assert.equal(r.rows!.at(-1)![5], 0);
  const stress = run('arm-mortgage', 'upward-caps'); assert.ok(stress.rows!.every(row => Number(row[1]) <= 10));
  assert.equal(stress.rows![84][1], 10);
  for (const row of r.rows!) near(Number(row[2]), Number(row[3]) + Number(row[4]));
  const noCarry = run('arm-mortgage', 'scenario', { indices: '4\n20' }); assert.equal(noCarry.rows![60][1], 6.5); assert.equal(noCarry.rows![72][1], 8.5);
  for (const patch of [{ fixed_years: 30 }, { holding_years: 31 }, { reset_months: '3' }, { floor: 11 }, { floor: 8 }, { indices: '' }, { term_years: 2.5 }, { principal: 0 }, { indices: 'Infinity' }]) assert.throws(() => run('arm-mortgage', 'scenario', patch));
});

test('Rebalancing conserves cents, fees and withdrawals while contributions never sell', () => {
  for (const mode of ['trades', 'contributions']) for (const cash of [0, 10000, 20000]) {
    const r = run('portfolio-rebalancing', mode, { cash_change: cash });
    const ending = r.rows!.reduce((s, row) => s + Math.round(Number(row[6]) * 100), 0);
    assert.equal(ending, (100000 + cash) * 100);
    near(get(r, 'Total modeled buys').value - get(r, 'Total modeled sells').value, cash);
    if (mode === 'contributions') assert.ok(r.rows!.every(row => Number(row[5]) >= 0));
  }
  assert.match(get(run('portfolio-rebalancing', 'contributions'), 'Allocation status').displayValue!, /deviations remain/);
  assert.match(get(run('portfolio-rebalancing', 'contributions', { cash_change: 20000 }), 'Allocation status').displayValue!, /Matches/);
  const zeroTarget = run('portfolio-rebalancing', 'contributions', { assets: 'A, 100, 0\nB, 0, 100', cash_change: 100 });
  assert.match(get(zeroTarget, 'Minimum net new cash for a no-sale target').displayValue!, /Not finite/);
  const tooLarge = run('portfolio-rebalancing', 'contributions', { assets: 'A, 10000000000, .000001\nB, 0, 99.999999', cash_change: 1 });
  assert.match(get(tooLarge, 'Minimum net new cash for a no-sale target').displayValue!, /supported/);
  assert.deepEqual(allocateCents(1, [1, 1, 1]), [1, 0, 0]);
  assert.deepEqual(allocateCents(100_000_000_000_000, [1, 99_999_999]).reduce((s, n) => s + n, 0), 100_000_000_000_000);
});

test('Portfolio inputs reject ambiguous weights, excessive precision and unfunded contribution fees', () => {
  for (const patch of [{ assets: 'A, 10, 50\nB, 10, 40' }, { assets: 'A, 10, 50\na, 10, 50' }, { assets: 'A, -1, 100' }, { assets: 'A, 1.001, 100' }, { assets: 'A, 1, 99.9999999\nB, 1, .0000001' }, { cash_change: -100001 }, { assets: 'A, 0, 100', cash_change: 0 }]) assert.throws(() => run('portfolio-rebalancing', 'trades', patch));
  assert.throws(() => run('portfolio-rebalancing', 'contributions', { cash_change: -1 }));
  assert.throws(() => run('portfolio-rebalancing', 'contributions', { cash_change: 10, fees: 11 }));
});

const specialistIds = ['business-line-of-credit','triple-net-lease','arm-mortgage','portfolio-rebalancing'];
for (const id of specialistIds) test('Published specialist examples restore complete independently checked inputs: '+id,()=>{
  const calculator=calc(id),guide=guides[id],article=comparisonGuides[id];
  const fixtures=reference.fixtures.filter(f=>f.id===id);
  const verify=(mode:string,values:Record<string,string|number|undefined>,expected?:{label:string;value:number;tolerance?:number})=>{
    const normalized=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,String(v)]));
    const matching=fixtures.find(f=>f.mode===mode&&JSON.stringify(Object.entries(f.values).sort())===JSON.stringify(Object.entries(normalized).sort()));
    assert.ok(matching,'Every published example must have a separate reference calculation');
    const link=calculatorPresetHref('/'+id+'-calculator',mode,values),restored=sharedInputs(calculator,'',new URL(link,'https://www.calculatorfree.io').hash)!;
    assert.ok(restored);assert.equal(restored.mode.id,mode);assert.deepEqual(restored.values,normalized);
    const result=runCalculation(id,mode,restored.values);
    if(expected){assert.ok(Object.keys(matching.expected).includes(expected.label));near(get(result,expected.label).value,expected.value);}
  };
  assert.deepEqual([...new Set(guide.examples.map(e=>e.mode))].sort(),calculator.modes.map(m=>m.id).sort());
  for(const e of guide.examples)verify(e.mode,e.values,e.expected);
  for(const p of article.presets)verify(p.mode,p.values);
  const term=glossaryTerms.find(t=>t.tools[0]?.id===id)!;
  assert.ok(term);const e=term.example.calculator!;verify(e.mode,e.values,e.expected[0]);assert.ok(glossaryExampleLink(e));
  for(const related of term.related)assert.ok(glossaryTerms.some(t=>t.slug===related),'Unknown related term '+related);
  const csv=readFileSync(new URL('../public/data/comparison-guides/'+id+'.csv',import.meta.url),'utf8');
  for(const p of article.presets)assert.ok(csv.includes(p.label),'CSV must include each guide scenario');
  for(const p of article.presets)assert.ok(csv.includes(calculatorPresetHref(p.path,p.mode,p.values)),'CSV must restore the same complete inputs');
});
