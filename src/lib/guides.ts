import semrushThirdEightFaq from './semrush-third-eight-faq-content.json';
import semrushNextEightFaq from './semrush-next-eight-faq-content.json';
import semrushEightFaq from './semrush-eight-faq-content.json';
import calculationPageRefresh from './calculation-page-refresh.json';
import stockContent from './stock-tool-content.json';
import propertyDealContent from './property-deal-content.json';
import priorityContent from './priority-two-content.json';
import rothLadderContent from './roth-ladder-content.json';
import dripContent from './drip-content.json';
import {motherPageIds,motherPageReviewedOn} from './mother-page-ui';
import motherPageContent from './mother-page-content.json';
import coveredCallContent from './covered-call-content.json';
import houseHackContent from './house-hacking-content.json';
import mortgageInvestContent from './mortgage-vs-invest-content.json';
import cashReturnContent from './cash-on-cash-content.json';
import brrrrContent from './brrrr-content.json';
import baristaContent from './barista-fire-content.json';
import rmdRefresh from './rmd-refresh-content.json';
import batchContent from './semrush-five-content.json';
import hsaContent from './hsa-content.json';
import debtStrategyContent from './debt-strategy-content.json';
import fireBudgetContent from './fire-budget-content.json';
import strategyContent from './strategy-tools-content.json';
import coastContent from './coast-fire-content.json';
import businessContent from './business-tool-content.json';
import refresh from "./researched-calculator-content.json";
import { calculatorPresetHref } from './preset-links';
import mortgageToolsGuides from "./mortgage-tools-guides.json";
import insightExamples from "./insight-examples.json";
import extendedGuides from "./extended-guides.json";
import { longTailContent, type LongTailLink } from "./long-tail-content";
export type WorkedExample = {
  title: string;
  mode: string;
  values: Record<string, string | number>;
  inputs: string;
  steps: string[];
  answer: string;
  expected: { label: string; value: number; tolerance?: number };
};
export type Guide = {
  checkedOn?: string;
  summary: string;
  scope: string;
  examples: WorkedExample[];
  questions: { question: string; answer: string; steps?: string[]; anchor?: string; links?: LongTailLink[] }[];
  sources: { title: string; url: string }[];
};
const investor = {
  title: "SEC Investor.gov: compound interest calculator and input definitions",
  url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
};
const amortization = {
  title: "CFPB: how amortization allocates principal and interest",
  url: "https://www.consumerfinance.gov/ask-cfpb/what-is-amortization-and-how-could-it-affect-my-auto-loan-en-771/",
};
const mortgageSource = {
  title: "CFPB: how paying down a mortgage works",
  url: "https://www.consumerfinance.gov/ask-cfpb/how-does-paying-down-a-mortgage-work-en-1943/",
};
export const notesCheckedOn = "2026-10-19";
export const guides: Record<string, Guide> = {
  ...(extendedGuides as unknown as Record<string, Guide>),
  vat: {
    summary:
      "VAT is calculated on the net price. Add VAT by multiplying the net price by 1 + rate/100. Remove VAT by dividing the gross price by the same factor.",
    scope:
      "Enter the applicable rate yourself. This tool solves one nonnegative price/rate relationship; it does not determine country-specific eligibility, exemptions or invoice-level rounding. Currency labels do not select a tax jurisdiction.",
    examples: [
      {
        title: "Add 20% VAT to a net price of 100",
        mode: "any-two",
        values: { rate: 20, net: 100, gross: "", tax: "" },
        inputs:
          "Net price 100; VAT rate 20%; leave gross price and tax amount blank.",
        steps: ["Tax = 100 × 20 / 100 = 20.", "Gross = 100 + 20 = 120."],
        answer: "The tax is 20 and the gross price is 120.",
        expected: { label: "Gross amount", value: 120 },
      },
      {
        title: "Remove 20% VAT from a gross price of 120",
        mode: "any-two",
        values: { rate: 20, net: "", gross: 120, tax: "" },
        inputs:
          "Gross price 120; VAT rate 20%; leave net price and tax amount blank.",
        steps: ["Net = 120 ÷ 1.20 = 100.", "Tax = 120 − 100 = 20."],
        answer:
          "The net price is 100. Subtracting 20% of 120 would give 96, which uses the wrong tax base.",
        expected: { label: "Net amount", value: 100 },
      },
      {
        title: "Find the rate from a gross price and tax amount",
        mode: "any-two",
        values: { rate: "", net: "", gross: 120, tax: 20 },
        inputs:
          "Gross price 120; tax amount 20; leave rate and net price blank.",
        steps: ["Net = 120 − 20 = 100.", "Rate = 20 ÷ 100 × 100 = 20%."],
        answer: "The implied VAT rate is 20%.",
        expected: { label: "VAT rate", value: 20 },
      },
    ],
    questions: [
      {
        question: "Which two fields can I enter?",
        answer:
          "Any pair of VAT rate, net price, gross price and tax amount. Leave the other two blank. All six combinations are supported when they determine a unique nonnegative answer.",
      },
      {
        question: "Can I use a zero VAT rate?",
        answer:
          "Yes. A zero rate and a known net or gross price determine zero tax. A zero rate and zero tax alone do not determine a price, so the calculator asks for a different pair.",
      },
      {
        question: "Why are some inputs rejected?",
        answer:
          "Gross price cannot be below net price for this nonnegative VAT model. Tax cannot exceed gross price. Two zero amounts without a known rate do not determine a unique rate. Clear empties all four fields.",
      },
    ],
    sources: [
      {
        title:
          "GOV.UK: VAT rates, including standard, reduced and zero-rated examples",
        url: "https://www.gov.uk/vat-rates",
      },
    ],
  },
  loan: {
    summary:
      "An amortizing loan has a regular payment that covers interest on the outstanding balance and repays principal. The payment depends on the amount borrowed, periodic rate and number of payments.",
    scope:
      "The amortized-loan example excludes fees, insurance and extra payments. Select matching payment and compounding frequencies; a quoted interest rate is not necessarily an all-in APR.",
    examples: [
      {
        title: "A 100,000 loan at 6% over 30 years",
        mode: "amortized",
        values: {
          principal: 100000,
          years: 30,
          months: 0,
          rate: 6,
          compound: "Monthly",
          pay: "Monthly",
        },
        inputs:
          "Principal $100,000; 30 years; 6% nominal annual rate; monthly compounding and payments.",
        steps: [
          "Monthly rate = 0.06 ÷ 12 = 0.005.",
          "Number of payments = 30 × 12 = 360.",
          "Payment = 100000 × 0.005 ÷ (1 − 1.005^(−360)).",
        ],
        answer:
          "The regular monthly payment is $599.55 before fees or insurance.",
        expected: { label: "Payment per period", value: 599.5505251527524 },
      },
    ],
    questions: [
      {
        question: "What happens at zero interest?",
        answer:
          "Without interest or fees, each regular payment is principal divided by the number of payments. A $12,000 loan over 12 monthly payments is $1,000 per month.",
      },
      {
        question: "Why is the final payment sometimes smaller?",
        answer:
          "The schedule caps the last payment at the outstanding principal plus that period’s interest, including when extra payments shorten the loan.",
      },
    ],
    sources: [amortization],
  },
  mortgage: {
    summary:
      "A mortgage payment can include principal and interest plus property taxes, insurance and other ownership costs. The principal-and-interest amount alone is not the total monthly housing cost.",
    scope:
      "Fixed-rate residential mortgage planning with U.S. housing-cost and PMI assumptions. Start with a home price and down payment, or enter a loan amount directly. For an existing loan, use the current balance, remaining term and actual PMI quote; past costs are excluded. Commercial mortgages, adjustable rates and interest-only phases require different models. This is an estimate rather than a lender quote.",
    examples: [
      {
        title: "Separate loan payment from ownership costs",
        mode: "monthly",
        values: {
          price: 125000,
          down: 20,
          down_unit: "Percent",
          years: 30,
          months: 0,
          rate: 6,
          tax: 0,
          insurance: 0,
          pmi: 0,
          hoa: 0,
          other: 0,
          extra_monthly: 0,
          extra_yearly: 0,
          extra_once: 0,
        },
        inputs:
          "Home price $125,000; 20% down; 30 years; 6% annual rate; all entered ownership costs and extra payments set to zero.",
        steps: [
          "Down payment = 125000 × 20% = 25000.",
          "Loan principal = 125000 − 25000 = 100000.",
          "At 6% nominal annual interest and 360 monthly payments, principal and interest is $599.55.",
        ],
        answer:
          "Monthly principal and interest is $599.55. Add the property’s actual taxes, insurance and fees to estimate total housing cash flow.",
        expected: {
          label: "Monthly principal & interest",
          value: 599.5505251527524,
        },
      },
    ],
    questions: [
      {
        question: "Does a larger down payment reduce the loan?",
        answer:
          "Yes. Holding the home price and other financing inputs constant, a larger down payment lowers the amount financed. It can also affect mortgage insurance eligibility.",
      },
      {
        question: "Are loan-year tables calendar-year tax records?",
        answer:
          "No. The yearly summary groups payments from the start of the loan and preserves each group’s closing balance. It is not a calendar-year tax statement.",
      },
    ],
    sources: [mortgageSource],
  },
  interest: {
    summary:
      "Compound growth earns interest on both the original amount and accumulated interest. Contribution timing, compounding frequency, tax and inflation can change the projected ending balance.",
    scope:
      "Returns are assumed constant. Positive interest is taxed using the entered planning rate; historical volatility, investment-specific tax rules and transaction fees are not inferred.",
    examples: [
      {
        title: "Grow 1,000 at 5% with no additions",
        mode: "accumulation",
        values: {
          principal: 1000,
          years: 10,
          months: 0,
          rate: 5,
          compound: "Annually",
          annual: 0,
          monthly: 0,
          tax: 0,
          inflation: 0,
        },
        inputs:
          "Starting amount $1,000; 5% annually compounded; 10 years; no deposits, taxes or inflation.",
        steps: [
          "Growth factor = 1.05^10.",
          "Ending balance = 1000 × 1.05^10 = 1628.8946…",
        ],
        answer: "The ending balance is $1,628.89; earnings are $628.89.",
        expected: { label: "Ending balance", value: 1628.8946267774414 },
      },
    ],
    questions: [
      {
        question: "Are nominal and effective annual rates the same?",
        answer:
          "They coincide with annual compounding. With more frequent compounding, a nominal annual rate generally produces a different effective annual yield.",
      },
      {
        question: "Do contributions at the beginning earn more interest?",
        answer:
          "At a positive return, a beginning-of-period contribution earns one more period of interest than the same contribution at period end.",
      },
    ],
    sources: [investor],
  },
  "compound-interest": {
    checkedOn: "2026-10-20",
    summary:
      "Use the compound interest calculator with monthly contributions to project a savings balance, total contributions and net earnings. The separate Equivalent Interest Rate mode preserves effective yield when converting quoted rates.",
    scope:
      "Growth uses a constant nominal annual rate and its selected compounding equivalent; monthly and annual contributions are distinct cash streams. Tax and inflation adjustments are simplified. The conversion mode instead changes the nominal rate to preserve effective yield. Neither mode guarantees returns.",
    examples: [
      {
        title: "Convert 5% nominal monthly compounding to an annual rate",
        mode: "conversion",
        values: { rate: 5, from: "Monthly", to: "Annually" },
        inputs:
          "Input interest rate 5%; input compounding Monthly; output compounding Annually.",
        steps: [
          "Monthly periodic rate = 0.05 ÷ 12.",
          "Effective annual yield = (1 + 0.05/12)^12 − 1.",
        ],
        answer:
          "The equivalent annually compounded rate is approximately 5.1162%.",
        expected: {
          label: "Equivalent interest rate",
          value: 5.1161897881733,
          tolerance: 0.000001,
        },
      },
    ],
    questions: [
      {
        question: "Where can I calculate compound growth with deposits?",
        answer:
          "Use Compound Growth on this page for starting money, monthly or annual contributions and a time horizon. Contribution timing controls whether deposits earn during their first period.",
      },
      {
        question: "Does changing the frequency create extra return here?",
        answer:
          "In Equivalent Interest Rate mode, the quoted rate changes to preserve yield. In Compound Growth mode, changing compounding while holding the nominal rate fixed can change growth. These are different questions.",
      },
    ],
    sources: [investor],
  },
  retirement: {
    checkedOn: "2026-10-20",
    summary:
      "A retirement savings plan depends on the target balance, current savings, time to retirement and assumed return. Monthly deposits and a single year-end deposit are different funding schedules.",
    scope:
      "The saving-plan example uses an effective annual return and end-of-month deposits. Future returns are uncertain; the selected model’s inflation and withdrawal timing are stated separately.",
    examples: [
      {
        title: "Keep annual deposits separate from monthly savings",
        mode: "withdrawal",
        values: {age: 65, retire: 67, life: 77, balance: 0, saving: 0, annual: 1000, return: 6, inflation: 0},
        inputs: "Age 65; retire at 67; no current balance or monthly deposits; add $1,000 at each year end; effective annual return 6%.",
        steps: ["First year-end deposit grows for one year: 1000 × 1.06 = 1060.", "Second year-end deposit adds 1000 at retirement: 1060 + 1000 = 2060."],
        answer: "The balance at retirement is $2,060. Annual deposits are additional to monthly deposits, not an alternative way to enter the same money.",
        expected: {label: "Balance at retirement", value: 2060},
      },
      {
        title: "Save from age 35 to 67 toward 600,000",
        mode: "saving",
        values: {
          age: 35,
          retire: 67,
          target: 600000,
          balance: 30000,
          return: 6,
        },
        inputs:
          "Age 35; retirement age 67; target $600,000; current savings $30,000; effective annual return 6%.",
        steps: [
          "Saving horizon = 32 years = 384 monthly deposits.",
          "Convert the 6% effective annual return to a monthly rate: 1.06^(1/12) − 1.",
          "Current savings grow to $193,601.60. End-of-month deposits fund the remaining target.",
        ],
        answer:
          "Required monthly saving is $362.74. Twelve monthly deposits total $4,352.89 per year; the alternative single year-end deposit is $4,471.33.",
        expected: {
          label: "Required monthly saving",
          value: 362.7406004461587,
        },
      },
    ],
    questions: [
      {question: "How do annual and monthly contributions differ?", answer: "In Monthly Withdrawal, monthly deposits are made at each month end and the separate annual amount is deposited at each year end before retirement. Enter only genuinely additional annual deposits to avoid double counting."},
      {
        question: "Should I pay both the monthly and annual plan?",
        answer:
          "No. The monthly plan and single year-end annual deposit are alternatives. The annual total of monthly savings merely adds twelve monthly payments.",
      },
      {
        question: "What does an inflation-adjusted balance mean?",
        answer:
          "It expresses a future nominal amount in the purchasing power of the reference date, using the entered constant inflation assumption.",
      },
    ],
    sources: [investor],
  },
  "401k": {
    checkedOn: "2026-10-20",
    summary:
      "The 401(k) projection iterates one saving year at a time: apply annual return to the opening balance, add employee and employer contributions at year end, then increase salary. A separate schedule illustrates inflation-indexed withdrawals during retirement.",
    scope:
      "Future years use fixed 2026 employee limits with age-based catch-up. The projection applies the 2026 $72,000 annual-additions cap excluding employee catch-up and the $360,000 employer matching compensation cap. It does not project future legal changes, other employers’ contributions or all plan-specific limits. A separate before-tax retirement schedule uses month-end withdrawals that increase monthly with inflation and target depletion at life expectancy; it does not enforce RMD rules.",
    examples: [
      {
        title: "Withdraw a retirement balance over one year",
        mode: "projection",
        values: {age: 67, retire: 67, life: 68, balance: 12000, return: 0, inflation: 0},
        inputs: "Already retired at age 67; life expectancy 68; balance $12,000; return and inflation both 0%.",
        steps: ["The remaining retirement horizon is 12 months.", "No interest or inflation: 12000 ÷ 12 = 1000 at each month end."],
        answer: "Initial monthly retirement withdrawal is $1,000 before tax; the illustrated ending balance is zero after one year.",
        expected: {label: "Initial monthly retirement withdrawal", value: 1000},
      },
      {
        title: "Find a steady contribution window for a two-tier match",
        mode: "match",
        values: {age: 35, salary: 80000, match1: 100, limit1: 3, match2: 50, limit2: 2},
        inputs: "Age 35; salary $80,000; match 100% on the first 3%, then 50% on the next 2%; fixed 2026 employee limit $24,500.",
        steps: ["Minimum for the full match is 3% + 2% = 5% of salary.", "Maximum steady rate without reaching the annual employee limit early is 24500 ÷ 80000 × 100 = 30.625%.", "The annual employer match is 80000 × 3% + 80000 × 2% × 50% = 3200."],
        answer: "Under equal-pay, full-year and no-true-up assumptions, a steady election between 5% and 30.625% earns the modeled full match.",
        expected: {label: "Minimum contribution rate for full match", value: 5},
      },
      {
        title: "Understand the first year of a 401(k) projection",
        mode: "projection",
        values: {
          age: 35,
          retire: 36,
          life: 90,
          salary: 80000,
          balance: 100000,
          contribution: 10,
          match: 50,
          match_limit: 3,
          salary_growth: 3,
          return: 6,
          inflation: 3,
        },
        inputs:
          "Starting balance $100,000; salary $80,000; employee contribution 10%; employer matches 50% of contributions up to 3% of salary; annual return 6%.",
        steps: [
          "Employee contribution = 80000 × 10% = 8000.",
          "Employer contribution = min(8000, 80000 × 3%) × 50% = 1200.",
          "Year-end balance = 100000 × 1.06 + 8000 + 1200 = 115200.",
        ],
        answer:
          "The first year ends with $115,200. The employee contribution is $8,000 and the employer contribution is $1,200.",
        expected: { label: "Projected 401(k) balance", value: 115200 },
      },
    ],
    questions: [
      {question: "Why does life expectancy change the retirement withdrawal?", answer: "It sets the number of retirement months. A longer retirement usually requires a smaller initial withdrawal from the same balance. The retirement-date balance is unchanged; the separate withdrawal schedule changes."},
      {question: "What if the annual limit prevents the full employer match?", answer: "The calculator reports that no full-match contribution-rate window exists and shows the partial match at the employee limit. The window assumes equal pay, per-pay-period matching and no annual true-up. Your plan can apply additional limits."},
      {
        question: "What is Starting balance plus employee contributions?",
        answer:
          "It is the entered starting balance plus future annually calculated employee contributions. Future employer contributions and future investment returns are excluded. The starting balance itself may already contain earlier employer money and returns.",
      },
      {
        question: "Does a 50% match with a 3% limit mean the employer pays 3%?",
        answer:
          "No. In this model the employer matches half of eligible employee contributions up to 3% of salary, so the maximum match is 1.5% of salary before other plan limits.",
      },
    ],
    sources: [
      {
        title:
          "IRS: 2026 retirement contribution limits and age-based catch-up",
        url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits",
      },
    ],
  },
  "income-tax": {
    summary:
      "Start by choosing your tax year and filing status. Enter your income, deductions and credits. The calculator estimates federal income tax under the selected rules. Some types of income, such as eligible long-term gains, use different tax rates.",
    scope:
      "This tool covers selected federal rules for 2025 and 2026. It does not prepare a full tax return or calculate state and local income tax. Qualified business income (QBI) is income that may qualify for a business deduction. Alternative minimum tax (AMT) is a separate tax calculation. Check the stated limits for these rules, tax credits, separate returns and special income.",
    examples: [
      {
        title: "A basic 2026 single wage-earner estimate",
        mode: "federal",
        values: { year: "2026", filing: "Single", wages: 80000 },
        inputs:
          "2026; Single; $80,000 wages; no additional income, deductions or credits; under age 65.",
        steps: [
          "Standard deduction = 16100; taxable income = 80000 − 16100 = 63900.",
          "Tax = 12400 × 10% + (50400 − 12400) × 12% + (63900 − 50400) × 22%.",
        ],
        answer:
          "Estimated federal income tax is $8,770. Employee Social Security and Medicare are separate payroll taxes.",
        expected: { label: "Estimated federal income tax", value: 8770 },
      },
    ],
    questions: [
      {
        question: "Is my marginal rate applied to all income?",
        answer:
          "No. Each slice of ordinary taxable income uses the rate for that bracket. Your top rate does not apply to every dollar. Some investment income uses special rates. Tax credits can also reduce the final amount.",
      },
      {
        question: "Is annual tax the same as paycheck withholding?",
        answer:
          "No. Your tax liability is the tax owed for the year. Withholding is tax already taken from your pay. Payroll rules and your withholding choices affect that amount.",
      },
    ],
    sources: [
      {
        title:
          "IRS: Revenue Procedure 2025-32 and 2026 inflation-adjusted tax parameters",
        url: "https://www.irs.gov/irb/2025-45_IRB",
      },
      {
        title: "IRS: Schedule 1-A qualified deductions",
        url: "https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf",
      },
    ],
  },
  rmd: {
    summary:
      "An owner-account RMD generally divides the previous December 31 balance by the applicable IRS distribution period. The selected table depends on account and beneficiary circumstances.",
    scope:
      "This implementation supports owner accounts and current life-expectancy tables for distribution years 2022 onward. Inherited-account rules, employer still-working exceptions and all deadline choices are not modeled. The joint table requires a qualifying sole-beneficiary spouse more than ten years younger.",
    examples: [
      {
        title: "Uniform Lifetime Table example at age 75",
        mode: "annual",
        values: {
          birth: 1951,
          year: 2026,
          balance: 500000,
          spouse: "No",
          return: 5,
          projection: 1,
        },
        inputs:
          "Born 1951; distribution year 2026; prior December 31 balance $500,000; Uniform Lifetime Table.",
        steps: [
          "Age in the distribution year = 2026 − 1951 = 75.",
          "Uniform Lifetime Table divisor at age 75 = 24.6.",
          "RMD = 500000 ÷ 24.6.",
        ],
        answer: "The annual RMD is $20,325.20 under this table selection.",
        expected: { label: "Annual RMD", value: 20325.20325203252 },
      },
    ],
    questions: [
      {
        question: "Does the current year’s return change this year’s RMD?",
        answer:
          "The selected year’s owner-account RMD uses the prior year-end balance. The return assumption affects projected future balances under this model’s year-end withdrawal timing.",
      },
      {
        question: "Why are years before 2022 rejected?",
        answer:
          "The implemented IRS life-expectancy factors became effective in 2022. Earlier distribution years need historical tables and potentially relief rules.",
      },
    ],
    sources: [
      {
        title:
          "IRS Publication 590-B: distribution tables and owner-account rules",
        url: "https://www.irs.gov/publications/p590b",
      },
    ],
  },
  irr: {
    checkedOn: "2026-10-20",
    summary:
      "The internal rate of return is a discount rate that makes the net present value of the entered cash flows zero. Cash-flow timing matters, so equal total profits can produce different IRRs.",
    scope:
      "The unequal-flow form uses successive year ends, not arbitrary dates. Fixed-flow rates are converted to effective annual rates from the selected payment period. The numerical search is bounded, and nearly repeated roots are sensitive to rounding; detected roots do not guarantee every root was found.",
    examples: [
      {
        title: "A 40,000 investment with three annual inflows",
        mode: "irregular",
        values: { initial: 40000, flows: "10000, 20000, 30000" },
        inputs:
          "Initial investment $40,000; year-end inflows $10,000, $20,000 and $30,000.",
        steps: [
          "Solve −40000 + 10000/(1+r) + 20000/(1+r)^2 + 30000/(1+r)^3 = 0.",
        ],
        answer: "The detected annual IRR is approximately 19.438%.",
        expected: { label: "Annual IRR 1", value: 19.438, tolerance: 0.0005 },
      },
    ],
    questions: [
      {
        question: "Can an investment have more than one IRR?",
        answer:
          "Yes. Cash flows that change sign more than once can produce multiple solutions. Examine the cash flows and NPV rather than treating a single rate as a complete investment recommendation.",
      },
      {
        question: "Does IRR include risk?",
        answer:
          "No. It summarizes the cash-flow pattern entered. It does not establish that forecast cash flows are reliable or account for risk by itself.",
      },
    ],
    sources: [
      {
        title:
          "Calculation methodology and cash-flow model scope",
        url: "/methodology.html#model-scope",
      },
    ],
  },
};

