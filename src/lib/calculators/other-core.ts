import {minimumPaymentPlan} from '../credit-minimum';
import {parseDebts,debtSchedule} from '../debt-repayment';
export {parseDebts,debtSchedule} from '../debt-repayment';
export type {Debt} from '../debt-repayment';
import { solveVAT } from "../vat";
import { firstFiscalFraction } from "../depreciation";
import {
  tool,
  baseLoanFields,
  extraFields,
  loanResult,
  freq,
  frequencies,
  compoundField,
} from "./helpers";
import {
  num,
  select,
  area,
  date,
  number as n,
  money,
  metric,
  type Values,
  type Mode,
  type Result,
  type Field,
} from "../types";
import {
  payment,
  periodic,
  future,
  annuityPV,
  duration,
  positive,
  nonnegative,
  parseNumbers,
  sum,
  bisect,
  amortize,
  solveRate,
  periods,
} from "../finance";
const pct = (v: Values, k: string) => n(v, k) / 100;
const term = (v: Values) => n(v, "years") * 12 + n(v, "months");
const payFreq = () =>
  select(
    "pay",
    "Payment frequency",
    frequencies.filter((x) => x !== "Continuously"),
    "Monthly",
  );
const loan = tool(
  "loan",
  [
    {
      id: "amortized",
      title: "Amortized Loan",
      fields: [...baseLoanFields(), compoundField(), payFreq()],
      description:
        "Calculate periodic payments for a fixed-rate amortizing loan.",
      formula:
        "Payment = P × i/(1−(1+i)^−N). Compound frequency and payment frequency are independent.",
      calculate: (v) => {
        const f = freq(v.pay),
          N = (term(v) / 12) * f,
          r = periodic(n(v, "rate"), freq(v.compound), f);
        return loanResult(n(v, "principal"), r, N);
      },
    },
    {
      id: "deferred",
      title: "Deferred Payment Loan",
      fields: [...baseLoanFields(), compoundField()],
      description:
        "Calculate a single repayment at maturity with no intervening payments.",
      formula: "Maturity value = principal × (1+r/m)^(m×years).",
      calculate: (v) => {
        const p = n(v, "principal"),
          fv = future(
            p,
            0,
            periodic(n(v, "rate"), freq(v.compound), 12),
            term(v),
          );
        return {
          metrics: [
            money("Amount due at maturity", fv),
            money("Total interest", fv - p),
          ],
        };
      },
    },
    {
      id: "bond",
      title: "Bond Present Value",
      fields: [
        num("face", "Face value due at maturity", 100000, "$"),
        num("years", "Years to maturity", 10, "years"),
        {...num("months", "Additional months", 0, "months"), max: 11, step: 1},
        num("rate", "Annual yield", 5, "%", -99),
        compoundField(),
      ],
      description:
        "Discount a zero-coupon bond’s maturity value to present value.",
      formula: "Present value = face value/(1+r/m)^(m×years).",
      calculate: (v) => {
        if (!Number.isInteger(n(v,"months"))) throw new Error("Additional months must be a whole number.");
        const p =
          n(v, "face") /
          (1 + periodic(n(v, "rate"), freq(v.compound), 1)) ** (n(v, "years") + n(v,"months") / 12);
        return {
          metrics: [
            money("Bond present value", p),
            money("Discount from face value", n(v, "face") - p),
          ],
        };
      },
    },
  ],
  "Calculate amortized loans, deferred lump-sum loans, and zero-coupon bond values.",
);
function repaymentTool(id: string, advanced = false) {
  return tool(
    id,
    ["term", "payment"].map((mode): Mode => ({
      id: mode,
      title: mode === "term" ? "Fixed Term" : "Fixed Payment",
      fields: [
        num("principal", "Loan balance", 20000, "$"),
        num("rate", "Annual interest rate", 6, "%"),
        ...(mode === "term"
          ? [
              num("years", "Repayment term", 5, "years", 0),
              num("months", "Additional months", 0, "months"),
            ]
          : [num("payment", "Payment each period", 400, "$")]),
        ...(advanced ? [compoundField(), payFreq()] : []),
      ],
      description:
        "Solve a repayment installment or the time needed to repay a balance.",
      formula:
        "Fixed installment amortization; solve the payment count when the installment is supplied.",
      calculate: (v) => {
        const f = advanced ? freq(v.pay) : 12,
          r = advanced
            ? periodic(n(v, "rate"), freq(v.compound), f)
            : pct(v, "rate") / 12,
          N =
            mode === "term"
              ? (term(v) / 12) * f
              : duration(n(v, "principal"), n(v, "payment"), r);
        return loanResult(
          n(v, "principal"),
          r,
          N,
          {},
          mode === "payment" ? n(v, "payment") : undefined,
        );
      },
    })),
    "Calculate payments for a fixed repayment term or the payoff time for a chosen installment.",
  );
}
const paymentTool = repaymentTool("payment"),
  repayment = repaymentTool("repayment", true);
