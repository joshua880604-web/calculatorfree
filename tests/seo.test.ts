import { test } from "node:test";
import assert from "node:assert/strict";
import { siteConfig, serializeSchema, absoluteURL } from "../src/lib/site";
import {
  sitemapEntries,
  calculatorMetadata,
  calculatorSchema,
  contentUpdatedOn,
} from "../src/lib/seo";
import { guides } from "../src/lib/guides";
import { calculators, defaults, runCalculation } from "../src/lib/calculators";
test("SEO defaults never invent a public origin or enable preview indexing", () => {
  assert.deepEqual(siteConfig({}), { origin: undefined, indexable: false });
  assert.equal(
    siteConfig({
      SITE_URL: "https://finance.example",
      SITE_INDEXABLE: "true",
      VERCEL_ENV: "preview",
    }).indexable,
    false,
  );
  assert.equal(
    siteConfig({ SITE_URL: "https://finance.example", SITE_INDEXABLE: "true" })
      .indexable,
    true,
  );
  assert.throws(() => siteConfig({ SITE_INDEXABLE: "true" }), /SITE_URL/);
  for (const url of [
    "http://finance.example",
    "https://finance.example/path",
    "https://user:pass@finance.example",
    "https://finance.example/?q=1",
    "https://finance.example/#x",
  ])
    assert.throws(() => siteConfig({ SITE_URL: url }));
});
test("Production sitemap lists canonical pages and only reviewed content dates", () => {
  const config = siteConfig({
    SITE_URL: "https://finance.example/",
    SITE_INDEXABLE: "true",
  });
  const entries = sitemapEntries(config);
  assert.equal(entries.length, 271);
  assert.equal(contentUpdatedOn['/fat-fire-calculator.html'],'2026-10-29');
  assert.equal(contentUpdatedOn['/lean-fire-calculator.html'],'2026-10-29');
  assert.equal(new Set(entries.map((e) => e.url)).size, entries.length);
  assert.ok(
    entries.every(
      (e) =>
        e.url.startsWith("https://finance.example/") &&
        !e.url.includes("?") && !e.url.includes("#") &&
        e.lastModified === contentUpdatedOn[new URL(e.url).pathname],
    ),
  );
  assert.ok(
    !entries.some(
      (e) => e.url === "https://finance.example/" || e.url.includes("/api/"),
    ),
  );
  assert.equal(sitemapEntries(siteConfig({})).length, 0);
  assert.equal(entries.filter(e=>e.lastModified).length,Object.keys(contentUpdatedOn).length);
  assert.equal(contentUpdatedOn['/mortgage-calculator.html'],'2026-10-31');
  assert.equal(contentUpdatedOn['/guides/'],'2026-11-01');
  for(const path of ['/seller-financing-calculator.html','/fix-and-flip-calculator.html','/pmi-calculator.html','/house-affordability-calculator.html','/glossary/interest-only-and-balloon-loans/','/glossary/private-mortgage-insurance/','/glossary/debt-to-income-ratio/','/glossary/down-payment/'])assert.equal(contentUpdatedOn[path],'2026-11-01');
  for(const path of ['/stock-profit-calculator.html','/stock-average-calculator.html','/irr-calculator.html','/mirr-calculator.html','/glossary/return-on-investment/','/glossary/internal-rate-of-return/','/glossary/modified-internal-rate-of-return/'])assert.equal(contentUpdatedOn[path],'2026-11-01');
  for(const path of ['/noi-calculator.html','/cap-rate-calculator.html','/rental-property-calculator.html','/heloc-calculator.html','/glossary/net-operating-income/','/glossary/cap-rate-vs-cash-on-cash-return/','/glossary/home-equity-and-heloc/'])assert.equal(contentUpdatedOn[path],'2026-11-01');
  for(const path of ['/guides/pay-off-mortgage-or-invest/','/guides/should-you-reinvest-dividends/','/guides/roth-conversion-ladder/'])assert.equal(contentUpdatedOn[path],'2026-10-31');
  assert.equal(contentUpdatedOn['/privacy.html'],'2026-10-29');
  assert.equal(contentUpdatedOn['/about.html'],'2026-10-31');
  assert.equal(contentUpdatedOn['/methodology.html'],'2026-10-31');
  assert.equal(contentUpdatedOn['/401k-calculator.html'],'2026-11-01');
  assert.equal(contentUpdatedOn['/rmd-calculator.html'],'2026-11-01');
  assert.equal(contentUpdatedOn['/guides/debt-snowball-vs-avalanche/'],'2026-10-30');
  assert.equal(contentUpdatedOn['/guides/mortgage-recast-vs-refinance/'],'2026-10-30');
  for (const path of ['/investment-calculator.html','/irr-calculator.html','/social-security-calculator.html','/pension-calculator.html','/annuity-calculator.html','/annuity-payout-calculator.html','/rental-property-calculator.html','/debt-consolidation-calculator.html','/business-loan-calculator.html','/budget-calculator.html','/break-even-calculator.html','/roi-calculator.html','/noi-calculator.html','/fire-calculator.html','/mirr-calculator.html','/guides/how-to-calculate-coast-fire/','/coast-fire-calculator.html','/roas-calculator.html','/landed-cost-calculator.html','/quick-ratio-calculator.html','/current-ratio-calculator.html','/boat-loan-calculator.html','/auto-lease-calculator.html','/cash-back-or-low-interest-calculator.html','/heloc-calculator.html','/home-equity-loan-calculator.html','/student-loan-calculator.html','/personal-loan-calculator.html','/retirement-calculator.html','/roth-ira-calculator.html','/house-affordability-calculator.html','/fha-loan-calculator.html','/va-mortgage-calculator.html','/pmi-calculator.html']) assert.equal(contentUpdatedOn[path], ['/budget-calculator.html','/rent-affordability-calculator.html','/savings-calculator.html','/simple-interest-calculator.html','/fha-loan-calculator.html','/va-mortgage-calculator.html','/auto-lease-calculator.html','/cash-back-or-low-interest-calculator.html','/auto-loan-calculator.html','/boat-loan-calculator.html','/home-equity-loan-calculator.html','/debt-consolidation-calculator.html','/pension-calculator.html','/social-security-calculator.html','/annuity-calculator.html','/annuity-payout-calculator.html','/roi-calculator.html','/break-even-calculator.html','/personal-loan-calculator.html','/student-loan-calculator.html','/business-loan-calculator.html','/pmi-calculator.html','/house-affordability-calculator.html','/irr-calculator.html','/mirr-calculator.html','/retirement-calculator.html','/noi-calculator.html','/rental-property-calculator.html','/heloc-calculator.html'].includes(path) ? '2026-11-01' : ['/guides/how-to-calculate-coast-fire/','/coast-fire-calculator.html','/roi-calculator.html','/landed-cost-calculator.html'].includes(path) ? '2026-10-31' : path.startsWith('/guides/') || ['/coast-fire-calculator.html','/roas-calculator.html'].includes(path) ? '2026-10-30' : ['/coast-fire-calculator.html','/roi-calculator.html','/roas-calculator.html','/retirement-calculators.html','/loan-calculators.html'].includes(path) ? '2026-10-29' : '2026-10-28');
  for(const path of ['/coast-fire-calculator.html','/roi-calculator.html','/rent-vs-buy-calculator.html','/multiple-credit-card-payoff-calculator.html','/brrrr-calculator.html','/roas-calculator.html'])assert.equal(contentUpdatedOn[path],path==='/roi-calculator.html'?'2026-11-01':path==='/coast-fire-calculator.html'?'2026-10-31':['/brrrr-calculator.html','/roas-calculator.html'].includes(path)?'2026-10-30':'2026-10-29');
  for(const path of ['/savings-calculator.html','/simple-interest-calculator.html','/glossary/apy/','/glossary/simple-interest/'])assert.equal(contentUpdatedOn[path],'2026-11-01');
  for(const path of ['/budget-calculator.html','/rent-affordability-calculator.html','/glossary/budget-and-savings-rate/','/glossary/debt-to-income-ratio/'])assert.equal(contentUpdatedOn[path],'2026-11-01');
  for(const path of ['/future-value-calculator.html','/present-value-calculator.html','/glossary/time-value-of-money/'])assert.equal(contentUpdatedOn[path],'2026-11-01');
  assert.ok(Object.entries(contentUpdatedOn).filter(([path])=>!['/future-value-calculator.html','/present-value-calculator.html','/guides/how-to-calculate-future-value/','/guides/how-to-calculate-present-value/'].includes(path)).filter(([path])=>!['/budget-calculator.html','/rent-affordability-calculator.html','/guides/how-to-calculate-monthly-budget/','/guides/how-to-calculate-rent-affordability/'].includes(path)).filter(([path])=>!['/savings-calculator.html','/simple-interest-calculator.html'].includes(path)).filter(([path])=>!['/about.html','/methodology.html','/house-hacking-calculator.html','/cash-on-cash-return-calculator.html','/guides/what-is-house-hacking/','/guides/how-to-calculate-cash-on-cash-return/','/guides/how-to-calculate-landed-cost/','/compound-interest-calculator.html','/guides/annualized-return-vs-total-return/','/guides/compound-interest-with-monthly-contributions/','/guides/how-to-calculate-monthly-mortgage-payment/'].includes(path)).filter(([path])=>!['/guides/coast-fire-inflation-sensitivity/','/guides/brrrr-refinance-cash-flow-analysis/','/guides/roas-profit-margin-analysis/'].includes(path)&&!['/stock-profit-calculator.html','/stock-average-calculator.html','/seller-financing-calculator.html','/fix-and-flip-calculator.html','/cap-rate-calculator.html','/credit-card-minimum-payment-calculator.html','/roth-conversion-ladder-calculator.html','/drip-calculator.html','/embed-resources','/rent-vs-buy-calculator.html','/covered-call-calculator.html','/house-hacking-calculator.html','/pay-off-mortgage-vs-invest-calculator.html','/cash-on-cash-return-calculator.html','/brrrr-calculator.html','/barista-fire-calculator.html','/guides/barista-fire-vs-coast-fire/','/self-employment-tax-calculator.html','/apr-calculator.html','/hsa-calculator.html','/debt-snowball-calculator.html','/debt-avalanche-calculator.html','/guides/how-to-calculate-debt-snowball/','/guides/how-to-calculate-debt-avalanche/','/fat-fire-calculator.html','/lean-fire-calculator.html','/investment-calculator.html','/irr-calculator.html','/social-security-calculator.html','/pension-calculator.html','/annuity-calculator.html','/annuity-payout-calculator.html','/rental-property-calculator.html','/debt-consolidation-calculator.html','/business-loan-calculator.html','/budget-calculator.html','/break-even-calculator.html','/roi-calculator.html','/noi-calculator.html','/fire-calculator.html','/mirr-calculator.html','/guides/how-to-calculate-coast-fire/','/coast-fire-calculator.html','/roas-calculator.html','/landed-cost-calculator.html','/quick-ratio-calculator.html','/current-ratio-calculator.html','/boat-loan-calculator.html','/auto-lease-calculator.html','/cash-back-or-low-interest-calculator.html','/heloc-calculator.html','/home-equity-loan-calculator.html','/student-loan-calculator.html','/personal-loan-calculator.html','/retirement-calculator.html','/401k-calculator.html','/roth-ira-calculator.html','/rmd-calculator.html','/house-affordability-calculator.html','/fha-loan-calculator.html','/va-mortgage-calculator.html','/guides/margin-vs-markup/','/salary-calculator.html','/paycheck-calculator.html','/single-credit-card-payoff-calculator.html','/multiple-credit-card-payoff-calculator.html','/loan-repayment-calculator.html','/rent-affordability-calculator.html','/currency-converter.html','/margin-calculator.html','/markup-calculator.html','/guides/should-i-pay-off-debt-or-save/','/guides/apr-vs-interest-rate/','/guides/is-refinancing-worth-it/','/guides/roth-ira-vs-traditional-ira/','/guides/how-much-emergency-fund-should-i-have/','/guides/rent-vs-buy-a-house/','/guides/are-mortgage-points-worth-it/','/guides/pay-off-car-loan-early/','/guides/biweekly-vs-monthly-mortgage-payments/','/guides/cd-vs-savings-account/','/retirement-calculators.html','/tax-income-calculators.html','/business-calculators.html','/everyday-calculators.html','/privacy.html','/guides/debt-snowball-vs-avalanche/','/guides/','/guides/mortgage-recast-vs-refinance/','/mortgage-calculator.html','/pmi-calculator.html','/biweekly-mortgage-calculator.html','/discount-points-calculator.html','/real-estate-calculator.html','/loan-calculators.html','/savings-investment-calculators.html','/cd-calculator.html','/mortgage-recast-calculator.html','/tax-equivalent-yield-calculator.html','/treasury-bill-calculator.html'].includes(path)).filter(([path])=>!['/guides/how-long-will-retirement-savings-last/','/guides/how-does-an-hsa-work/','/guides/how-to-calculate-rmd/','/guides/how-401k-matching-works/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-net-operating-income/','/guides/how-to-calculate-cap-rate/','/guides/how-to-calculate-rental-property-cash-flow/','/guides/how-are-heloc-payments-calculated/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-stock-profit/','/guides/how-to-calculate-average-stock-price/','/guides/how-to-calculate-irr/','/guides/how-to-calculate-mirr/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-seller-financing/','/guides/how-to-calculate-house-flipping-profit/','/guides/how-to-calculate-pmi-and-cancellation/','/guides/how-much-house-can-i-afford/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-personal-loan-payments/','/guides/how-to-calculate-student-loan-payments/','/guides/how-to-calculate-business-loan-payments/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-roi/','/guides/how-to-calculate-break-even-point/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-annuity-future-value/','/guides/how-to-calculate-annuity-payouts/'].includes(path)).filter(([path])=>!['/guides/pension-lump-sum-vs-monthly-payments/','/guides/how-to-compare-social-security-claiming-ages/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-home-equity-loan-payments/','/guides/how-to-compare-debt-consolidation-loans/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-auto-loan-payments/','/guides/how-to-calculate-boat-loan-payments/'].includes(path)).filter(([path])=>path!=='/auto-loan-calculator.html').filter(([path])=>!['/guides/how-to-calculate-auto-lease-payments/','/guides/cash-rebate-vs-low-interest-financing/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-fha-loan-payments/','/guides/how-to-calculate-va-loan-payments/'].includes(path)).filter(([path])=>!['/guides/how-to-calculate-savings-goal/','/guides/how-to-calculate-simple-interest/'].includes(path)).filter(([path])=>!path.startsWith('/glossary/')&&!['/guides/pay-off-mortgage-or-invest/','/guides/should-you-reinvest-dividends/','/guides/roth-conversion-ladder/'].includes(path)).every(([,date])=>date==='2026-10-25'));
  assert.ok(!entries.some(e=>e.url.endsWith('/llms.txt')||e.url.endsWith('/sitemap.xml')));
});
test("Calculator canonicals consolidate shared query variants and schema matches the real app", () => {
  const calc = calculators.find((c) => c.id === "vat")!,
    config = siteConfig({
      SITE_URL: "https://finance.example",
      SITE_INDEXABLE: "true",
    });
  const metadata = calculatorMetadata(calc, config);
  assert.equal(
    metadata.alternates?.canonical,
    "https://finance.example/vat-calculator.html",
  );
  const schema = calculatorSchema(calc, config);
  assert.equal(schema["@graph"][0].name, calc.title);
  assert.ok(schema["@graph"].some((x) => x["@type"] === "BreadcrumbList"));
  const text = serializeSchema(schema);
  assert.ok(!text.includes("aggregateRating") && !text.includes("reviewedBy"));
  assert.ok(
    !serializeSchema({ value: "</script><script>alert(1)</script>" }).includes(
      "<",
    ),
  );
  assert.ok(
    !JSON.stringify(calculatorMetadata(calc, siteConfig({}))).includes(
      "finance.example",
    ),
  );
});
for (const [id, guide] of Object.entries(guides))
  for (const example of guide.examples)
    test("Published worked example: " + id + " / " + example.title, () => {
      const mode = calculators
        .find((c) => c.id === id)!
        .modes.find((m) => m.id === example.mode)!;
      assert.ok(mode);
      const result = runCalculation(id, mode.id, {
        ...defaults(mode),
        ...Object.fromEntries(
          Object.entries(example.values).map(([k, v]) => [k, String(v)]),
        ),
      });
      const metric = result.metrics.find(
        (m) => m.label === example.expected.label,
      );
      assert.ok(metric);
      assert.ok(
        Math.abs(metric.value - example.expected.value) <=
          (example.expected.tolerance ?? 0.005),
        `${metric.value} != ${example.expected.value}`,
      );
      assert.ok(guide.scope.length > 50 && guide.sources.length > 0);
    });

