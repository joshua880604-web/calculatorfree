import { calculatorPresetHref, canHandoffCreditMinimum } from './preset-links';
import { sharedInputs } from './sharing';
import type { Calculator, Values } from './types';

const minimumPath = '/credit-card-minimum-payment-calculator.html';
const minimumFields = ['principal', 'rate', 'minimum', 'floor', 'interest_extra', 'extra'];

// Retain the historical calculation contract for old links and exports, while
// presenting changing minimum payments on their dedicated document only.
export function visibleCalculatorModes(calc: Calculator) {
  return calc.id === 'credit-card' ? calc.modes.filter(mode => mode.id !== 'minimum') : calc.modes;
}

export function minimumPaymentHref(values: Values = {}) {
  const inputs = Object.fromEntries(minimumFields
    .filter(key => values[key] !== undefined)
    .map(key => [key, key === 'extra' && !values[key].trim() ? '0' : values[key]]));
  return calculatorPresetHref(minimumPath, 'minimum', inputs);
}

export function legacyMinimumPaymentHref(calc: Calculator, search: string, hash: string) {
  if (calc.id !== 'credit-card') return null;
  const raw = hash.startsWith('#calc=') ? hash.slice(6) : search.replace(/^\?/, '');
  if (new URLSearchParams(raw).get('mode') !== 'minimum') return null;
  // Use the old mode's defaults: notably $10,000, 20% APR, and interest_extra=No.
  // The dedicated page defaults differ; omitting these would change saved results.
  const shared = sharedInputs(calc, search, hash);
  return shared?.mode.id === 'minimum' && canHandoffCreditMinimum(shared.values) ? minimumPaymentHref(shared.values) : null;
}
