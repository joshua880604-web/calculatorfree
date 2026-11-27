import type { Result } from './types';

// Read the calculated monthly row, not the form: inputs can be edited before
// Calculate is selected, while the displayed result still belongs to the old run.
export function firstPaymentParts(id: string, result: Result) {
  if (!['amortization', 'credit-card-minimum-payment'].includes(id)) return null;
  const row = result.rows?.[0];
  if (!row || !result.columns) return null;
  const read = (label: string) => {
    const cell = row[result.columns!.indexOf(label)];
    return typeof cell === 'number' && Number.isFinite(cell) ? cell : null;
  };
  const payment = read('Payment'), interest = read('Interest');
  const principal = read('Principal'), balance = read('Balance');
  if (payment === null || interest === null || principal === null || balance === null) return null;
  return { payment, interest, principal, balance };
}
