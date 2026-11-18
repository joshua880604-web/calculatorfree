import { tool } from './helpers';
import { metric, money, num, select, type Field, type Result, type Values } from '../types';
import { bounded, choose, integer, percentage, usd, value, whole } from './expansion-common';

const rentUnits = ['Per square foot per year', 'Per square foot per month'] as const;
const areaField = (key: string, label: string, initial: number): Field => ({ ...num(key, label, initial, 'sq ft', 0.01), max: 1e8 });
const unit = (key: string, label: string) => select(key, label, [...rentUnits]);
const annualize = (rate: number, basis: string) => rate * (basis === rentUnits[1] ? 12 : 1);
const common = () => [areaField('area', 'Tenant rentable area', 2000), usd('base_rate', 'Base rent quoted per square foot', 24), unit('base_basis', 'Base-rent quote period')];
const horizon = () => [whole('years', 'Whole lease years to model', 5, 'years', 1, 30), percentage('base_growth', 'Base-rent increase each lease year', 3, -99, 100), percentage('nnn_growth', 'NNN-charge increase each lease year', 2, -99, 100), whole('free_months', 'Initial months with base rent abated', 0, 'months', 0, 360), usd('other_monthly', 'Other nonoverlapping monthly occupancy charges', 0), usd('upfront', 'Upfront nonrefundable occupancy cost', 2000), usd('deposit', 'Refundable deposit entered separately', 5000)];

export function tripleNetLease(v: Values, buildingShare = false): Result {
  const area = value(v, 'area', 0.01, 1e8), baseRate = value(v, 'base_rate', 0, 1e6);
  const baseAnnual = area * annualize(baseRate, choose(v, 'base_basis', rentUnits));
  let nnnAnnual: number, share = 0;
  const parts: (string | number)[][] = [];
  if (buildingShare) {
    const buildingArea = value(v, 'building_area', 0.01, 1e8);
    if (area > buildingArea) throw Error('Tenant area cannot exceed the building area in this area-share model.');
    share = area / buildingArea;
    const taxes = value(v, 'taxes', 0, 1e10), insurance = value(v, 'insurance', 0, 1e10), cam = value(v, 'cam', 0, 1e10);
    parts.push(['Property taxes', taxes, share * 100, taxes * share], ['Building insurance', insurance, share * 100, insurance * share], ['CAM excluding those taxes and insurance', cam, share * 100, cam * share]);
    nnnAnnual = (taxes + insurance + cam) * share;
  } else {
    nnnAnnual = area * annualize(value(v, 'nnn_rate', 0, 1e6), choose(v, 'nnn_basis', rentUnits));
  }
  const years = integer(v, 'years', 1, 30), free = integer(v, 'free_months', 0, years * 12);
  const baseGrowth = value(v, 'base_growth', -99, 100) / 100, nnnGrowth = value(v, 'nnn_growth', -99, 100) / 100;
  const other = value(v, 'other_monthly', 0, 1e10), upfront = value(v, 'upfront', 0, 1e10), deposit = value(v, 'deposit', 0, 1e10);
  let recurring = 0, firstYear = 0, totalBase = 0, totalNnn = 0, firstMonth = 0;
  const rows: number[][] = [], annual: number[][] = [];
  for (let year = 0; year < years; year++) {
    const baseMonthly = bounded(baseAnnual * (1 + baseGrowth) ** year / 12), nnnMonthly = bounded(nnnAnnual * (1 + nnnGrowth) ** year / 12);
    let yearBase = 0, yearNnn = 0, yearRecurring = 0;
    for (let month = year * 12 + 1; month <= (year + 1) * 12; month++) {
      const payableBase = month <= free ? 0 : baseMonthly, amount = payableBase + nnnMonthly + other;
      recurring = bounded(recurring + amount); yearBase += payableBase; yearNnn += nnnMonthly; yearRecurring += amount;
      rows.push([month, year + 1, payableBase, nnnMonthly, other, amount, month === 1 ? upfront : 0, recurring + upfront]);
      if (month === 1) firstMonth = amount;
    }
    if (year === 0) firstYear = yearRecurring;
    totalBase += yearBase; totalNnn += yearNnn;
    annual.push([year + 1, yearBase, yearNnn, other * 12, yearRecurring, year === 0 ? upfront : 0, yearRecurring + (year === 0 ? upfront : 0)]);
  }
  return {
    metrics: [money('First-year recurring occupancy cost', firstYear), money('First-year average monthly recurring cost', firstYear / 12), money('Total modeled nonrefundable occupancy cost', recurring + upfront), money('First-month cash including deposit and upfront cost', firstMonth + upfront + deposit), money('Refundable deposit kept separate', deposit), money('Annualized NNN charge per square foot at start', nnnAnnual / area), money('Total base rent after entered abatement', totalBase), money('Total modeled NNN charges', totalNnn), ...(buildingShare ? [{ ...metric('Area-based expense share', share * 100), format: 'percent' as const }] : [])],
    columns: ['Month', 'Lease year', 'Payable base rent', 'NNN charges', 'Other recurring charges', 'Recurring total', 'Upfront nonrefundable cost', 'Cumulative nonrefundable cost'], rows,
    annualColumns: ['Lease year', 'Base rent', 'NNN charges', 'Other charges', 'Recurring cost', 'Upfront nonrefundable cost', 'Total nonrefundable cost'], annualRows: annual,
    additionalTables: buildingShare ? [{ title: 'Initial annual building-expense allocation', columns: ['Nonoverlapping category', 'Whole-building annual amount', 'Area share (%)', 'Tenant annual charge'], rows: parts }] : [],
    notes: [
      'This is a tenant-cost illustration using entered quotes and assumptions. It does not interpret a lease, infer legal obligations, obtain local tax or insurance quotes, or estimate a property investment return.',
      buildingShare ? 'The modeled expense share equals tenant rentable area divided by the entered building area. An actual contract can define a different share or allocation. Use quoted-charge mode with a reconciled tenant charge when this area-share assumption does not apply.' : 'Base rent and NNN quotes each have their own annual or monthly per-square-foot unit. A quoted NNN amount must already contain the intended, nonoverlapping expense categories; do not add those categories again as other charges.',
      'Base rent and aggregate NNN charges increase or decrease once at each lease-year anniversary using the entered assumptions. Other monthly charges stay flat. These are scenarios, not forecasts or contract escalations inferred by the tool.',
      'Initial free months abate base rent only. NNN and other charges continue in those months. Upfront nonrefundable cost is paid once in month one; recurring averages exclude it. The separate refundable deposit is included only in initial cash, with no assumed refund date or present value.',
      'The table retains unrounded amounts internally. Displayed monthly amounts can differ by a few cents from independently rounded annual totals. Rentable and usable areas need not be the same; enter the area used by the selected quote and expense allocation.',
    ],
  };
}