repayment.modes.unshift({
  id: "extra-payments", title: "Loan Payoff with Extra Payments",
  fields: [num("principal","Current loan balance",20000,"$"),num("rate","Annual interest rate",6,"%"),num("payment","Regular monthly payment",400,"$"),...extraFields()],
  description:"Compare monthly loan payoff with and without extra monthly, yearly or one-time principal payments.",
  formula:"Accrue monthly interest; apply the regular payment plus scheduled extra principal. Compare interest and payment count with the regular-payment baseline.",
  calculate:(v)=>{
    const p=n(v,"principal"),r=pct(v,"rate")/12,a=n(v,"payment");
    if(p>0 && a<=p*r) throw new Error("Regular payment must cover monthly interest to compare the baseline payoff.");
    if(!Number.isInteger(n(v,"extra_once_month")))throw new Error("One-time payment month must be a whole number.");
    const N=p===0?1:duration(p,a,r),baseline=loanResult(p,r,N,{},a);
    const result=loanResult(p,r,N,{monthly:n(v,"extra_monthly"),yearly:n(v,"extra_yearly"),once:n(v,"extra_once"),onceMonth:n(v,"extra_once_month")},a);
    result.metrics.unshift(money("Interest saved",baseline.metrics[1].value-result.metrics[1].value),metric("Months saved",baseline.metrics[3].value-result.metrics[3].value));
    result.notes=["Fixed-rate monthly repayment only. Extra yearly payments occur every 12 months; one-time extra is paid in the entered month. No prepayment penalties or new borrowing are included. The final payment is capped at the balance plus interest."];
    return result;
  },
});
const sales = tool(
  "sales-tax",
  ["after", "before", "rate"].map((id): Mode => ({
    id,
    title:
      id === "after"
        ? "After-Tax Price"
        : id === "before"
          ? "Before-Tax Price"
          : "Sales Tax Rate",
    fields: [
      ...(id !== "before" ? [num("before", "Before-tax price", 100, "$")] : []),
      ...(id !== "after" ? [num("after", "After-tax price", 107, "$")] : []),
      ...(id !== "rate" ? [num("rate", "Sales tax rate", 7, "%")] : []),
    ],
    description: "Solve the missing price or sales tax rate.",
    formula: "After-tax price = before-tax price × (1 + tax rate).",
    calculate: (v) => {
      const before =
          id === "before"
            ? n(v, "after") / (1 + pct(v, "rate"))
            : n(v, "before"),
        after = id === "after" ? before * (1 + pct(v, "rate")) : n(v, "after"),
        rate =
          id === "rate"
            ? (after / positive(before, "Before-tax price") - 1) * 100
            : n(v, "rate");
      return {
        metrics: [
          money("Before-tax price", before),
          money("Sales tax", after - before),
          money("After-tax price", after),
          metric("Tax rate", rate, "percent"),
        ],
      };
    },
  })),
  "Calculate sales tax, a before-tax price, or the tax rate.",
);
const credit = tool(
  "credit-card",
  ["payment", "term", "minimum"].map((id): Mode => ({
    id,
    title:
      id === "payment"
        ? "Fixed Monthly Payment"
        : id === "term"
          ? "Payoff by Deadline"
          : "Minimum Payment",
    fields: [
      num("principal", "Credit card balance", 10000, "$"),
      num("rate", "Annual percentage rate", 20, "%"),
      ...(id === "payment"
        ? [num("payment", "Monthly payment", 300, "$")]
        : id === "term"
          ? [
              num("years", "Years to repay", 3, "years"),
              num("months", "Additional months", 0, "months"),
            ]
          : [
              num("minimum", "Minimum payment percent", 2, "%"),
              num("floor", "Minimum dollar payment", 25, "$"),
              select("interest_extra", "Add monthly interest to minimum?", [
                "No",
                "Yes",
              ]),
              {...num("extra", "Extra above the monthly minimum", 0, "$"), optional:true, hint:"Adds a fixed amount to each recalculated minimum. The final payment is capped at the amount owed."},
            ]),
    ],
    description: "Estimate payoff time and interest assuming no new charges.",
    formula:
      "Monthly interest = opening balance × APR/12; apply the selected payment rule.",
    calculate: (v) => {
      const p = n(v, "principal"),
        r = pct(v, "rate") / 12;
      if (id !== "minimum") {
        const N = id === "term" ? term(v) : duration(p, n(v, "payment"), r);
        return loanResult(
          p,
          r,
          N,
          {},
          id === "payment" ? n(v, "payment") : undefined,
        );
      }
      const input={balance:p,apr:n(v,'rate'),percent:n(v,'minimum'),floor:n(v,'floor'),interestExtra:v.interest_extra==='Yes',extra:v.extra? n(v,'extra'):0};
      const plan=minimumPaymentPlan(input);
      const comparisons=[...new Set([0,input.extra,25,50])].map(extra=>{
        try {const candidate=minimumPaymentPlan({...input,extra});return [extra,candidate.firstPayment,candidate.months,candidate.total,candidate.totalPayments];}
        catch {return [extra,'Not available','Not repaid under this rule','Not available','Not available'];}
      });
      return {
        metrics:[metric('Months to repay',plan.months),money('Total interest',plan.total),money('Total payments',plan.totalPayments),money('Initial modeled minimum payment',plan.firstMinimum),money('Initial payment including extra',plan.firstPayment)],
        columns:['Month','Payment','Interest','Principal','Balance'],rows:plan.rows,
        additionalTables:[{title:'Minimum payments versus a little extra',columns:['Extra above monthly minimum (USD)','First payment (USD)','Months to repay','Total interest (USD)','Total payments (USD)'],rows:comparisons,note:'Each scenario recalculates the minimum on the remaining opening balance each month, then adds a fixed extra payment. This is not a fixed-total-payment plan. Unrepayable scenarios have no estimated payoff or interest total.'}],
        notes:['Monthly interest is opening balance × APR / 12. The minimum is the larger of the dollar floor or the selected percent of opening balance, plus interest only when selected. The final payment cannot exceed the balance plus interest. Real issuers may use statement balances, daily interest, fees and different rounding rules.','No new purchases, annual fees, late fees, promotional APR changes, multiple APR balances or past-due amounts are modeled. Your statement gives the actual minimum due.'],
      };
    },
  })),
  "Calculate credit card payoff time, payment targets, and minimum-payment costs.",
);
const debtField = () =>
  area(
    "debts",
    "Debts",
    "Card A, 5000, 150, 22\nCard B, 3000, 100, 18",
    "One per line: name, balance, minimum monthly payment, annual APR percent. Up to 20 debts.",
  );
