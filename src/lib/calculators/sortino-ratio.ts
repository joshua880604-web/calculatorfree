import { tool } from './helpers';
import { area, metric, select, type Result, type Values } from '../types';
import { choose, percentage, value } from './expansion-common';
import { numericCell } from './specialist-common';
import { ratioMetric } from './working-capital-common';

const periods = ['Monthly', 'Quarterly', 'Annual', 'Weekly', 'Daily'] as const;
const common = () => [select('period', 'One observation period (all inputs must match)', [...periods]), percentage('target', 'Fixed target return for that same period (MAR)', 1, -100, 1000)];

export function sortinoRatio(v: Values, series = false): Result {
  const period = choose(v, 'period', periods), target = value(v, 'target', -100, 1000);
  let mean: number, downside: number, below = 0, count = 0;
  let rows: (string | number)[][];
  if (series) {
    const parts = (v.returns ?? '').trim().split(/[\s,;]+/).filter(Boolean);
    if (parts.length < 2 || parts.length > 2000) throw Error('Enter 2 to 2000 equally spaced simple percentage returns, without thousands separators.');
    const returns = parts.map((p, i) => numericCell(p, `Return ${i + 1}`, -100, 1e6));
    count = returns.length;
    mean = returns.reduce((total, r) => total + r, 0) / count;
    let sumSquares = 0;
    rows = returns.map((r, i) => {
      const shortfall = Math.min(0, r - target);
      if (r < target) below++;
      sumSquares += shortfall * shortfall;
      return [i + 1, r, target, shortfall, shortfall * shortfall];
    });
    downside = Math.sqrt(sumSquares / count);
  } else {
    mean = value(v, 'mean_return', -100, 1e6);
    downside = value(v, 'downside_deviation', 0, 1e6);
    rows = [['Arithmetic mean return (%)', mean], ['Fixed matching-period target (%)', target], ['All-observation downside deviation (percentage points)', downside]];
  }
  const ratio = downside > 0 ? (mean - target) / downside : null;
  return {
    metrics: [
      { ...ratioMetric('Sortino ratio for one observation period', ratio, 'Undefined: zero downside deviation'), digits: 4 },
      metric('Arithmetic mean return per period', mean, 'percent'),
      metric('Fixed target return per period', target, 'percent'),
      metric('Downside deviation per period', downside, 'percent'),
      metric('Mean return minus target', mean - target, 'percent'),
      { ...metric('Observation period', 0), displayValue: period },
      ...(series ? [metric('All observations in denominator', count), metric('Observations strictly below target', below)] : []),
    ],
    columns: series ? ['Observation', 'Simple return (%)', 'Fixed target (%)', 'Shortfall (percentage points)', 'Squared shortfall (points²)'] : ['Matching-period statistic', 'Value'],
    rows,
    notes: [
      `All inputs describe one ${period.toLowerCase()} observation period. The fixed minimum acceptable return (MAR) is not converted from an annual target. Enter a matching-period target explicitly.`,
      'Sortino = (arithmetic mean return − fixed target) / downside deviation. Here downside deviation is sqrt(sum(min(return − target, 0)²) / N), where N includes every observation. Returns at or above the target contribute zero; neither the number of losing periods nor N − 1 replaces N.',
      series ? 'Each entry is a simple percentage total return over an equally spaced interval, not a price, cash profit or CAGR. Use consistent fee, dividend and deposit treatment. The table shows the shortfalls before squaring.' : 'Supply a downside deviation already computed against this same target, over the same period and with all observations in its denominator. Ordinary standard deviation or a below-target-only deviation is a different statistic.',
      'Zero downside deviation leaves Sortino undefined, even if every observation meets the target. Negative mean-minus-target gives a negative ratio; it is not converted to a positive performance score.',
      'This worksheet reports the observation-period ratio only. It does not multiply a monthly result by sqrt(12) or claim an annual Sortino. Compounding and target shortfalls across longer periods require their own return series and assumptions.',
      'This is historical or hypothetical arithmetic, without a market-data feed, universal good-ratio cutoff, portfolio recommendation or prediction. Short samples and near-zero downside deviation can produce unstable comparisons.',
    ],
  };
}

export const sortinoRatioCalculator = tool('sortino-ratio', [
  { id: 'statistics', title: 'Known Matching-Period Statistics', description: 'Use matched arithmetic mean return, target and all-observation downside deviation.', fields: [percentage('mean_return', 'Arithmetic mean return for one observation period', 3, -100, 1e6), percentage('downside_deviation', 'Downside deviation for the same target and period', 2, 0, 1e6), ...common()], formula: 'Period Sortino = (arithmetic mean return − same-period target) / all-observation downside deviation.', calculate: v => sortinoRatio(v) },
  { id: 'return-series', title: 'Periodic Return Series', description: 'Inspect each target shortfall and the all-observation denominator.', fields: [area('returns', 'Equally spaced simple returns (%)', '-3, 1, 4, 10', '1 means 1%. Separate 2–2000 observations by commas, spaces, semicolons or newlines; do not use thousands separators.'), ...common()], formula: 'Downside deviation = sqrt(sum(min(return − target, 0)²) / N). Period Sortino = (mean return − target) / downside deviation.', calculate: v => sortinoRatio(v, true) },
], 'Calculate a period Sortino ratio from matched statistics or a manual return series. Inspect target shortfalls, the all-observation denominator and undefined zero-downside cases.');