import { relatedCalculatorIds } from "../src/lib/guides";
test("Contextual related tools are real, distinct and not self-links", () => {
  for (const [id, related] of Object.entries(relatedCalculatorIds)) {
    assert.ok(calculators.some((c) => c.id === id));
    assert.equal(new Set(related).size, related.length);
    for (const link of related) {
      assert.notEqual(link, id);
      assert.ok(
        calculators.some((c) => c.id === link),
        link,
      );
    }
  }
});

test("Every functional calculator has a unique guide, reproducible examples and specific questions", () => {
  const tools=calculators.filter(c=>!c.directory);
  assert.equal(tools.length,115);
  assert.equal(Object.keys(guides).length,115);
  assert.equal(new Set(Object.values(guides).map(g=>g.summary)).size,115);
  for(const tool of tools){
    const guide=guides[tool.id];assert.ok(guide,tool.id);
    assert.ok(guide.summary.length>80 && guide.scope.length>50,tool.id);
    assert.ok(guide.questions.length>=2 && guide.examples.length>=1,tool.id);
    assert.equal(new Set(guide.questions.map(q=>q.question)).size,guide.questions.length);
    for(const e of guide.examples){
      const mode=tool.modes.find(m=>m.id===e.mode)!;
      for(const [key,value] of Object.entries(e.values)){
        const field=mode.fields.find(f=>f.key===key);assert.ok(field,tool.id+key);
        if(field.options)assert.ok(field.options.includes(String(value)),tool.id+key);
      }
    }
  }
});


