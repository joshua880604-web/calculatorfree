import { tool, compoundField, timingField, freq, frequencies } from "./helpers";
import { calendarDate } from "../calendar-date";
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
} from "../types";
import {
  future,
  present,
  annuityPV,
  periodic,
  payment,
  solveRate,
  bisect,
  irr,
  parseNumbers,
  sum,
  datesYears,
  positive,
  periods,
} from "../finance";
const pct = (v: Values, k: string) => n(v, k) / 100;
const due = (v: Values) => v.timing === "Beginning of period";
function growth(
  v: Values,
  overrides: Partial<Record<string, number>> = {},
): Result {
  const get = (k: string) => overrides[k] ?? n(v, k);
  const initial = get("principal"),
    years =
      get("years") + (overrides.months ?? (v.months ? n(v, "months") : 0)) / 12,
    months = Math.round(years * 12);
  if (years < 0) throw new Error("Investment length cannot be negative.");
  if (months > 0) periods(months);
  const rate = get("rate"),
    tax = pct(v, "tax"),
    inflation = pct(v, "inflation"),
    monthly = get("monthly"),
    annual = get("annual"),
    annualIncrease =
      (v.annual_increase
        ? get("annual_increase")
        : v.increase
          ? get("increase")
          : 0) / 100,
    monthlyIncrease =
      (v.monthly_increase
        ? get("monthly_increase")
        : v.increase
          ? get("increase")
          : 0) / 100;
  const r = periodic(rate, freq(v.compound), 12);
  let b = initial,
    paid = initial,
    taxes = 0,
    accrued = 0,
    initialBalance = initial, initialAccrued = 0;
  const rows: (string | number)[][] = [];
  const monthlyRows: (string | number)[][] = [];
  for (let m = 1; m <= months; m++) {
    const c = monthly * (1 + monthlyIncrease) ** Math.floor((m - 1) / 12),
      a = annual * (1 + annualIncrease) ** Math.floor((m - 1) / 12);
    if (due(v)) {
      b += c;
      paid += c;
      if (m % 12 === 1) {
        b += a;
        paid += a;
      }
    }
    const initialInterest = initialBalance*r;
    initialBalance += initialInterest; initialAccrued += Math.max(0, initialInterest);
    const interest = b * r;
    b += interest;
    accrued += Math.max(0, interest);
    if (!due(v)) {
      b += c;
      paid += c;
      if (m % 12 === 0) {
        b += a;
        paid += a;
      }
    }
    if (m % 12 === 0 || m === months) {
      const t = accrued * tax;
      b -= t;
      taxes += t;
      initialBalance -= initialAccrued * tax; initialAccrued = 0;
      accrued = 0;
      rows.push([m / 12, paid, b - paid, b]);
    }
    monthlyRows.push([m, paid, b - paid, b]);
  }
  return {
    metrics: [
      money("Ending balance", b),
      money("Total contributions", paid),
      money("Starting amount", initial),
      money("Additional contributions", paid-initial),
      money("Net investment earnings", b - paid),
      money("Net earnings from starting amount", initialBalance - initial),
      money("Net earnings from additional deposits", b - paid - (initialBalance - initial)),
      money("Tax on interest", taxes),
      money("Inflation-adjusted balance", b / (1 + inflation) ** years),
    ],
    columns: ["Month", "Contributions", "Net earnings", "Balance"],
    rows: monthlyRows,
    schedulePeriod: "Monthly",
    annualColumns: ["Year", "Contributions", "Net earnings", "Balance"],
    annualRows: rows,
    chart: [
      { label: "Contributions", value: paid },
      { label: "Net earnings", value: Math.max(0, b - paid) },
    ],
    notes: [
      "Interest is accrued monthly using the selected compounding equivalent. Tax is charged on positive interest at each year end; tax losses are not carried forward.",
    ],
  };
}
const growthFields = () => [
  num("principal", "Starting amount", 10000, "$"),
  num("years", "Investment length", 10, "years", 0),
  num("months", "Additional months", 0, "months"),
  num("rate", "Annual interest / return rate", 5, "%", -99),
  compoundField(),
  num("annual", "Annual contribution", 0, "$"),
  num("monthly", "Monthly contribution", 100, "$"),
  timingField(),
  num("tax", "Tax on interest", 0, "%"),
  num("inflation", "Inflation rate", 0, "%", -99),
];
const growthMode = (
  id: string,
  title: string,
  fields = growthFields(),
): Mode => ({
  id,
  title,
  fields,
  calculate: growth,
  description: "Project the balance, contributions, and earnings over time.",
  formula:
    "Balance grows at the equivalent periodic rate, with contributions added at the selected timing.",
});
const interest = tool(
  "interest",
  [growthMode("accumulation", "Interest Calculator")],
  "Calculate investment growth with annual and monthly additions, taxes, and inflation.",
);
const savings = tool(
  "savings",
  [
    growthMode("accumulation", "Savings Calculator", [
      ...growthFields(),
      num("annual_increase", "Yearly increase in annual contribution", 0, "%"),
      num(
        "monthly_increase",
        "Yearly increase in monthly contribution",
        0,
        "%",
      ),
    ]),
  ],
  "Estimate savings with increasing deposits and interest.",
);
const compound = tool(
  "compound-interest",
  [
    growthMode("growth", "Compound Growth"),
    {
      id: "conversion",
      title: "Equivalent Interest Rate",
      fields: [
        num("rate", "Input interest rate", 5, "%", -99),
        select("from", "Input compounding", frequencies, "Annually"),
        select("to", "Output compounding", frequencies, "Monthly"),
      ],
      description:
        "Convert nominal interest rates between compounding frequencies without changing effective annual yield.",
      formula:
        "Effective yield = (1 + r/m)^m − 1; equivalent nominal rate = n × ((1 + yield)^(1/n) − 1).",
      calculate: (v) => {
        const a = freq(v.from),
          b = freq(v.to),
          r = pct(v, "rate");
        if (a && 1 + r / a <= 0)
          throw new Error("Invalid interest rate for this frequency.");
        const log = a ? a * Math.log1p(r / a) : r;
        const out = b ? b * Math.expm1(log / b) : log;
        return {
          metrics: [
            metric("Equivalent interest rate", out * 100, "percent"),
            metric("Effective annual yield", Math.expm1(log) * 100, "percent"),
          ],
        };
      },
    },
  ],
  "Calculate compound growth with monthly deposits or convert equivalent compounding rates.",
);
const investmentModes = [
  "End Amount",
  "Contribute Amount",
  "Return Rate",
  "Starting Amount",
  "Invest Length",
].map((label, index): Mode => {
  const key = ["end", "monthly", "rate", "principal", "years"][index];
  const fields = [
    ...growthFields(),
    num("end", "Target end amount", 50000, "$"),
  ].filter((f) => f.key !== key && !(key === "years" && f.key === "months"));
  return {
    id: ["end", "contribution", "return", "starting", "length"][index],
    title: label,
    fields,
    description:
      "Solve one investment variable while holding the other assumptions fixed.",
    formula:
      "Solve the periodic contribution and compound growth cash-flow equation.",
    calculate: (v) => {
      if (key === "end") return growth(v);
      const target = n(v, "end");
      let value: number;
      if (key === "principal" || key === "monthly") {
        const a = growth(v, { [key]: 0 }).metrics[0].value,
          b = growth(v, { [key]: 1 }).metrics[0].value;
        value = (target - a) / (b - a);
        if (value < 0)
          throw new Error(
            "Target requires a negative input. Reduce other contributions or change the target.",
          );
      } else if (key === "rate")
        value = bisect(
          (x) => growth(v, { rate: x }).metrics[0].value - target,
          -50,
          100,
        );
      else {
        value = -1;
        for (let m = 0; m <= 2400; m++) {
          const balance = growth(v, { years: m / 12, months: 0 }).metrics[0]
            .value;
          const tolerance =
            32 *
            Number.EPSILON *
            Math.max(1, Math.abs(target), Math.abs(balance));
          if (balance >= target - tolerance) {
            value = m / 12;
            break;
          }
        }
        if (value < 0) throw new Error("Target not reached within 200 years.");
      }
      const result = growth(v, {
        [key]: value,
        ...(key === "years" ? { months: 0 } : {}),
      });
      result.metrics.unshift(
        metric(
          label,
          value,
          key === "rate" ? "percent" : key === "years" ? "number" : "money",
        ),
      );
      return result;
    },
  };
});
const investment = tool(
  "investment",
  investmentModes,
  "Solve for an investment’s end amount, contributions, return, starting balance, or duration.",
);
// Goal modes share the existing contribution/timing model; preserve accumulation links.
for (const [source, id, title] of [
  ["contribution", "goal-contribution", "Savings Goal: Monthly Deposit"],
  ["length", "goal-time", "Savings Goal: Time Needed"],
] as const) {
  const original = investmentModes.find(m => m.id === source)!;
  savings.modes.push({
    ...original, id, title,
    fields: [...original.fields].sort((a,b) => (a.key === "end" ? -1 : b.key === "end" ? 1 : 0)),
    description: source === "contribution" ? "Calculate the monthly deposit needed to reach a savings goal, including current savings, interest and contribution timing." : "Find the first whole month your savings reach the target under the entered contribution and return assumptions (up to 200 years).",
    calculate: (v) => {
      if (source === "contribution") {
        const baseline=growth(v,{monthly:0});
        if (baseline.metrics[0].value >= n(v,"end")) {
          baseline.metrics.unshift(money("Required monthly deposit",0));
          baseline.notes!.push("The target is already covered by projected existing savings and annual deposits; no monthly deposit is required.");
          return baseline;
        }
      }
      if(source === "contribution" && n(v,"years")*12+n(v,"months")===0) throw new Error("A future savings target needs at least one month to add deposits.");
      const result=original.calculate(v);
      result.metrics[0].label=source === "contribution" ? "Required monthly deposit" : "Years to savings goal";
      if(source === "length") result.metrics.splice(1,0,metric("Months to savings goal",Math.round(result.metrics[0].value*12)));
      return result;
    },
  });
}
// APY belongs only to Savings; shared investment/interest calculators retain their conventions.
for (const mode of savings.modes) {
  const calculate = mode.calculate;
  mode.fields = mode.fields.flatMap(field => field.key === "rate" ? [
    { ...select("rate_type", "Rate type", ["Nominal interest rate", "APY"], "Nominal interest rate"), optional: true },
    { ...field, label: "Annual rate / APY", hint: "APY already includes compounding. Choose Nominal interest rate for a stated rate with a separate compounding frequency." },
  ] : [{ ...field, ...(field.key === "compound" ? { hint: "Used for nominal rates only; ignored when Rate type is APY." } : {}) }]);
  mode.formula += " For APY, monthly rate = (1 + APY/100)^(1/12) - 1; the compounding selector is ignored.";
  mode.calculate = values => {
    if (values.rate_type && !["Nominal interest rate", "APY"].includes(values.rate_type)) throw new Error("Choose a valid savings rate type.");
    const apy = values.rate_type === "APY";
    if (apy && n(values, "rate") <= -100) throw new Error("APY must be greater than -100%.");
    // An effective annual yield is the equivalent of a nominal rate compounded annually.
    const result = calculate(apy ? { ...values, compound: "Annually" } : values);
    if (apy) result.notes = [...(result.notes ?? []), "APY is a constant effective annual yield. The compounding selector is ignored; monthly growth uses (1 + APY/100)^(1/12) - 1. Actual bank rates can change; bank day counts, crediting and rounding can differ. No live rates are fetched."];
    return result;
  };
}
const tvmFields = () => [
  num("N", "Number of periods (N)", 120, "periods", 0.001),
  num("rate", "Annual interest (I/Y)", 6, "%", -99),
  num("PV", "Present value (PV)", -10000, "$", -1e15),
  num("PMT", "Payment (PMT)", -100, "$", -1e15),
  num("FV", "Future value (FV)", 30000, "$", -1e15),
  num("pay", "Payments per year (P/Y)", 12, "", 1),
  num("compound", "Compounds per year (C/Y)", 12, "", 1),
  timingField(),
];
function tvm(v: Values, r: number, N: number): number {
  return future(n(v, "PV"), n(v, "PMT"), r, N, due(v)) + n(v, "FV");
}
const finance = tool(
  "finance",
  ["FV", "PMT", "I/Y", "N", "PV"].map((key): Mode => ({
    id: key.replace("/", "-").toLowerCase(),
    title: `Solve ${key}`,
    fields: tvmFields().filter((f) => f.key !== (key === "I/Y" ? "rate" : key)),
    description:
      "Use cash-flow signs: money paid out is negative and money received is positive.",
    formula: "PV × (1+i)^N + PMT × annuity factor + FV = 0.",
    calculate: (v) => {
      const rate = key === "I/Y" ? 0 : n(v, "rate"),
        r = periodic(rate, n(v, "compound"), n(v, "pay"));
      let value: number;
      if (key === "FV")
        value = -future(n(v, "PV"), n(v, "PMT"), r, n(v, "N"), due(v));
      else if (key === "PV")
        value = present(-n(v, "FV"), n(v, "PMT"), r, n(v, "N"), due(v));
      else if (key === "PMT") {
        const factor = future(0, 1, r, n(v, "N"), due(v));
        value =
          (-n(v, "FV") - future(n(v, "PV"), 0, r, n(v, "N"))) /
          positive(factor, "Payment factor");
      } else if (key === "I/Y")
        value = bisect(
          (x) => tvm(v, periodic(x, n(v, "compound"), n(v, "pay")), n(v, "N")),
          -50,
          100,
        );
      else {
        // Find a local bracket before evaluating extreme powers at N=12,000.
        // A valid short solution can otherwise be rejected when that endpoint overflows.
        const equation=(x:number)=>tvm(v,r,x),start=equation(0.001);
        let high=1,end=equation(high);
        while(Number.isFinite(end)&&start*end>0&&high<12000){
          high=Math.min(12000,high*2);end=equation(high);
        }
        value=bisect(equation,0.001,high);
      }
      return {
        metrics: [
          metric(
            key,
            value,
            key === "I/Y" ? "percent" : key === "N" ? "number" : "money",
          ),
        ],
        notes: [
          "Payment and present/future values use the financial cash-flow sign convention.",
        ],
      };
    },
  })),
  "Time value of money with separate payment and compounding frequencies.",
);
const rateTool = tool(
  "interest-rate",
  [
    {
      id: "rate",
      title: "Interest Rate",
      fields: [
        num("principal", "Loan amount", 100000, "$"),
        num("years", "Loan term", 10, "years", 0.01),
        num("months", "Additional months", 0, "months"),
        num("payment", "Monthly payment", 1100, "$"),
      ],
      description:
        "Find the nominal annual rate implied by a fixed monthly payment.",
      formula: "Numerically solve P = A × (1 − (1+i)^−N) / i.",
      calculate: (v) => {
        const principal = positive(n(v, "principal"), "Loan amount"),
          installment = positive(n(v, "payment"), "Monthly payment"),
          months = n(v, "years") * 12 + n(v, "months");
        if (!Number.isInteger(months) || months < 1)
          throw new Error("Use a whole number of monthly payments. Check years and additional months.");
        const total = installment * months;
        const monthlyRate = total === principal ? 0 : solveRate(principal, installment, months);
        return {
          metrics: [
            metric("Annual interest rate", monthlyRate * 1200, "percent"),
            money("Total scheduled payments", total),
            money("Total interest", total - principal),
            metric("Monthly interest rate", monthlyRate * 100, "percent"),
            metric("Effective annual rate", Math.expm1(12 * Math.log1p(monthlyRate)) * 100, "percent"),
          ],
          notes: [
            "Equal end-of-month principal-and-interest payments over the entered whole monthly periods. No fees, escrow, balloon balance, skipped payments or daily-interest convention are modeled.",
            "Annual interest rate is the nominal monthly rate times twelve. Effective annual rate reflects monthly compounding; neither is a lender's fee-inclusive APR disclosure.",
            ...(monthlyRate < 0 ? ["Scheduled payments total less than principal, so these inputs imply a negative mathematical rate. Recheck principal, term and payment; this is not a typical loan offer or proof of a subsidy."] : []),
          ],
        };
      },
    },
  ],
  "Find your loan interest rate from the amount borrowed, term and monthly payment. Review total payments and interest before fees.",
);
const simpleFields = () => [
  num("principal", "Principal", 10000, "$"),
  num("balance", "End balance", 12000, "$"),
  num("rate", "Simple interest rate", 5, "%", -99),
  select("rate_unit", "Rate period", ["Annual", "Monthly", "Daily"]),
  num("years", "Time", 4, "", 0.0001),
  select("term_unit", "Time unit", ["Years", "Months", "Days"]),
];
const simple = tool(
  "simple-interest",
  ["Balance", "Principal", "Term", "Rate"].map((label, i): Mode => {
    const k = ["balance", "principal", "years", "rate"][i];
    return {
      id: k,
      title: label,
      fields: simpleFields().filter((f) => f.key !== k),
      description:
        "Simple interest is computed on the original principal without compounding.",
      formula: "A = P × (1 + r × t).",
      calculate: (v) => {
        const rp =
            v.rate_unit === "Monthly" ? 12 : v.rate_unit === "Daily" ? 365 : 1,
          tp = v.term_unit === "Months" ? 12 : v.term_unit === "Days" ? 365 : 1;
        let x: number;
        if (k === "balance")
          x =
            n(v, "principal") *
            (1 + (pct(v, "rate") * rp * n(v, "years")) / tp);
        else if (k === "principal")
          x =
            n(v, "balance") /
            positive(
              1 + (pct(v, "rate") * rp * n(v, "years")) / tp,
              "Accumulation factor",
            );
        else if (k === "years")
          x =
            ((n(v, "balance") / positive(n(v, "principal"), "Principal") - 1) /
              pct(v, "rate") /
              rp) *
            tp;
        else
          x =
            ((((n(v, "balance") / positive(n(v, "principal"), "Principal") -
              1) /
              positive(n(v, "years"), "Time")) *
              tp) /
              rp) *
            100;
        if (!Number.isFinite(x) || (x < 0 && k === "years"))
          throw new Error("No valid result for these inputs.");
        return {
          metrics: [
            metric(
              label,
              x,
              k === "rate" ? "percent" : k === "years" ? "number" : "money",
            ),
          ],
        };
      },
    };
  }),
  "Calculate simple interest, principal, time, or interest rate.",
);
const cd = tool(
  "cd",
  [
    {
      id: "accumulation",
      title: "CD Return",
      fields: [
        num("principal", "Initial deposit", 10000, "$"),
        { ...select("rate_type", "Rate type", ["Nominal interest rate", "APY"], "Nominal interest rate"), optional: true },
        { ...num("rate", "Annual rate / APY", 5, "%", -99), hint: "Choose the rate type above. APY already includes compounding; do not compound it again." },
        { ...compoundField(), hint: "Used for nominal interest rates only. Ignored when Rate type is APY." },
        num("years", "Deposit length", 3, "years", 0),
        num("months", "Additional months", 0, "months"),
        num("tax", "Marginal tax rate", 22, "%"),
      ],
      description: "Estimate the CD maturity value and after-tax interest.",
      formula: "Nominal rate: FV = P × (1 + r/m)^(m×t). APY: FV = P × (1 + APY)^t. Rates are decimals; t is years. Taxes are applied to total positive interest.",
      calculate: (v) => {
        if (v.rate_type && !["Nominal interest rate", "APY"].includes(v.rate_type)) throw new Error("Choose a valid CD rate type.");
        const apy = v.rate_type === "APY";
        const annualRate = n(v, "rate");
        if (apy && annualRate <= -100) throw new Error("APY must be greater than -100%.");
        const monthlyRate = apy ? Math.expm1(Math.log1p(annualRate / 100) / 12) : periodic(annualRate, freq(v.compound), 12);
        const p = n(v, "principal"),
          fv = future(
            p,
            0,
            monthlyRate,
            n(v, "years") * 12 + n(v, "months"),
          ),
          interest = fv - p,
          tax = Math.max(0, interest) * pct(v, "tax");
        const term=n(v,"years")*12+n(v,"months");
        if(term>12000)throw new Error("CD term exceeds supported schedule limits.");
        const rows:(number|string)[][]=[], yearly:(number|string)[][]=[];
        let previous=p;
        for(let i=1;i<=Math.ceil(term);i++){
          const month=Math.min(i,term), balance=future(p,0,monthlyRate,month);
          rows.push([month,balance-previous,balance-p,balance]);previous=balance;
          if(i%12===0 || i===Math.ceil(term))yearly.push([month/12,balance-p,balance]);
        }
        return {
          columns:["Month","Period interest","Cumulative interest","Balance before tax"], rows,
          schedulePeriod:"Monthly", annualColumns:["Year","Cumulative interest","Balance before tax"], annualRows:yearly,
          additionalTables:[{title:'Compare hypothetical CD terms at the same entered rate',columns:['Term (months)','Before-tax maturity balance (USD)','Interest earned (USD)','After-tax maturity balance (USD)'],rows:[6,12,18,24,36].map(months=>{const ending=future(p,0,monthlyRate,months),gain=ending-p;return [months,ending,gain,ending-Math.max(0,gain)*pct(v,'tax')];}),note:'Holds your deposit, rate and rate type constant across all terms. These are hypothetical durations, not bank quotes or a CD ladder; actual rates can differ by term. Taxes are approximated at maturity.'}],
          notes:[...(apy ? ["APY already includes compounding. The selected compounding frequency is ignored. Growth uses a constant effective annual yield and term in months / 12, not exact bank day-count or crediting conventions."] : []), "Schedule balances are before tax. The marginal tax estimate is applied to positive total interest at maturity; it does not model annual tax cash flows, early withdrawal penalties or changing rates."],
          metrics: [
            money("Maturity balance", fv),
            money("Interest earned", interest),
            money("Tax on interest", tax),
            money("After-tax balance", fv - tax),
            metric("Effective annual yield (APY)",(Math.pow(1+monthlyRate,12)-1)*100,"percent"),
            metric("Selected CD term in months",term),
          ],
        };
      },
    },
  ],
  "Estimate certificate of deposit earnings and taxes.",
);
const mutual = tool(
  "mutual-fund",
  [
    {
      id: "projection",
      title: "Mutual Fund Return",
      fields: [
        ...growthFields().filter(
          (f) => !["tax", "inflation", "compound", "timing"].includes(f.key),
        ),
        num("front", "Front-end sales charge", 3, "%"),
        num("back", "Deferred sales charge", 0, "%"),
        num("expense", "Annual operating expenses", 1, "%"),
      ],
      description: "Compare net fund growth to the same return without fees.",
      formula:
        "Front-end charges reduce each contribution; recurring expenses reduce the effective annual return.",
      calculate: (v) => {
        const base = {
          ...v,
          compound: "Annually",
          timing: "End of period",
          tax: "0",
          inflation: "0",
        };
        const gross = growth(base),
          front = pct(v, "front"),
          net = growth(base, {
            principal: n(v, "principal") * (1 - front),
            monthly: n(v, "monthly") * (1 - front),
            annual: n(v, "annual") * (1 - front),
            rate: ((1 + pct(v, "rate")) * (1 - pct(v, "expense")) - 1) * 100,
          });
        const end = net.metrics[0].value * (1 - pct(v, "back"));
        net.metrics = [
          money("Net redemption value", end),
          money("Balance without charges", gross.metrics[0].value),
          money("Effect of fees and lost growth", gross.metrics[0].value - end),
        ];
        net.notes = [
          "Deferred sales charge is applied to final balance. Charges and expense policies vary by fund.",
        ];
        return net;
      },
    },
  ],
  "Project mutual fund growth after sales charges and operating expenses.",
);
const roi = tool(
  "roi",
  ["length", "dates"].map((id): Mode => ({
    id,
    title: id === "dates" ? "Use Dates" : "Use Investment Length",
    fields: [
      num("cost", "Amount invested", 10000, "$"),
      num("returned", "Amount returned", 15000, "$"),
      ...(id === "dates"
        ? [
            date("start", "Start date", "2021-01-01"),
            date("end", "End date", "2026-01-01"),
          ]
        : [num("years", "Investment length", 5, "years", 0.0001)]),
    ],
    description:
      "Compare total profit, total return, and compound annual growth.",
    formula:
      "ROI = (returned − invested)/invested; annualized = (returned/invested)^(1/years) − 1.",
    calculate: (v) => {
      const cost = positive(n(v, "cost"), "Investment"),
        returned = n(v, "returned"),
        t =
          id === "dates"
            ? datesYears(v.start, v.end)
            : positive(n(v, "years"), "Years");
      return {
        metrics: [
          money("Investment gain", returned - cost),
          metric(
            "Return on investment",
            (returned / cost - 1) * 100,
            "percent",
          ),
          metric(
            "Annualized return",
            (Math.pow(returned / cost, 1 / t) - 1) * 100,
            "percent",
          ),
        ],
      };
    },
  })),
  "Calculate total and annualized return on investment.",
);
const average = tool(
  "average-return",
  [
    {
      id: "returns",
      title: "Average and Cumulative Return",
      fields: [
        area("returns", "Returns, one percent per period", "10, -5, 15"),
        num("periods", "Periods per year", 1, "", 0.01),
      ],
      description:
        "Compare arithmetic average and geometric compounded returns.",
      formula: "Arithmetic = sum(r)/N; geometric = product(1+r)^(1/N)−1.",
      calculate: (v) => {
        const a = parseNumbers(v.returns);
        if (a.some((x) => x < -100))
          throw new Error("Returns cannot be below −100%.");
        const factor = a.reduce((b, x) => b * (1 + x / 100), 1);
        return {
          metrics: [
            metric("Arithmetic average", sum(a) / a.length, "percent"),
            metric(
              "Geometric average",
              (factor ** (1 / a.length) - 1) * 100,
              "percent",
            ),
            metric("Cumulative return", (factor - 1) * 100, "percent"),
            metric(
              "Annualized geometric return",
              (factor ** (n(v, "periods") / a.length) - 1) * 100,
              "percent",
            ),
          ],
          columns: ["Period", "Return (%)"],
          rows: a.map((x, i) => [i + 1, x]),
        };
      },
    },
    {
      id: "cashflows",
      title: "Dated Cash Flows",
      fields: [
        area(
          "cashflows",
          "Date and cash flow, one row per transaction",
          "2020-01-01, -10000\n2021-01-01, -2000\n2026-01-01, 18000",
          "Use a real YYYY-MM-DD calendar date, amount. Include opening investment and final liquidation value.",
        ),
      ],
      description:
        "Find the annual money-weighted return using exact transaction dates.",
      formula: "Σ CFᵢ/(1+r)^((dateᵢ−date₀)/365) = 0.",
      calculate: (v) => {
        const lines = v.cashflows.split(/\r?\n/).map((line, index) => ({ line, index }));
        while (lines[0]?.line.trim() === "") lines.shift();
        while (lines.at(-1)?.line.trim() === "") lines.pop();
        if (!lines.length) throw new Error("Enter dated cash flows using YYYY-MM-DD, amount.");
        const rows = lines
          .map(({ line, index }) => {
            const [d, a, ...extra] = line.split(",").map((s) => s.trim());
            if (!d || !a || extra.length || !Number.isFinite(Number(a)))
              throw new Error(`Row ${index + 1}: enter YYYY-MM-DD, amount.`);
            try { calendarDate(d); }
            catch { throw new Error(`Row ${index + 1}: enter a real YYYY-MM-DD calendar date.`); }
            return { date: d, amount: Number(a) };
          })
          .sort((a, b) => a.date.localeCompare(b.date));
        const start = Date.parse(rows[0].date),
          times = rows.map(
            (x) => (Date.parse(x.date) - start) / 86400000 / 365,
          ),
          roots = irr(
            rows.map((x) => x.amount),
            times,
          );
        return {
          metrics: roots.map((x, i) =>
            metric(`Annual IRR ${i + 1}`, x * 100, "percent"),
          ),
          notes: [
            "Multiple roots are shown when found. This is a money-weighted return, not a time-weighted index return.",
          ],
        };
      },
    },
  ],
  "Measure arithmetic, geometric, cumulative, and dated cash-flow returns.",
);
average.modes.push({
  id: "variable-periods",
  title: "Variable Period Returns",
  fields: [
    area(
      "period_returns",
      "Return and duration by period",
      "10, 1, 0\n5, 0, 6",
      "One per line: total return percent, years, months. Returns are for each whole holding period, not annualized.",
    ),
  ],
  description:
    "Calculate cumulative growth and an annualized return across unequal holding periods.",
  formula:
    "Growth = product(1 + period return); annualized return = growth^(1/total years) − 1.",
  calculate: (v) => {
    const entries = v.period_returns
      .trim()
      .split("\n")
      .map((line) => {
        const a = line.split(",").map(Number);
        if (
          a.length !== 3 ||
          a.some((x) => !Number.isFinite(x)) ||
          a[0] < -100 ||
          a[1] < 0 ||
          a[2] < 0 ||
          a[1] + a[2] / 12 <= 0
        )
          throw new Error(
            "Each row needs return percent, nonnegative years, and months with positive total duration.",
          );
        return { r: a[0] / 100, t: a[1] + a[2] / 12 };
      });
    if (entries.length > 60) throw new Error("Maximum 60 return periods.");
    const years = sum(entries.map((x) => x.t)),
      factor = entries.reduce((s, x) => s * (1 + x.r), 1);
    return {
      metrics: [
        metric("Total holding years", years),
        metric("Cumulative return", (factor - 1) * 100, "percent"),
        metric(
          "Annualized compound return",
          (factor ** (1 / years) - 1) * 100,
          "percent",
        ),
        metric(
          "Time-weighted simple annual return",
          (sum(entries.map((x) => x.r)) / years) * 100,
          "percent",
        ),
      ],
      columns: [
        "Period",
        "Total return (%)",
        "Holding years",
        "Annualized return (%)",
      ],
      rows: entries.map((x, i) => [
        i + 1,
        x.r * 100,
        x.t,
        ((1 + x.r) ** (1 / x.t) - 1) * 100,
      ]),
    };
  },
});
const irrTool = tool(
  "irr",
  ["fixed", "irregular"].map((id): Mode => ({
    id,
    title: id === "fixed" ? "Fixed Cash Flow" : "Unequal Annual Cash Flows",
    fields: [
      num("initial", "Initial investment (outflow at time zero)", 10000, "$"),
      ...(id === "fixed"
        ? [
            num("years", "Holding length", 5, "years", 0),
            {...num("months", "Additional holding months", 0, "months"), max: 11, step: 1},
            select("cash_action", "Recurring cash flow", ["Net cash flow", "No recurring cash flow", "Additional investment"]),
            num("inflow", "Net cash flow each period", 3000, "$", -1e12),
            select("cash_frequency", "Cash flow frequency", [
              "Annually",
              "Semiannually",
              "Quarterly",
              "Monthly",
              "Semimonthly",
              "Biweekly",
              "Weekly",
              "Daily",
            ]),
            num("ending", "Ending value", 1000, "$"),
            select("timing", "Cash flow timing", [
              "End of period",
              "Beginning of period",
            ]),
          ]
        : [
            area(
              "flows",
              "Subsequent cash flows by year",
              "2000, 3000, 4000, 5000",
              "One number per year, starting at year 1. Use negative values for additional investments and 0 for years with no cash flow. Do not repeat the initial investment. Write 10000, not 10,000: commas separate cash flows, not thousands. This form is not date-based XIRR.",
            ),
          ]),
    ],
    description:
      id === "fixed" ? "Estimate an effective annual IRR from equally spaced fixed cash flows; choose frequency and beginning/end timing." : "Estimate an annual IRR from unequal amounts at successive year ends. Amounts may vary, but dates remain one year apart.",
    formula: "NPV = Σ CFₜ/(1+r)^t = 0.",
    calculate: (v) => {
      let flows: number[], eventTimes: number[];
      if (id === "fixed") {
        if (!Number.isInteger(n(v,"months"))) throw new Error("Additional holding months must be a whole number.");
        const horizon=positive(n(v,"years")+n(v,"months")/12,"Holding length"), frequency=freq(v.cash_frequency), rawPeriods=horizon*frequency;
        if(horizon>12000 || (v.cash_action!=="No recurring cash flow" && rawPeriods>12000))throw new Error("Holding period exceeds supported cash-flow limits.");
        const cash=v.cash_action==="No recurring cash flow"?0:v.cash_action==="Additional investment"?-Math.abs(n(v,"inflow")):n(v,"inflow");
        flows=[-n(v,"initial")];eventTimes=[0];
        if(v.cash_action!=="No recurring cash flow") {
          const count=due(v)?Math.ceil(rawPeriods-1e-10):Math.floor(rawPeriods+1e-10);
          for(let index=0;index<count;index++){
            const time=(due(v)?index:index+1)/frequency;
            if(time===0)flows[0]+=cash;else{flows.push(cash);eventTimes.push(time);}
          }
        }
        if(Math.abs(eventTimes.at(-1)!-horizon)<1e-10)flows[flows.length-1]+=n(v,"ending");
        else {flows.push(n(v,"ending"));eventTimes.push(horizon);}
      } else {flows=[-n(v,"initial"),...parseNumbers(v.flows)];eventTimes=flows.map((_,i)=>i);}
      const roots = irr(flows,eventTimes);
      return {
        metrics: roots.map((r, i) =>
          metric(
            `Annual IRR ${i + 1}`,
            r * 100,
            "percent",
          ),
        ),
        columns: ["Period", "Time (years)", "Net cash flow"],
        rows: flows.map((x, i) => [i, eventTimes[i], x]),
        notes: [
          "All headline rates are effective annual IRRs. Initial investment is a positive amount entered here and is converted into a negative time-zero outflow. Subsequent negative flows represent additional investment; zeros preserve empty periods.",
          "The numerical search is bounded to approximately −99.9994% through 16,275,379% per year. Multiple or repeated roots can exist; detected roots are not a guarantee that every root was found. Nearly repeated roots are numerically sensitive. IRR is not ROI and does not measure risk.",
          ...(roots.length>1 ? ["Multiple IRRs were detected. There is no single unambiguous IRR for these cash flows; examine NPV and the complete cash-flow pattern."] : []),
          ...(id === "irregular" ? ["Unequal amounts are assumed to occur at year ends. For actual irregular dates, use the dated cash-flow mode in Average Return Calculator."] : [`Cash-flow frequency: ${v.cash_frequency}. Final value is received at the exact end of the holding period. For a partial final period, only recurring payment dates within the holding period are included; no prorated recurring payment is invented. Additional investment treats the entered periodic amount as an outflow. The no-recurring-flow selection ignores the periodic amount.`]),
        ],
      };
    },
  })),
  "Calculate internal rate of return from fixed or irregular cash flows.",
);
const payback = tool(
  "payback-period",
  ["fixed", "irregular"].map((id): Mode => ({
    id,
    title: id === "fixed" ? "Fixed Cash Flow" : "Irregular Cash Flows",
    fields: [
      num("initial", "Initial investment", 10000, "$"),
      num("discount", "Discount rate", 5, "%", -99),
      ...(id === "fixed"
        ? [
            num("annual", "Annual net cash flow", 3000, "$", -1e12),
            num("change", "Annual cash flow increase", 0, "", -1e12),
            select("change_unit", "Cash flow increase unit", [
              "Percent",
              "Dollars",
            ]),
            num("years", "Projection length", 10, "years", 1),
          ]
        : [area("flows", "Annual net cash flows", "2000, 3000, 4000, 5000")]),
    ],
    description: "Compare simple and discounted payback periods.",
    formula:
      "Find when cumulative (discounted) cash flow first recovers the initial investment.",
    calculate: (v) => {
      const a =
        id === "fixed"
          ? Array.from(
              { length: Math.min(1000, Math.round(n(v, "years"))) },
              (_, i) =>
                v.change_unit === "Dollars"
                  ? n(v, "annual") + n(v, "change") * i
                  : n(v, "annual") * (1 + pct(v, "change")) ** i,
            )
          : parseNumbers(v.flows);
      let c = -n(v, "initial"),
        d = c,
        pp: number | undefined,
        dp: number | undefined;
      const rows = a.map((x, i) => {
        const disc = x / (1 + pct(v, "discount")) ** (i + 1),
          old = c,
          od = d;
        c += x;
        d += disc;
        if (pp === undefined && c >= 0 && x > 0) pp = i - old / x;
        if (dp === undefined && d >= 0 && disc > 0) dp = i - od / disc;
        return [i + 1, x, c, disc, d];
      });
      return {
        metrics: [
          money("Net cash flow after investment", c),
          money("Net present value", d),
          ...(pp !== undefined ? [metric("Payback period (years)", pp)] : []),
          ...(dp !== undefined
            ? [metric("Discounted payback (years)", dp)]
            : []),
        ],
        columns: [
          "Year",
          "Cash flow",
          "Net cumulative",
          "Discounted cash flow",
          "Discounted cumulative",
        ],
        rows,
        notes: [
          ...(pp === undefined
            ? ["Investment is not recovered within the supplied cash flows."]
            : []),
          ...(dp === undefined
            ? [
                "Discounted investment is not recovered within the supplied cash flows.",
              ]
            : []),
        ],
      };
    },
  })),
  "Find the time required to recover an investment, with and without discounting.",
);
const pv = tool(
  "present-value",
  ["lump", "annuity"].map((id): Mode => ({
    id,
    title: id === "lump" ? "Future Lump Sum" : "Periodic Payments",
    fields: [
      num("future", "Future amount", 10000, "$"),
      num("periods", "Number of periods", 10, "", 0.001),
      num("rate", "Rate per period", 5, "%", -99),
      ...(id === "annuity"
        ? [num("payment", "Periodic payment", 1000, "$"), timingField()]
        : []),
    ],
    description: "Discount future cash flows to today’s value.",
    formula: "PV = FV/(1+r)^N + PMT × (1 − (1+r)^−N)/r.",
    calculate: (v) => {
      const r = pct(v, "rate"),
        N = n(v, "periods"),
        lump = n(v, "future") / (1 + r) ** N,
        a = id === "annuity" ? annuityPV(n(v, "payment"), r, N, due(v)) : 0;
      return {
        metrics: [
          money("Present value", lump + a),
          money("Lump-sum present value", lump),
          money("Payments present value", a),
        ],
      };
    },
  })),
  "Calculate the present value of a future amount or a payment stream.",
);
const fv = tool(
  "future-value",
  [
    {
      id: "growth",
      title: "Future Value",
      fields: [
        num("principal", "Starting amount", 10000, "$"),
        num("periods", "Number of periods", 10, "", 0),
        num("rate", "Rate per period", 5, "%", -99),
        num("payment", "Periodic deposit", 1000, "$"),
        timingField(),
      ],
      description:
        "Project a starting amount and regular deposits at a periodic rate.",
      formula: "FV = PV × (1+r)^N + PMT × ((1+r)^N−1)/r.",
      calculate: (v) => {
        const value = future(
            n(v, "principal"),
            n(v, "payment"),
            pct(v, "rate"),
            n(v, "periods"),
            due(v),
          ),
          contributed = n(v, "principal") + n(v, "payment") * n(v, "periods");
        return {
          metrics: [
            money("Future value", value),
            money("Total contributions", contributed),
            money("Interest earned", value - contributed),
          ],
        };
      },
    },
  ],
  "Calculate future value with periodic contributions.",
);
function bondPrice(
  face: number,
  coupon: number,
  yieldRate: number,
  years: number,
  f: number,
): number {
  const n = years * f;
  return (
    annuityPV((face * coupon) / f, yieldRate / f, n) +
    face / (1 + yieldRate / f) ** n
  );
}
const bondFields = () => [
  num("price", "Bond price", 950, "$"),
  num("face", "Face value", 1000, "$"),
  num("coupon", "Annual coupon", 5),
  select("coupon_unit", "Coupon unit", ["Percent", "Dollars"]),
  num("yield", "Annual yield", 6, "%", -99),
  num("years", "Years to maturity", 10, "years", 0.01),
  select(
    "frequency",
    "Coupon frequency",
    ["Annually", "Semiannually", "Quarterly", "Monthly"],
    "Semiannually",
  ),
];
const bond = tool(
  "bond",
  [
    ...["price", "face", "yield", "years", "coupon"].map((key): Mode => ({
      id: key,
      title: `Solve ${key === "years" ? "Maturity" : key[0].toUpperCase() + key.slice(1)}`,
      fields: bondFields().filter((f) => f.key !== key),
      description:
        "Price a fixed coupon bond from discounted coupons and redemption value.",
      formula: "Price = coupon × annuity factor + face/(1+y/f)^(years×f).",
      calculate: (v) => {
        const get = (k: string) => (k === key ? 0 : n(v, k)),
          f = freq(v.frequency),
          couponRate =
            v.coupon_unit === "Dollars" && key !== "face"
              ? get("coupon") / positive(get("face"), "Face value")
              : get("coupon") / 100;
        let value: number;
        if (key === "price")
          value = bondPrice(
            get("face"),
            couponRate,
            get("yield") / 100,
            get("years"),
            f,
          );
        else if (key === "face")
          value =
            v.coupon_unit === "Dollars"
              ? (get("price") -
                  annuityPV(
                    get("coupon") / f,
                    get("yield") / 100 / f,
                    get("years") * f,
                  )) *
                (1 + get("yield") / 100 / f) ** (get("years") * f)
              : get("price") /
                bondPrice(
                  1,
                  get("coupon") / 100,
                  get("yield") / 100,
                  get("years"),
                  f,
                );
        else if (key === "yield")
          value = bisect(
            (x) =>
              bondPrice(get("face"), couponRate, x / 100, get("years"), f) -
              get("price"),
            -50,
            200,
          );
        else if (key === "coupon")
          value =
            ((get("price") -
              get("face") /
                (1 + get("yield") / 100 / f) ** (get("years") * f)) /
              annuityPV(
                get("face") / f,
                get("yield") / 100 / f,
                get("years") * f,
              )) *
            100;
        else
          value = bisect(
            (x) =>
              bondPrice(get("face"), couponRate, get("yield") / 100, x, f) -
              get("price"),
            0.001,
            200,
          );
        if (key === "coupon" && v.coupon_unit === "Dollars")
          value *= get("face") / 100;
        return {
          metrics: [
            metric(
              key === "years" ? "Years to maturity" : key,
              value,
              key === "yield" ||
                (key === "coupon" && v.coupon_unit === "Percent")
                ? "percent"
                : key === "years"
                  ? "number"
                  : "money",
            ),
          ],
        };
      },
    })),
    {
      id: "dated",
      title: "Settlement-Date Pricing",
      fields: [
        ...bondFields().filter((f) => !["price", "years"].includes(f.key)),
        date("settlement", "Settlement date", "2026-10-19"),
        date("maturity", "Maturity date", "2036-10-19"),
        select("daycount", "Day-count convention", [
          "Actual/Actual",
          "30/360",
          "Actual/360",
          "Actual/365",
        ]),
      ],
      description:
        "Discount the remaining coupon schedule and separate accrued interest from clean price.",
      formula:
        "Dirty price discounts all remaining payments; clean price = dirty price − accrued coupon.",
      calculate: (v) => {
        const settlement = new Date(v.settlement + "T00:00:00Z"),
          maturity = new Date(v.maturity + "T00:00:00Z");
        datesYears(v.settlement, v.maturity);
        const f = freq(v.frequency),
          months = 12 / f;
        const maturityDay = maturity.getUTCDate(),
          monthEnd =
            maturityDay ===
            new Date(
              Date.UTC(
                maturity.getUTCFullYear(),
                maturity.getUTCMonth() + 1,
                0,
              ),
            ).getUTCDate();
        const couponDate = (offset: number) => {
          const first = new Date(
            Date.UTC(
              maturity.getUTCFullYear(),
              maturity.getUTCMonth() - offset * months,
              1,
            ),
          );
          const last = new Date(
            Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
          ).getUTCDate();
          first.setUTCDate(monthEnd ? last : Math.min(maturityDay, last));
          return first;
        };
        let offset = 0,
          next = couponDate(offset);
        const coupons: Date[] = [];
        while (next > settlement) {
          coupons.unshift(new Date(next));
          next = couponDate(++offset);
          if (coupons.length > 2000)
            throw new Error("Too many coupon periods.");
        }
        const previous = next,
          following = coupons[0];
        const actual = (a: Date, b: Date) => (+b - +a) / 86400000;
        const days = (a: Date, b: Date) =>
          v.daycount === "30/360"
            ? (b.getUTCFullYear() - a.getUTCFullYear()) * 360 +
              (b.getUTCMonth() - a.getUTCMonth()) * 30 +
              Math.min(b.getUTCDate(), 30) -
              Math.min(a.getUTCDate(), 30)
            : actual(a, b);
        const denom =
            v.daycount === "Actual/Actual"
              ? actual(previous, following)
              : v.daycount === "Actual/365"
                ? 365 / f
                : 360 / f,
          fraction = days(previous, settlement) / denom,
          first = days(settlement, following) / denom,
          coupon =
            (v.coupon_unit === "Dollars"
              ? n(v, "coupon")
              : n(v, "face") * pct(v, "coupon")) / f,
          r = pct(v, "yield") / f;
        const dirty = sum(
            coupons.map(
              (_, i) =>
                (coupon + (i === coupons.length - 1 ? n(v, "face") : 0)) /
                (1 + r) ** (i + first),
            ),
          ),
          accrued = coupon * fraction;
        return {
          metrics: [
            money("Clean price", dirty - accrued),
            money("Dirty price", dirty),
            money("Accrued interest", accrued),
            metric("Interest accrued days", days(previous, settlement)),
          ],
          notes: [
            "Regular coupon schedule, no ex-coupon period; unusual first/last coupons require separate treatment.",
          ],
        };
      },
    },
  ],
  "Price fixed-coupon bonds and solve for yield, maturity, face value, or coupon.",
);
export const investmentCalculators = [
  interest,
  investment,
  finance,
  compound,
  rateTool,
  savings,
  simple,
  cd,
  bond,
  mutual,
  average,
  irrTool,
  roi,
  payback,
  pv,
  fv,
];
export { growth };
