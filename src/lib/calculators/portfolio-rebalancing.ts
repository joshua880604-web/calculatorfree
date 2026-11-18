import { tool } from './helpers';
import { area, metric, money, num, type Result, type Values } from '../types';
import { usd, value } from './expansion-common';
import { inputRows, numericCell } from './specialist-common';

const WEIGHT_UNITS = 100_000_000;
type Asset = { name: string; cents: number; weight: number };

function wholeUnits(n: number, multiplier: number, label: string): number {
  const scaled = n * multiplier, rounded = Math.round(scaled);
  if (!Number.isSafeInteger(rounded) || Math.abs(scaled - rounded) > Math.max(1e-6, Number.EPSILON * Math.abs(scaled) * 8)) throw Error(`${label}: use at most ${multiplier === 100 ? 'two money' : 'six percentage'} decimal places.`);
  return rounded;
}

function assetsFrom(raw: string): Asset[] {
  const names = new Set<string>();
  const assets = inputRows(raw, 3, 1, 50).map(([name, amount, percentage], i) => {
    if (name.length > 60 || names.has(name.toLowerCase())) throw Error(`Asset ${i + 1}: use a distinct label of 1 to 60 characters.`);
    names.add(name.toLowerCase());
    return { name, cents: wholeUnits(numericCell(amount, `Asset ${i + 1} current value`), 100, `Asset ${i + 1} current value`), weight: wholeUnits(numericCell(percentage, `Asset ${i + 1} target percentage`, 0, 100), 1e6, `Asset ${i + 1} target percentage`) };
  });
  const sum = assets.reduce((s, a) => s + a.weight, 0);
  if (sum !== WEIGHT_UNITS) throw Error(`Target percentages total ${sum / 1e6}%. Make them total exactly 100%; up to six decimal places are supported.`);
  return assets;
}

// Exact cent allocation. Remainders break ties in original row order.
export function allocateCents(total: number, weights: number[]): number[] {
  if (!Number.isSafeInteger(total) || total < 0) throw Error('Allocation requires a nonnegative whole-cent budget.');
  if (total === 0) return weights.map(() => 0);
  const denominator = weights.reduce((s, n) => s + BigInt(n), 0n);
  if (denominator <= 0n) throw Error('A positive allocation budget requires a positive allocation weight.');
  const rows = weights.map((w, i) => {
    const product = BigInt(total) * BigInt(w);
    return { index: i, amount: Number(product / denominator), remainder: product % denominator };
  });
  const left = total - rows.reduce((s, r) => s + r.amount, 0);
  const ordered = [...rows].sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
  for (let i = 0; i < left; i++) ordered[i].amount++;
  return rows.map(r => r.amount);
}

function minimumNetCash(assets: Asset[], starting: number): number | null {
  if (assets.some(a => a.cents > 0 && a.weight === 0)) return null;
  let requiredTotal = BigInt(starting);
  for (const a of assets) if (a.weight > 0) {
    const numerator = BigInt(a.cents) * BigInt(WEIGHT_UNITS), denominator = BigInt(a.weight);
    const required = (numerator + denominator - 1n) / denominator;
    if (required > requiredTotal) requiredTotal = required;
  }
  const result = Number(requiredTotal - BigInt(starting));
  return Number.isSafeInteger(result) && requiredTotal <= 100_000_000_000_000n ? result / 100 : null;
}