test("Production SEO follows the confirmed www extensionless destination while old routes stay intact", () => {
 for (const origin of ["https://calculatorfree.io", "https://www.calculatorfree.io"]) {
  const config=siteConfig({SITE_URL:origin,SITE_INDEXABLE:"true"});
  assert.equal(config.origin,"https://www.calculatorfree.io");
  assert.equal(absoluteURL("/cd-calculator.html",config),"https://www.calculatorfree.io/cd-calculator");
  assert.equal(absoluteURL("/glossary/",config),"https://www.calculatorfree.io/glossary/");
  const entries=sitemapEntries(config);
  assert.equal(entries.length,271);
  assert.equal(new Set(entries.map(e=>e.url)).size,271);
  assert.ok(entries.every(e=>e.url.startsWith("https://www.calculatorfree.io/")&&!e.url.endsWith(".html")&&!e.url.includes("?")));
  for (const calc of calculators.filter(c=>!c.directory)) {
   const app=calculatorSchema(calc,config)["@graph"][0];
   assert.equal(app.url,calculatorMetadata(calc,config).alternates?.canonical);
   assert.deepEqual(app.offers,{"@type":"Offer",price:"0",priceCurrency:"USD",url:app.url});
   assert.ok(!("aggregateRating" in app)&&!("review" in app));
  }
 }
 assert.equal(absoluteURL("/cd-calculator.html",siteConfig({SITE_URL:"https://finance.example",SITE_INDEXABLE:"true"})),"https://finance.example/cd-calculator.html");
});
