import type { Values } from "./types";
import {roth401kComparisonScope} from './roth-401k-scope';

// Scope labels describe implemented rules, not a promise of worldwide tax support.
export function calculatorScope(id: string, mode: string, values: Values): string | undefined {
  switch (id) {
    case 'retirement-withdrawal': return 'USD retirement drawdown starting now. Constant returns and annual spending increases, month-end withdrawals, editable fee and flat withdrawal-tax assumptions. No benefit estimate, account ordering, RMD enforcement or probability of retirement success.';
    case 'balance-transfer': return 'One full USD credit-card balance, fixed monthly repayment budget and APR/12 interest. One-time fees, promotional months and subsequent APR are modeled; new spending, credit scoring and issuer-specific daily interest or payment allocation are excluded.';
    case 'dscr': return mode==='noi'?'Annual property NOI divided by annual debt service, using amounts supplied by you. Lender accounting adjustments and loan approval are not determined.':'Monthly rental income divided by PITIA, with amortizing or interest-only P&I. Maximum principal is constrained by the entered DSCR target only; other lender limits may apply.';
    case 'fsa': return `U.S. employee Health FSA planning for a plan year beginning in ${values.year==='2025'?'2025':'2026'}. Entered eligible spending, tax-saving rates and employer unused-funds rules. No Dependent Care FSA, prior carryover, employer contributions or enrollment eligibility determination.`;
    case 'closing-cost': return mode==='seller'?'USD seller settlement worksheet using entered payoff, negotiated commission, costs and buyer credit. Net cash is not taxable capital gain. No local fee lookup or contractual approval.':'USD buyer settlement worksheet using entered itemized costs, down payment, previous payments and credits. No financed closing costs or local fee lookup. Applied credits are capped at total itemized costs for this worksheet.';
    case "stock-profit": return "One long USD stock position bought and sold in full. Manual prices, fractional shares, side-specific fees and optional unreinvested cash dividends. Before income tax; no live quote, shorting, margin, tax lots or corporate actions.";
    case "stock-average": return "One security, purchases only. Quantity-weighted economic acquisition cost including fixed USD buy fees, not a tax cost-basis election. Manual optional comparison price; no sales, dividend reinvestment, splits or advice to average down.";

    case "seller-financing": return "Fixed-rate USD real-estate note with monthly end-of-period payments and one maturity settlement. Balloon principal is measured after that month\u2019s installment. No legal eligibility, fees, escrow, taxes, daily interest or refinancing guarantee.";
    case "fix-and-flip": return "One USD buy-renovate-sell project before income tax. Cash purchase or a fully drawn acquisition-only interest-only loan; rehab is cash-funded. Sale price and costs are assumptions; cash required, profit and net sale cash are different measures.";

    case "rental-property": return "Nominal USD rental projection with entered financing, annual income/cost growth and an end-of-holding-year sale. Before owner income and capital-gains tax. Cash flow, sale proceeds and IRR are different measures; IRR may be absent or have multiple solutions. Not an appraisal or forecast.";
    case "cap-rate": return "USD unlevered annual NOI divided by property value. Target-rate values are scenarios, not appraisals or offers; no debt service, capex, owner income tax, appreciation or total-return model.";
    case "credit-card-minimum-payment": return "One balance, fixed APR and a user-defined opening-balance minimum rule. Monthly APR/12 interest, fractional cents retained internally, no new spending or fees. Not an issuer statement or credit-score estimate; projection limited to 100 years.";
    case "roth-conversion-ladder": return "U.S. single-owner pre-59½ bridge ending by planning age 59. Fully taxable traditional IRA conversions, separate five-tax-year clocks and outside-cash tax assumptions. No prior conversions, earnings withdrawals, tax brackets, pro-rata basis or retirement-safety determination.";
    case "drip": return "Single-asset nominal USD scenario with fractional shares and regular dividend intervals. Flat dividend tax at payout; no live quotes, inflation, sale tax, tax lots or fees. The comparison retains dividends as cash earning zero interest.";
    case "debt-snowball":
    case "debt-avalanche": return "Fixed-APR monthly debt projection. Total budget includes all minimums. Compare both methods with the same rollover and one-time payment assumptions; actual statements may use daily interest and changing minimum rules.";
    case "cash-on-cash-return": return mode === "property" ? "First-year USD rental worksheet with actual scheduled P&I, cash-paid acquisition costs and an explicit capital reserve. Cash yield differs from cap rate and total ROI; no sale, refinance or tax calculation." : "One-year pre-income-tax cash yield from your supplied cash flow and cash investment. Monthly input is a recurring amount multiplied by 12, not an annualized total-return percentage.";
    case "mortgage-vs-invest": return "Equal initial cash, equal monthly budget and one comparison horizon. Both paths invest freed loan payments. Nominal USD, fixed rates, no mortgage tax deduction or prepayment penalty. Compare investments minus debt; home value is common and excluded.";
    case "covered-call": return "USD standard stock buy-write at expiry: 100 shares per call. Manual premium and fees; dividends, taxes, pre-expiry pricing and early-assignment timing excluded. Premium is not pure profit; losses can be substantial and gains are capped.";
    case "house-hacking": return "Owner-occupied monthly cash budget in USD. Only entered tenant spaces count as rent; your own unit does not. Includes whole-property costs and manual mortgage insurance, not loan qualification, tax allocation or a total investment return.";
    case "brrrr": return "One USD rental deal: cash-funded rehab, a fully drawn interest-only acquisition loan and one fixed-rate refinance. Includes reserves separately from NOI. No lender qualification, tax calculation, sale forecast or repeated deals.";
    case "noi": return "Property-level NOI before financing, capital expenditure or replacement reserves, depreciation and owner income tax. Enter all money in one selected reporting period; no appraisal or lender-specific underwriting is inferred.";
    case "barista-fire": return "Today’s USD; dated part-time income and monthly portfolio withdrawals bridge to a full-retirement sizing target. No lifetime withdrawal simulation, safe-rate guarantee, automatic benefits or tax calculation.";
    case "fat-fire":
    case "lean-fire": return "Full FIRE target from an itemized budget in today’s USD. Annual provisions are recurring allowances; taxes are entered estimates. No universal Lean/Fat cutoff, withdrawal guarantee or automatic benefit calculation.";
    case "fire": return "Full FIRE portfolio target and first monthly crossing under constant real-return assumptions. Not Coast FIRE, a retirement drawdown simulation, account eligibility, benefit estimate or probability of success.";
    case "mirr": return "Equal-period signed project cash flows, including time zero. Both rate inputs are effective annual rates converted to the selected spacing; irregular-date XIRR and automatic project costs are excluded.";

    case "coast-fire": return "Constant-return Coast FIRE scenario in today’s USD. Monthly investments stop at the modeled threshold. Pre-retirement living costs, actual benefit eligibility and guaranteed withdrawal safety are not calculated.";
    case "roas": return "Revenue-based ROAS and contribution-margin scenarios. No live attribution, automatic bidding or guarantee of company net profit.";
    case "landed-cost": return "One homogeneous shipment in USD with manually entered duties and nonrecoverable taxes. No tariff lookup, customs classification, tax advice or currency conversion.";
    case "quick-ratio": return "Accounting acid-test ratio from same-date current balances. Inventory, prepayments and other non-quick assets are excluded; no SaaS MRR calculation.";
    case "current-ratio": return "Same-date current asset and liability classifications. Working capital is a dollar difference, not a profitability percentage or future cash-flow guarantee.";
    case "tax-equivalent-yield": return "U.S. taxable-account yield comparison using entered marginal rates. No automatic tax brackets, exemption eligibility, AMT or state/federal deduction interactions.";
    case "treasury-bill": return "U.S. Treasury bill held to maturity. Bank discount pricing uses 360 days; simple annualized returns use the selected 365/366 days and are not the official auction Investment Rate. No live quotes.";
    case "mortgage-recast": return "Fixed-rate monthly P&I only. Same rate and remaining contractual term; recast requires servicer approval. Taxes, insurance, PMI cancellation and FHA/VA/USDA eligibility are not modeled.";
    case "pmi": return "U.S. conventional borrower-paid PMI. Original-value 80% requests, scheduled 78% termination and original-term midpoint are distinct; FHA/VA and investor-specific appreciation rules are excluded.";
    case "biweekly-mortgage": return "Fixed-rate P&I comparison with 26 credited periods/year; not twice-monthly payments or a dated daily-accrual simulation.";
    case "discount-points": return "Compare entered fixed-rate quotes and upfront costs in USD. One point costs 1% of principal; rate reductions are lender-specific.";
    case "mortgage":
      return mode === "biweekly"
        ? "Fixed-rate residential mortgage comparison. Biweekly results exclude taxes, insurance and PMI."
        : "U.S. PMI assumptions; enter your local housing costs.";
    case "fha-loan":
      return "U.S. FHA payment planning. Automatic premiums use ordinary forward-loan rules; Manual accepts checked special or historical terms. Appraisal, underwriting and local loan eligibility still require verification.";
    case "va-mortgage":
      return "U.S. ordinary VA purchase-loan planning using the fee table effective April 7, 2023. Prior manufactured-home-only use keeps first-use rates; entitlement and exemption eligibility are entered assumptions. Other VA loan types require different fee rules.";
    case "401k":
      if (mode === 'roth-vs-traditional') return roth401kComparisonScope;
      if (mode === "early") return "U.S. 401(k) early-withdrawal estimate using your entered tax rates and selected exceptions to the modeled 10% additional tax. This is not a complete income-tax return.";
      return "U.S. 401(k) planning using fixed 2026 contribution and age-based catch-up rules. Limits combine traditional and Roth deferrals; applicable high-earner catch-up must be Roth. This projection does not split those tax treatments or project future legal limit changes.";
    case "ira":
    case "roth-ira":
      return "U.S. IRA planning using fixed 2026 contribution limits. Contribution eligibility and tax treatment depend on the stated assumptions.";
    case "self-employment-tax":
      return "U.S. 2025/2026 regular self-employment tax and Additional Medicare allocation. Excludes ordinary income tax, state tax, special SE methods and withholding credits.";
    case "hsa":
      return "U.S. HSA planning with selected 2025 or 2026 limits. Contribution eligibility must be confirmed separately; projected limits and tax assumptions stay fixed.";
    case "rmd":
      return "U.S. RMD planning for traditional IRA and other eligible non-Roth owner accounts. Roth IRA owner balances, designated Roth plan balances for 2024 onward, inherited accounts and employer-plan deferrals are excluded." + (values.birth === "1959" ? " For 1959 births, age 73 is a planning assumption in this tool; confirm the applicable IRS guidance with your custodian." : "");
    case "income-tax":
      return `U.S. federal income tax for tax year ${values.year === "2025" ? "2025" : "2026"}. Select the tax year before comparing estimates.`;
    case "estate-tax":
      return "U.S. federal estate tax using the 2026 exclusion. State estate taxes are not computed.";
    case "take-home-paycheck":
      return "U.S. paycheck planning using 2026 federal rules. Entered state and local rates are assumptions, not jurisdiction-specific tax calculations.";
    case "social-security":
      return mode === "compare"
        ? "U.S. Social Security planning. Enter your own monthly benefit estimates for both ages; changing the ages does not recalculate those quoted amounts."
        : "U.S. Social Security retirement-benefit planning. Enter FRA PIA in age-62 dollars; assumed COLA applies while waiting and after claiming. Use a nominal discount rate. Earnings records and benefit statements are not retrieved.";
  }
}