guides.irr.examples.push({title:"Monthly cash-flow periods, annual IRR",mode:"fixed",values:{initial:100,years:1,inflow:0,cash_frequency:"Monthly",ending:121,timing:"End of period"},inputs:"Invest 100 USD at time zero, receive 121 at the end of one year, and use twelve monthly periods with no interim flows.",steps:["The monthly rate solves 100 × (1+r)^12 = 121.","Effective annual IRR = (1+r)^12 − 1 = 121/100 − 1 = 21%."],answer:"Annual IRR is 21%; this is not a 21% monthly return.",expected:{label:"Annual IRR 1",value:21,tolerance:0.00005}},{title:"A cash-flow pattern with two IRRs",mode:"irregular",values:{initial:100,flows:"230, -132"},inputs:"Initial outflow 100 USD, year-one inflow 230, year-two outflow 132.",steps:["NPV = −100 + 230/(1+r) − 132/(1+r)^2.","At 10%: −100 + 230/1.1 − 132/1.1² = 0.","At 20% the same NPV is also zero; neither root alone is an unambiguous investment ranking."],answer:"The calculator detects annual IRRs of 10% and 20%.",expected:{label:"Annual IRR 1",value:10,tolerance:0.00005}});
guides.irr.questions.push({question:"Is this IRR result annual or monthly?",answer:"Headline results are effective annual rates. Cash-flow dates are expressed in years and the solver finds an annual discount rate. For regularly spaced monthly flows this is equivalent to compounding a monthly rate, not multiplying it by twelve."},{question:"Can I enter cash flows on irregular dates?",answer:"Recurring flows follow the selected frequency; an additional terminal value is received at the exact holding date, including a partial final period. For freely chosen calendar dates, use the dated cash-flow mode of Average Return Calculator. Keep zero entries for empty years in the unequal annual form."});
guides.irr.sources.push({title:"Dated cash-flow return calculator",url:calculatorPresetHref('/average-return-calculator.html','cashflows')});

