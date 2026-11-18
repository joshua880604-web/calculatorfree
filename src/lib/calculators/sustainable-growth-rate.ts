import { tool } from './helpers';
import { metric, money, num, type Result, type Values } from '../types';
import { percentage, usd, value } from './expansion-common';

const annualRoe = () => percentage('roe', 'Annual return on equity (ROE)', 15, -1000, 1000);
const signedMoney = (key: string, label: string, initial: number) => ({ ...num(key, label, initial, '$', -1e12), max: 1e12 });

/** Explicit annual ROE × retention heuristic; not a full external-financing model. */
export function sustainableGrowthRate(v: Values, mode: 'ratios' | 'financials' | 'target' = 'ratios'): Result {
  let roe: number, payout: number;
  let extra: Result['metrics'] = [];
  if (mode === 'financials') {
    const income = value(v, 'net_income', -1e12, 1e12), dividends = value(v, 'dividends', 0, 1e12);
    const begin = value(v, 'equity_begin', -1e12, 1e12), end = value(v, 'equity_end', -1e12, 1e12);
    if (income <= 0) throw Error('This positive-earnings SGR model needs annual net income above zero. Zero or negative income does not receive a sustainable-growth estimate.');
    if (begin <= 0 || end <= 0) throw Error('Both beginning and ending book equity must be positive. A zero, negative or crossing equity base is outside this SGR model.');
    if (dividends > income) throw Error('Dividends exceed annual net income. This 0–100% retention model does not interpret an excess distribution as sustainable growth.');
    const equity = (begin + end) / 2;
    roe = income / equity * 100; payout = dividends / income * 100;
    extra = [money('Annual net income used', income), money('Annual dividends paid', dividends), money('Current-year earnings retained', income - dividends), money('Two-point average book equity', equity)];
  } else {
    roe = value(v, 'roe', -1000, 1000);
    if (roe <= 0) throw Error('Enter a positive annual ROE for this model. Nonpositive ROE is not interpreted as a sustainable positive-growth capacity.');
    payout = mode === 'target' ? 0 : value(v, 'payout', 0, 100);
  }
  let retention: number, growth: number;
  if (mode === 'target') {
    growth = value(v, 'target_growth', 0, 1000);
    if (growth > roe) throw Error('At the entered ROE, the target requires retention above 100%. Lower the target or change the ROE assumption; a negative dividend payout is not offered as a feasible solution.');
    retention = growth / roe * 100;
    payout = 100 - retention;
  } else {
    retention = 100 - payout;
    growth = roe * retention / 100;
  }
  const metrics = [
    metric('Annual SGR under entered assumptions', growth, 'percent'),
    metric(mode === 'target' ? 'Required earnings retention' : 'Earnings retention ratio', retention, 'percent'),
    metric(mode === 'target' ? 'Implied dividend payout ratio' : 'Dividend payout ratio', payout, 'percent'),
    metric('Annual ROE used', roe, 'percent'),
    ...extra,
  ];
  if (mode === 'target') metrics.unshift(metrics.splice(1, 1)[0]);
  const scenarioPayouts = [...new Set([0, 25, 50, 75, 100, payout])].sort((a, b) => a - b);
  return {
    metrics,
    columns: ['Dividend payout (%)', 'Earnings retention (%)', 'Annual ROE held constant (%)', 'Annual SGR heuristic (%)'],
    rows: scenarioPayouts.map(p => [p, 100 - p, roe, roe * (100 - p) / 100]),
    notes: [
      'This worksheet uses the annual ROE × earnings-retention approximation: SGR = ROE × (1 − dividend payout ratio). Both factors must refer to a consistent annual period, company and shareholder scope. Percentage inputs are converted as ratios before multiplication.',
      mode === 'financials' ? 'ROE here uses annual net income divided by the simple average of beginning and ending positive book equity. Dividend payout uses the same income scope. Equity changes within the year can make this two-point average unrepresentative; use reconciled annual ROE in ratio mode when appropriate. Current-year retained earnings are not the cumulative retained-earnings balance or operating cash flow.' : 'The entered annual ROE is a supplied assumption or reconciled accounting statistic. Do not substitute stock-price return or mix a quarterly ROE with an annual payout assumption. The calculator does not infer whether the supplied ROE used average, beginning or ending equity.',
      'The sustainable-growth interpretation assumes stable profitability, asset turnover, dividend policy and capital structure with no new equity issuance. Debt may increase proportionally to maintain the stated leverage. This is different from an internal-growth model that forbids all external financing.',
      'The result is a conditional heuristic, not a sales-growth forecast, an exact equity roll-forward, loan approval or cash-flow financing plan. Other formulas using ROE × retention / (1 − ROE × retention) require their own timing and denominator definitions and are not silently substituted here.',
      mode === 'target' ? 'The inverse calculation changes the retention/payout assumption while holding the supplied annual ROE fixed. Targets above that ROE would need retention over 100% and are rejected. Zero target implies 100% payout in this equation; it is not a dividend recommendation.' : 'The comparison table changes only the payout assumption while holding ROE constant. That isolates the equation; real distributions, investment needs, leverage and profitability can change together. Payout of 100% gives zero retention and a zero result in this model.',
      'Do not automatically use this SGR as a perpetual DDM or DCF growth input. Stable-stage valuation has separate assumptions, including a discount or required return above the selected perpetual growth rate. The calculator supplies no universal good-SGR threshold or investment recommendation.',
    ],
  };
}

export const sustainableGrowthRateCalculator = tool('sustainable-growth-rate', [
  { id: 'ratios', title: 'ROE & Dividend Payout', description: 'Apply an explicit annual ROE × retention approximation.', fields: [annualRoe(), percentage('payout', 'Annual dividend payout ratio', 40)], formula: 'Annual SGR (%) = annual ROE (%) × (1 − payout (%) / 100).', calculate: v => sustainableGrowthRate(v) },
  { id: 'financials', title: 'Income, Dividends & Equity', description: 'Reconcile a positive-income annual case using two-point average book equity.', fields: [signedMoney('net_income', 'Annual net income for the selected shareholder scope', 180000), usd('dividends', 'Annual dividends for the same shareholder scope', 72000), signedMoney('equity_begin', 'Beginning book equity for that scope', 1000000), signedMoney('equity_end', 'Ending book equity for that scope', 1400000)], formula: 'Annual ROE = income / average(beginning, ending equity). Retention = (income − dividends) / income. SGR = annual ROE × retention.', calculate: v => sustainableGrowthRate(v, 'financials') },
  { id: 'target', title: 'Retention Needed for a Target', description: 'Solve the feasible retention and payout ratios while holding annual ROE constant.', fields: [annualRoe(), percentage('target_growth', 'Selected annual growth target', 12, 0, 1000)], formula: 'Required retention (%) = target SGR (%) / positive annual ROE (%) × 100; payout (%) = 100 − retention (%).', calculate: v => sustainableGrowthRate(v, 'target') },
], 'Estimate sustainable growth from annual ROE and retained earnings. Reconcile income, dividends and book equity, or find the retention needed for your selected growth target.');
