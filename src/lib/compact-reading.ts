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
];

// Change presentation order only; all original mathematical examples remain available.
export const compactReadingLeadExamples: Record<string,number> = {
 'fha-loan':1, savings:3, cd:2, retirement:4, '401k':2, 'roth-ira':1,
 annuity:1, 'annuity-payout':2, pension:2, 'social-security':2,
 'personal-loan':1, 'student-loan':2, 'auto-loan':1, 'credit-card':1,
 'home-equity-loan':2, apr:1, 'debt-consolidation':1,
};
