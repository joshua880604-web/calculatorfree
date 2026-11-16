import { test } from "node:test";
import assert from "node:assert/strict";
import { calculators, defaults, runCalculation } from "../src/lib/calculators/index";
import { hasCalculatorWorkspace, workspaceIds, workspaceLayout, workspaceMetrics } from "../src/lib/workspace-layout";
import { resultTrend } from "../src/lib/result-trend";
import { summaryMetrics } from "../src/lib/sharing";

function run(id: string, mode: string, overrides: Record<string, string> = {}) {
  const m = calculators.find(c => c.id === id)!.modes.find(m => m.id === mode)!;
  const values = { ...defaults(m), ...overrides }, result = runCalculation(id, mode, values);
  return { result, values, trend: resultTrend(id, mode, values, result), summary: workspaceMetrics(id, mode, result) };
}
test("workspace policy covers reviewed pages, preserves broad forms, and never loses metrics", () => {
  assert.equal(workspaceIds.length, 83); assert.equal(new Set(workspaceIds).size, 83);
  for (const id of ["income-tax", "marriage-tax", "budget", "credit-cards-payoff", "401k", "scientific"]) assert.equal(hasCalculatorWorkspace(id), false);
  assert.equal(workspaceLayout("retirement", "required"), "stacked");
  assert.equal(workspaceLayout("payback-period", "irregular"), "stacked");
  for (const c of calculators.filter(c => hasCalculatorWorkspace(c.id))) for (const m of c.modes) {
    const x = run(c.id, m.id), shown = [x.summary.primary, ...x.summary.highlights, ...x.summary.details];
    assert.equal(shown.length, x.result.metrics.length, c.id + ":" + m.id);
    assert.deepEqual(new Set(shown), new Set(x.result.metrics));
  }
});
test("requested payment and comparison amounts remain visible before disclosures", () => {
  for (const id of ["mortgage", "fha-loan", "va-mortgage"]) {
    assert.equal(run(id, "monthly").summary.primary.label, id==='fha-loan'?"Initial monthly total":"Monthly principal & interest");
    assert.equal(run(id, "biweekly").summary.primary.label, "Biweekly payment");
    assert.ok(run(id, "monthly").summary.highlights.some(m => m.label === (id==='fha-loan'?"Monthly principal & interest":"Initial monthly total")));
  }
  for (const id of ["auto-loan", "boat-loan"]) {
    assert.equal(run(id, "payment").summary.primary.label, "Payment per period");
    assert.match(run(id, "price").summary.primary.label, /price/);
  }
  const refinance = run("refinance", "balance").summary;
  assert.equal(refinance.primary.label, "New monthly payment");
  assert.ok(refinance.highlights.some(m => m.label === "Current monthly payment"));
  const cd = run("cd", "accumulation").summary;
  assert.equal(cd.primary.label, "After-tax balance");
  assert.deepEqual(cd.highlights.map(m => m.label), ["Interest earned", "Maturity balance", "Tax on interest"]);
  assert.equal(cd.details.length, 2, "The original four CD figures stay visible; APY and term remain in the breakdown");
});
test("exported summaries prioritize the same result as the active workspace mode", () => {
  for (const [id, mode] of [["auto-loan", "payment"], ["auto-loan", "price"], ["cd", "accumulation"], ["mortgage", "biweekly"], ["student-loan", "projection"], ["retirement", "withdrawal"]]) {
    const x = run(id, mode), exported = summaryMetrics(id, x.result, mode);
    assert.deepEqual(exported[0], x.summary.primary);
    assert.equal(new Set(exported.map(m => m.label)).size, exported.length);
    assert.ok(exported.length <= 5);
  }
});
test("comparison and inverse-solving modes surface the figure the user requested", () => {
  assert.deepEqual(run("markup", "compare").summary.highlights.map(m => m.label), ["Markup on cost", "Profit margin"]);
  assert.equal(run("down-payment", "cash").summary.primary.label, "Cash needed");
  assert.equal(run("down-payment", "percent").summary.primary.label, "Down payment percentage");
  assert.equal(run("student-loan", "solve-payment").summary.primary.label, "Monthly payment");
  assert.equal(run("student-loan", "solve-rate").summary.primary.label, "Annual interest rate");
  assert.equal(run("student-loan", "solve-term").summary.primary.label, "Term in months");
  assert.equal(run("payback-period", "fixed").summary.primary.label, "Payback period (years)");
});
test("loan opening curves reflect elapsed principal, financed fees and solved loan amounts", () => {
  const elapsed = run("mortgage-payoff", "known-normal");
  assert.ok(elapsed.trend!.points[0].balance < Number(elapsed.values.principal));
  assert.ok(Math.abs(elapsed.trend!.points[0].balance - elapsed.result.metrics.find(m => m.label === "Current principal balance")!.value) < 1e-8);
  const refinance = run("refinance", "balance", { finance: "Yes", fees: "3000", cashout: "10000" });
  assert.ok(Math.abs(refinance.trend!.points[0].balance - 263000) < 1e-8);
  const student = run("student-loan", "projection");
  assert.equal(student.trend!.points[0].balance, student.result.metrics.find(m => m.label === "Balance entering repayment")!.value);
  const solved = run("auto-loan", "price"); assert.equal(solved.values.principal, undefined);
  assert.ok(Math.abs(solved.trend!.points[0].balance - Number(solved.result.rows![0][4]) - Number(solved.result.rows![0][3])) < 1e-8);
});
test("HELOC draw plateau and terminal balance come directly from its computed phases", () => {
  const x = run("heloc", "draw-repay");
  assert.equal(x.trend!.points[0].balance, 50000);
  assert.equal(x.result.rows![119][4], 50000);
  assert.equal(x.trend!.points.at(-1)!.x, 360);
  assert.equal(x.trend!.points.at(-1)!.balance, x.result.rows!.at(-1)![4]);
  assert.match(x.trend!.help, /no additional draws/);
});
test("CD curve is before tax while its primary result is after tax", () => {
  const x = run("cd", "accumulation", { tax: "100" });
  assert.equal(x.summary.primary.value, 10000);
  assert.ok(x.trend!.points.at(-1)!.balance > x.summary.primary.value);
  assert.match(x.trend!.title, /before tax/); assert.match(x.trend!.help, /after-tax maturity/);
});
test("withdrawal graphs use actual fractional years and reduced final payments", () => {
  for (const [id, mode] of [["annuity-payout", "payment"], ["annuity-payout", "length"], ["retirement", "longevity"]]) {
    const x = run(id, mode), last = x.trend!.points.at(-1)!;
    assert.equal(last.x, x.result.rows!.at(-1)![1]); assert.equal(last.balance, 0);
    assert.equal(x.trend!.xLabel, "Years");
  }
  const quarterly = run("annuity-payout", "length", { frequency: "Quarterly" });
  assert.equal(quarterly.trend!.points[1].x, .25);
});
test("IRA graph starts at entered age and identifies pre-tax account value", () => {
  for (const id of ["ira", "roth-ira"]) {
    const x = run(id, "comparison");
    assert.deepEqual(x.trend!.points[0], { x: 35, balance: 50000 });
    assert.equal(x.trend!.points.at(-1)!.x, 67); assert.equal(x.trend!.points.at(-1)!.balance, x.result.rows!.at(-1)![2]);
  }
  assert.match(run("ira", "comparison").trend!.title, /before withdrawal tax/);
});
test("fee comparison retains both actual balances without labeling either as contributions", () => {
  const x = run("investment-fee", "compare");
  assert.equal(x.trend!.secondaryKey, "comparison"); assert.equal(x.trend!.secondaryLabel, "Option B");
  assert.equal(x.trend!.points.at(-1)!.balance, x.result.rows!.at(-1)![1]);
  assert.equal(x.trend!.points.at(-1)!.comparison, x.result.rows!.at(-1)![2]);
  assert.equal(x.trend!.points[0].contributions, undefined);
});
test("depreciation shows book value with schedule years and actual salvage endpoint", () => {
  for (const mode of ["straight", "declining", "syd"]) {
    const x = run("depreciation", mode, { first_months: "6" });
    assert.equal(x.trend!.points[0].balance, 50000);
    assert.equal(x.trend!.points.at(-1)!.balance, 5000);
    assert.equal(x.trend!.points.at(-1)!.x, x.result.rows!.at(-1)![0]);
    assert.match(x.trend!.help, /not an estimate of market/);
  }
});
test("every enabled curve matches the full computed schedule's exact terminal value", () => {
  let count = 0;
  for (const c of calculators.filter(c => hasCalculatorWorkspace(c.id))) for (const m of c.modes) {
    const x = run(c.id, m.id); if (!x.trend) continue; count++;
    const balanceColumn = x.result.columns!.findIndex(label => ["Traditional IRA year-end value (USD)", "DRIP value (USD)", "Covered call P/L (USD)", "Paydown-path position", "Closing portfolio (today’s USD)", "Closing balance (USD)", "Total balance", "Recast balance", "Balance", "Balance before tax", "Ending balance", "IRA balance", "Option A balance", "Book value", "Net borrowing-cost savings"].includes(label));
    assert.equal(x.trend.points.at(-1)!.balance, x.result.rows!.at(-1)![balanceColumn], c.id + ":" + m.id);
    assert.ok(x.trend.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.balance)));
    assert.ok(x.trend.points.length <= 241);
  }
  assert.equal(count, 79);
});
