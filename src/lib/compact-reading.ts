// Preview rollout: keep the calculator workspace intact and compact supporting reading only.
export const compactReadingIds = [
 'coast-fire', 'brrrr', 'roi', 'fha-loan', 'debt-snowball',
 'fire', 'lean-fire', 'fat-fire', 'barista-fire',
 'cash-on-cash-return', 'house-hacking', 'rental-property', 'mortgage-vs-invest',
 'debt-avalanche', 'credit-cards-payoff', 'roas', 'landed-cost',
 'mortgage', 'rent-vs-buy', 'heloc',
 'compound-interest', 'investment', 'savings', 'cd', 'retirement', '401k',
 'roth-ira', 'roth-conversion-ladder', 'rmd', 'hsa',
 'annuity', 'annuity-payout', 'pension', 'social-security',
 'personal-loan', 'student-loan', 'auto-loan', 'credit-card',
 'home-equity-loan', 'mortgage-payoff', 'apr', 'debt-consolidation',
 'amortization', 'house-affordability', 'rent', 'va-mortgage',
 'cash-back-or-low-interest', 'auto-lease', 'irr', 'income-tax',
 'take-home-paycheck', 'debt-payoff', 'repayment', 'business-loan',
 'boat-loan', 'budget', 'emergency-fund', 'investment-fee',
 'break-even', 'pmi', 'discount-points', 'biweekly-mortgage',
 'mortgage-recast', 'treasury-bill', 'quick-ratio', 'noi',
 'self-employment-tax', 'mirr', 'drip', 'covered-call',
 'cap-rate', 'credit-card-minimum-payment', 'fix-and-flip', 'seller-financing',
 'stock-profit', 'stock-average',
];

// Change presentation order only; all original mathematical examples remain available.
export const compactReadingLeadExamples: Record<string,number> = {
 'fha-loan':1, savings:3, cd:2, retirement:4, '401k':2, 'roth-ira':1,
 annuity:1, 'annuity-payout':2, pension:2, 'social-security':2,
 'personal-loan':1, 'student-loan':2, 'auto-loan':1, 'credit-card':1,
 'home-equity-loan':2, apr:1, 'debt-consolidation':1,
 'amortization':1, 'house-affordability':2, 'va-mortgage':1,
 'cash-back-or-low-interest':1, 'auto-lease':1, 'take-home-paycheck':1,
 'debt-payoff':1, repayment:1, 'business-loan':2, 'boat-loan':2,
 pmi:2, 'biweekly-mortgage':2,
 'marriage-tax':1,
};

// Shorter pages retain their reading flow; only measured long sections are folded.
export type CompactReadingSections = Partial<Record<'questions'|'examples'|'sources'|'comparisons',boolean>>;
export const compactReadingSections: Record<string,CompactReadingSections> = {
  "simple-interest": {
    "questions": true,
    "comparisons": true
  },
  "bond": { "questions": true },
  "interest": { "questions": true },
  "payment": { "questions": true },
  "estate-tax": { "questions": true },
  "lease": { "questions": true },
  "sales-tax": { "questions": true },
  "discount": { "questions": true, "examples": true, "sources": true },
  "vat": { "questions": true },
  "interest-rate": { "questions": true, "examples": true, "sources": true },
  "average-return": { "questions": true },
  "college-cost": { "questions": true },
  "finance": { "questions": true },
  "commission": { "questions": true },
  "inflation": { "questions": true },
  "down-payment": { "questions": true },
  "debt-to-income-ratio": { "questions": true },
  "payback-period": { "questions": true },
  "mutual-fund": {
    "questions": true
  },
  "future-value": {
    "questions": true,
    "comparisons": true
  },
  "present-value": {
    "questions": true,
    "comparisons": true
  },
  "salary": {
    "questions": true
  },
  "marriage-tax": {
    "questions": true,
    "examples": true
  },
  "loan": {
    "questions": true
  },
  "currency": {
    "questions": true
  },
  "margin": {
    "questions": true
  },
  "depreciation": {
    "questions": true,
    "sources": true
  },
  "markup": {
    "questions": true
  },
  "cagr": {
    "questions": true
  },
  "real-return": {
    "questions": true
  },
  "tax-equivalent-yield": {
    "questions": true
  },
  "current-ratio": {
    "questions": true
  }
};
