import oldRules from "./tax-2025.json";
import rules from "./official-rules.json";
import details from "./tax-details.json";
import policy from "./policy-rules.json";
export type Filing =
  "single" | "married_joint" | "head_household" | "married_separate";
export type TaxInputs = {
  year: 2025 | 2026;
  filing: Filing;
  wages: number;
  spouseWages: number;
  medicareWages?: number;
  spouseMedicareWages?: number;
  nonitemizerCashGifts?: number;
  business: number;
  spouseBusiness: number;
  interest: number;
  dividends: number;
  qualified: number;
  shortGains: number;
  longGains: number;
  socialSecurity: number;
  mfsLivedApartAllYear?: boolean;
  mfsSpouseItemizes?: boolean;
  niitPassiveIncome?: number;
  qbiIncome?: number;
  activeQbiIncome?: number;
  activeBusiness?: boolean;
  spouseActiveBusiness?: boolean;
  other: number;
  adjustments: number;
  itemized: number;
  salt: number;
  age65: number;
  tips: number;
  overtime: number;
  carInterest: number;
  children: number;
  dependents: number;
  studentInterest: number;
  amtAdjustments: number;
  credits: number;
  qualifiedBusiness: boolean;
  exemptInterest?: number;
  educationExpenses?: number[];
  educationTypes?: string[];
  aotcRefundable?: boolean;
  careExpenses?: number;
  carePeople?: number;
};
const brackets2025: Record<Filing, number[][]> = oldRules.brackets;
export function bracketTax(taxable: number, brackets: number[][]): number {
  return brackets.reduce(
    (total, [low, rate], i) =>
      total +
      Math.max(0, Math.min(taxable, brackets[i + 1]?.[0] ?? Infinity) - low) *
        rate,
    0,
  );
}
export function ordinaryTax(
  taxable: number,
  filing: Filing,
  year = 2026,
): number {
  return bracketTax(
    Math.max(0, taxable),
    year === 2025
      ? brackets2025[filing]
      : rules.federal_income_tax.brackets[filing],
  );
}
export function gainsTax(
  gains: number,
  ordinary: number,
  filing: Filing,
  year: 2025 | 2026,
): number {
  const [zero, fifteen] =
      details.capital_gains[String(year) as "2025" | "2026"][filing],
    free = Math.min(gains, Math.max(0, zero - ordinary)),
    middle = Math.min(
      gains - free,
      Math.max(0, fifteen - Math.max(ordinary, zero)),
    );
  return middle * 0.15 + Math.max(0, gains - free - middle) * 0.2;
}
export function selfEmployment(
  net: number,
  wages: number,
  year: 2025 | 2026,
): number {
  const income = Math.max(0, net) * 0.9235,
    base = year === 2026 ? 184500 : 176100;
  if (income < 400) return 0;
  return Math.min(income, Math.max(0, base - wages)) * 0.124 + income * 0.029;
}
export function federalTax(x: TaxInputs) {
  const married = x.filing === "married_joint",
    se1 = selfEmployment(x.business, x.wages, x.year),
    se2 = selfEmployment(x.spouseBusiness, x.spouseWages, x.year),
    se = se1 + se2,
    wages = x.wages + x.spouseWages,
    business = x.business + x.spouseBusiness;
  let short = x.shortGains,
    long = x.longGains;
  if (short < 0 && long > 0) {
    const offset = Math.min(-short, long);
    short += offset;
    long -= offset;
  }
  if (long < 0 && short > 0) {
    const offset = Math.min(-long, short);
    long += offset;
    short -= offset;
  }
  const capitalIncome = Math.max(
    short + long,
    x.filing === "married_separate" ? -1500 : -3000,
  );
  const gross =
    wages + business + x.interest + x.dividends + capitalIncome + x.other;
  const provisional =
      gross +
      x.qualified +
      x.socialSecurity / 2 -
      x.adjustments -
      se / 2 +
      (x.exemptInterest ?? 0),
    base = married ? 32000 : 25000,
    upper = married ? 44000 : 34000;
  const taxableSS =
    x.filing === "married_separate" && !x.mfsLivedApartAllYear
      ? Math.min(x.socialSecurity * 0.85, 0.85 * Math.max(0, provisional))
      : provisional <= base
        ? 0
        : provisional <= upper
          ? Math.min(x.socialSecurity * 0.5, (provisional - base) * 0.5)
          : Math.min(
              x.socialSecurity * 0.85,
              0.85 * (provisional - upper) +
                Math.min(x.socialSecurity * 0.5, (upper - base) * 0.5),
            );
  const tentative = gross + x.qualified + taxableSS - x.adjustments - se / 2,
    phase = married
      ? x.year === 2025
        ? [170000, 200000]
        : [175000, 205000]
      : [85000, 100000],
    student =
      x.filing === "married_separate"
        ? 0
        : Math.min(2500, x.studentInterest) *
          Math.max(
            0,
            Math.min(1, (phase[1] - tentative) / (phase[1] - phase[0])),
          ),
    agi = Math.max(0, tentative - student);
  const canUseStandard = !(x.filing === "married_separate" && x.mfsSpouseItemizes),
    standard = canUseStandard ?
    (x.year === 2026
      ? rules.federal_income_tax.standard_deductions[x.filing]
      : {
          single: 15750,
          married_joint: 31500,
          head_household: 23625,
          married_separate: 15750,
        }[x.filing]) +
    x.age65 *
      (x.year === 2026
        ? married || x.filing === "married_separate"
          ? 1650
          : 2050
        : married || x.filing === "married_separate"
          ? 1600
          : 2000) : 0;
  const saltCapBase = x.year === 2026 ? 40400 : 40000,
    saltPhase = x.year === 2026 ? 505000 : 500000,
    separate = x.filing === "married_separate" ? 2 : 1,
    saltCap =
      Math.max(
        10000,
        saltCapBase - 0.3 * Math.max(0, agi - saltPhase / separate),
      ) / separate,
    salt = Math.min(x.salt, saltCap),
    itemized = x.itemized + salt,
    cashGiftDeduction = x.year === 2026 && canUseStandard ? Math.min(Math.max(0, x.nonitemizerCashGifts ?? 0), married ? 2000 : 1000) : 0;
  const allowed = x.filing !== "married_separate",
    threshold = married ? 300000 : 150000,
    steps = Math.floor(Math.max(0, agi - threshold) / 1000),
    tip = allowed ? Math.max(0, Math.min(x.tips, 25000) - 100 * steps) : 0,
    overtime = allowed
      ? Math.max(0, Math.min(x.overtime, married ? 25000 : 12500) - 100 * steps)
      : 0,
    car = Math.max(
      0,
      Math.min(x.carInterest, 10000) -
        200 * Math.ceil(Math.max(0, agi - (married ? 200000 : 100000)) / 1000),
    ),
    senior = allowed
      ? x.age65 *
        Math.max(0, 6000 - 0.06 * Math.max(0, agi - (married ? 150000 : 75000)))
      : 0,
    extra = tip + overtime + car + senior;
  const amtSpec = details.amt[String(x.year) as "2025" | "2026"];
  const qbiNetIncome = x.qbiIncome ?? business - se / 2,
    activeQbiIncome = x.activeQbiIncome ??
      ((x.activeBusiness ? x.business - se1 / 2 : 0) + (x.spouseActiveBusiness ? x.spouseBusiness - se2 / 2 : 0)),
    activeQbiMinimum = x.year === policy.active_qbi_minimum.tax_year &&
      activeQbiIncome >= policy.active_qbi_minimum.minimum_net_active_qbi
      ? policy.active_qbi_minimum.minimum_deduction : 0;
  function deductionTax(rawDeduction: number, usingStandard: boolean) {
    // Section 199A is calculated without the section 68 reduction (199A(e)(1)).
    const beforeQBI = Math.max(0, agi - rawDeduction - extra),
      preferential = Math.min(beforeQBI, Math.max(0, long + x.qualified)),
      qbi = x.qualifiedBusiness
        ? Math.max(activeQbiMinimum, Math.min(Math.max(0, qbiNetIncome) * 0.2, Math.max(0, beforeQBI - preferential) * 0.2))
        : 0,
      topBracket = rules.federal_income_tax.brackets[x.filing].at(-1)![0],
      itemizedReduction = x.year === 2026 && !usingStandard
        ? (2 / 37) * Math.min(rawDeduction, Math.max(0, agi - extra - qbi - topBracket))
        : 0,
      deduction = rawDeduction - itemizedReduction,
      taxable = Math.max(0, agi - deduction - extra - qbi),
      capital = Math.min(taxable, Math.max(0, long + x.qualified)),
      regular = ordinaryTax(taxable - capital, x.filing, x.year) + gainsTax(capital, taxable - capital, x.filing, x.year),
      // Section 56(b)(1)(E): section 68 does not apply to AMT.
      amtiBeforeMfs = Math.max(0, taxable - itemizedReduction + (usingStandard ? standard : salt) + senior + x.amtAdjustments),
      mfsAmtRule = policy.mfs_amt_increase[String(x.year) as "2025" | "2026"],
      mfsAmtIncrease = x.filing === "married_separate"
        ? Math.min(mfsAmtRule.maximum, Math.max(0, amtiBeforeMfs - mfsAmtRule.threshold) * mfsAmtRule.rate) : 0,
      amti = amtiBeforeMfs + mfsAmtIncrease,
      exemption = Math.max(0, amtSpec.exemptions[x.filing] - Math.max(0, amti - amtSpec.phaseout_start[x.filing]) * amtSpec.exemption_reduction_rate),
      amtBase = Math.max(0, amti - exemption),
      amtCapital = Math.min(amtBase, Math.max(0, long + x.qualified)),
      amtOrdinary = amtBase - amtCapital,
      amtBoundary = x.filing === "married_separate" ? amtSpec.upper_rate_threshold_married_separate : amtSpec.upper_rate_threshold,
      tmt = Math.min(amtOrdinary, amtBoundary) * 0.26 + Math.max(0, amtOrdinary - amtBoundary) * 0.28 + gainsTax(amtCapital, amtOrdinary, x.filing, x.year),
      amt = Math.max(0, tmt - regular);
    return {usingStandard, deduction, itemizedReduction, taxable, qbi, regular, amt, mfsAmtIncrease};
  }
  const standardTax = deductionTax(standard + cashGiftDeduction, true),
    itemizedTax = deductionTax(itemized, false),
    selectedTax = canUseStandard && standardTax.regular + standardTax.amt <= itemizedTax.regular + itemizedTax.amt ? standardTax : itemizedTax,
    {usingStandard, deduction, itemizedReduction, taxable, qbi, regular, amt, mfsAmtIncrease} = selectedTax;
  const educationPhase =
    x.filing === "married_separate"
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((married ? 180000 : 90000) - agi) / (married ? 20000 : 10000),
          ),
        );
  let aotc = 0,
    llcExpenses = 0;
  for (let i = 0; i < (x.educationExpenses?.length ?? 0); i++) {
    const expense = Math.max(0, x.educationExpenses![i]);
    if (x.educationTypes?.[i] === "American Opportunity")
      aotc +=
        Math.min(2000, expense) +
        0.25 * Math.min(2000, Math.max(0, expense - 2000));
    else if (x.educationTypes?.[i] === "Lifetime Learning")
      llcExpenses += expense;
  }
  aotc *= educationPhase;
  const educationRefund = x.aotcRefundable ? aotc * 0.4 : 0,
    educationCredit =
      aotc -
      educationRefund +
      Math.min(2000, llcExpenses * 0.2) * educationPhase;
  const carePeople = Math.min(2, Math.max(0, x.carePeople ?? 0)),
    earned1 = Math.max(0, x.wages + x.business - se1 / 2),
    earned2 = Math.max(0, x.spouseWages + x.spouseBusiness - se2 / 2),
    careLimit = Math.min(
      x.careExpenses ?? 0,
      carePeople * 3000,
      earned1,
      married ? earned2 : earned1,
    ),
    careRate =
      x.year === 2025
        ? Math.max(
            0.2,
            0.35 - 0.01 * Math.ceil(Math.max(0, agi - 15000) / 2000),
          )
        : Math.max(
            0.2,
            Math.max(
              0.35,
              0.5 - 0.01 * Math.ceil(Math.max(0, agi - 15000) / 2000),
            ) -
              0.01 *
                Math.ceil(
                  Math.max(0, agi - (married ? 150000 : 75000)) /
                    (married ? 4000 : 2000),
                ),
          ),
    careCredit =
      x.filing === "married_separate" ? 0 : Math.max(0, careLimit) * careRate;
  const nominalCredit = x.children * 2200 + x.dependents * 500,
    credit = Math.max(
      0,
      nominalCredit -
        50 * Math.ceil(Math.max(0, agi - (married ? 400000 : 200000)) / 1000),
    ),
    // Schedule 8812 Credit Limit Worksheet A: designated nonrefundable
    // education/care/entered credits reduce the tax available to CTC first.
    otherCreditsApplied = Math.min(regular + amt, x.credits + educationCredit + careCredit),
    childCredit = Math.min(credit, Math.max(0, regular + amt - otherCreditsApplied)),
    nonrefundable = otherCreditsApplied + childCredit,
    unused = Math.max(0, credit - childCredit),
    actcEarnedIncome = Math.max(0, wages + business - se / 2),
    childRefund = Math.min(x.children * 1700, unused, Math.max(0, actcEarnedIncome - 2500) * 0.15),
    refundable = childRefund + educationRefund;
  const ssBase = x.year === 2026 ? 184500 : 176100,
    payrollSS =
      (Math.min(x.wages, ssBase) + Math.min(x.spouseWages, ssBase)) * 0.062,
    medicareWages = (x.medicareWages ?? x.wages) + (x.spouseMedicareWages ?? x.spouseWages),
    medicare = medicareWages * 0.0145,
    additionalThreshold = married
      ? 250000
      : x.filing === "married_separate"
        ? 125000
        : 200000,
    additional =
      Math.max(
        0,
        medicareWages +
          (Math.max(0, x.business) * 0.9235 >= 400
            ? Math.max(0, x.business) * 0.9235
            : 0) +
          (Math.max(0, x.spouseBusiness) * 0.9235 >= 400
            ? Math.max(0, x.spouseBusiness) * 0.9235
            : 0) -
          additionalThreshold,
      ) * 0.009,
    niit =
      Math.min(
        Math.max(0, x.interest + x.dividends + x.qualified + capitalIncome + (x.niitPassiveIncome ?? 0)),
        Math.max(0, agi - additionalThreshold),
      ) * 0.038;
  const federal =
    Math.max(0, regular + amt - nonrefundable) +
    se +
    additional +
    niit -
    refundable;
  return {
    gross: gross + x.qualified + x.socialSecurity,
    agi,
    taxable,
    taxableSS,
    standard,
    itemized,
    deduction,
    itemizedReduction,
    usingStandard,
    nonitemizerCashDeduction: usingStandard ? cashGiftDeduction : 0,
    salt,
    extra,
    qbi,
    regular,
    amt,
    mfsAmtIncrease,
    credit: nonrefundable,
    refundable,
    childCredit,
    childRefund,
    actcEarnedIncome,
    federal,
    payrollSS,
    medicare,
    additional,
    se,
    niit,
    student,
    educationCredit,
    educationRefund,
    careCredit,
    careRate,
    tips: tip,
    overtime,
    car,
    senior,
  };
}