const compoundMonthlyRate = 0.05/12;
const compoundMonthFactor = (1+compoundMonthlyRate)**12;
guides["compound-interest"].checkedOn = "2026-10-25";
guides["compound-interest"].examples.unshift({
  title:"Compound growth with monthly contributions", mode:"growth",
  values:{principal:1000,years:1,months:0,rate:5,compound:"Monthly",annual:0,monthly:100,timing:"End of period",tax:0,inflation:0},
  inputs:"Start with 1,000 USD; deposit 100 at each month end for one year; 5% nominal annual rate compounded monthly; no tax or inflation adjustment.",
  steps:["Monthly rate is 0.05 / 12.","Ending balance = 1,000 × (1+0.05/12)^12 + 100 × ((1+0.05/12)^12 − 1)/(0.05/12)."],
  answer:"Ending balance is approximately 2,279.05 USD; total contributions are 2,200 USD.",
  expected:{label:"Ending balance",value:1000*compoundMonthFactor+100*(compoundMonthFactor-1)/compoundMonthlyRate,tolerance:0.005},
});

export const relatedCalculatorIds: Record<string, string[]> = {
  vat: ["sales-tax", "discount", "margin", "commission"],
  mortgage: [
    "amortization",
    "mortgage-payoff",
    "house-affordability",
    "refinance",
    "apr",
    "rent-vs-buy",
  ],
  loan: ["payment", "repayment", "interest-rate", "apr", "debt-consolidation"],
  interest: [
    "compound-interest",
    "savings",
    "investment",
    "future-value",
    "present-value",
  ],
  "compound-interest": [
    "interest",
    "savings",
    "investment",
    "future-value",
    "simple-interest",
  ],
  retirement: [
    "401k",
    "ira",
    "roth-ira",
    "annuity-payout",
    "social-security",
    "rmd",
  ],
  "401k": ["retirement", "ira", "roth-ira", "income-tax", "rmd"],
  "income-tax": [
    "take-home-paycheck",
    "salary",
    "marriage-tax",
    "estate-tax",
    "401k",
  ],
  rmd: ["ira", "roth-ira", "401k", "retirement", "annuity-payout"],
  irr: ["roi", "payback-period", "average-return", "investment"],
};

