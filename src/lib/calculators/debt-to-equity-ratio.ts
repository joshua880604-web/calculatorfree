import { tool } from './helpers';
import { metric, money, num, select, type Result, type Values } from '../types';
import { choose, usd, value } from './expansion-common';
import { ratioMetric } from './working-capital-common';

const bases = ['Total liabilities', 'Interest-bearing debt'] as const;
const common = () => [select('debt_basis', 'Numerator definition used consistently', [...bases]), usd('debt', 'Amount under the selected numerator definition', 240000), { ...num('equity', 'Book shareholders’ equity at the same date and scope', 160000, '$', -1e12), max: 1e12, hint: 'Use matching company scope and currency. Negative book equity is permitted but flagged.' }];
const de = (debt: number, equity: number) => equity > 0 ? debt / equity : null;
const dc = (debt: number, equity: number) => equity > 0 ? debt / (debt + equity) * 100 : null;
const missing = 'Not meaningful: book equity is zero or negative';
const cell = (n: number | null) => n === null ? missing : n;

export function debtToEquityRatio(v: Values, changes = false): Result {
  const basis = choose(v, 'debt_basis', bases), debt = value(v, 'debt', 0, 1e12), equity = value(v, 'equity', -1e12, 1e12);
  const repay = changes ? value(v, 'repayment', 0, debt) : 0, injection = changes ? value(v, 'equity_injection', 0, 1e12) : 0;
  const afterDebt = debt - repay, afterEquity = equity + injection;
  const ratio = de(afterDebt, afterEquity), capitalShare = dc(afterDebt, afterEquity);
  const metrics = [
    { ...ratioMetric(changes ? 'Debt-to-equity after entered changes' : 'Debt-to-equity ratio', ratio, missing), digits: 4 },
    ratioMetric('Selected numerator / (numerator + book equity)', capitalShare, missing, capitalShare === null ? 'number' : 'percent'),
    money('Selected numerator amount used', afterDebt), money('Book equity used', afterEquity),
    { ...metric('Numerator definition', 0), displayValue: basis },
    { ...metric('Equity interpretation', 0), displayValue: afterEquity > 0 ? 'Positive book equity; compare only matching definitions' : 'Nonpositive book equity: investigate the balance sheet' },
  ];
  if (changes) metrics.push({ ...ratioMetric('Debt-to-equity before entered changes', de(debt, equity), missing), digits: 4 }, money('Entered repayment from existing company cash', repay), money('New equity capital retained in the company', injection));
  const states = changes ? [['Before changes', debt, equity], ['Repayment only', afterDebt, equity], ['New equity only', debt, afterEquity], ['Both entered changes', afterDebt, afterEquity]] as const : [['Entered balance-sheet snapshot', debt, equity]] as const;
  return {
    metrics,
    columns: ['Balance-sheet scenario', 'Selected numerator (USD)', 'Book equity (USD)', 'D/E with positive equity', 'Selected numerator / (numerator + equity) (%)'],
    rows: states.map(([label, d, e]) => [label, d, e, cell(de(d, e)), cell(dc(d, e))]),
    notes: [
      `The selected numerator is ${basis.toLowerCase()}. Definitions vary: total liabilities can include payables and provisions, while interest-bearing debt normally selects a narrower borrowing scope. Use one definition, date, currency and entity scope consistently.`,
      'This worksheet uses book shareholders’ equity, not market capitalization or personal income. It does not calculate a personal debt-to-income ratio, retrieve financial statements or determine a universal healthy leverage threshold.',
      'D/E is shown only when book equity is positive. Zero equity makes division undefined; negative equity does not turn leverage into a healthy negative score. An injection that restores positive equity can make the after-change ratio interpretable, while the before-change ratio stays flagged.',
      'Selected numerator / (selected numerator + book equity) describes only that stated denominator. With interest-bearing debt selected, it excludes other liabilities and is not automatically debt / total assets. With total liabilities and consistent book equity, the balance-sheet identity can connect the quantities, subject to scope and classification.',
      changes ? 'Repayment reduces the selected liability amount and existing company cash by the same amount; equity stays constant. The separate new-equity injection increases company cash and book equity without changing liabilities. The combined row applies both independent entries, without interest, fees, profit, tax, distributions or issuance costs. Cash availability and feasibility are not checked.' : 'A single snapshot does not show liquidity, maturity, covenants or the reason equity changed. Match both sides to the same ownership and consolidation scope; compare companies only after reconciling the numerator definition.',
    ],
  };
}

export const debtToEquityRatioCalculator = tool('debt-to-equity-ratio', [
  { id: 'snapshot', title: 'Balance-Sheet Snapshot', description: 'Choose a numerator definition and compare it with matching book equity.', fields: common(), formula: 'D/E = selected total liabilities or interest-bearing debt / positive book shareholders’ equity.', calculate: v => debtToEquityRatio(v) },
  { id: 'changes', title: 'Repayment & New Equity Scenarios', description: 'Separate a repayment from existing cash and a new capital injection retained as cash.', fields: [...common(), usd('repayment', 'Repayment from existing company cash (up to selected numerator)', 40000), usd('equity_injection', 'New equity capital retained in the company', 40000)], formula: 'After-change D/E = (selected numerator − repayment) / (book equity + new equity capital), when the denominator is positive.', calculate: v => debtToEquityRatio(v, true) },
], 'Calculate corporate debt-to-equity using total liabilities or interest-bearing debt and book equity. Compare repayment and new-equity scenarios, with nonpositive equity explicitly flagged.');
