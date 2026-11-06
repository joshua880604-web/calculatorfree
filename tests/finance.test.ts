import { test } from "node:test";
import assert from "node:assert/strict";
import {
  payment,
  future,
  annuityPV,
  amortize,
  periodic,
  irr,
  duration,
  sum,
} from "../src/lib/finance";
import {
  calculators,
  defaults,
  runCalculation,
  routeFor,
} from "../src/lib/calculators";
import { ordinaryTax } from "../src/lib/tax";
import { debtSchedule } from "../src/lib/calculators/other";
const close = (actual: number, expected: number, tol = 1e-6) =>
  assert.ok(Math.abs(actual - expected) <= tol, `${actual} != ${expected}`);
test("independent monthly-payment and zero-interest fixtures", () => {
  close(payment(100000, 0.06 / 12, 360), 599.5505251527524);
  close(payment(12000, 0, 12), 1000);
});
test("compound and ordinary annuity fixtures", () => {
  close(future(1000, 0, 0.05, 10), 1628.8946267774414);
  close(annuityPV(1000, 0.05, 10), 7721.734929184813);
  close(future(1000, 100, 0, 12), 2200);
  close(
    future(1000, 100, 0.01, 12, true) - future(1000, 100, 0.01, 12, false),
    future(0, 100, 0.01, 12) * 0.01,
  );
});
test("amortization conserves principal and caps final payment", () => {
  const rows = amortize(100000, 0.06 / 12, 360, { monthly: 100 });
  close(sum(rows.map((r) => r.principal)), 100000, 0.00001);
  assert.equal(rows.at(-1)!.balance, 0);
  assert.ok(rows.length < 360);
  assert.ok(rows.at(-1)!.payment <= rows[0].payment);
});
test("rate conversion preserves annual effective yield", () => {
  const m = periodic(5, 1, 12);
  close((1 + m) ** 12, 1.05);
  close(periodic(0, 12, 12), 0);
});
test("IRR normal, multiple roots, no root", () => {
  close(irr([-100, 110])[0], 0.1);
  const roots = irr([-100, 230, -132]);
  assert.equal(roots.length, 2);
  close(roots[0], 0.1);
  close(roots[1], 0.2);
  assert.throws(() => irr([100, 110]));
});
test("negative amortization rejected and zero-rate duration", () => {
  assert.throws(() => duration(10000, 10, 0.02));
  close(duration(12000, 1000, 0), 12);
  assert.throws(() => amortize(10000, 0.02, 120, {}, 10));
});
test("official 2026 bracket boundaries", () => {
  close(ordinaryTax(12400, "single"), 1240);
  close(ordinaryTax(50400, "single"), 5800);
  close(ordinaryTax(24800, "married_joint"), 2480);
  close(ordinaryTax(100800, "married_joint"), 11600);
});
test("debt avalanche zero-rate independent fixture", () => {
  const result = debtSchedule(
    [
      { name: "A", balance: 1000, minimum: 100, rate: 0 },
      { name: "B", balance: 500, minimum: 50, rate: 0 },
    ],
    300,
    true,
  );
  assert.equal(result.metrics[0].value, 5);
  close(result.metrics[1].value, 0);
  close(result.metrics[2].value, 1500);
});
test("scope preserves financial entries, evergreen tools and four mortgage decision tools", () => {
  assert.equal(calculators.filter(c=>c.category!=="Everyday Tools").length,129);
  assert.equal(calculators.length, 134);
  assert.equal(new Set(calculators.map((c) => c.id)).size, 134);
  assert.equal(new Set(calculators.map((c) => routeFor(c.id))).size, 134);
  assert.equal(calculators.filter((c) => c.directory).length, 1);
  assert.equal(routeFor("income-tax"), "/tax-calculator.html");
  assert.equal(routeFor("debt-to-income-ratio"), "/debt-ratio-calculator.html");
});
for (const calc of calculators) {
  for (const mode of calc.modes) {
    test(`default numeric smoke: ${calc.id}/${mode.id}`, () => {
      const values = defaults(mode);
      if (calc.id === "currency" && mode.id === "live") {
        assert.throws(() => runCalculation(calc.id, mode.id, values));
        return;
      }
      const result = runCalculation(calc.id, mode.id, values);
      assert.ok(result.metrics.length);
      assert.ok(result.metrics.every((x) => Number.isFinite(x.value)));
    });
  }
}
test("empty input and numeric overflow never return a result", () => {
  const c = calculators.find((c) => c.id === "loan")!,
    m = c.modes[0],
    v = defaults(m);
  assert.throws(() => runCalculation(c.id, m.id, { ...v, principal: "" }));
  assert.throws(() =>
    runCalculation(c.id, m.id, { ...v, principal: "Infinity" }),
  );
  assert.throws(() => runCalculation(c.id, m.id, { ...v, principal: "1e20" }));
});

test('Extra repayment dates reject fractional periods instead of silently dropping payments',()=>{
 for(const period of [0,1.5,-1,12001,Infinity,NaN]){
  for(const key of ['onceMonth','monthlyStart','yearlyStart'])
   assert.throws(()=>amortize(1000,0,10,{[key]:period,once:100}),/whole number/);
  assert.throws(()=>amortize(1000,0,10,{dated:{[period]:100}}),/whole number/);
 }
 for(const amount of [-1,Infinity,NaN]){
  for(const key of ['monthly','yearly','once'])assert.throws(()=>amortize(1000,0,10,{[key]:amount}));
  assert.throws(()=>amortize(1000,0,10,{dated:{1:amount}}));
 }
 assert.throws(()=>amortize(1000,0,10,{},-1),/greater than zero/);
});

test('Scheduled extra repayments conserve principal, cap oversize extras and honor start dates',()=>{
 const rows=amortize(1000,0,10,{monthly:100,monthlyStart:3,once:100,onceMonth:2,yearly:1000,yearlyStart:5});
 assert.deepEqual(rows.map(row=>row.payment),[100,200,200,200,300]);
 close(sum(rows.map(row=>row.principal)),1000);close(sum(rows.map(row=>row.interest)),0);assert.equal(rows.at(-1)!.balance,0);
 const dated=amortize(1000,0,10,{dated:{2:10000}});assert.deepEqual(dated.map(row=>row.payment),[100,900]);
});

test('Student loan extra repayment rejects fractional one-time month through the public calculator',()=>{
 const mode=calculators.find(c=>c.id==='student-loan')!.modes.find(m=>m.id==='extra')!;
 assert.throws(()=>runCalculation('student-loan','extra',{...defaults(mode),extra_once:'1000',extra_once_month:'1.5'}),/whole number/);
});