// Current independent arithmetic examples for newly exposed source-style controls.
guides["take-home-paycheck"].examples.push({title:"A simple paycheck from one job",mode:"source-paycheck",values:{salary:12000,pretax:0,state_rate:0,local_rate:0,pay_frequency:"Monthly"},inputs:"Single, $12,000 annual job income; no payroll deductions, other jobs, dependents or state/city tax; monthly pay.",steps:["Income is below the 2026 single standard deduction, so estimated federal income tax is zero.","Employee Social Security is 12000 × 6.2% = 744; Medicare is 12000 × 1.45% = 174.","Monthly net = (12000 − 744 − 174) / 12 = 923.50."],answer:"Estimated monthly take-home pay is $923.50 under the stated annual-tax allocation model.",expected:{label:"Take-home pay per period",value:923.5}});
guides.commission.examples.push({title:"Find a missing commission rate",mode:"any-two",values:{sales:1000,commission:75,rate:""},inputs:"Sales amount $1,000 and commission $75; leave the rate blank.",steps:["Rate = commission / sales × 100.","75 / 1000 × 100 = 7.5%."],answer:"The commission rate is 7.5%.",expected:{label:"Commission rate",value:7.5}});
guides.irr.examples.push({title:"Annualize a six-month investment without interim flows",mode:"fixed",values:{initial:100,years:0,months:6,ending:121,cash_action:"No recurring cash flow"},inputs:"Invest $100 and receive $121 after six months, with no recurring cash flow.",steps:["Holding period is 6/12 = 0.5 years.","Annual IRR solves 100 = 121/(1+r)^0.5, so r = 1.21² − 1 = 46.41%."],answer:"Effective annual IRR is 46.41%; the actual six-month gain is 21%.",expected:{label:"Annual IRR 1",value:46.41}});
guides["house-affordability"].examples.push({title:"Use a dollar down payment and fixed housing costs",mode:"budget",values:{budget:2000,down:20000,down_unit:"Dollars",years:10,rate:0,tax_rate:2400,tax_unit:"Dollars per year",insurance:1200,insurance_unit:"Dollars per year",hoa:100,hoa_unit:"Dollars per month",maintenance:600,maintenance_unit:"Dollars per year"},inputs:"Monthly budget $2,000; $20,000 down; ten-year zero-interest loan; annual tax $2,400, insurance $1,200 and maintenance $600; monthly HOA $100.",steps:["Fixed monthly costs = 200 + 100 + 50 + 100 = 450.","Mortgage budget = 2000 − 450 = 1550; loan amount = 1550 × 120 = 186000.","Home price = 186000 + 20000 = 206000."],answer:"The modeled home price is $206,000; this is a budget calculation, not a lender approval.",expected:{label:"Estimated home price",value:206000}});

