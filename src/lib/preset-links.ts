import { navigationHref } from './navigation';
import { minimumPaymentPlan } from './credit-minimum';

export const MAX_SHARE_LENGTH = 20000;

// Defaults of the retained historical single-card minimum mode. Existing
// presets that omit fields must not inherit the dedicated tool's newer defaults.
export const legacyCreditMinimumDefaults = {
  principal: '10000', rate: '20', minimum: '2', floor: '25', interest_extra: 'No', extra: '0',
};

export function canHandoffCreditMinimum(values: Record<string, string | number | undefined>) {
  for (const key of ['principal', 'floor', 'extra']) {
    const value = Number(values[key] || 0);
    if (!Number.isFinite(value) || value < 0 || value > 1e9) return false;
  }
  for (const key of ['rate', 'minimum']) {
    const value = Number(values[key]);
    if (!Number.isFinite(value) || value < 0 || value > 100) return false;
  }
  try {
    return minimumPaymentPlan({balance:Number(values.principal), apr:Number(values.rate),
      percent:Number(values.minimum), floor:Number(values.floor), extra:Number(values.extra || 0),
      interestExtra:values.interest_extra === 'Yes'}).months <= 1200;
  } catch {
    // Non-amortizing/invalid scenarios retain the destination's explicit error.
    return true;
  }
}

// Presets describe client-side state on an existing tool, not another document.
// Keep the versioned fragment compatible with previously shared result links.
export function calculatorPresetHref(path: string, mode: string, values: Record<string, string | number | undefined> = {}) {
  if (navigationHref(path).split(/[?#]/)[0] === '/single-credit-card-payoff-calculator' && mode === 'minimum') {
    values = {...legacyCreditMinimumDefaults, ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined))};
    if (values.extra === '') values.extra = '0';
    if (canHandoffCreditMinimum(values)) path = '/credit-card-minimum-payment-calculator';
  }
  const params = new URLSearchParams({ share_version: '1', mode });
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && !['share_version', 'mode', 'verified_rate'].includes(key)) params.set(key, String(value));
  }
  const href = navigationHref(path).split(/[?#]/)[0] + '#calc=' + params.toString();
  if (href.length > MAX_SHARE_LENGTH) throw new Error('These inputs are too long for a reliable calculation link. Open the tool and enter them directly.');
  return href;
}
