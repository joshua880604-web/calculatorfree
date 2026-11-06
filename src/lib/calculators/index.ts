import {cdLadderCalculator} from './cd-ladder';
import {npvCalculator} from './npv';
import {leaseVsBuyCarCalculator} from './lease-vs-buy-car';
import {mortgageComparisonCalculator} from './mortgage-comparison';
import {remainingCalculators} from './remaining-tools';
import {retirementWithdrawalCalculator} from './retirement-withdrawal';
import {balanceTransferCalculator} from './balance-transfer';
import {dscrCalculator} from './dscr';
import {fsaCalculator} from './fsa';
import {closingCostCalculator} from './closing-cost';
import {stockProfitCalculator,stockAverageCalculator} from './stock-trades';
import {sellerFinancingCalculator,fixFlipCalculator} from './property-deals';
import {capRateCalculator} from './cap-rate';
import {cardMinimumCalculator} from './credit-card-minimum-payment';
import {rothLadderCalculator} from './roth-conversion-ladder';
import {dripCalculator} from './drip';
import {coveredCallCalculator} from './covered-call';
import {houseHackingCalculator} from './house-hacking';
import {mortgageInvestCalculator} from './mortgage-vs-invest';
import {cashOnCashCalculator} from './cash-on-cash';
import {brrrrCalculator} from './brrrr';
import {baristaFireCalculator} from './barista-fire';
import {selfEmploymentTaxCalculator} from './self-employment-tax';
import {hsaCalculator} from './hsa';
import {debtSnowball,debtAvalanche} from './debt-strategies';
import {leanFireCalculator,fatFireCalculator} from './fire-budgets';
import {noiCalculator} from "./noi";
import {fireCalculator} from "./fire";
import {mirrCalculator} from "./mirr";
import {coastFire} from "./coast-fire";
import {businessTools} from "./business-tools";
import {investmentDecisions} from "./investment-decisions";
import {mortgageRecast} from "./mortgage-recast";
import {mortgageTools} from "./mortgage-tools";
import {evergreenCalculators} from "./evergreen";
import { calculateMode } from "../calculate-mode";
import data from "../catalog-data.json";
import { propertyCalculators } from "./property";
import { investmentCalculators } from "./investment";
import { retirementCalculators } from "./retirement";
import { taxCalculators } from "./tax-salary";
import { everydayCalculators } from "./everyday";
import { otherCalculators } from "./other";
import { defaults, type Calculator, type Values, type Result } from "../types";
export const calculators: Calculator[] = [
  cdLadderCalculator,npvCalculator,leaseVsBuyCarCalculator,mortgageComparisonCalculator,
  ...remainingCalculators,
  retirementWithdrawalCalculator,balanceTransferCalculator,dscrCalculator,fsaCalculator,closingCostCalculator,
  stockProfitCalculator,stockAverageCalculator,sellerFinancingCalculator,fixFlipCalculator,capRateCalculator, cardMinimumCalculator, rothLadderCalculator, dripCalculator, coveredCallCalculator, houseHackingCalculator,mortgageInvestCalculator,cashOnCashCalculator,brrrrCalculator,baristaFireCalculator,selfEmploymentTaxCalculator,hsaCalculator,debtSnowball,debtAvalanche,leanFireCalculator,fatFireCalculator,noiCalculator,fireCalculator,mirrCalculator,
  coastFire,
  ...businessTools,
  ...evergreenCalculators,
  ...mortgageTools,
  ...investmentDecisions,
  mortgageRecast,
  ...propertyCalculators,
  ...investmentCalculators,
  ...retirementCalculators,
  ...taxCalculators,
  ...otherCalculators,
  ...everydayCalculators,
].sort(
  (a, b) =>
    data.findIndex((x) => x.id === a.id) - data.findIndex((x) => x.id === b.id),
);
export const categories = [...new Set(data.map((x) => x.category))];
export const routeFor = (id: string) =>
  data.find((x) => x.id === id)?.local_route ?? "/financial-calculator.html";
export const calculatorBySlug = (slug: string) =>
  calculators.find((c) => routeFor(c.id) === "/" + slug);
export function runCalculation(id: string, modeId: string, v: Values): Result {
  const calc = calculators.find(c => c.id === id);
  if (!calc) throw new Error("Unknown calculator mode.");
  return calculateMode(calc, modeId, v);
}

export { defaults };