// Task-oriented links complement the existing, individually curated recommendations.
const relatedClusters = [
  ["house-affordability","down-payment","rent","debt-to-income-ratio","mortgage","fha-loan","va-mortgage"],
  ["refinance","mortgage-payoff","amortization","apr","home-equity-loan","heloc"],
  ["rental-property","rent-vs-buy","roi","payback-period"],
  ["auto-loan","cash-back-or-low-interest","auto-lease","boat-loan","lease"],
  ["interest","investment","savings","compound-interest","cd","simple-interest"],
  ["bond","mutual-fund","average-return","irr","roi","finance","present-value","future-value"],
  ["retirement","401k","pension","social-security","annuity","annuity-payout","ira","roth-ira","rmd"],
  ["income-tax","take-home-paycheck","salary","marriage-tax","estate-tax","budget"],
  ["loan","payment","repayment","interest-rate","business-loan","personal-loan","student-loan","college-cost"],
  ["credit-card","credit-cards-payoff","debt-payoff","debt-consolidation","budget"],
  ["vat","sales-tax","discount","margin","commission","percentage"],
  ["currency","inflation","interest","future-value"],
  ["depreciation","business-loan","margin","budget"],
  ["tip-bill-split","percentage","sales-tax","discount"],
  ["date","unit-converter","scientific","percentage"],
];
for (const cluster of relatedClusters) for (const id of cluster) {
  if (!relatedCalculatorIds[id]) relatedCalculatorIds[id] = cluster.filter(other=>other!==id).slice(0,5);
}

// Specific answers reflect the current local model; no external review is implied.
const clarifiedQuestions: Record<string, {question:string;answer:string}> = {
  retirement: {question:"What if I am already at my retirement age?",answer:"In Required Savings, set current age equal to retirement age. There is no remaining saving period, so the result shows Additional savings needed now rather than a zero monthly saving requirement. A shortfall is the target retirement balance minus existing savings, with a minimum of zero."},
  '401k': {question:"Does the employee contribution total include my current 401(k) balance?",answer:"Employee contributions means new employee deposits over the projection. Starting 401(k) balance is separate, and Starting balance plus employee contributions combines them once. Employer matching and investment earnings are separate components. Future projections hold the stated 2026 limits fixed."},
  'mortgage-payoff': {question:"Do extra mortgage payments reduce property taxes and insurance?",answer:"The payoff comparison models loan principal and interest. Extra principal can reduce future interest and shorten payoff time, but property taxes and homeowners insurance do not disappear when the mortgage is repaid. Lender prepayment penalties and accrued daily payoff interest are excluded."},
  repayment: {question:"When is a one-time extra loan payment applied?",answer:"Enter a whole payment month. Month 1 is the first scheduled payment in the projection. Extra payments are capped at the remaining principal and that period's interest; payments scheduled after payoff have no effect. The model does not include prepayment penalties."},
  currency: {question:"Does this currency converter work without a live exchange-rate API?",answer:"Yes. Custom Exchange Rate uses the rate you enter; Saved Reference Rates uses historical data bundled with the site and displays its dates. Neither mode requests external data. Snapshots do not update automatically and do not represent an executable bank quote; BTC conversion requires a manual rate."},
  'take-home-paycheck': {question:"Will this estimate exactly match my employer's tax withholding?",answer:"Not necessarily. This tool allocates estimated annual federal income tax to the entered job and pay frequency. It does not implement the complete IRS Publication 15-T payroll withholding procedure. W-4 elections, year-to-date payroll, benefit treatment and employer rounding can change an actual paycheck."},
};
for (const [id,question] of Object.entries(clarifiedQuestions)) {
  guides[id].questions.push(question);
  guides[id].checkedOn = "2026-10-21";
}

guides['debt-payoff'].questions.push({question:'What is the difference between debt snowball and debt avalanche?',answer:'Both pay the entered minimum on every debt first. Snowball applies extra money to the smallest remaining balance, while avalanche applies it to the highest APR. This implementation ranks balances after monthly interest and minimum payments. Choose the separate mode to calculate either plan; snowball is not guaranteed to minimize interest.'});
guides.margin.questions.push({question:'Is a 25% markup the same as a 25% profit margin?',answer:'No. At a cost of $100, a 25% markup gives a $125 selling price and $25 profit. Gross margin is $25 divided by $125, or 20%. Use Markup from Cost to price from a markup percentage; use the profit modes to solve from revenue and cost.'});
guides.savings.questions.push({question:'Can I use this as a high yield savings calculator?',answer:'Yes, with an interest rate and compounding frequency you enter. The calculator does not fetch current account rates, compare banks or recommend a product. APY is an effective annual yield; a quoted nominal rate with a compounding frequency is a different input convention.'});
guides['debt-payoff'].examples.push({title:'Pay the smallest balance first with a debt snowball',mode:'snowball',values:{debts:'Small, 100, 10, 0\nLarge, 1000, 100, 12',extra:100,yearly:0,once:0,once_month:1,rollover:'Yes'},inputs:'Two debts: $100 at 0% APR with a $10 minimum, and $1,000 at 12% APR with a $100 minimum. Add $100 per month and roll freed payments forward.',steps:['The first month adds $10 interest to the larger debt.','Pay minimums of $10 and $100, then clear the remaining $90 of the small debt.','The final $10 of extra money goes to the larger debt; balances are $0 and $900 after month one.','Subsequent balances are $699, $495.99, $290.9499 and $83.859399; the last payment is $84.69799299.'],answer:'First-month payment is $210 and the combined ending balance is $900.',expected:{label:'Total paid',value:1134.69799299,tolerance:.01}});
guides.margin.examples.push({title:'Convert a markup on cost into selling price and margin',mode:'markup',values:{cost:100,markup:25},inputs:'Cost $100 and markup 25%.',steps:['Profit = 100 × 25% = 25.','Selling price = 100 + 25 = 125.','Gross margin = 25 ÷ 125 = 20%.'],answer:'Selling price is $125; markup is 25%, while gross margin is 20%.',expected:{label:'Selling price',value:125}});
for(const id of ['debt-payoff','margin','savings'])if((guides[id].checkedOn ?? '') < '2026-10-21')guides[id].checkedOn='2026-10-21';

for (const {calculator,...example} of insightExamples) guides[calculator].examples.push({...example,values:Object.fromEntries(Object.entries(example.values).filter(([,value])=>value!==undefined))});

Object.assign(relatedCalculatorIds,{"markup": ["margin", "break-even", "commission", "sales-tax"], "cagr": ["average-return", "irr", "investment", "real-return"], "emergency-fund": ["savings", "budget", "interest", "retirement"], "break-even": ["markup", "margin", "business-loan"], "investment-fee": ["mutual-fund", "investment", "cagr", "real-return"], "real-return": ["inflation", "cagr", "investment-fee", "savings"]});

relatedCalculatorIds.inflation = [...new Set([...(relatedCalculatorIds.inflation??[]),"real-return"])];
relatedCalculatorIds.margin = [...new Set([...(relatedCalculatorIds.margin??[]),"markup","break-even"])];
relatedCalculatorIds["mutual-fund"] = [...new Set([...(relatedCalculatorIds["mutual-fund"]??[]),"investment-fee"])];

// Reviewed repairs to the shared U.S. tax rules.
for (const id of ["income-tax", "take-home-paycheck", "marriage-tax"]) guides[id].checkedOn = "2026-10-25";