const cards = tool(
  "credit-cards-payoff",
  [
    {
      id: "avalanche",
      title: "Credit Card Payoff Plan",
      fields: [
        debtField(),
        num("budget", "Total monthly payment budget", 400, "$"),
      ],
      description:
        "Pay minimums, then direct remaining cash to the highest APR balance.",
      formula:
        "Debt avalanche: minimums on all debts, extra to the highest rate; freed payments roll over.",
      calculate: (v) => debtSchedule(parseDebts(v.debts), n(v, "budget"), true),
    },
  ],
  "Create a highest-interest-first repayment plan for multiple credit cards.",
);
const debtPayoff = tool(
  "debt-payoff",
  [
    {
      id: "avalanche",
      title: "Debt Avalanche",
      fields: [
        debtField(),
        { ...select("rollover", "Keep total monthly payment fixed?", ["Yes", "No"]), hint: "Yes keeps freed minimum payments in the budget. No removes a paid-off debt’s minimum from future monthly budgets." },
        { ...num("extra", "Additional monthly payment", 100, "$"), hint: "Extra above all listed minimum payments. Do not include the minimums again." },
        num("yearly", "Extra yearly payment", 0, "$"),
        num("once", "One-time extra payment", 0, "$"),
        num("once_month", "One-time payment month", 1, "", 1),
      ],
      description:
        "Allocate extra payments to the highest-rate debt, optionally rolling freed payments forward.",
      formula:
        "Accrue each loan’s interest separately and apply minimums followed by avalanche extra payments.",
      calculate: (v) => {
        const d = parseDebts(v.debts);
        return debtSchedule(
          d,
          sum(d.map((x) => x.minimum)),
          v.rollover === "Yes",
          n(v, "extra"),
          n(v, "yearly"),
          n(v, "once"),
          n(v, "once_month"),
        );
      },
    },
  ],
  "Build a multi-debt payoff schedule with recurring and one-time extra payments.",
);
debtPayoff.modes.push({
  ...debtPayoff.modes[0], id: "snowball", title: "Debt Snowball",
  description: "Pay minimums on all debts, then direct extra money to the smallest remaining balance. Optionally roll freed payments forward.",
  formula: "Accrue monthly interest, pay minimums, then rank remaining balances from smallest to largest. Ties use the higher APR first.",
  calculate: v => {
    const debts = parseDebts(v.debts);
    const result = debtSchedule(debts, sum(debts.map(d=>d.minimum)), v.rollover === "Yes", n(v,"extra"),n(v,"yearly"),n(v,"once"),n(v,"once_month"), "snowball");
    result.notes = ["Snowball prioritizes the smallest balance after this month’s interest and minimum payments. Avalanche prioritizes the highest APR. Rates and minimums remain fixed; no new borrowing or fees are included. Snowball does not guarantee the lowest interest cost."];
    return result;
  },
});
const consolidation = tool(
  "debt-consolidation",
  [
    {
      id: "comparison",
      title: "Debt Consolidation",
      fields: [
        debtField(),
        num("new_rate", "New loan rate", 10, "%"),
        num("years", "New loan term", 5, "years", 0.01),
        num("fees", "Origination fees", 3, "%"),
        select("finance", "Finance fees?", ["Yes", "No"]),
      ],
      description:
        "Compare the current avalanche repayment plan against a consolidated loan.",
      formula:
        "Consolidate balances and compare total interest plus origination fees on future cash flows.",
      calculate: (v) => {
        const d = parseDebts(v.debts),
          balance = sum(d.map((x) => x.balance)),
          fees = balance * pct(v, "fees"),
          current = debtSchedule(d, sum(d.map((x) => x.minimum)), true),
          p = balance + (v.finance === "Yes" ? fees : 0),
          result = loanResult(p, pct(v, "new_rate") / 12, n(v, "years") * 12);
        result.metrics.push(
          money("Origination fee", fees),
          money("Current plan total interest", current.metrics[1].value),
          money(
            "Interest and fee savings",
            current.metrics[1].value - result.metrics[1].value - fees,
          ),
        );
        return result;
      },
    },
  ],
  "Compare existing debts with a fee-adjusted consolidation loan.",
);
const student = tool(
  "student-loan",
  [
    {
      id: "normal",
      title: "Normal Repayment",
      fields: baseLoanFields(),
      description:
        "Show the regular monthly student loan payment and amortization schedule.",
      formula: "Monthly payment amortizes the principal over the entered term.",
      calculate: (v) =>
        loanResult(n(v, "principal"), pct(v, "rate") / 12, term(v)),
    },

    ...["payment", "principal", "rate", "term"].map((key): Mode => ({
      id: "solve-" + key,
      title: "Solve " + key,
      fields: [
        ...(key !== "principal"
          ? [num("principal", "Loan balance", 30000, "$")]
          : []),
        ...(key !== "rate"
          ? [num("rate", "Annual interest rate", 6, "%")]
          : []),
        ...(key !== "term" ? [num("years", "Term", 10, "years", 0.01)] : []),
        ...(key !== "payment"
          ? [num("payment", "Monthly payment", 350, "$")]
          : []),
      ],
      description:
        "Solve one missing student loan variable from the other three.",
      formula: "Fixed monthly installment cash-flow equation.",
      calculate: (v) => {
        let p = key === "principal" ? 0 : n(v, "principal"),
          r = key === "rate" ? 0 : pct(v, "rate") / 12,
          N = key === "term" ? 0 : n(v, "years") * 12,
          a = key === "payment" ? 0 : n(v, "payment");
        if (key === "principal") p = annuityPV(a, r, N);
        if (key === "rate") r = solveRate(p, a, N);
        if (key === "term") N = duration(p, a, r);
        if (key === "payment") a = payment(p, r, N);
        return {
          metrics: [
            money("Loan balance", p),
            metric("Annual interest rate", r * 1200, "percent"),
            metric("Term in months", N),
            money("Monthly payment", a),
          ],
        };
      },
    })),
    {
      id: "extra",
      title: "Extra Repayment",
      fields: [...baseLoanFields(), ...extraFields()],
      description:
        "Compare extra principal payments with the original repayment plan.",
      formula: "Simulate monthly principal reduction including extra payments.",
      calculate: (v) =>
        loanResult(n(v, "principal"), pct(v, "rate") / 12, term(v), {
          monthly: n(v, "extra_monthly"),
          yearly: n(v, "extra_yearly"),
          once: n(v, "extra_once"),
          onceMonth: n(v, "extra_once_month"),
        }),
    },
    {
      id: "all",
      title: "Pay Off Altogether",
      fields: [
        num("principal", "Current loan balance", 30000, "$"),
        num("rate", "Annual interest rate", 6, "%"),
        num("payment", "Current monthly payment", 350, "$"),
      ],
      description:
        "Estimate the future interest avoided by paying off the balance now.",
      formula:
        "Interest avoided = remaining scheduled payments − current principal.",
      calculate: (v) => {
        const p = n(v, "principal"),
          r = pct(v, "rate") / 12,
          N = duration(p, n(v, "payment"), r),
          rows = amortize(p, r, N, {}, n(v, "payment"));
        return {
          metrics: [
            money("Immediate principal payoff", p),
            money("Future interest avoided", sum(rows.map((x) => x.interest))),
          ],
          notes: [
            "Accrued daily interest since your last payment is not included.",
          ],
        };
      },
    },
    {
      id: "projection",
      title: "In-School Loan Projection",
      fields: [
        num("principal", "Current student loan balance", 0, "$"),
        num("annual", "Annual borrowing", 10000, "$"),
        num("school", "Years until graduation", 4, "years", 0),
        num("grace", "Grace period", 6, "months"),
        num("rate", "Annual interest rate", 6, "%"),
        num("years", "Repayment term", 10, "years", 0.01),
        select("pay_interest", "Pay interest while in school?", ["No", "Yes"]),
      ],
      description:
        "Project borrowing, in-school accrued interest, and the graduation repayment balance.",
      formula:
        "Borrow at each academic year start; accrue simple interest during school and grace, then capitalize once.",
      calculate: (v) => {
        let principal = n(v, "principal"),
          accrued = 0,
          interestPaid = 0;
        const school = Math.round(n(v, "school") * 12),
          N = school + n(v, "grace");
        if (N > 1200) throw new Error("School and grace period is too long.");
        for (let m = 0; m < N; m++) {
          if (m < school && m % 12 === 0) principal += n(v, "annual");
          const interest = (principal * pct(v, "rate")) / 12;
          if (v.pay_interest === "Yes") interestPaid += interest;
          else accrued += interest;
        }
        const repayment = principal + accrued,
          result = loanResult(
            repayment,
            pct(v, "rate") / 12,
            n(v, "years") * 12,
          );
        result.metrics.unshift(
          money("Borrowed principal", principal),
          money("Capitalized interest", accrued),
          money("In-school interest paid", interestPaid),
          money("Balance entering repayment", repayment),
        );
        return result;
      },
    },
  ],
  "Solve student loan payments, accelerated repayment, and the effect of borrowing before graduation.",
);
const college = tool(
  "college-cost",
  [
    {
      id: "planning",
      title: "College Savings Plan",
      fields: [
        num("cost", "Current annual college cost", 35000, "$"),
        num("increase", "Annual college cost increase", 5, "%"),
        num("duration", "College duration", 4, "years", 1),
        num("coverage", "Cost to cover from savings", 100, "%"),
        num("balance", "Current savings", 10000, "$"),
        num("return", "Annual investment return", 5, "%", -99),
        num("tax", "Tax on investment returns", 0, "%"),
        num("years", "Years until college", 10, "years", 0),
      ],
      description:
        "Estimate future tuition and the monthly saving needed before college starts.",
      formula:
        "Discount future annual college costs to enrollment, then solve the savings contribution required.",
      calculate: (v) => {
        const years = n(v, "years"),
          rate = pct(v, "return") * (1 - pct(v, "tax")),
          cost = n(v, "cost") * (1 + pct(v, "increase")) ** years,
          rows = Array.from(
            { length: Math.min(20, Math.round(n(v, "duration"))) },
            (_, i) => [i + 1, cost * (1 + pct(v, "increase")) ** i],
          ),
          total = sum(rows.map((x) => x[1])),
          target = sum(
            rows.map((x, i) => (x[1] * pct(v, "coverage")) / (1 + rate) ** i),
          ),
          existing = n(v, "balance") * (1 + rate) ** years,
          r = Math.expm1(Math.log1p(rate) / 12),
          needed = Math.max(0, target - existing),
          monthly = years ? needed / future(0, 1, r, years * 12) : 0;
        return {
          metrics: [
            money("Total projected college costs", total),
            money("Savings required at enrollment", target),
            money("Required monthly saving", monthly),
            money(
              "Additional lump sum needed today",
              needed / (1 + rate) ** years,
            ),
          ],
          columns: ["College year", "Projected annual cost"],
          rows,
        };
      },
    },
  ],
  "Plan college costs and saving contributions before enrollment.",
);
const vat = tool(
  "vat",
  [
    {
      id: "any-two",
      title: "VAT Calculator",
      fields: [
        { ...num("rate", "VAT rate", 20, "%"), optional: true },
        { ...num("net", "Net price", 100, "$"), optional: true },
        { ...num("gross", "Gross price", 0, "$"), value: "", optional: true },
        { ...num("tax", "Tax amount", 0, "$"), value: "", optional: true },
      ],
      description:
        "Enter any two values and leave the other two fields blank to calculate the remaining values.",
      formula:
        "Gross price = net price + tax amount; tax amount = net price × VAT rate / 100.",
      calculate: (v) => {
        const result = solveVAT(v);
        return {
          metrics: [
            money("Net amount", result.net),
            money("VAT amount", result.tax),
            money("Gross amount", result.gross),
            metric("VAT rate", result.rate, "percent"),
          ],
        };
      },
    },
  ],
  "Calculate VAT rate, net price, gross price, or tax amount using any two known values.",
);
const depreciation = tool(
  "depreciation",
  ["straight", "declining", "syd"].map((id): Mode => ({
    id,
    title:
      id === "straight"
        ? "Straight Line"
        : id === "declining"
          ? "Declining Balance"
          : "Sum of Years’ Digits",
    fields: [
      num("cost", "Asset cost", 50000, "$"),
      num("salvage", "Salvage value", 5000, "$"),
      num("life", "Useful life", 5, "years", 1),
      ...(id === "declining"
        ? [num("factor", "Declining-balance factor", 2, "", 0.01)]
        : []),
      select("partial", "Partial year depreciation?", ["Yes", "No"]),
      select("convention", "First-year proration", [
        "Custom months",
        "Actual days",
      ]),
      num("first_months", "Months in first accounting year", 12, "months", 1),
      date("service_date", "Start of asset service", "2026-01-01"),
      date("fiscal_end", "First accounting year end", "2026-12-31"),
      select("round", "Round depreciation to dollars?", ["No", "Yes"]),
    ],
    description:
      "Build an annual depreciation schedule, including a partial first year.",
    formula:
      id === "straight"
        ? "Annual depreciation = (cost − salvage)/life."
        : id === "declining"
          ? "Depreciation = opening book value × factor/life, capped at salvage."
          : "Depreciation = (cost − salvage) × remaining life / sum of years.",
    calculate: (v) => {
      const cost = n(v, "cost"),
        salvage = n(v, "salvage"),
        life = n(v, "life"),
        first =
          v.partial === "No"
            ? 12
            : v.convention === "Actual days"
              ? 12 * firstFiscalFraction(v.service_date, v.fiscal_end)
              : n(v, "first_months");
      if (salvage > cost || first > 12 || life > 200 || !Number.isInteger(life))
        throw new Error("Check salvage, useful life, and first-year months.");
      let book = cost,
        accum = 0;
      const basis = cost - salvage,
        rows: (number | string)[][] = [];
      const annualSYD = Array.from(
        { length: life },
        (_, i) => (basis * (life - i)) / ((life * (life + 1)) / 2),
      );
      for (let year = 1; year <= life + (first < 12 ? 1 : 0); year++) {
        const service =
          year === 1 ? first / 12 : year === life + 1 ? (12 - first) / 12 : 1;
        let dep: number;
        if (id === "straight") dep = (basis / life) * service;
        else if (id === "syd") {
          const fraction = first / 12;
          dep =
            year === 1
              ? annualSYD[0] * fraction
              : (annualSYD[year - 2] ?? 0) * (1 - fraction) +
                (annualSYD[year - 1] ?? 0) * fraction;
        } else dep = ((book * n(v, "factor")) / life) * service;
        if (id !== "declining" && year === life + (first < 12 ? 1 : 0))
          dep = book - salvage;
        dep = Math.min(book - salvage, Math.max(0, dep));
        if (v.round === "Yes" && year < life)
          dep = Math.min(book - salvage, Math.round(dep));
        book -= dep;
        accum += dep;
        rows.push([year, dep, accum, book]);
      }
      return {
        metrics: [
          money("Depreciable basis", basis),
          money("Total depreciation", accum),
          money("Ending book value", book),
        ],
        columns: [
          "Year",
          "Depreciation",
          "Accumulated depreciation",
          "Book value",
        ],
        rows,
        notes: [
          "Custom months prorates service years by entered months; Actual days uses inclusive service dates within the entered first accounting year, then carries the unused service-year fraction into later years. These conventions are explicitly defined here; original convention choices remain unverified. Planning depreciation schedule, not a MACRS tax schedule. Declining balance does not switch to straight line or force a terminal write-down. Partial-year methods require verification against the original accounting convention.",
        ],
      };
    },
  })),
  "Build straight-line, declining-balance, and sum-of-years depreciation schedules.",
);
const margin = tool(
  "margin",
  [
    ...["revenue", "cost", "margin", "profit"].map((key): Mode => ({
      id: key,
      title: "Profit Margin · Find " + key,
      fields:
        key === "revenue"
          ? [
              num("cost", "Cost", 100, "$"),
              num("margin", "Gross margin", 25, "%"),
            ]
          : key === "cost"
            ? [
                num("revenue", "Revenue", 200, "$"),
                num("margin", "Gross margin", 25, "%"),
              ]
            : [
                num("cost", "Cost", 100, "$"),
                num("revenue", "Revenue", 150, "$"),
              ],
      description:
        "Distinguish margin as a share of revenue from markup as a share of cost.",
      formula:
        "Margin = (revenue − cost)/revenue; markup = (revenue − cost)/cost.",
      calculate: (v) => {
        let cost: number, revenue: number;
        if (key === "revenue") {
          cost = n(v, "cost");
          revenue = cost / positive(1 - pct(v, "margin"), "One minus margin");
        } else if (key === "cost") {
          revenue = n(v, "revenue");
          cost = revenue * (1 - pct(v, "margin"));
        } else {
          cost = n(v, "cost");
          revenue = n(v, "revenue");
        }
        return {
          metrics: [
            money("Revenue", revenue),
            money("Cost", cost),
            money("Profit", revenue - cost),
            metric(
              "Gross margin",
              ((revenue - cost) / positive(revenue, "Revenue")) * 100,
              "percent",
            ),
            ...(cost > 0
              ? [metric("Markup", ((revenue - cost) / cost) * 100, "percent")]
              : []),
          ],
        };
      },
    })),
    {
      id: "stock",
      title: "Stock Margin",
      fields: [
        num("price", "Share price", 50, "$"),
        num("shares", "Number of shares", 100, "", 0),
        num("requirement", "Initial margin requirement", 50, "%"),
      ],
      description:
        "Calculate equity required to open a margined stock position.",
      formula: "Required equity = share price × shares × margin requirement.",
      calculate: (v) => {
        const value = n(v, "price") * n(v, "shares"),
          equity = value * pct(v, "requirement");
        return {
          metrics: [
            money("Position value", value),
            money("Required equity", equity),
            money("Borrowed amount", value - equity),
          ],
        };
      },
    },
    {
      id: "currency",
      title: "Currency Margin",
      fields: [
        num("units", "Currency units", 100000, "", 0),
        num("rate", "Quote currency per base currency", 1.1, "", 0.00001),
        num("leverage", "Leverage ratio", 30, "to 1", 1),
      ],
      description: "Calculate margin required on a leveraged FX position.",
      formula: "Required margin = units × FX rate / leverage.",
      calculate: (v) => ({
        metrics: [
          money(
            "Notional value in quote currency",
            n(v, "units") * n(v, "rate"),
          ),
          money(
            "Required margin in quote currency",
            (n(v, "units") * n(v, "rate")) / n(v, "leverage"),
          ),
        ],
      }),
    },
  ],
  "Calculate profit margins, markups, stock margin, and foreign-exchange margin.",
);
margin.modes.push({
  id: "markup", title: "Markup from Cost",
  fields: [num("cost","Cost",100,"$",0.01), num("markup","Markup on cost",25,"%")],
  description: "Calculate a selling price by adding a percentage of cost. Markup is profit divided by cost; gross margin is profit divided by selling price.",
  formula: "Selling price = cost × (1 + markup/100); margin = markup/(100 + markup) × 100%.",
  calculate: v => {
    const cost=positive(n(v,"cost"),"Cost"), revenue=cost*(1+pct(v,"markup"));
    return {metrics:[money("Selling price",revenue),money("Profit",revenue-cost),metric("Markup",n(v,"markup"),"percent"),metric("Gross margin",(revenue-cost)/revenue*100,"percent")],notes:["Markup uses cost as its denominator; gross margin uses revenue. Taxes, discounts and other expenses are excluded."]};
  },
});
const discount = tool(
  "discount",
  ["percent", "amount", "original", "rate"].map((id): Mode => ({
    id,
    title:
      id === "percent"
        ? "Percent Off"
        : id === "amount"
          ? "Amount Off"
          : id === "original"
            ? "Original Price"
            : "Discount Rate",
    fields:
      id === "original"
        ? [
            num("after", "Sale price", 80, "$"),
            num("rate", "Discount", 20, "%"),
          ]
        : id === "rate"
          ? [
              num("before", "Original price", 100, "$"),
              num("after", "Sale price", 80, "$"),
            ]
          : [
              num("before", "Original price", 100, "$"),
              num(
                id === "percent" ? "rate" : "saved",
                id === "percent" ? "Discount" : "Amount saved",
                20,
                id === "percent" ? "%" : "$",
              ),
            ],
    description:
      "Find the sale price, original price, amount saved, or discount rate.",
    formula: "Sale price = original price × (1 − discount rate).",
    calculate: (v) => {
      const before =
          id === "original"
            ? n(v, "after") / positive(1 - pct(v, "rate"), "One minus discount")
            : n(v, "before"),
        after =
          id === "percent"
            ? before * (1 - pct(v, "rate"))
            : id === "amount"
              ? before - n(v, "saved")
              : n(v, "after");
      if (after < 0 || after > before)
        throw new Error("Sale price must be between zero and original price.");
      const values = {
        original: money("Original price", before),
        sale: money("Sale price", after),
        saved: money("Amount saved", before - after),
        rate: metric("Discount rate", ((before - after) / positive(before, "Original price")) * 100, "percent"),
      };
      const primary = id === "original" ? "original" : id === "rate" ? "rate" : "sale";
      return {
        metrics: [values[primary], ...(["sale", "saved", "rate", "original"] as const).filter(key => key !== primary).map(key => values[key])],
        notes: ["Price reductions only. Sales tax, shipping, fees and promotion eligibility are separate. Calculations retain precision before currency display rounding."],
      };
    },
  })),
  "Find the sale price and savings from a percent or dollar discount, recover an original price, or compare two stacked percentage discounts.",
);
discount.modes.push({
  id: "stacked",
  title: "Stacked Discounts",
  fields: [num("before", "Original price", 100, "$"), {...num("first", "First discount", 20, "%"), max:100}, {...num("second", "Additional discount", 10, "%"), max:100}],
  description: "Apply a second percentage reduction to the already discounted price.",
  formula: "Sale price = original × (1 − first/100) × (1 − additional/100).",
  calculate: v => {
    const original = positive(n(v,"before"), "Original price"),
      first = n(v,"first"), second = n(v,"second");
    if(first<0 || first>100 || second<0 || second>100) throw new Error("Each discount must be between 0% and 100%.");
    const intermediate = original * (1-first/100), sale = intermediate * (1-second/100);
    return {metrics:[money("Sale price",sale),money("Amount saved",original-sale),metric("Discount rate",(1-sale/original)*100,"percent"),money("Original price",original),money("Price after first discount",intermediate)],
      columns:["Discount stage","Rate (%)","Stage savings","Price after stage"],
      rows:[["First discount",first,original-intermediate,intermediate],["Additional discount",second,intermediate-sale,sale]],
      notes:["The additional percentage applies to the remaining price, not the original. Enter only promotions that can actually be combined; eligibility is not determined.","No sales tax, shipping or fees are added. Intermediate amounts retain full precision; a merchant's per-stage rounding can differ."]};
  },
});
function feeLoan(id: string, business = false) {
  return tool(
    id,
    [
      {
        id: "repayment",
        title: business ? "Business Loan" : "Personal Loan",
        fields: [
          ...baseLoanFields(),
          ...(business ? [compoundField(), payFreq()] : []),
          num("origination", "Origination fee", 3, "%"),
          num("documentation", "Documentation fee", 0, "$"),
          num("other_fee", "Other fees", 0, "$"),
          select("treatment", "Fee treatment", [
            "Deducted from proceeds",
            "Paid upfront",
            "Financed",
          ]),
          num("insurance", "Insurance per payment", 0, "$"),
        ],
        description:
          "Calculate a loan payment and cash-flow APR including fees and insurance.",
        formula:
          "APR solves net proceeds against all periodic loan payments and insurance charges.",
        calculate: (v) => {
          const p = n(v, "principal"),
            fees =
              p * pct(v, "origination") +
              n(v, "documentation") +
              n(v, "other_fee"),
            financed = p + (v.treatment === "Financed" ? fees : 0),
            net = positive(
              p - (v.treatment === "Financed" ? 0 : fees),
              "Net proceeds",
            ),
            f = business ? freq(v.pay) : 12,
            r = business
              ? periodic(n(v, "rate"), freq(v.compound), f)
              : pct(v, "rate") / 12,
            N = (term(v) / 12) * f,
            a = payment(financed, r, N),
            result = loanResult(financed, r, N),
            apr = solveRate(net, a + n(v, "insurance"), N) * f * 100;
          result.metrics.unshift(
            money("Payment including insurance", a + n(v, "insurance")),
          );
          result.metrics.push(
            money("Loan fees", fees),
            money("Net proceeds after fees", net),
            metric("Nominal APR including insurance", apr, "percent"),
          );
          return result;
        },
      },
    ],
    "Calculate fee-adjusted payments, loan proceeds, and annual percentage rate.",
  );
}
const business = feeLoan("business-loan", true),
  personal = feeLoan("personal-loan");