export const tripleNetLeaseCalculator = tool('triple-net-lease', [
  { id: 'quoted', title: 'Quoted Rent & NNN per Square Foot', description: 'Normalize separate base-rent and NNN quote periods and model occupancy costs.', fields: [...common(), usd('nnn_rate', 'NNN charge quoted per square foot', 6), unit('nnn_basis', 'NNN quote period'), ...horizon()], formula: 'Annual starting cost = area × annualized base-rent quote + area × annualized NNN quote + other monthly charges × 12. Apply the stated lease-year growth, base-rent abatement and separate upfront costs.', calculate: v => tripleNetLease(v) },
  { id: 'building', title: 'Building Costs: Area-Based Share', description: 'Allocate entered nonoverlapping building expenses using an explicit rentable-area fraction.', fields: [...common(), areaField('building_area', 'Building rentable area used for expense share', 10000), usd('taxes', 'Whole-building annual property taxes', 30000), usd('insurance', 'Whole-building annual insurance', 10000), usd('cam', 'Whole-building annual CAM excluding taxes and insurance', 20000), ...horizon()], formula: 'Area share = tenant area / building area. Starting annual tenant NNN = area share × (nonoverlapping building taxes + insurance + CAM). Add payable base rent and other charges.', calculate: v => tripleNetLease(v, true) },
], 'Calculate triple net lease cost from per-square-foot quotes or an area-based share of building expenses. Compare monthly and annual costs, abatement, escalation and upfront cash.');