// Reviewed policy conditions; no new jurisdiction or full-return engine implied.
guides['income-tax'].questions.push(
  {question:'Does net rental income enter the 3.8% NIIT calculation?',answer:'NIIT means Net Investment Income Tax. It is an extra 3.8% federal tax that can apply to investment income. Select Yes to include eligible net rental, royalty and passive income in this calculation. Enter income after allowed expenses and loss limits. Select No only when an exclusion applies. Ordinary retirement distributions and unrelated other income are not automatically treated as net investment income.'},
  {question:'What if my spouse itemizes on a separate return?',answer:'Choose Married filing separately and answer Yes if your spouse itemizes deductions. You then cannot use the standard deduction. The model uses your own eligible itemized deductions instead. Whether you lived apart all year is a separate question.'},
  {question:'When does the 2026 $400 minimum QBI deduction apply?',answer:'QBI means qualified business income. Select the simplified QBI deduction. Indicate material participation only if you meet that requirement for an eligible active business. The model subtracts half of regular self-employment tax from eligible net active QBI. It checks that amount against the $1,000 threshold. For qualifying cases in 2026, it uses the larger of $400 or the modeled deduction. Other QBI adjustments, income-based business limits and eligibility rules still need separate review.'}
);
guides['income-tax'].sources.push(
  {title:'IRS: NIIT income, deductions and exclusions',url:'https://www.irs.gov/newsroom/questions-and-answers-on-the-net-investment-income-tax'},
  {title:'IRS: MFS special AMTI increase',url:'https://www.irs.gov/instructions/i6251'},
  {title:'26 USC 55: year-specific AMT rules',url:'https://uscode.house.gov/us/usc/119-118/t26/s55/'},
  {title:'26 USC 199A: minimum deduction for active QBI',url:'https://uscode.house.gov/us/usc/119-120/t26/s199A/'}
);
guides['va-mortgage'].scope='Ordinary U.S. VA purchase loans only, using the funding-fee table effective April 7, 2023. It does not establish entitlement, exemption eligibility or loan approval; refinancing and other VA loan types require different fee rules.';
guides['va-mortgage'].questions.push({question:'Does prior VA use only for a manufactured home count as subsequent use?',answer:'VA keeps first-use funding-fee rates when your only prior use was to purchase a manufactured home. Choose Only a manufactured home in Previous VA loan use. Other prior use selects the regular subsequent-use branch; exemption is checked separately.'});
guides['va-mortgage'].sources.push({title:'VA: purchase funding-fee rates, exemptions and prior manufactured-home use',url:'https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/'});
guides['social-security'].scope='Simplified U.S. individual retirement planning. Ideal-age PIA is quoted in age 62 dollars with a nominal discount rate; assumed COLA applies while waiting and after claiming. Compare mode instead uses nominal claim-date benefit quotes and adds COLA only after each starts. Work-history, earnings-test, spouse and survivor coordination are not modeled.';
guides['social-security'].questions.push({question:'Does COLA apply while I wait to claim Social Security?',answer:'SSA applies relevant COLAs after age 62 even before claiming. Ideal Application Age therefore grows a common age 62-dollar PIA during the wait and after claiming using your assumed annual COLA. For actual benefit quotes already expressed at each claiming date, use Compare Application Ages and do not add waiting-period inflation twice.'});
guides['social-security'].sources.push({title:'SSA: retirement benefit factors and COLA before claiming',url:'https://www.ssa.gov/policy/docs/statcomps/supplement/2025/apnc.html'});
guides.rmd.scope='Traditional IRA and other eligible non-Roth owner accounts, using the stated IRS tables for 2022 onward. Roth IRA owner balances and designated Roth plan balances for 2024 onward have no owner lifetime RMD and must not be entered here. Inherited accounts, still-working employer-plan deferrals and all deadline choices are not modeled.';
guides.rmd.questions.push({question:'Should I enter my Roth IRA or Roth 401(k) balance here?',answer:'No. Roth IRA owners have no lifetime RMD, and designated Roth plan accounts have no owner lifetime RMD for 2024 onward. This owner-account model is for eligible non-Roth balances. Inherited Roth accounts have different rules and are excluded.'});
guides.rmd.sources.push({title:'IRS: RMD account types and Roth exclusions',url:'https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs'});
guides['401k'].questions.push({question:'Can all 2026 catch-up contributions be pre-tax?',answer:'No. Catch-up generally must be Roth when prior-year FICA wages with the same plan sponsor exceeded $150,000. The modeled employee limit combines traditional and Roth deferrals, and this before-tax projection does not split their tax treatment. IRS annual eligibility uses calendar-year-end age; align your entered age and plan rules when checking a contribution limit.'});
guides['401k'].sources.push({title:'IRS: 2026 Roth catch-up requirements',url:'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-catch-up-contributions'});
guides.mortgage.questions.push({question:'Is cancellation at 80% LTV the same as automatic PMI termination?',answer:'No. The 80% option assumes a borrower-requested cancellation is approved. The separate automatic termination rule generally uses 78% of original value on the original payment schedule and requires payments to be current. This calculator does not automatically determine those conditions or midpoint termination.'});
guides.mortgage.sources.push({title:'CFPB: requested PMI cancellation and automatic termination',url:'https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/'});
guides.mortgage.questions.push(
  {question:'Which home value is used for the 80% PMI option?',answer:'For a purchase loan, original value is the lower of the purchase price and appraisal at purchase. Enter that original appraisal when it is below the price; leaving it blank assumes it is at least the price. This option assumes borrower-requested cancellation is approved and does not use a current market appraisal.'},
  {question:'What happens if my down payment covers the whole purchase price?',answer:'Both monthly and biweekly modes show that no mortgage loan is needed. Entered property tax, home insurance, HOA and other ownership costs still appear as initial monthly and annual amounts. There is no amortization schedule or loan-interest saving, and the calculator does not infer a lifetime ownership-cost total.'},
  {question:'Can I enter a partial year or a dated extra principal payment?',answer:'A partial year is allowed when years × 12 + months is a whole number of months; for example, 1.5 years is 18 months. Each dated extra-payment row must contain exactly two nonempty comma-separated values: payment month, amount. Enter 1,1000 for an extra 1000 in month 1, without thousands separators. Multiple valid rows for the same month are added together.'}
);
for(const id of ['va-mortgage','social-security','rmd','401k','mortgage'])guides[id].checkedOn='2026-10-25';
guides.mortgage.questions.push({question:'Does PMI automatically change with my down payment?',answer:'Yes. Monthly Mortgage defaults to Automatic estimate. It uses original LTV, the selected credit score range and loan term with National MI Monthly Advantage base rates effective March 1, 2022, reviewed October 26, 2026. For a 400,000 purchase, 30-year fixed loan and assumed credit score 740–759, 4% down estimates 224 per month at 0.70% annually; 15% down estimates about 56.67 per month at 0.20%. Actual lender pricing and eligibility may differ. Select Manual for your actual quote. Homeowners insurance is a separate expense.'});
guides.mortgage.questions.push({question:'What assumptions does automatic PMI use?',answer:'It is an illustrative unadjusted borrower-paid monthly base-rate estimate for a fixed-rate, one-unit primary-residence purchase, standard agency coverage, up to two borrowers and DTI at most 45%. The default credit score assumption is 740–759 and can be changed. Original value is the lower purchase price or original appraisal. Supported PMI-bearing loans have original LTV up to 97% and terms up to 40 years; a result does not establish loan eligibility. Premiums use original principal, reducing to the lesser of the starting annual rate or 0.20% after 120 payments. Requested cancellation at 80% original value is assumed approved; 78% automatic termination and midpoint rules remain outside this model. Manual mode retains entered dollar or percentage quotes and cancellation settings. Biweekly Comparison excludes ownership expenses and PMI.'});
guides.mortgage.sources.push(
 {title:'National MI: published Monthly Advantage base-rate card, effective March 1, 2022',url:'https://www.nationalmi.com/wp-content/uploads/2022/02/MA.MN_.BP_.2022-03.pdf'},
 {title:'National MI: current listing of traditional rate cards and agency coverage',url:'https://www.nationalmi.com/products-rates/'},
 {title:'Fannie Mae: standard mortgage insurance coverage requirements',url:'https://selling-guide.fanniemae.com/sel/b7-1-02/mortgage-insurance-coverage-requirements'}
);
guides.mortgage.examples.push({title:'Automatic PMI with 4% down',mode:'monthly',values:{price:400000,down:4,down_unit:'Percent',years:30,months:0,pmi_method:'Automatic estimate',pmi_credit:'740-759',appraised_value:''},inputs:'Home price 400,000; 4% down; 30-year fixed loan; assumed credit score 740–759; appraisal left blank.',steps:['Original loan = 400,000 × 96% = 384,000; original LTV = 96%.','The published base-rate card gives 0.70% annually for this term, LTV and credit band.','Initial monthly PMI = 384,000 × 0.007 ÷ 12 = 224.'],answer:'Estimated initial PMI is 224 per month, included in the initial monthly total. This is a base-rate illustration, not a lender quote.',expected:{label:'Initial monthly PMI',value:224}});
guides.mortgage.checkedOn='2026-10-26';