export function rebalancePortfolio(v: Values, contributionsOnly = false): Result {
  const assets = assetsFrom(v.assets), starting = assets.reduce((s, a) => s + a.cents, 0);
  const flow = wholeUnits(value(v, 'cash_change', contributionsOnly ? 0 : -1e10, 1e10), 100, 'External cash change');
  const fees = wholeUnits(value(v, 'fees', 0, 1e10), 100, 'Entered total transaction costs'), net = flow - fees;
  if (contributionsOnly && net < 0) throw Error('In contribution-only mode, new cash must cover the entered costs without selling holdings.');
  const finalTotal = starting + net;
  if (finalTotal <= 0 || finalTotal > 1e14) throw Error('The post-cost portfolio value must be positive and at most one trillion dollars.');
  const targets = allocateCents(finalTotal, assets.map(a => a.weight));
  const deficits = targets.map((target, i) => Math.max(0, target - assets[i].cents));
  const changes = contributionsOnly ? allocateCents(net, deficits) : targets.map((target, i) => target - assets[i].cents);
  const after = changes.map((change, i) => assets[i].cents + change), gaps = after.map((amount, i) => amount - targets[i]);
  const bought = changes.reduce((s, n) => s + Math.max(0, n), 0), sold = changes.reduce((s, n) => s + Math.max(0, -n), 0), gap = gaps.reduce((s, n) => s + Math.abs(n), 0);
  const minimum = minimumNetCash(assets, starting);
  const minMetric = minimum === null ? { ...money('Minimum net new cash for a no-sale target', 0), displayValue: assets.some(a => a.cents > 0 && a.weight === 0) ? 'Not finite while a zero-target asset remains held' : 'Exceeds the supported portfolio amount range' } : money('Minimum net new cash for a no-sale target', minimum);
  return {
    metrics: [money('Total modeled buys', bought / 100), money('Total modeled sells', sold / 100), money('Post-cost portfolio value', finalTotal / 100), money('Total absolute dollar gap from rounded targets', gap / 100), { ...metric('Allocation status', gap === 0 ? 1 : 0), displayValue: gap === 0 ? 'Matches cent-rounded target amounts' : 'Target deviations remain' }, money('Entered external cash change before costs', flow / 100), money('Entered transaction costs', fees / 100), minMetric],
    columns: ['Asset label', 'Current value', 'Current weight (%)', 'Target weight (%)', 'Cent-rounded target value', 'Buy (+) or sell (−)', 'Value after plan', 'Weight after plan (%)', 'Above (+) / below (−) rounded target'],
    rows: assets.map((a, i) => [a.name, a.cents / 100, starting > 0 ? a.cents / starting * 100 : 'No starting value', a.weight / 1e6, targets[i] / 100, changes[i] / 100, after[i] / 100, after[i] / finalTotal * 100, gaps[i] / 100]),
    additionalTables: [{ title: 'Cash and portfolio conservation', columns: ['Measure', 'Amount'], rows: [['Starting holdings', starting / 100], ['External cash change before costs', flow / 100], ['Less entered costs', -fees / 100], ['Ending holdings', after.reduce((s, n) => s + n, 0) / 100], ['Buys minus sells', (bought - sold) / 100]] }],
    notes: [
      'Targets are supplied by you. The calculator does not recommend asset allocations, securities, risk levels, a trading frequency or an investment decision. It uses manually entered market values, not live prices or broker connections.',
      contributionsOnly ? 'Contribution-only mode keeps every existing holding. After paying the entered costs from new cash, it distributes the remaining cash in proportion to positive dollar deficits relative to cent-rounded targets for the final portfolio size. This is the stated allocation rule; it can leave overweights and underweights when new cash is insufficient.' : 'Full rebalancing can buy and sell. Target values apply to starting holdings plus the signed external cash change, less entered costs. Negative external cash means a withdrawal; the plan may need sales to fund the withdrawal and costs.',
      'Entered money supports at most two decimal places and target percentages support six. Target amounts and contribution allocations use exact integer-cent largest-remainder allocation, breaking ties in row order. Cent-rounded target amounts can produce tiny differences from the unrounded percentage ratios.',
      'The no-sale minimum is the smallest cent-sized net cash amount sufficient for the unrounded proportional targets. It excludes transaction costs. A currently held asset with a zero target cannot be removed using finite added cash alone. The minimum is a feasibility calculation, not a recommended contribution.',
      'All costs are entered as one nonoverlapping total; taxes, bid/ask spreads, whole-share or lot constraints, settlement, account restrictions and realized gains are not calculated. Results are dollar allocations, not executable orders or tax advice. Include idle cash as its own asset if it belongs in your target allocation.',
    ],
  };
}

const holdings = () => area('assets', 'Asset label, current dollar value, target percent', 'US stocks, 70000, 60\nBonds, 30000, 40', 'One asset per row, up to 50. Targets must total 100%. Money: two decimals; weights: six. Use plain labels without commas, tabs or | inside them.');
export const portfolioRebalancingCalculator = tool('portfolio-rebalancing', [
  { id: 'trades', title: 'Full Buy / Sell Rebalance', description: 'Calculate dollar buys and sells after a signed cash change and entered costs.', fields: [holdings(), { ...num('cash_change', 'Cash added (+) or withdrawn (−) before costs', 0, '$', -1e10), max: 1e10 }, usd('fees', 'Total transaction costs funded by this plan', 0)], formula: 'Final value = current holdings + signed external cash − costs. Cent-rounded targets are allocated by the entered weights; trade = target amount − current amount.', calculate: v => rebalancePortfolio(v) },
  { id: 'contributions', title: 'New Cash Only, No Sales', description: 'Allocate new cash by positive target deficits and show any deviations left over.', fields: [holdings(), { ...num('cash_change', 'New cash available before entered costs', 10000, '$'), max: 1e10 }, usd('fees', 'Costs paid from the new cash', 0)], formula: 'Keep current holdings. Allocate net added cash proportionally to positive deficits against final-value targets, with exact cent allocation; show the remaining target gaps.', calculate: v => rebalancePortfolio(v, true) },
], 'Calculate portfolio rebalancing amounts from current values and your target weights. Compare full buys and sells with new-cash-only allocation and inspect remaining deviations.');