const boat = tool(
  "boat-loan",
  ["payment", "price"].map((id): Mode => ({
    id,
    title: id === "payment" ? "Monthly Payment" : "Boat Price",
    fields: [
      num(
        id === "payment" ? "price" : "payment",
        id === "payment" ? "Boat price" : "Monthly budget",
        id === "payment" ? 50000 : 700,
        "$",
      ),
      num("down", "Down payment", 10000, "$"),
      num("trade", "Trade-in value", 0, "$"),
      num("tax", "Sales tax", 7, "%"),
      num("fees", "Fees", 500, "$"),
      select("finance", "Finance taxes and fees?", ["Yes", "No"]),
      num("rate", "Annual interest", 7, "%"),
      num("years", "Loan term", 10, "years", 0.01),
    ],
    description: "Calculate a boat loan payment or affordable purchase price.",
    formula: "Financed balance = price − down − trade + financed tax and fees.",
    calculate: (v) => {
      const finance = v.finance === "Yes",
        N = n(v, "years") * 12,
        r = pct(v, "rate") / 12,
        price =
          id === "payment"
            ? n(v, "price")
            : (annuityPV(n(v, "payment"), r, N) +
                n(v, "down") +
                n(v, "trade") -
                (finance ? n(v, "fees") : 0)) /
              (1 + (finance ? pct(v, "tax") : 0)),
        tax = price * pct(v, "tax"),
        p =
          price -
          n(v, "down") -
          n(v, "trade") +
          (finance ? tax + n(v, "fees") : 0);
      nonnegative(p, "Financed balance");
      const result = loanResult(p, r, N);
      result.metrics.unshift(
        money("Boat price", price),
        money("Sales tax", tax),
        money(
          "Upfront cash",
          n(v, "down") + (finance ? 0 : tax + n(v, "fees")),
        ),
      );
      return result;
    },
  })),
  "Calculate boat loan payments or a boat price from a monthly financing budget.",
);
const lease = tool(
  "lease",
  ["rate", "payment"].map((id): Mode => ({
    id,
    title: id === "rate" ? "Fixed Interest Rate" : "Fixed Monthly Payment",
    fields: [
      num("price", "Asset value", 30000, "$"),
      num("residual", "Residual value", 10000, "$"),
      num("years", "Lease term", 3, "years", 0),
      num("months", "Additional months", 0, "months"),
      num(
        id === "rate" ? "rate" : "payment",
        id === "rate" ? "Annual interest rate" : "Monthly payment",
        id === "rate" ? 6 : 650,
        id === "rate" ? "%" : "$",
      ),
    ],
    description:
      "Value a lease as a payment stream plus an end-of-term residual.",
    formula:
      "Asset value = payment × annuity present-value factor + residual/(1+i)^N.",
    calculate: (v) => {
      const p = n(v, "price"),
        res = n(v, "residual"),
        N = term(v);
      positive(N, "Lease term");
      let r: number, a: number;
      if (id === "rate") {
        r = pct(v, "rate") / 12;
        a = (p - res / (1 + r) ** N) / annuityPV(1, r, N);
      } else {
        a = n(v, "payment");
        r = bisect(
          (x) => annuityPV(a, x, N) + res / (1 + x) ** N - p,
          -0.5,
          10,
        );
      }
      return {
        metrics: [
          money("Monthly payment", a),
          metric("Nominal annual rate", r * 1200, "percent"),
          money("Total lease payments", a * N),
          money("Total cost with residual purchase", a * N + res),
        ],
      };
    },
  })),
  "Calculate lease payments or solve the implied financing rate.",
);
const budgetGroups: Record<string, string[]> = {
  Income: ["Salary", "Pension", "Investment income", "Other income"],
  Housing: [
    "Mortgage or rent",
    "Property tax",
    "Home insurance",
    "Utilities",
    "Maintenance",
    "HOA",
    "Other housing",
  ],
  Transportation: [
    "Vehicle payments",
    "Auto insurance",
    "Fuel",
    "Public transit",
    "Vehicle maintenance",
    "Other transportation",
  ],
  Debt: ["Credit cards", "Student loans", "Other debt"],
  Living: ["Groceries", "Dining", "Clothing", "Entertainment", "Other living"],
  Health: ["Health insurance", "Medical costs"],
  Children: ["Childcare", "Education", "Child support", "Other child expenses"],
  Savings: [
    "Emergency fund",
    "Retirement saving",
    "Investments",
    "Other saving",
  ],
  Miscellaneous: [
    "Travel",
    "Gifts",
    "Charity",
    "Pets",
    "Personal care",
    "Other expenses",
  ],
};
const budget = tool(
  "budget",
  [
    {
      id: "budget",
      title: "Personal Budget",
      fields: [
        num("tax", "Income tax on gross income", 20, "%"),
        ...Object.entries(budgetGroups).flatMap(([group, labels]) =>
          labels.flatMap((label, i) => [
            num(
              group + "_" + i,
              group + " · " + label,
              group === "Income" && i === 0
                ? 6000
                : group === "Housing" && i === 0
                  ? 1500
                  : 0,
              "$",
            ),
            select(
              group + "f" + i,
              label + " frequency",
              ["Monthly", "Annually", "Biweekly", "Weekly"],
              "Monthly",
            ),
          ]),
        ),
      ],
      description:
        "Normalize each income and expense to a monthly amount and calculate the remaining budget.",
      formula:
        "Monthly surplus = monthly after-tax income − spending − savings allocations.",
      calculate: (v) => {
        const totals = Object.entries(budgetGroups).map(([group, labels]) => ({
            group,
            total: sum(
              labels.map(
                (_, i) =>
                  (n(v, group + "_" + i) * freq(v[group + "f" + i])) / 12,
              ),
            ),
          })),
          gross = totals[0].total,
          tax = gross * pct(v, "tax"),
          out = sum(totals.slice(1).map((x) => x.total));
        return {
          metrics: [
            money("Monthly take-home income", gross - tax),
            money("Monthly spending and saving", out),
            money("Monthly surplus / deficit", gross - tax - out),
            money("Annual surplus / deficit", (gross - tax - out) * 12),
          ],
          columns: ["Category", "Monthly amount", "Annual amount"],
          rows: [
            ...totals.map(
              (x) => [x.group, x.total, x.total * 12] as (string | number)[],
            ),
            ["Income tax", tax, tax * 12],
          ],
          chart: totals
            .slice(1)
            .map((x) => ({ label: x.group, value: x.total })),
        };
      },
    },
  ],
  "Build a personal budget from income, spending, debt payments, and saving allocations.",
);
const commission = tool(
  "commission",
  [
    ...["commission", "sales", "rate"].map((key): Mode => ({
      id: key,
      title: "Solve " + key,
      fields: [
        ...(key !== "sales" ? [num("sales", "Sales amount", 10000, "$")] : []),
        ...(key !== "rate" ? [num("rate", "Commission rate", 5, "%")] : []),
        ...(key !== "commission"
          ? [num("commission", "Commission earned", 500, "$")]
          : []),
      ],
      description: "Solve commission, sales, or commission rate.",
      formula: "Commission = sales × commission rate.",
      calculate: (v) => {
        const sales =
            key === "sales"
              ? n(v, "commission") / positive(pct(v, "rate"), "Commission rate")
              : n(v, "sales"),
          rate =
            key === "rate"
              ? n(v, "commission") / positive(sales, "Sales")
              : pct(v, "rate");
        return {
          metrics: [
            money("Sales amount", sales),
            metric("Commission rate", rate * 100, "percent"),
            money("Commission", sales * rate),
          ],
        };
      },
    })),
    {
      id: "tiered",
      title: "Tiered Commission and Base Pay",
      fields: [
        num("sales", "Sales amount", 25000, "$"),
        num("base", "Base pay for the sales period", 1000, "$"),
        select("tier_unit", "Tier rates entered as", ["Percent of sales", "Amount per item"]),
        select("method", "Tier method", [
          "Progressive bands",
          "Single rate on all sales",
        ]),
        area(
          "tiers",
          "Commission tiers",
          "10000, 3\n20000, 5\n1000000000, 7",
          "Up to 8 rows: upper sales/quantity bound, rate. With Amount per item, enter item quantity in Sales amount. Bounds must increase; base pay must cover the same period.",
        ),
      ],
      description:
        "Calculate graduated commission bands or a whole-sale rate plus base pay.",
      formula:
        "Progressive commission applies each rate only to sales inside that band.",
      calculate: (v) => {
        const tiers = v.tiers
          .trim()
          .split("\n")
          .map((x) => x.split(",").map(Number));
        if (
          !tiers.length ||
          tiers.length > 8 ||
          tiers.some(
            (x) =>
              x.length !== 2 || x.some((a) => !Number.isFinite(a) || a < 0),
          )
        )
          throw new Error("Enter up to 8 valid upper-bound, rate rows.");
        if (n(v,"sales") > tiers.at(-1)![0])throw new Error("Final tier must cover the sales amount.");
        if(v.method === "Single rate on all sales"){
          const [bound,rate]=tiers.find(([bound])=>n(v,"sales")<=bound)!;
          if(tiers.some(([bound],i)=>i>0&&bound<=tiers[i-1][0]))throw new Error("Tier upper bounds must increase.");
          const commission=n(v,"sales")*rate/(v.tier_unit==="Amount per item"?1:100);
          return {metrics:[money("Commission",commission),money("Base pay",n(v,"base")),money("Total earnings",commission+n(v,"base"))],columns:["Band start","Band end","Rate","Sales or items","Band commission"],rows:[[0,bound,rate,n(v,"sales"),commission]],notes:["A single selected tier rate applies to the full sales amount or item count. Base pay uses the same period as sales."]};
        }
        let prev = 0,
          total = 0;
        const rows: (number | string)[][] = [];
        for (const [bound, rate] of tiers) {
          if (bound <= prev)
            throw new Error("Tier upper bounds must increase.");
          const sales = Math.max(0, Math.min(n(v, "sales"), bound) - prev),
            commission = (sales * rate) / (v.tier_unit==="Amount per item"?1:100);
          rows.push([prev, bound, rate, sales, commission]);
          total += commission;
          prev = bound;
        }
        if (n(v, "sales") > tiers.at(-1)![0])
          throw new Error("Final tier must cover the sales amount.");
        return {
          metrics: [
            money("Commission", total),
            money("Base pay", n(v, "base")),
            money("Total earnings", total + n(v, "base")),
          ],
          columns: [
            "Band start",
            "Band end",
            "Rate (% or amount/item)",
            "Sales in band",
            "Band commission",
          ],
          rows,
        };
      },
    },
  ],
  "Calculate simple, graduated, or whole-sale-rate commission and base compensation.",
);
commission.modes.unshift({
  id:"any-two",title:"Commission Calculator",
  fields:[{...num("sales","Sales amount",10000,"$"),optional:true},{...num("rate","Commission rate",5,"%"),optional:true},{...num("commission","Commission earned",0,"$"),value:"",optional:true}],
  description:"Enter any two of sales, commission rate and commission earned to find the remaining value.",
  formula:"Commission = sales × rate / 100.",
  calculate:v=>{
    const keys=["sales","rate","commission"], filled=keys.filter(key=>v[key]?.trim()!==""&&v[key]!==undefined);
    if(filled.length!==2)throw new Error("Enter exactly two values and leave the unknown field blank.");
    let sales=v.sales?.trim()?n(v,"sales"):0, rate=v.rate?.trim()?n(v,"rate"):0, earned=v.commission?.trim()?n(v,"commission"):0;
    if(!filled.includes("commission"))earned=sales*rate/100;
    else if(!filled.includes("sales")){if(rate===0)throw new Error("A zero rate does not determine a unique sales amount.");sales=earned*100/rate;}
    else {if(sales===0)throw new Error("Zero sales do not determine a unique commission rate.");rate=earned/sales*100;}
    const metrics={sales:money("Sales amount",sales),rate:metric("Commission rate",rate,"percent"),commission:money("Commission",earned)};
    const unknown=keys.find(key=>!filled.includes(key))!;
    return {metrics:[unknown,...keys.filter(key=>key!==unknown)].map(key=>metrics[key as keyof typeof metrics])};
  },
});
export const otherCoreCalculators = [
  loan,
  paymentTool,
  sales,
  credit,
  cards,
  debtPayoff,
  consolidation,
  repayment,
  student,
  college,
  vat,
  depreciation,
  margin,
  discount,
  business,
  personal,
  boat,
  lease,
  budget,
  commission,
];