guides.mortgage.questions.push({question:'Can I enter a loan amount instead of a home price?',answer:'Yes. Select Loan amount to enter principal directly. For an existing mortgage, use its current balance and remaining term, and enter your actual PMI quote in Manual mode. The projection excludes past interest and purchase costs. Automatic PMI and 80% cancellation require the original home value, defined as the lower original purchase price and appraisal. This calculator models fixed-rate residential repayment; commercial, adjustable-rate and interest-only structures need different models.'});
guides.mortgage.examples.push({title:'Project an existing balance with no interest',mode:'monthly',values:{loan_basis:'Loan amount',loan_amount:12000,years:1,months:0,rate:0,pmi_method:'Manual',pmi:0,tax:0,insurance:0,hoa:0,other:0,extra_monthly:0,extra_yearly:0,extra_once:0},inputs:'Current balance $12,000; one year remaining; 0% interest; no entered housing costs, PMI or extra principal.',steps:['Remaining term = 12 monthly payments.','At zero interest, monthly principal = 12000 ÷ 12 = 1000.','No interest or entered housing costs are added.'],answer:'Monthly principal and interest is $1,000. The projection starts at the entered balance and excludes past payments.',expected:{label:'Monthly principal & interest',value:1000}});

// Independent mortgage decision tools, with official policy sources and worked cases.
Object.assign(guides, mortgageToolsGuides as unknown as Record<string, Guide>);
relatedCalculatorIds["mortgage-recast"] = ["mortgage-payoff", "refinance", "mortgage", "amortization", "pmi"];
relatedCalculatorIds.pmi = ["mortgage", "fha-loan", "down-payment", "amortization"];
relatedCalculatorIds["biweekly-mortgage"] = ["mortgage", "mortgage-payoff", "amortization", "discount-points"];
relatedCalculatorIds["discount-points"] = ["mortgage", "refinance", "apr", "biweekly-mortgage"];
for (const id of ["mortgage", "amortization", "mortgage-payoff", "refinance"]) relatedCalculatorIds[id] = [...new Set([...(relatedCalculatorIds[id] ?? []), "pmi", "biweekly-mortgage", "discount-points"])];

import investmentDecisionGuides from './investment-decisions-guides.json';
Object.assign(guides, investmentDecisionGuides as unknown as Record<string,Guide>);
relatedCalculatorIds['tax-equivalent-yield']=['treasury-bill','bond','cd','income-tax','real-return'];
relatedCalculatorIds['treasury-bill']=['tax-equivalent-yield','cd','bond','interest','savings'];

// Reviewed calculator names, model explanations and worked examples share stable routes.
for(const [id,patch] of Object.entries(refresh as unknown as Record<string,{updatedOn:string;summary?:string;scope?:string;examples?:WorkedExample[];sources?:Guide['sources']}>)){
 const guide=guides[id];
 if(patch.summary)guide.summary=patch.summary;
 if(patch.scope)guide.scope=patch.scope;
 if(patch.examples)guide.examples.push(...patch.examples);
 for(const source of patch.sources??[])if(!guide.sources.some(item=>item.url===source.url))guide.sources.push(source);
 guide.checkedOn=patch.updatedOn;
}

