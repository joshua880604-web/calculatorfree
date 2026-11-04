import {roth401kComparisonMode} from './roth-401k-comparison';
import {contributionTaxSavings} from '../401k-tax-savings';
import { retirementIncome } from "../retirement-projection";
import { employee401kLimit as limit401 } from "../retirement-limits";
import { tool, timingField } from "./helpers";
import {
  num,
  select,
  number as n,
  money,
  metric,
  type Values,
  type Mode,
} from "../types";
import {
  future,
  annuityPV,
  payment,
  duration,
  positive,
  sum,
  periods,
} from "../finance";
import rules from "../official-rules.json";
const pct = (v: Values, k: string) => n(v, k) / 100;
const monthly = (rate: number) => Math.expm1(Math.log1p(rate) / 12);
const timing = (v: Values) => v.timing === "Beginning of period";
const ageFields = () => [
  num("age", "Current age", 35, "years", 0),
  num("retire", "Retirement age", 67, "years", 1),
  num("life", "Life expectancy", 90, "years", 1),
];
function remaining(v: Values): { working: number; retired: number } {
  if (!["age", "retire", "life"].every(key => Number.isInteger(n(v, key))))
    throw new Error("Current age, retirement age and life expectancy must be whole numbers.");
  const working = n(v, "retire") - n(v, "age"),
    retired = n(v, "life") - n(v, "retire");
  if (working < 0 || retired <= 0)
    throw new Error(
      "Retirement age must be at least current age and below life expectancy.",
    );
  return { working, retired };
}
const retirement = tool(
  "retirement",
  [
    {
      id: "required",
      title: "Required Savings",
      fields: [
        ...ageFields(),
        num("income", "Current annual income", 80000, "$"),
        num("salary_growth", "Annual income increase", 2, "%"),
        num("replacement", "Income needed after retirement", 75),
        select("replacement_unit", "Retirement income entered as", ["Percent of final annual income", "Dollars per year"]),
        num("return", "Annual investment return", 6, "%", -99),
        num("inflation", "Inflation", 2.5, "%", -99),
        num("other", "Other monthly retirement income", 1500, "$"),
        num("balance", "Current retirement savings", 100000, "$"),
        num("saving", "Future retirement savings", 500),
        select("saving_unit", "Future savings entered as", ["Dollars per month", "Dollars per year", "Percent of annual income"]),
      ],
      description:
        "Estimate the retirement balance needed to fund an inflation-adjusted income gap.",
      formula:
        "Target = sum of first-year income gap × (1 + inflation)^(year − 1) / (1 + return)^year; required monthly saving funds target less future current savings.",
      calculate: (v) => {
        if (v.replacement_unit !== "Dollars per year" && n(v,"replacement") > 100) throw new Error("Income replacement percentage must not exceed 100%.");
        const { working, retired } = remaining(v),
          r = pct(v, "return"),
          real = (1 + r) / (1 + pct(v, "inflation")) - 1,
          annual = v.replacement_unit === "Dollars per year" ? n(v,"replacement") :
            n(v, "income") *
            (1 + pct(v, "salary_growth")) ** working *
            pct(v, "replacement"),
          gap = Math.max(0, annual - n(v, "other") * 12),
          target = annuityPV(gap, real, retired) / (1 + pct(v, "inflation")),
          existing = future(n(v, "balance"), 0, monthly(r), working * 12),
          factor = future(0, 1, monthly(r), working * 12),
          needed = working ? Math.max(0, (target - existing) / factor) : 0,
          projected = (() => {
            if (v.saving_unit === "Dollars per year") return future(n(v,"balance"), n(v,"saving"), r, working);
            if (v.saving_unit !== "Percent of annual income") return future(n(v,"balance"), n(v,"saving"), monthly(r), working*12);
            if (n(v,"saving") > 100) throw new Error("Savings percentage must not exceed 100%.");
            let total = n(v,"balance");
            const months = working*12;
            if (months > 12000) throw new Error("Savings horizon exceeds supported limits.");
            for (let month=0; month<months; month++) total = total*(1+monthly(r)) + n(v,"income")*(1+pct(v,"salary_growth"))**Math.floor(month/12)*pct(v,"saving")/12;
            return total;
          })();
        return {
          metrics: [
            money("Required savings at retirement", target),
            ...(working > 0
              ? [money("Required monthly saving", needed)]
              : [money("Additional savings needed now", Math.max(0, target - existing))]),
            money("Projected retirement savings", projected),
            money("Projected surplus / shortfall", projected - target),
            money("First-year retirement income need", annual),
          ],
          notes: [
            ...(working === 0 ? ["Retirement starts now, so there is no remaining contribution period. Additional savings needed now is the immediate funding shortfall, not a monthly saving plan."] : []),
            "The entered income gap is the first retirement-year withdrawal, paid at that year’s end; inflation increases subsequent yearly withdrawals. A dollar income target is an annual amount at retirement; a percentage applies to projected final working income. Monthly savings are paid at month end; annual savings at year end; salary-percentage deposits are paid monthly and increase with the entered annual income increase. Other income is treated as inflation-indexed throughout retirement. Returns and inflation remain constant.",
          ],
        };
      },
    },
    {
      id: "saving",
      title: "Saving Plan",
      fields: [
        num("age", "Current age", 35, "years"),
        num("retire", "Retirement age", 67, "years"),
        num("target", "Target savings", 1500000, "$"),
        num("balance", "Current savings", 100000, "$"),
        num("return", "Annual return", 6, "%", -99),
      ],
      description:
        "Find the periodic saving needed to reach a retirement target.",
      formula:
        "Monthly saving = (target − future current savings)/annuity accumulation factor.",
      calculate: (v) => {
        const N =
            positive(n(v, "retire") - n(v, "age"), "Years until retirement") *
            12,
          r = monthly(pct(v, "return")),
          existing = future(n(v, "balance"), 0, r, N),
          required = Math.max(
            0,
            (n(v, "target") - existing) / future(0, 1, r, N),
          );
        return {
          metrics: [
            money("Required monthly saving", required),
            money("Annual total of monthly savings", required * 12),
            money(
              "Required year-end annual saving",
              Math.max(
                0,
                (n(v, "target") - existing) /
                  future(0, 1, pct(v, "return"), N / 12),
              ),
            ),
            money("Current savings future value", existing),
          ],
          notes: [
            "Monthly savings are paid at each month end. Annual total of monthly savings is twelve monthly deposits; Required year-end annual saving is an alternative single deposit at each year end. These are separate plans, not amounts to contribute together. Annual return is an effective annual rate.",
          ],
        };
      },
    },
    {
      id: "withdrawal",
      title: "Monthly Withdrawal",
      fields: [
        ...ageFields(),
        num("balance", "Current savings", 100000, "$"),
        num("saving", "Monthly contribution", 500, "$"),
        {...num("annual", "Annual contribution", 0, "$"), hint: "Additional deposit at each year end before retirement; separate from monthly deposits."},
        num("return", "Annual return", 6, "%", -99),
        num("inflation", "Inflation", 2.5, "%", -99),
      ],
      description:
        "Estimate the initial sustainable monthly withdrawal with subsequent inflation increases.",
      formula:
        "Retirement balance includes current savings, month-end deposits and additional year-end deposits. Initial monthly withdrawal = retirement balance × (1 + monthly inflation) / real-rate monthly annuity present-value factor.",
      calculate: (v) => {
        const { working, retired } = remaining(v),
          r = pct(v, "return"),
          b = future(n(v, "balance"), n(v, "saving"), monthly(r), working * 12) + future(0, n(v, "annual"), r, working),
          real = (1 + r) / (1 + pct(v, "inflation")) - 1,
          w =
            payment(b, monthly(real), retired * 12) *
            (1 + monthly(pct(v, "inflation")));
        return {
          metrics: [
            money("Balance at retirement", b),
            money("Initial monthly withdrawal", w),
            money(
              "Monthly withdrawal in today’s dollars",
              w / (1 + pct(v, "inflation")) ** working,
            ),
          ],
          notes: [
            "First withdrawal is at the end of the first retirement month. Subsequent monthly withdrawals grow at the monthly rate equivalent to entered annual inflation. Monthly contributions occur at month end; additional annual contributions occur at year end, both before retirement. Annual investment return is effective.",
          ],
        };
      },
    },
    {
      id: "longevity",
      title: "Savings Longevity",
      fields: [
        num("balance", "Retirement balance", 500000, "$"),
        num("withdrawal", "Monthly withdrawal", 3000, "$"),
        num("return", "Annual return", 5, "%", -99),
      ],
      description:
        "Find how long a retirement balance supports fixed monthly withdrawals.",
      formula: "N = −ln(1 − PV×i/PMT)/ln(1+i); actual month-end withdrawals use ceil(N), with the last withdrawal capped at the available balance.",
      calculate: (v) => {
        const b = n(v, "balance"),
          w = n(v, "withdrawal"),
          r = monthly(pct(v, "return"));
        if (b === 0) return {
          metrics: [metric("Years savings last", 0), metric("Monthly withdrawals", 0), money("Total withdrawn", 0)],
          notes: ["There is no starting balance to withdraw."],
        };
        positive(w, "Monthly withdrawal");
        if (r >= 0 && w <= b * r)
          return {
            metrics: [money("Initial monthly interest", b * r)],
            notes: [
              "Under these constant-return assumptions the withdrawal does not exhaust the balance.",
            ],
          };
        const N = duration(b, w, r), count = Math.max(1, Math.ceil(N - 1e-10)),
          schedule = payoutSchedule(b, r, w, count, 12);
        return {
          ...schedule,
          metrics: [
            metric("Years savings last", count / 12),
            metric("Monthly withdrawals", count),
            money("Total withdrawn", schedule.total),
            money("Final monthly withdrawal", Number(schedule.rows.at(-1)![4])),
          ],
          notes: ["Withdrawals occur at month end after investment returns. Duration ends on the actual final payment date; the final withdrawal is limited to the remaining balance. Annual return is effective and constant; taxes and fees are excluded."],
        };
      },
    },
  ],
  "Plan retirement saving, income, withdrawals, and savings longevity.",
);
const k401 = tool(
  "401k",
  [
    {
      id: "projection",
      title: "401(k) Projection",
      fields: [
        ...ageFields(),
        num("salary", "Annual salary", 80000, "$"),
        num("balance", "Current 401(k) balance", 100000, "$"),
        {...num("contribution", "Employee contribution", 10, "% of salary"),max:100},
        num("match", "Employer match", 50, "%"),
        num("match_limit", "Employer match limit", 6, "% of salary"),
        num("salary_growth", "Annual salary increase", 2, "%"),
        num("return", "Annual return", 6, "%", -99),
        num("inflation", "Inflation", 2.5, "%", -99),
      ],
      description:
        "Project savings one year at a time. Starting balance plus employee contributions includes the starting 401(k) balance plus the sum of each projected year’s capped employee contribution.",
      formula:
        "For each year: employee = min(annual salary × contribution%, age-based annual limit); employer = min(employee, annual salary × match limit%) × match%; ending balance = opening balance × (1 + annual return) + employee + employer. Starting balance plus employee contributions = starting 401(k) balance + sum of annual employee amounts.",
      calculate: (v) => {
        const { working, retired } = remaining(v);
        if (!Number.isInteger(working) || !Number.isInteger(retired)) throw new Error("Projection ages must be whole numbers.");
        if (working > 100)
          throw new Error("Projection must not exceed 100 years.");
        let b = n(v, "balance"),
          salary = n(v, "salary");
        const rows: (string | number)[][] = [];
        for (let y = 0; y < working; y++) {
          const e = Math.min(
              salary * pct(v, "contribution"),
              limit401(n(v, "age") + y), salary,
            ),
            eligibleComp=Math.min(salary,rules.retirement_contributions.employer_compensation_limit),
            employerRoom=Math.max(0,Math.min(salary,rules.retirement_contributions.combined_annual_additions_limit)-Math.min(e,rules.retirement_contributions.employee_401k_limit)),
            match = Math.min(employerRoom, Math.min(e, eligibleComp * pct(v, "match_limit")) * pct(v, "match"));
          b = b * (1 + pct(v, "return")) + e + match;
          rows.push([n(v, "age") + y + 1, salary, e, match, b]);
          salary *= 1 + pct(v, "salary_growth");
        }
        const income = retirementIncome(b, pct(v, "return"), pct(v, "inflation"), retired, n(v, "retire"));
        return {
          metrics: [
            money("Projected 401(k) balance", b),
            money("Employee contributions", sum(rows.map((row) => Number(row[2])))),
            money("Starting 401(k) balance", n(v,"balance")),
            money(
              "Starting balance plus employee contributions",
              n(v, "balance") + sum(rows.map((row) => Number(row[2]))),
            ),
            money(
              "Employer contributions",
              sum(rows.map((row) => Number(row[3]))),
            ),
            money(
              "Inflation-adjusted balance",
              b / (1 + pct(v, "inflation")) ** working,
            ),
            money("Initial monthly retirement withdrawal", income.initial),
            money("Initial withdrawal in today’s dollars", income.initial / (1 + pct(v, "inflation")) ** working),
            money("Total retirement withdrawals", income.total),
          ],
          additionalTables: [{ title: "Retirement withdrawals", columns: ["Year-end age", "Opening balance", "Investment return", "Annual withdrawals", "Ending balance"], rows: income.rows, note: "USD, before tax. Withdrawals start at the end of the first retirement month, increase monthly with inflation, and target depletion at life expectancy. No new contributions, RMD rules or withdrawal penalties are modeled here." }],
          columns: ["Age", "Salary", "Employee", "Employer", "Balance"],
          rows,
          notes: [
            "Retirement income uses the entered life expectancy. Annual return is effective; monthly withdrawals increase at the monthly-equivalent inflation rate. Constant returns, full vesting and no taxes or fees are assumed. This is a sustainable-withdrawal illustration, not an RMD calculation or a guarantee.",
            "Annual iteration: the entered salary applies to the first projection year; salary increases once after each year. Each year’s employee contribution is salary × contribution percentage, capped by the limit for your age at the start of that projection year. Starting balance plus employee contributions adds the entered starting 401(k) balance once to the sum of these annual employee amounts. It excludes future investment returns and future employer matching; the starting balance may already contain past employer contributions and returns. The Employee column shows only that year’s new employee contribution.",
            "The opening balance earns the entered annual return first, then employee and employer contributions are added at year end. All projected years use 2026 limits with age-based catch-up; future limit increases are not projected. Employer matching uses up to $360,000 of compensation; annual additions excluding catch-up are capped at the lesser of compensation or $72,000. Catch-up deferrals above the regular employee limit are excluded from that additions cap. Other employers’ plans and nondiscrimination tests are not modeled. Calculations retain full precision; displayed annual amounts are rounded.",
            "Contribution limits combine traditional and Roth employee deferrals. Beginning in 2026, catch-up contributions generally must be Roth when prior-year FICA wages from the same plan sponsor exceeded $150,000. This before-tax growth illustration does not split traditional and Roth balances or calculate that tax effect. Catch-up eligibility uses calendar-year-end age under IRS rules; this annual age-based projection uses the entered age at each projection year's start, so align it to the applicable tax year when checking a legal contribution limit.",
          ],
        };
      },
    },
    {
      ...roth401kComparisonMode,
    },
    {
      id: "early",
      title: "Early Withdrawal Cost",
      fields: [
        num("withdrawal", "Withdrawal amount", 10000, "$"),
        num("federal", "Federal marginal tax", 22, "%"),
        num("state", "State marginal tax", 5, "%"),
        num("local", "Local marginal tax", 0, "%"),
        select("employed", "Still employed by the employer sponsoring this account?", ["Yes", "No"]),
        select("separated55", "Left this employer in or after the year you turned 55?", ["No", "Yes"]),
        select("disabled", "Qualifying total and permanent disability?", ["No", "Yes"]),
        select("exception", "Other early withdrawal penalty exception applies?", [
          "No",
          "Yes",
        ]),
      ],
      description:
        "Estimate income tax and the additional early-distribution penalty.",
      formula:
        "Net withdrawal = gross − marginal income tax − applicable 10% additional tax.",
      calculate: (v) => {
        const amount = n(v, "withdrawal"),
          tax =
            amount * (pct(v, "federal") + pct(v, "state") + pct(v, "local")),
          penalty = v.exception === "Yes" || v.disabled === "Yes" || (v.employed === "No" && v.separated55 === "Yes") ? 0 : amount * 0.1;
        return {
          metrics: [
            money("Net amount received", amount - tax - penalty),
            money("Estimated income tax", tax),
            money("Additional early withdrawal tax", penalty),
          ],
          notes: [
            "Intended for distributions before age 59½. The 10% additional tax is waived for a selected qualifying disability, another selected exception, or separation from this employer in or after the year you turn 55 when no longer employed by that sponsoring employer. The age-55 rule does not generally apply to IRAs; plan eligibility must be checked. Income tax still applies. This marginal-rate illustration does not recalculate a complete tax return.",
          ],
        };
      },
    },
    {
      id: "match",
      title: "Maximize Employer Match",
      fields: [
        num("age", "Age", 35, "years"),
        num("salary", "Annual salary", 80000, "$"),
        num("match1", "First-tier match", 100, "%"),
        num(
          "limit1",
          "First-tier employee contribution band",
          3,
          "% of salary",
        ),
        num("match2", "Second-tier match", 50, "%"),
        num(
          "limit2",
          "Additional second-tier contribution band",
          2,
          "% of salary",
        ),
      ],
      description:
        "Find a steady contribution-rate window for two matching bands without reaching the employee limit early.",
      formula:
        "Employer match = first band × first match rate + additional band × second match rate.",
      calculate: (v) => {
        const salary = positive(n(v, "salary"), "Annual salary"),
          limit = limit401(n(v, "age")),
          eligibleComp=Math.min(salary,rules.retirement_contributions.employer_compensation_limit),
          band1 = pct(v, "limit1"), band2 = pct(v, "limit2");
        if (!Number.isInteger(n(v, "age"))) throw new Error("Age must be a whole number.");
        if (band1 + band2 > 1) throw new Error("Combined contribution bands must not exceed 100% of salary.");
        const minimum = (pct(v, "match2") > 0 && band2 > 0 ? band1 + band2 : pct(v, "match1") > 0 ? band1 : 0) * eligibleComp / salary,
          maximum = Math.min(1, limit / salary),
          possible = minimum <= maximum + 1e-12,
          required = Math.min(salary * minimum, limit),
          first = Math.min(required, eligibleComp * band1),
          second = Math.min(Math.max(0, required - first), eligibleComp * band2),
          match = Math.min(first * pct(v, "match1") + second * pct(v, "match2"), Math.max(0,Math.min(salary,rules.retirement_contributions.combined_annual_additions_limit)-Math.min(required,rules.retirement_contributions.employee_401k_limit)));
        return {
          metrics: [
            ...(possible ? [metric("Minimum contribution rate for full match", minimum * 100, "percent")] : [metric("Rate required for full match (unattainable)", minimum * 100, "percent")]),
            metric("Maximum steady contribution rate", maximum * 100, "percent"),
            money("Age-based annual employee limit (2026)", limit),
            money(possible ? "Annual contribution to maximize match" : "Annual contribution at employee limit", required),
            money("Contribution per month", required / 12),
            money("Employer annual match", match),
            money("Total annual additions", required + match),
          ],
          notes: [
            possible ? `A steady contribution rate from ${(minimum * 100).toFixed(4)}% through ${(maximum * 100).toFixed(4)}% can earn the full modeled match without exhausting the employee limit early. Use the unrounded result when setting payroll elections.` : "No full-match contribution-rate window exists: the employee limit is below the contribution needed for both matching bands. Amounts shown use the employee limit and receive only the associated partial match.",
            "Assumes equal pay across the year, a constant contribution percentage, per-pay-period matching, no annual true-up, no prior year-to-date contributions and full-year employment. The maximum is a conservative rate that avoids reaching the limit before year end; it does not optimize the final payroll’s partial contribution. Employer matching uses the 2026 $360,000 eligible-compensation cap and the $72,000 annual-additions cap excluding employee catch-up. A large match can be reduced by this additions cap. Actual plan rules, other employers and prior contributions may further restrict contributions.",
            "Second tier is the additional band after tier one, not a cumulative upper threshold. The employee limit uses your entered age and fixed 2026 rules; no employer match is available if both tier match rates are zero.",
            "The employee limit combines traditional and Roth deferrals. Under 2026 rules, catch-up generally must be Roth when prior-year FICA wages with the same plan sponsor exceeded $150,000. Enter your calendar-year-end age when using this annual limit illustration; eligibility and payroll elections still require plan review.",
          ],
        };
      },
    },
    contributionTaxSavings,
  ],
  "Project 401(k) saving, compare early withdrawal costs, and maximize matching contributions.",
);
function benefitPV(
  monthlyBenefit: number,
  years: number,
  r: number,
  cola: number,
  delay = 0,
): number {
  if (years <= 0) return 0;
  const count = Math.floor(years * 12);
  if (count > 2400) throw new Error("Benefit horizon exceeds 200 years.");
  return sum(
    Array.from(
      { length: count },
      (_, i) =>
        (monthlyBenefit * (1 + cola) ** Math.floor(i / 12)) /
        (1 + r) ** (delay + (i + 1) / 12),
    ),
  );
}
const pension = tool(
  "pension",
  [
    {
      id: "lump",
      title: "Lump Sum vs. Monthly Pension",
      fields: [
        num("age", "Retirement age", 65, "years"),
        num("life", "Life expectancy", 90, "years"),
        num("lump", "Lump sum offered", 300000, "$"),
        num("monthly", "Monthly pension", 2000, "$"),
        num("return", "Annual discount / investment return", 5, "%", -99),
        num("cola", "Annual pension COLA", 0, "%", -99),
      ],
      description: "Compare the discounted pension stream to a lump sum.",
      formula:
        "Pension value = present value of monthly pension benefits, adjusted for COLA.",
      calculate: (v) => {
        const years = positive(n(v, "life") - n(v, "age"), "Years of benefits"),
          pv = benefitPV(
            n(v, "monthly"),
            years,
            pct(v, "return"),
            pct(v, "cola"),
          );
        return {
          metrics: [
            money("Present value of pension", pv),
            money("Lump sum", n(v, "lump")),
            money("Pension value advantage", pv - n(v, "lump")),
            metric(
              "Undiscounted break-even years",
              n(v, "lump") / positive(n(v, "monthly") * 12, "Annual pension"),
            ),
          ],
        };
      },
    },
    {
      id: "survivor",
      title: "Single Life vs. Joint Survivor",
      fields: [
        num("age", "Your retirement age", 65, "years"),
        num("life", "Your life expectancy", 85, "years"),
        num("spouse", "Spouse age at your retirement", 62, "years"),
        num("spouse_life", "Spouse life expectancy", 90, "years"),
        num("single", "Single-life monthly pension", 2500, "$"),
        num("joint", "Joint-survivor monthly pension", 2100, "$"),
        num("survivor", "Survivor benefit", 100, "% of joint pension"),
        num("return", "Annual discount rate", 5, "%", -99),
        num("cola", "Annual COLA", 0, "%", -99),
      ],
      description:
        "Compare household pension benefits through the entered lifespans.",
      formula:
        "Discount single-life benefits, joint benefits during your life, and the survivor benefit thereafter.",
      calculate: (v) => {
        const your = positive(n(v, "life") - n(v, "age"), "Your benefit years"),
          spouse = positive(
            n(v, "spouse_life") - n(v, "spouse"),
            "Spouse benefit years",
          ),
          r = pct(v, "return"),
          cola = pct(v, "cola"),
          single = benefitPV(n(v, "single"), your, r, cola),
          joint =
            benefitPV(n(v, "joint"), your, r, cola) +
            (spouse > your
              ? benefitPV(
                  n(v, "joint") * (1 + cola) ** your * pct(v, "survivor"),
                  spouse - your,
                  r,
                  cola,
                  your,
                )
              : 0);
        return {
          metrics: [
            money("Single-life present value", single),
            money("Joint-survivor present value", joint),
            money("Joint-survivor value advantage", joint - single),
          ],
          notes: [
            "Uses deterministic entered lifespans, not actuarial mortality probabilities.",
          ],
        };
      },
    },
    {
      id: "longer",
      title: "Work Longer",
      fields: [
        num("age1", "Earlier retirement age", 62, "years"),
        num("payment1", "Earlier monthly pension", 1800, "$"),
        num("age2", "Later retirement age", 67, "years"),
        num("payment2", "Later monthly pension", 2600, "$"),
        num("life", "Life expectancy", 90, "years"),
        num("return", "Annual discount rate", 5, "%", -99),
        num("cola", "Annual COLA", 0, "%", -99),
      ],
      description: "Compare pension streams starting at two retirement ages.",
      formula: "Discount each benefit stream to the earlier retirement age.",
      calculate: (v) => {
        const a = n(v, "age1"),
          b = n(v, "age2");
        if (b <= a)
          throw new Error(
            "Later retirement age must exceed earlier retirement age.",
          );
        const r = pct(v, "return"),
          cola = pct(v, "cola"),
          pv1 = benefitPV(n(v, "payment1"), n(v, "life") - a, r, cola),
          pv2 = benefitPV(n(v, "payment2"), n(v, "life") - b, r, cola, b - a);
        return {
          metrics: [
            money("Earlier pension present value", pv1),
            money("Later pension present value", pv2),
            money("Later pension advantage", pv2 - pv1),
          ],
          notes: [
            "Employment salary and additional retirement contributions while working longer are excluded.",
          ],
        };
      },
    },
  ],
  "Compare pension payment options and retirement timing.",
);
export function fullRetirementAge(birth: number): number {
  if (birth <= 1937) return 65;
  if (birth <= 1942) return 65 + ((birth - 1937) * 2) / 12;
  if (birth <= 1954) return 66;
  if (birth <= 1959) return 66 + ((birth - 1954) * 2) / 12;
  return 67;
}
export function ssFactor(claim: number, birth: number): number {
  const fra = fullRetirementAge(birth),
    delta = Math.round((claim - fra) * 12);
  return delta < 0
    ? 1 -
        (Math.min(-delta, 36) * (5 / 9)) / 100 -
        (Math.max(0, -delta - 36) * (5 / 12)) / 100
    : 1 + (Math.min(delta, (70 - fra) * 12) * (2 / 3)) / 100;
}
const social = tool(
  "social-security",
  [
    {
      id: "ideal",
      title: "Ideal Application Age",
      fields: [
        num("birth", "Birth year", 1964, "", 1943),
        num("life", "Life expectancy", 90, "years", 62),
        {...num("pia", "FRA monthly benefit in age-62 dollars", 2000, "$"), hint: "PIA at a common age-62 price basis, before claiming-age adjustments. For benefit amounts already quoted at each future claiming date, use Compare Application Ages instead."},
        num("return", "Nominal annual discount rate", 3, "%", -99),
        {...num("cola", "Assumed annual COLA", 2, "%"), hint: "An editable future assumption, applied while waiting from age 62 and after claiming; not a guaranteed SSA rate."},
      ],
      description:
        "Compare retirement benefits for application ages from 62 through 70.",
      formula:
        "Claim-date benefit = age-62-dollar PIA × claiming-age factor × (1 + assumed COLA)^(claim age − 62). Early reductions: 5/9% for first 36 months, 5/12% thereafter; delayed credits: 2/3% per month through age 70.",
      calculate: (v) => {
        const fra = fullRetirementAge(n(v, "birth")),
          r = pct(v, "return"),
          cola = pct(v, "cola"),
          life = n(v, "life"),
          rows = Array.from({ length: 9 }, (_, i) => {
            const age = i + 62,
              benefit = n(v, "pia") * ssFactor(age, n(v, "birth")) * (1 + cola) ** (age - 62),
              pv = benefitPV(benefit, life - age, r, cola, age - 62);
            return [age, benefit, pv];
          }),
          best = rows.reduce((a, b) => (b[2] > a[2] ? b : a));
        return {
          metrics: [
            metric("Highest present-value application age", best[0]),
            money("Initial monthly benefit at selected age", best[1]),
            metric("Full retirement age", fra),
          ],
          columns: [
            "Claim age",
            "Initial monthly benefit",
            "Present value at age 62",
          ],
          rows,
          notes: [
            "All ideal-age options use a common PIA quoted in age-62 dollars and a nominal discount rate. Assumed COLA raises benefits during the wait from age 62 as well as after claiming. The model applies COLA on annual anniversaries and pays benefits at month end; actual SSA calendar COLAs, benefit rounding and credit posting dates can differ. An SSA quote that already includes future inflation must first be converted to this basis or used in Compare Application Ages.",
            "Retirement benefit only: excludes earnings-test withholding, spousal/survivor coordination, taxation, and future benefit-law changes. Delayed credit model applies to birth years 1943 and later.",
          ],
        };
      },
    },
    {
      id: "compare",
      title: "Compare Application Ages",
      fields: [
        num("age1", "First application age", 62, "years", 62),
        {...num("monthly1", "First claim-date monthly benefit", 1400, "$"), hint: "Nominal amount at the first claiming date. Include any waiting-period COLA already in the quote; it will not be added again before claiming."},
        num("age2", "Second application age", 70, "years", 62),
        {...num("monthly2", "Second claim-date monthly benefit", 2480, "$"), hint: "Nominal amount at the second claiming date. Both quotes must use a consistent nominal-dollar basis."},
        num("life", "Life expectancy", 90, "years", 62),
        num("return", "Annual discount rate", 3, "%", -99),
        num("cola", "Annual COLA", 2, "%"),
      ],
      description:
        "Compare two quoted benefit options using their starting ages and amounts.",
      formula: "Discount each benefit stream to the earlier application age.",
      calculate: (v) => {
        const a = n(v, "age1"),
          b = n(v, "age2"),
          base = Math.min(a, b),
          r = pct(v, "return"),
          cola = pct(v, "cola"),
          one = benefitPV(
            n(v, "monthly1"),
            n(v, "life") - a,
            r,
            cola,
            a - base,
          ),
          two = benefitPV(
            n(v, "monthly2"),
            n(v, "life") - b,
            r,
            cola,
            b - base,
          );
        return {
          notes: ["Enter nominal claim-date benefit quotes on a consistent basis. Each quote is used as its own initial monthly amount; no additional waiting-period COLA is added. The entered COLA applies only after each option starts, with a nominal discount rate to the earlier claiming age. Quotes stated in today's dollars need conversion before using nominal future COLA and discount assumptions."],
          metrics: [
            money("First option present value", one),
            money("Second option present value", two),
            money("Second option advantage", two - one),
          ],
        };
      },
    },
  ],
  "Compare Social Security claiming ages and the present value of retirement benefits.",
);
const annuity = tool(
  "annuity",
  [
    {
      id: "growth",
      title: "Annuity Accumulation",
      fields: [
        num("principal", "Starting principal", 100000, "$"),
        num("annual", "Annual addition", 1000, "$"),
        num("monthly", "Monthly addition", 100, "$"),
        timingField(),
        num("rate", "Annual growth rate", 5, "%", -99),
        num("years", "Accumulation length", 20, "years", 0.01),
      ],
      description:
        "Accumulate a starting balance with monthly and annual contributions.",
      formula:
        "Monthly and annual annuity accumulation factors use their respective periodic rates.",
      calculate: (v) => {
        const r=pct(v,"rate"), years=n(v,"years"), p=n(v,"principal"), rawMonths=years*12;
        if(Math.abs(rawMonths-Math.round(rawMonths))>1e-7)throw new Error("Accumulation length must contain a whole number of months.");
        if(rawMonths>12000)throw new Error("Accumulation schedule exceeds supported limits.");
        const months=Math.round(rawMonths), rows:(number|string)[][]=[], yearly:(number|string)[][]=[];
        let fv=p, contributions=p, yearAdd=0, yearReturn=0;
        for(let month=1;month<=months;month++){
          const addition=n(v,"monthly")+((timing(v)?month%12===1:month%12===0)?n(v,"annual"):0);
          if(timing(v))fv+=addition;
          const interest=fv*monthly(r);fv+=interest;
          if(!timing(v))fv+=addition;
          contributions+=addition;
          const displayedAddition=addition+(month===1?p:0);yearAdd+=displayedAddition;yearReturn+=interest;
          rows.push([month,displayedAddition,interest,fv]);
          if(month%12===0||month===months){yearly.push([Math.ceil(month/12),yearAdd,yearReturn,fv]);yearAdd=0;yearReturn=0;}
        }
        return {
          columns:["Month","Addition including initial principal","Investment return","Ending balance"], rows,
          annualColumns:["Year","Addition including initial principal","Investment return","Ending balance"],annualRows:yearly,schedulePeriod:"Monthly",
          notes:["The first row’s addition includes starting principal. Annual additions occur at the beginning or end of each saving year; monthly additions use the same selected timing. The final partial year receives an annual deposit only if its scheduled deposit date is reached."],
          metrics: [
            money("Annuity future value", fv),
            money("Starting principal", p),
            money("Total additions", contributions-p),
            money("Total contributions", contributions),
            money("Growth", fv - contributions),
          ],
        };
      },
    },
  ],
  "Estimate annuity accumulation before withdrawals begin.",
);
function payoutSchedule(principal: number, rate: number, amount: number, count: number, frequency: number, fractionalLast = 1) {
  if(count>12000)throw new Error("Payout schedule exceeds supported limits.");
  const rows:(number|string)[][]=[], yearly:(number|string)[][]=[];
  let balance=principal, total=0, yearPaid=0, yearInterest=0;
  for(let i=1;i<=count;i++){
    const fraction=i===count?fractionalLast:1, opening=balance,
      interest=opening*Math.expm1(Math.log1p(rate)*fraction), available=opening+interest,
      paid=i===count?available:Math.min(amount,available);
    balance=Math.max(0,available-paid);total+=paid;yearPaid+=paid;yearInterest+=interest;
    rows.push([i,(i-1+fraction)/frequency,opening,interest,paid,balance]);
    if(i%frequency===0||i===count){yearly.push([Math.ceil(i/frequency),yearInterest,yearPaid,balance]);yearPaid=0;yearInterest=0;}
  }
  return {rows,annualRows:yearly,total,columns:["Period","Time (years)","Opening balance","Investment return","Payout","Ending balance"],annualColumns:["Year","Investment return","Payout","Ending balance"],schedulePeriod:"Per payout"};
}
const annuityPayout = tool(
  "annuity-payout",
  ["length", "payment"].map((id): Mode => ({
    id,
    title: id === "length" ? "Fix Length" : "Fix Payment",
    fields: [
      num("principal", "Annuity principal", 300000, "$"),
      num("rate", "Annual return", 5, "%", -99),
      select("frequency", "Payout frequency", [
        "Monthly",
        "Quarterly",
        "Annually",
      ]),
      ...(id === "length"
        ? [num("years", "Payout length", 20, "years", 0.01)]
        : [num("payment", "Payment each period", 2000, "$")]),
    ],
    description:
      "Solve a fixed payout amount or how long a fixed payment can last.",
    formula: "Payout = principal / annuity present-value factor.",
    calculate: (v) => {
      const f =
          v.frequency === "Monthly" ? 12 : v.frequency === "Quarterly" ? 4 : 1,
        r = Math.expm1(Math.log1p(pct(v, "rate")) / f),
        p = n(v, "principal");
      if (id === "length") {
        const N = n(v, "years") * f,
          a = payment(p, r, N),
          count=Math.max(1,Math.ceil(N-1e-10)), schedule=payoutSchedule(p,r,a,count,f,N-(count-1));
        return {
          ...schedule,
          notes:["Payouts occur at period end. The final payout drains the remaining balance; a partial final period earns only its fractional-period return and can have a different payout. No tax or insurance fees are modeled."],
          metrics: [
            money("Payment each period", a),
            money("Total payments", schedule.total),
            money("Total investment earnings", schedule.total - p),
          ],
        };
      }
      const a = n(v, "payment");
      if(p===0)return {metrics:[metric("Payout duration in years",0),metric("Number of payments",0),money("Total payouts",0)]};
      if (r > 0 && a <= p * r)
        return {
          metrics: [money("Interest per period", p * r)],
          notes: [
            "Balance is not exhausted under the constant return assumption.",
          ],
        };
      const N = duration(p, a, r), count=Math.max(1,Math.ceil(N-1e-10)), schedule=payoutSchedule(p,r,a,count,f);
      return {
        ...schedule,
        notes:["Payments occur at the end of full payout periods; the final payout is the remaining balance and may be smaller. Duration is rounded up to the actual last payment date, not treated as a fractional regular payment."],
        metrics: [
          metric("Payout duration in years", count / f),
          metric("Number of payments", count),
          money("Total payouts", schedule.total),
          money("Total investment earnings", schedule.total-p),
        ],
      };
    },
  })),
  "Calculate annuity income for a fixed term or the duration of a chosen payout.",
);
const iraFields = () => [
  num("age", "Current age", 35, "years"),
  num("retire", "Retirement age", 67, "years"),
  num("balance", "Current balance", 50000, "$"),
  num("contribution", "Annual contribution", 7000, "$"),
  select("max", "Use annual maximum contribution?", ["No", "Yes"]),
  num("return", "Annual return", 6, "%", -99),
  num("tax", "Current marginal tax rate", 22, "%"),
  num("retire_tax", "Retirement tax rate", 22, "%"),
];
function iraProjection(v: Values, roth: boolean, preTaxInputs = false) {
  const years = positive(
    n(v, "retire") - n(v, "age"),
    "Years until retirement",
  );
  if (years > 100) throw new Error("Projection cannot exceed 100 years.");
  const afterTaxFactor = preTaxInputs ? 1 - pct(v, "tax") : 1;
  let retirement = n(v, "balance") * afterTaxFactor,
    taxable = n(v, "balance") * (roth ? afterTaxFactor : 1 - pct(v, "tax")),
    contributions = 0;
  const rows: (number | string)[][] = [];
  for (let i = 0; i < Math.ceil(years); i++) {
    const limit =
        rules.retirement_contributions.ira_limit +
        (n(v, "age") + i >= 50
          ? rules.retirement_contributions.ira_catch_up_50plus
          : 0),
      c =
        (v.max === "Yes" ? limit : Math.min(n(v, "contribution"), limit)) *
        afterTaxFactor;
    retirement = retirement * (1 + pct(v, "return")) + c;
    const comparable = roth ? c : c * (1 - pct(v, "tax"));
    taxable =
      taxable *
        (1 + pct(v, "return") - Math.max(0, pct(v, "return")) * pct(v, "tax")) +
      comparable;
    contributions += c;
    rows.push([n(v, "age") + i + 1, c, retirement, taxable]);
  }
  return {
    metrics: [
      money(
        roth ? "Roth IRA balance" : "Traditional IRA pre-tax balance",
        retirement,
      ),
      money(
        roth ? "Roth after-tax value" : "Traditional IRA after-tax value",
        roth ? retirement : retirement * (1 - pct(v, "retire_tax")),
      ),
      money("Comparable taxable investment balance", taxable),
      money("Total contributions", contributions),
    ],
    columns: ["Age", "Annual contribution", "IRA balance", "Taxable balance"],
    rows,
    notes: [
      "Uses published 2026 IRA limits for all future years. Assumes eligible contributions and qualified Roth distributions; income phaseouts and deductibility eligibility are not inferred. Taxable positive returns are taxed annually at the entered marginal rate. In the Traditional/Roth/taxable comparison, initial balances and contributions are entered pre-tax and converted to an equivalent after-tax basis for Roth/taxable saving.",
    ],
  };
}
const roth = tool(
  "roth-ira",
  [
    {
      id: "comparison",
      title: "Roth IRA vs. Taxable Savings",
      fields: iraFields().filter((f) => f.key !== "retire_tax"),
      description:
        "Compare a qualified Roth IRA balance with equivalent after-tax saving in a taxable account.",
      formula:
        "Roth earnings compound tax-free; taxable earnings are reduced by annual tax.",
      calculate: (v) => iraProjection(v, true),
    },
  ],
  "Compare Roth IRA growth and taxable investment saving.",
);
const iraTool = tool(
  "ira",
  [
    {
      id: "comparison",
      title: "Traditional, Roth, and Taxable",
      fields: iraFields(),
      description:
        "Compare after-tax retirement wealth under contribution and tax assumptions.",
      formula:
        "Traditional after-tax balance = pre-tax account × (1 − retirement tax); Roth uses after-tax contributions.",
      calculate: (v) => {
        const result = iraProjection(v, false),
          roth = iraProjection(v, true, true);
        result.metrics.push(
          money(
            "Roth balance with equivalent after-tax contribution",
            roth.metrics[0].value,
          ),
        );
        return result;
      },
    },
  ],
  "Compare traditional IRA, Roth IRA, and taxable savings under explicit tax assumptions.",
);
export const retirementCoreCalculators = [
  retirement,
  k401,
  pension,
  social,
  annuity,
  annuityPayout,
  roth,
  iraTool,
];