// Original business tools use their own definitions and examples, then the shared question renderer.
Object.assign(guides,Object.fromEntries(Object.entries(businessContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
Object.assign(relatedCalculatorIds,{roas:['landed-cost','margin','break-even','roi'],'landed-cost':['roas','markup','margin'],'quick-ratio':['current-ratio','business-loan','break-even'],'current-ratio':['quick-ratio','business-loan','break-even']});
for(const id of ['margin','markup','break-even'])relatedCalculatorIds[id]=[...new Set(['roas','landed-cost',...(relatedCalculatorIds[id]??[])])].slice(0,8);

// Independent Coast FIRE planning uses real purchasing power and stops deposits at the threshold.
Object.assign(guides,Object.fromEntries(Object.entries(coastContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['coast-fire']=['retirement','compound-interest','real-return','401k','roth-ira','investment-fee'];
relatedCalculatorIds.retirement=[...new Set(['coast-fire',...(relatedCalculatorIds.retirement??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(strategyContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
Object.assign(relatedCalculatorIds,{noi:['rental-property','rent-vs-buy','mortgage','margin'],fire:['coast-fire','retirement','compound-interest','real-return','401k'],mirr:['irr','roi','payback-period','present-value','future-value']});
for(const [id,addition] of [['coast-fire','fire'],['retirement','fire'],['rental-property','noi'],['irr','mirr'],['roi','mirr']] as const)relatedCalculatorIds[id]=[...new Set([addition,...(relatedCalculatorIds[id]??[])])].slice(0,8);

// Contextual links from the first paired Semrush optimization batch.
for(const [id,added] of Object.entries({'rental-property':['noi','roi'],'debt-consolidation':['debt-payoff','credit-card','budget'],'business-loan':['break-even','current-ratio','loan'],'budget':['emergency-fund','debt-consolidation','retirement'],'break-even':['margin','markup','roas'],'roi':['rental-property','investment','mirr','roas']}))relatedCalculatorIds[id]=[...new Set([...added,...(relatedCalculatorIds[id]??[])])].slice(0,8);

// Keep retirement and investment tasks connected without creating duplicate calculator routes.
for (const [id,added] of Object.entries({investment:['roi','irr','compound-interest','retirement'],irr:['mirr','roi','average-return'],annuity:['annuity-payout','present-value','investment'],'annuity-payout':['annuity','pension','retirement'],pension:['social-security','retirement','annuity-payout'],'social-security':['pension','retirement','coast-fire']})) relatedCalculatorIds[id]=[...new Set([...added,...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(fireBudgetContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['fat-fire']=['lean-fire','fire','coast-fire','retirement','compound-interest','budget'];
relatedCalculatorIds['lean-fire']=['fat-fire','fire','coast-fire','retirement','budget','emergency-fund'];
for(const id of ['fire','coast-fire','retirement'])relatedCalculatorIds[id]=[...new Set(['lean-fire','fat-fire',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(debtStrategyContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['debt-snowball']=['debt-avalanche','debt-payoff','credit-cards-payoff','credit-card','debt-consolidation','budget'];
relatedCalculatorIds['debt-avalanche']=['debt-snowball','debt-payoff','credit-cards-payoff','credit-card','debt-consolidation','budget'];
for(const id of ['debt-payoff','credit-cards-payoff','credit-card','debt-consolidation'])relatedCalculatorIds[id]=[...new Set(['debt-snowball','debt-avalanche',...(relatedCalculatorIds[id]??[])])].slice(0,8);


Object.assign(guides,Object.fromEntries(Object.entries(hsaContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds.hsa=['retirement','401k','roth-ira','compound-interest','income-tax'];
for(const id of ['retirement','401k','roth-ira'])relatedCalculatorIds[id]=[...new Set(['hsa',...(relatedCalculatorIds[id]??[])])].slice(0,8);

// Research-backed additions retain existing content and calculator ownership.
for(const [id,patch] of Object.entries(batchContent)){
 const entry=patch as {summary?:string;scope?:string;examples:WorkedExample[];sources:Guide['sources'];updatedOn:string};
 if(id==='self-employment-tax')guides[id]={summary:entry.summary!,scope:entry.scope!,examples:entry.examples,questions:[],sources:entry.sources,checkedOn:entry.updatedOn};
 else {const guide=guides[id];if(entry.summary)guide.summary=entry.summary;guide.examples.push(...entry.examples);guide.sources=[...new Map([...guide.sources,...entry.sources].map(source=>[source.url,source])).values()];guide.checkedOn=entry.updatedOn;}
}
relatedCalculatorIds['self-employment-tax']=['income-tax','take-home-paycheck','business-loan','hsa'];
for(const id of ['income-tax','take-home-paycheck'])relatedCalculatorIds[id]=[...new Set(['self-employment-tax',...(relatedCalculatorIds[id]??[])])].slice(0,8);

const refreshedRmd=rmdRefresh.rmd;
guides.rmd.summary=refreshedRmd.summary;guides.rmd.scope=refreshedRmd.scope;guides.rmd.examples.push(...refreshedRmd.examples);guides.rmd.sources=[...new Map([...guides.rmd.sources,...refreshedRmd.sources].map(source=>[source.url,source])).values()];guides.rmd.checkedOn=refreshedRmd.updatedOn;

Object.assign(guides,Object.fromEntries(Object.entries(baristaContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['barista-fire']=['coast-fire','fire','lean-fire','fat-fire','retirement','budget'];
for(const id of ['coast-fire','fire','lean-fire','fat-fire','retirement'])relatedCalculatorIds[id]=[...new Set(['barista-fire',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(brrrrContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds.brrrr=['rental-property','noi','refinance','mortgage','roi'];
for(const id of ['rental-property','noi','refinance'])relatedCalculatorIds[id]=[...new Set(['brrrr',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(cashReturnContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['cash-on-cash-return']=['rental-property','brrrr','noi','roi','irr'];
for(const id of ['rental-property','brrrr','noi'])relatedCalculatorIds[id]=[...new Set(['cash-on-cash-return',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(mortgageInvestContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['mortgage-vs-invest']=['mortgage-payoff','mortgage','investment','compound-interest','mortgage-recast'];
for(const id of ['mortgage-payoff','mortgage','investment','compound-interest'])relatedCalculatorIds[id]=[...new Set(['mortgage-vs-invest',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(houseHackContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['house-hacking']=['mortgage','rent-vs-buy','rental-property','cash-on-cash-return','noi','pmi'];
for(const id of ['mortgage','rent-vs-buy','rental-property'])relatedCalculatorIds[id]=[...new Set(['house-hacking',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(coveredCallContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['covered-call']=['roi','investment','average-return','real-return','compound-interest'];
for(const id of ['roi','investment','average-return'])relatedCalculatorIds[id]=[...new Set(['covered-call',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(dripContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['drip']=['investment','compound-interest','roi','covered-call','real-return','roth-ira'];
for(const id of ['investment','compound-interest','covered-call'])relatedCalculatorIds[id]=[...new Set(['drip',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(rothLadderContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['roth-conversion-ladder']=['ira','roth-ira','fire','coast-fire','barista-fire','retirement'];
for(const id of ['ira','roth-ira','fire','barista-fire'])relatedCalculatorIds[id]=[...new Set(['roth-conversion-ladder',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(priorityContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));
relatedCalculatorIds['cap-rate']=['noi','cash-on-cash-return','rental-property','brrrr','house-hacking','roi'];
relatedCalculatorIds['credit-card-minimum-payment']=['credit-card','credit-cards-payoff','debt-snowball','debt-avalanche','debt-consolidation'];
for(const id of ['noi','cash-on-cash-return','rental-property','brrrr','house-hacking'])relatedCalculatorIds[id]=[...new Set(['cap-rate',...(relatedCalculatorIds[id]??[])])].slice(0,8);
for(const id of ['credit-card','credit-cards-payoff','debt-snowball','debt-avalanche'])relatedCalculatorIds[id]=[...new Set(['credit-card-minimum-payment',...(relatedCalculatorIds[id]??[])])].slice(0,8);

Object.assign(guides,Object.fromEntries(Object.entries(propertyDealContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));

Object.assign(guides,Object.fromEntries(Object.entries(stockContent).map(([id,c])=>[id,{summary:c.summary,scope:c.scope,examples:c.examples,questions:[],sources:c.sources,checkedOn:c.updatedOn}])));

// Enrich existing canonical guides and merge questions covering the same task.
for (const [id, content] of Object.entries(longTailContent)) {
  for (const {queries: _queries, replacesQuestion, ...item} of content.items) {
    if (replacesQuestion) {
      const index = guides[id].questions.findIndex(question => question.question === replacesQuestion);
      if (index < 0) throw new Error(`Missing guide question to replace: ${id} / ${replacesQuestion}`);
      guides[id].questions[index] = item;
    } else guides[id].questions.push(item);
  }
  guides[id].checkedOn = [guides[id].checkedOn ?? '', content.updatedOn].sort().at(-1);
}


guides['rent-vs-buy'].examples[0].inputs='An all-cash $120,000 home with zero appreciation, selling costs, property costs and tax adjustment. The linked settings use $1,000 monthly rent and 0% investment return; this check isolates the buyer-equity output, not the overall attractiveness of buying.';
guides['credit-cards-payoff'].examples[0].inputs='Two $600 card balances at 0% APR, each with a $50 entered monthly minimum, and a $200 combined monthly budget. No new charges or fees.';

// Reviewed mother-page notes supplement the existing examples and preserve published question anchors.
for(const [id,patch] of Object.entries(motherPageContent)){
 const guide=guides[id];guide.summary=patch.summary;guide.scope=patch.scope;guide.checkedOn='2026-10-29';
 for(const question of patch.questions){const index=guide.questions.findIndex(q=>q.question===question.question);if(index>=0)guide.questions[index]={...guide.questions[index],...question};else guide.questions.push(question);}
 for(const source of patch.sources)if(!guide.sources.some(s=>s.url===source.url))guide.sources.push(source);
 guide.examples.push(...patch.additionalExamples);
}

for(const id of motherPageIds)guides[id].checkedOn=motherPageReviewedOn;

relatedCalculatorIds['seller-financing']=['mortgage','amortization','fix-and-flip','brrrr','loan'];
relatedCalculatorIds['fix-and-flip']=['seller-financing','brrrr','cash-on-cash-return','cap-rate','rental-property'];
for(const id of ['mortgage','brrrr','rental-property','cash-on-cash-return'])relatedCalculatorIds[id]=[...new Set(['seller-financing','fix-and-flip',...(relatedCalculatorIds[id]??[])])].slice(0,8);

relatedCalculatorIds['stock-profit']=['stock-average','roi','drip','covered-call','investment'];
relatedCalculatorIds['stock-average']=['stock-profit','drip','roi','investment'];
for(const id of ['roi','drip','covered-call','investment'])relatedCalculatorIds[id]=[...new Set(['stock-profit','stock-average',...(relatedCalculatorIds[id]??[])])].slice(0,8);

// Reviewed explanatory additions only; no calculator inputs, defaults or math changes.
for(const [id,refresh] of Object.entries(calculationPageRefresh)){
 const guide=guides[id];if(!guide)continue;
 const existing=new Set(guide.questions.map(q=>q.question.toLowerCase()));
 guide.questions.push(...refresh.questions.filter(q=>!existing.has(q.question.toLowerCase())));
 guide.checkedOn=refresh.checkedOn;
}

// Export-backed FAQ review: merge in place to retain published anchors and links.
for (const [id, review] of Object.entries({...semrushEightFaq, ...semrushNextEightFaq, ...semrushThirdEightFaq})) {
  const guide = guides[id];
  for (const item of review.items) {
    const { queries: _queries, ...patch } = item;
    const replacement = 'replacesQuestion' in patch ? patch.replacesQuestion : undefined;
    const index = replacement ? guide.questions.findIndex(q => q.question === replacement) : -1;
    if (replacement && index < 0) throw new Error(`Missing reviewed FAQ: ${id} / ${replacement}`);
    const { replacesQuestion: _replacement, ...question } = patch as typeof patch & { replacesQuestion?: string };
    if (index >= 0) guide.questions[index] = { ...guide.questions[index], ...question };
    else guide.questions.push(question);
  }
  guide.questions = guide.questions.filter(q => !(review.removeQuestions as string[]).includes(q.question));
  guide.checkedOn = review.checkedOn;
}
