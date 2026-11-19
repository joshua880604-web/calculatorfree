import {publisherIdentity} from './content-transparency';
import {embedResourcesPath,embedResourcesReviewedOn} from './embed-resources';
import {motherPageIds,motherPageReviewedOn} from './mother-page-ui';
import {guidesPath,editorialGuides,guideContentDate} from './editorial-guides';
import {categoryPages,type CategoryPage} from './category-pages';
import {calculatorCategories,calculatorCategory,categoryPaths} from './calculator-categories';
import guideInsights from "./guide-insights.json";
import {keywordTitles,searchTasks} from "./keyword-targets";
import type { Metadata } from "next";
import catalog from "./catalog-data.json";
import {
  absoluteURL,
  directoryPath,
  siteConfig,
  siteName,
  type SiteConfig,
} from "./site";
import type { Calculator } from "./types";
import {glossaryPath,glossaryTerms,glossaryTermPath} from './glossary';
import { longTailContent } from './long-tail-content';
const titles: Record<string, string> = {
  vat: "VAT Calculator - Add VAT, Remove VAT & Find the Rate",
  mortgage: "Mortgage Calculator - Monthly Payment & Amortization",
  loan: "Loan Calculator - Payments, Interest & Payoff",
  retirement: "Retirement Calculator - Savings & Monthly Withdrawals",
  "401k": "401(k) Calculator - Contributions & Employer Match",
  "income-tax": "Income Tax Calculator - 2025 & 2026 Federal Estimate",
  "compound-interest":
    "Compound Interest Calculator - Growth & Contributions",
  interest: "Interest Calculator - Savings Growth & Contributions",
};
// Page summaries describe the supported task without changing search-mode labels.
const descriptions: Record<string,string> = {
 'credit-card-minimum-payment':'Estimate a changing credit card minimum, payoff time and interest from your rule. Compare minimum-only payments with extra above each minimum.',
 'boat-loan':'Estimate boat loan payments, total interest and an amortization schedule. Include down payment, trade-in and entered taxes or fees; rates are assumed.',
 'down-payment':'Calculate a home down payment plus entered closing costs. Or use available cash to solve for a home price or down-payment percentage.',
 'capital-gains-tax':'Use the Capital Gains Tax Calculator to estimate incremental 2025 or 2026 U.S. federal tax on a sale, including optional NIIT. See scope and exclusions.',
 'credit-utilization':'Use the Credit Utilization Calculator to compare overall and per-card ratios and estimate payments to chosen targets. No credit-score prediction.',
 'auto-lease':'Use the Auto Lease Calculator to estimate payments from price, residual value, money factor and entered monthly tax. Compare modeled cash outlay.',
 'present-value':'Use the Present Value Calculator to discount a future lump sum or regular payments. Match the discount rate to each cash-flow period.',
 'annuity':'Use the Annuity Calculator to estimate future value from starting principal and regular contributions. Compare deposit timing under an assumed return.',
};
export function pageMetadata(
  path: string,
  title: string,
  description: string,
  config = siteConfig(),
): Metadata {
  const url = absoluteURL(path, config);
  const image = absoluteURL('/social/og-default-v1.png', config);
  return {
    title: title.length + (` | ${siteName}`).length > 70 || title.toLowerCase().includes(siteName) ? { absolute: title } : title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: { index: config.indexable, follow: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title,
      description,
      ...(url ? { url } : {}),
      ...(image ? {images:[{url:image,width:1200,height:630,type:'image/png',alt:'CalculatorFree.io — free financial calculators for mortgages, investing and retirement.'}]} : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? {images:[image]} : {}) },
  };
}
export function calculatorMetadata(calc: Calculator, config = siteConfig()) {
  return pageMetadata(
    catalog.find((c) => c.id === calc.id)!.local_route,
    keywordTitles[calc.id] ?? titles[calc.id] ?? calc.title,
    descriptions[calc.id] ?? searchTasks[calc.id]?.[0].description ?? calc.intro,
    config,
  );
}
// Dates record reviewed content changes, never the current build time.
export const contentUpdatedOn: Record<string, string> = {
 '/1031-exchange-calculator.html':'2026-11-05',
 '/home-maintenance-cost-calculator.html':'2026-11-05',
 '/vacancy-rate-calculator.html':'2026-11-05',
 '/credit-utilization-calculator.html':'2026-11-05',
 '/dca-calculator.html':'2026-11-05',
 '/rule-of-72-calculator.html':'2026-11-05',
 '/capital-gains-tax-calculator.html':'2026-11-05',

 '/retirement-withdrawal-calculator.html':'2026-11-05',
 '/balance-transfer-calculator.html':'2026-11-05',
 '/dscr-calculator.html':'2026-11-05',
 '/fsa-calculator.html':'2026-11-05',
 '/closing-cost-calculator.html':'2026-11-05',

 '/stock-profit-calculator.html':'2026-10-31',
 '/stock-average-calculator.html':'2026-10-31',
  '/seller-financing-calculator.html':'2026-10-31',
  '/fix-and-flip-calculator.html':'2026-10-31',
  "/cap-rate-calculator.html":"2026-10-30",
  "/credit-card-minimum-payment-calculator.html":"2026-10-30",
  "/roth-conversion-ladder-calculator.html":"2026-10-30",
  "/drip-calculator.html":"2026-10-30",
  "/privacy.html":"2026-10-29",
  [embedResourcesPath]:embedResourcesReviewedOn,
  [guidesPath]:'2026-10-31',
  ...Object.fromEntries(editorialGuides.map(guide=>[guide.path,guideContentDate(guide)])),
  "/tax-equivalent-yield-calculator.html": "2026-10-27",
  "/treasury-bill-calculator.html": "2026-10-27",
  "/mortgage-recast-calculator.html": "2026-10-26",
  ...Object.fromEntries(categoryPages.map(page=>[page.path,page.updatedOn])),
  "/pmi-calculator.html": "2026-10-28",
  "/biweekly-mortgage-calculator.html": "2026-10-26",
  "/discount-points-calculator.html": "2026-10-27",
  ...Object.fromEntries(Object.entries(longTailContent).map(([id,content])=>[catalog.find(c=>c.id===id)!.local_route,content.updatedOn])),
  "/fha-loan-calculator.html": "2026-10-28",
  "/marriage-calculator.html": "2026-10-25",
  "/va-mortgage-calculator.html": "2026-10-28",
  "/mortgage-calculator.html": "2026-10-31",
  "/methodology.html": "2026-10-31",
  "/compound-interest-calculator.html": "2026-10-25",
  "/average-return-calculator.html": "2026-10-25",
  "/irr-calculator.html": "2026-10-28",
  "/401k-calculator.html": "2026-10-29",
  "/ira-calculator.html": "2026-10-25",
  "/roth-ira-calculator.html": "2026-10-28",
  "/rmd-calculator.html": "2026-10-29",
  "/tax-calculator.html": "2026-10-25",
  "/estate-tax-calculator.html": "2026-10-25",
  "/paycheck-calculator.html": "2026-10-28",
  "/social-security-calculator.html": "2026-10-28",

};
contentUpdatedOn[glossaryPath]='2026-10-31';
for(const slug of ['lean-fire','fat-fire','dividend-reinvestment-plan','roth-conversion-ladder','roth-ira-five-year-rules','covered-call','cap-rate-vs-cash-on-cash-return','net-operating-income','contribution-margin'])contentUpdatedOn[glossaryTermPath(slug)]='2026-10-31';
for(const id of motherPageIds)contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]=motherPageReviewedOn;
// Original blogger copy and related model analyses added on this reviewed date.
for(const id of ["coast-fire","brrrr","roas"])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]="2026-10-30";

for(const id of ['mortgage','compound-interest','roi','coast-fire','house-hacking','cash-on-cash-return','landed-cost'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-10-31';

contentUpdatedOn['/about.html']='2026-10-31';
// Added reviewed guide links; model inputs and rules are unchanged.
for(const id of ['retirement','hsa','rmd','401k'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/guides/']='2026-11-03';
for(const slug of ['401k','employer-match-and-vesting','withdrawal-rate'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

// New property guides and scoped explanatory additions, checked November 1.
for(const id of ['noi','cap-rate','rental-property','heloc'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['net-operating-income','cap-rate-vs-cash-on-cash-return','home-equity-and-heloc'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

// Investment guide links and scoped model explanations, checked November 1.
for(const id of ['stock-profit','stock-average','irr','mirr'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['return-on-investment','internal-rate-of-return','modified-internal-rate-of-return'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

// Housing guide links and scoped explanations, checked November 1.
for(const id of ['seller-financing','fix-and-flip','pmi','house-affordability'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['interest-only-and-balloon-loans','private-mortgage-insurance','debt-to-income-ratio','down-payment','return-on-investment'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

export function sitemapEntries(config: SiteConfig = siteConfig()) {
  if (!config.origin || !config.indexable) return [];
  return [
    ...catalog.map((c) => c.local_route),
    ...categoryPages.filter(page=>!catalog.some(c=>c.local_route===page.path)).map(page=>page.path),
    directoryPath,
    "/about.html",
    "/privacy.html",
    "/disclaimer.html",
    "/methodology.html",
    glossaryPath,
    guidesPath,
    embedResourcesPath,
    ...editorialGuides.map(guide=>guide.path),
    ...glossaryTerms.map(term=>glossaryTermPath(term.slug)),
  ].map((path) => ({ url: absoluteURL(path, config)!, ...(contentUpdatedOn[path] ? { lastModified: contentUpdatedOn[path] } : {}) }));
}
export function calculatorSchema(calc: Calculator, config = siteConfig()) {
  const path = catalog.find((c) => c.id === calc.id)!.local_route,
    url = absoluteURL(path, config);
  const parent=calculatorCategory(calc.id);
  const parentPath=parent ? categoryPaths[parent.id] : undefined;
  const hasCategoryParent=Boolean(parentPath&&parentPath!==path);
  const app = {
    "@type": "WebApplication",
    name: calc.title,
    description: calc.intro,
    applicationCategory: calc.category === "Everyday Tools" ? "UtilitiesApplication" : "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    publisher: publisherIdentity(config),
    featureList: searchTasks[calc.id]?.map(task=>task.keyword) ?? calc.modes.map(mode=>mode.title),
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      ...(url ? { url } : {}),
    },
    inLanguage: "en",
    ...(url ? { "@id": url + "#calculator", url } : {}),
  };
  const graph: Record<string, unknown>[] = [app];
  if (url) {
    graph.push({
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      name: calc.title,
      description: calc.intro,
      inLanguage: "en",
      mainEntity: { "@id": url + "#calculator" },
      isPartOf: { "@type": "WebPage", url: absoluteURL(directoryPath, config) },
      hasPart: calc.directory ? undefined : [
        ...(calc.id in guideInsights ? [
          { "@type": "WebPageElement", "@id": url + "#reading-results", name: "Reading your result" },
          { "@type": "WebPageElement", "@id": url + "#compare-scenarios", name: "Compare two scenarios" },
        ] : []),
        { "@type": "WebPageElement", "@id": url + "#worked-examples", name: "Worked examples" },
        { "@type": "WebPageElement", "@id": url + "#scope-assumptions", name: "Scope and assumptions" },
      ],
    });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Financial calculators",
          item: absoluteURL(directoryPath, config),
        },
        ...(hasCategoryParent ? [{"@type":"ListItem",position:2,name:parent!.title,item:absoluteURL(parentPath!,config)}] : []),
        { "@type": "ListItem", position: hasCategoryParent?3:2, name: calc.title, item: url },
      ],
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function categoryPageSchema(page:CategoryPage,config=siteConfig()) {
 const url=absoluteURL(page.path,config),group=calculatorCategories.find(group=>group.id===page.id)!;
 const items=(group.sections?.flatMap(section=>section.tools)??group.tools).filter(id=>id!=='real-estate').map(id=>catalog.find(tool=>tool.id===id)!);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage',name:page.heading,description:page.description,...(url?{'@id':url,url,mainEntity:{'@id':url+'#category-tools'}}:{})},
  {'@type':'ItemList',...(url?{'@id':url+'#category-tools'}:{}),numberOfItems:items.length,itemListElement:items.map((tool,index)=>({'@type':'ListItem',position:index+1,name:tool.title,...(absoluteURL(tool.local_route,config)?{url:absoluteURL(tool.local_route,config)}:{})}))},
  ...(url?[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Financial calculators',item:absoluteURL(directoryPath,config)},{'@type':'ListItem',position:2,name:page.heading,item:url}]}]:[])
 ]};
}

for(const id of ['personal-loan','student-loan','business-loan'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['amortization','apr'])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

for(const id of ['roi','break-even'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['return-on-investment','break-even-point'])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

for(const id of ['annuity','annuity-payout'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/glossary/annuity/']='2026-11-01';

for(const id of ['pension','social-security'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['defined-benefit-pension','social-security-benefits'])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

for(const id of ['home-equity-loan','debt-consolidation'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['home-equity-and-heloc','debt-consolidation'])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

for(const id of ['auto-loan','boat-loan'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/glossary/amortization/']='2026-11-01';

for(const id of ['auto-lease','cash-back-or-low-interest'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/glossary/apr/']='2026-11-01';
contentUpdatedOn['/glossary/lease-residual-value/']='2026-11-01';

for(const id of ['fha-loan','va-mortgage'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/glossary/down-payment/']='2026-11-01';

for(const id of ['savings','simple-interest'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['apy','simple-interest'])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

for(const id of ['budget','rent'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
for(const slug of ['budget-and-savings-rate','debt-to-income-ratio'])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

for(const id of ['future-value','present-value'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/glossary/time-value-of-money/']='2026-11-01';

// Remaining financial-tool source/context review, 2026-11-01.
for(const id of ["amortization", "debt-to-income-ratio", "down-payment", "interest", "finance", "interest-rate", "bond", "mutual-fund", "payback-period", "income-tax", "salary", "marriage-tax", "estate-tax", "take-home-paycheck", "payment", "currency", "inflation", "college-cost", "sales-tax", "vat", "depreciation", "discount", "lease", "commission", "cagr", "investment-fee", "real-return", "tax-equivalent-yield", "treasury-bill", "quick-ratio", "current-ratio", "self-employment-tax", "covered-call", "credit-card-minimum-payment"])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-01';
contentUpdatedOn['/guides/compound-interest-with-monthly-contributions/']='2026-11-01';

for(const slug of ["amortization", "apr", "bond-yield", "cagr", "commission", "debt-to-income-ratio", "depreciation", "estate-vs-inheritance-tax", "exchange-rate", "expense-ratio", "gross-vs-net-pay", "inflation", "lease-residual-value", "loan-to-value-ratio", "marginal-vs-effective-tax-rate", "net-present-value", "quick-ratio", "real-rate-of-return", "return-on-investment", "sales-tax-vs-vat", "simple-interest"])contentUpdatedOn['/glossary/'+slug+'/']='2026-11-01';

// Six scoped glossary definitions and reciprocal concept links added November 1.
for(const slug of ['health-savings-account','brrrr-method','sequence-of-returns-risk','return-on-ad-spend','landed-cost','cost-basis'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

// Three property definitions and a withdrawal-rule clarification, checked November 1.
for(const slug of ['house-hacking','loan-seasoning','cash-out-refinance','withdrawal-rate'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

// Property operating assumptions and dividend-income definition, checked November 1.
for(const slug of ['after-repair-value','vacancy-rate','capital-expenditure','debt-service-coverage-ratio','dividend-yield'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-01';

for(const id of ['salary','ira'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-02';

contentUpdatedOn[catalog.find(c=>c.id==='refinance')!.local_route]='2026-11-02';

for(const id of ['biweekly-mortgage','mortgage-recast','emergency-fund','take-home-paycheck','roth-ira'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-02';

// Date only the eight pages receiving new mode walkthroughs and example checks.
for(const id of ['loan','finance','bond','average-return','margin','mortgage-payoff','depreciation','lease'])
 contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-02';

// Substantive homepage/contact/privacy changes and the corrected contextual links.
for(const path of [directoryPath,'/about.html','/privacy.html','/methodology.html','/covered-call-calculator.html'])
 contentUpdatedOn[path]='2026-11-02';

// Reviewed new guide relationships; calculation models are unchanged.
for(const id of ['refinance','drip','stock-profit','mortgage'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-03';


// New comparison guides and their visible tool/category reading links, November 3.
for(const id of ['apr','compound-interest','cd','hsa','simple-interest','401k','roth-ira','ira','refinance','heloc','home-equity-loan','mortgage','mortgage-payoff','retirement','fire','social-security','coast-fire','savings','cap-rate'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-03';
for(const path of ['/guides/','/real-estate-calculator.html','/retirement-calculators.html','/savings-investment-calculators.html'])contentUpdatedOn[path]='2026-11-03';
contentUpdatedOn['/guides/compound-interest-with-monthly-contributions/']='2026-11-03';

// Four additional guides and reciprocal reading links, checked November 4.
for(const id of ["break-even", "credit-card", "debt-consolidation", "heloc", "home-equity-loan", "ira", "margin", "markup", "personal-loan", "roth-conversion-ladder"])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-04';
for(const path of ['/guides/','/retirement-calculators.html','/business-calculators.html','/real-estate-calculator.html','/loan-calculators.html'])contentUpdatedOn[path]='2026-11-04';

// New embed controls and public Pinterest cover assets, November 4.
for(const id of ["auto-loan", "personal-loan", "credit-card", "debt-consolidation", "retirement", "401k", "emergency-fund", "budget"])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-04';

// Four decision guides and their visible reading relationships, November 4.
for(const id of ["auto-loan", "auto-lease", "401k", "investment", "compound-interest", "budget", "emergency-fund"])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-04';
for(const path of ['/guides/','/loan-calculators.html','/retirement-calculators.html','/savings-investment-calculators.html'])contentUpdatedOn[path]='2026-11-04';

// Preserve current review dates on the six guides receiving reciprocal reading links.
for(const path of ["/guides/how-to-calculate-auto-loan-payments/", "/guides/how-to-calculate-auto-lease-payments/", "/guides/how-401k-matching-works/", "/guides/compound-interest-with-monthly-contributions/", "/guides/how-to-calculate-monthly-budget/", "/guides/401k-vs-roth-ira/"])contentUpdatedOn[path]='2026-11-04';

// Roth comparison mode, matched-loan guide, IRR/NPV guide and lease definition.
for(const id of ["401k","fha-loan","mortgage","irr","present-value","auto-lease"])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]="2026-11-04";
for(const path of ["/guides/", "/glossary/", "/loan-calculators.html", "/real-estate-calculator.html", "/savings-investment-calculators.html", "/guides/fha-vs-conventional-loan/", "/guides/irr-vs-npv/", "/glossary/money-factor/", "/glossary/lease-residual-value/", "/glossary/net-present-value/", "/glossary/internal-rate-of-return/", "/guides/how-to-calculate-fha-loan-payments/", "/guides/how-to-calculate-monthly-mortgage-payment/", "/guides/how-to-calculate-irr/", "/guides/how-to-calculate-present-value/", "/guides/how-to-calculate-auto-lease-payments/"])contentUpdatedOn[path]="2026-11-04";

contentUpdatedOn['/stock-average-calculator.html']='2026-11-05';
contentUpdatedOn['/retirement-withdrawal-calculator.html']='2026-11-05';

// New companion articles and concept examples reviewed with their stated model scope.
contentUpdatedOn[glossaryPath]='2026-11-05';
contentUpdatedOn[guidesPath]='2026-11-05';
for(const slug of ['1031-exchange','1031-exchange-boot','credit-utilization','rule-of-72','capital-gains','dollar-cost-averaging','vacancy-rate'])contentUpdatedOn[glossaryTermPath(slug)]='2026-11-05';

// Four new comparison tools: original model and content review.
contentUpdatedOn['/cd-ladder-calculator.html']='2026-11-06';
contentUpdatedOn['/npv-calculator.html']='2026-11-06';
contentUpdatedOn['/lease-vs-buy-car-calculator.html']='2026-11-06';
contentUpdatedOn['/mortgage-comparison-calculator.html']='2026-11-06';
for(const path of ['/financial-calculator.html','/savings-investment-calculators.html','/real-estate-calculator.html','/loan-calculators.html','/guides/cd-ladder/','/guides/irr-vs-npv/','/guides/leasing-vs-buying-a-car/','/guides/15-vs-30-year-mortgage/','/glossary/certificate-of-deposit/','/glossary/net-present-value/','/glossary/lease-residual-value/','/glossary/apr/','/glossary/mortgage-points/'])contentUpdatedOn[path]='2026-11-06';

// New business models, original guides and glossary review.
contentUpdatedOn['/inventory-turnover-calculator.html']='2026-11-06';
contentUpdatedOn['/sba-loan-calculator.html']='2026-11-06';
for(const path of ['/business-calculators.html','/financial-calculator.html','/guides/','/glossary/','/glossary/inventory-turnover/','/glossary/sba-guaranty-fee/'])contentUpdatedOn[path]='2026-11-06';

// Content wording dates are separate from definition/example arithmetic checks.
function recordWordingUpdate(path:string,date:string){
 if(!contentUpdatedOn[path]||date>contentUpdatedOn[path])contentUpdatedOn[path]=date;
}
for(const id of ['credit-card-minimum-payment','boat-loan'])recordWordingUpdate(catalog.find(c=>c.id===id)!.local_route,'2026-11-15');
for(const id of ['capital-gains-tax','credit-utilization','auto-lease','present-value','annuity'])contentUpdatedOn[catalog.find(c=>c.id===id)!.local_route]='2026-11-10';
for(const term of glossaryTerms)if(term.updatedOn){
 recordWordingUpdate(glossaryTermPath(term.slug),term.updatedOn);
 for(const tool of term.tools)recordWordingUpdate(catalog.find(c=>c.id===tool.id)!.local_route,term.updatedOn);
 recordWordingUpdate(glossaryPath,term.updatedOn);
}
for(const guide of editorialGuides)if(guide.linksUpdatedOn){
 recordWordingUpdate(guide.path,guide.linksUpdatedOn);
 recordWordingUpdate(guidesPath,guide.linksUpdatedOn);
}
// Directory search counts describe functional calculators separately from category entries.
recordWordingUpdate('/financial-calculator.html','2026-11-16');

// New capital-cost, CD penalty, cash burn and fixed-bond methods with checked examples.
for(const path of ["/wacc-calculator.html", "/capm-calculator.html", "/cd-early-withdrawal-penalty-calculator.html", "/burn-rate-calculator.html", "/bond-duration-calculator.html", "/business-calculators.html", "/savings-investment-calculators.html", "/financial-calculator.html", "/guides/", "/glossary/"])recordWordingUpdate(path,'2026-11-16');

for(const slug of ['weighted-average-cost-of-capital','capital-asset-pricing-model','bond-duration','cd-early-withdrawal-penalty','burn-rate'])recordWordingUpdate(glossaryTermPath(slug),'2026-11-16');

// New temporary-subsidy, options-payoff, corporate-ratio, project-index and SEPP methods.
for(const path of ["/mortgage-buydown-calculator.html", "/guides/2-1-vs-3-2-1-mortgage-buydown/", "/glossary/temporary-mortgage-buydown/", "/cash-secured-put-calculator.html", "/guides/cash-secured-put-vs-covered-call/", "/glossary/cash-secured-put/", "/profitability-index-calculator.html", "/guides/profitability-index-vs-npv/", "/glossary/profitability-index/", "/return-on-equity-calculator.html", "/guides/roe-dupont-analysis/", "/glossary/return-on-equity/", "/72t-calculator.html", "/guides/72t-sepp-methods-and-rules/", "/glossary/substantially-equal-periodic-payments/", "/financial-calculator.html", "/real-estate-calculator.html", "/savings-investment-calculators.html", "/retirement-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"])recordWordingUpdate(path,'2026-11-17');

// Six new reward, working-capital and corporate-return tasks with checked examples and related-tool links.
for(const path of ["/credit-card-rewards-calculator.html", "/guides/cash-back-vs-points-and-annual-fees/", "/glossary/credit-card-rewards/", "/accounts-receivable-turnover-calculator.html", "/guides/receivables-turnover-vs-dso/", "/glossary/accounts-receivable-turnover/", "/days-payable-outstanding-calculator.html", "/guides/dpo-credit-purchases-vs-cogs/", "/glossary/days-payable-outstanding/", "/cash-conversion-cycle-calculator.html", "/guides/cash-conversion-cycle-vs-operating-cycle/", "/glossary/cash-conversion-cycle/", "/roic-calculator.html", "/guides/roic-vs-roe-roi-and-wacc/", "/glossary/return-on-invested-capital/", "/interest-coverage-ratio-calculator.html", "/guides/interest-coverage-vs-dscr/", "/glossary/interest-coverage-ratio/", "/single-credit-card-payoff-calculator.html", "/balance-transfer-calculator.html", "/budget-calculator.html", "/inventory-turnover-calculator.html", "/quick-ratio-calculator.html", "/current-ratio-calculator.html", "/burn-rate-calculator.html", "/return-on-equity-calculator.html", "/wacc-calculator.html", "/npv-calculator.html", "/roi-calculator.html", "/dscr-calculator.html", "/business-loan-calculator.html", "/financial-calculator.html", "/loan-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"])recordWordingUpdate(path,'2026-11-17');

// Six new market-valuation, risk and acquisition-cost tasks with checked examples and related-tool links.
for(const path of ["/stock-split-calculator.html", "/guides/stock-split-vs-reverse-stock-split/", "/glossary/stock-split/", "/customer-acquisition-cost-calculator.html", "/guides/customer-acquisition-cost-vs-roas/", "/glossary/customer-acquisition-cost/", "/dividend-discount-model-calculator.html", "/guides/dividend-discount-model-vs-dividend-reinvestment/", "/glossary/dividend-discount-model/", "/earnings-per-share-calculator.html", "/guides/basic-eps-vs-diluted-eps/", "/glossary/earnings-per-share/", "/sharpe-ratio-calculator.html", "/guides/sharpe-ratio-vs-total-return/", "/glossary/sharpe-ratio/", "/black-scholes-calculator.html", "/guides/option-theoretical-value-vs-expiration-payoff/", "/glossary/black-scholes-model/", "/stock-average-calculator.html", "/stock-profit-calculator.html", "/roas-calculator.html", "/break-even-calculator.html", "/margin-calculator.html", "/drip-calculator.html", "/capm-calculator.html", "/return-on-equity-calculator.html", "/present-value-calculator.html", "/roic-calculator.html", "/average-return-calculator.html", "/real-return-calculator.html", "/covered-call-calculator.html", "/cash-secured-put-calculator.html", "/financial-calculator.html", "/savings-investment-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"])recordWordingUpdate(path,'2026-11-17');

// Reviewed page/task descriptions replace worked-case labels; calculation methods are unchanged.
for(const path of ["/stock-split-calculator.html", "/customer-acquisition-cost-calculator.html", "/dividend-discount-model-calculator.html", "/earnings-per-share-calculator.html", "/sharpe-ratio-calculator.html", "/black-scholes-calculator.html", "/mortgage-buydown-calculator.html", "/cash-secured-put-calculator.html", "/profitability-index-calculator.html", "/return-on-equity-calculator.html", "/72t-calculator.html"])recordWordingUpdate(path,'2026-11-18');

// Substantive example editing and result explanations; only these tool pages changed.
for(const id of ["mortgage-buydown", "profitability-index", "return-on-equity", "72t", "credit-card-rewards", "accounts-receivable-turnover", "days-payable-outstanding", "cash-conversion-cycle", "roic", "interest-coverage-ratio", "stock-split", "customer-acquisition-cost", "dividend-discount-model", "earnings-per-share", "sharpe-ratio", "black-scholes", "cash-secured-put"])recordWordingUpdate('/'+id+'-calculator.html','2026-11-18');

// Three financial tasks, their original guides and definitions, and updated related links.
for(const path of ["/basis-point-calculator.html", "/guides/basis-points-vs-percentage-points/", "/glossary/basis-point/", "/prorated-rent-calculator.html", "/guides/how-to-prorate-rent-by-days/", "/glossary/prorated-rent/", "/operating-cash-flow-calculator.html", "/guides/operating-cash-flow-vs-net-income/", "/glossary/operating-cash-flow/", "/interest-rate-calculator.html", "/percentage-calculator.html", "/investment-fee-calculator.html", "/rent-affordability-calculator.html", "/rental-property-calculator.html", "/vacancy-rate-calculator.html", "/cash-conversion-cycle-calculator.html", "/roic-calculator.html", "/burn-rate-calculator.html", "/financial-calculator.html", "/real-estate-calculator.html", "/savings-investment-calculators.html", "/business-calculators.html", "/guides/", "/glossary/"])recordWordingUpdate(path,'2026-11-18');

// Edited comparison guides and definitions also change their visible linked term summaries.
for(const path of ["/72t-calculator.html", "/accounts-receivable-turnover-calculator.html", "/average-return-calculator.html", "/black-scholes-calculator.html", "/cash-conversion-cycle-calculator.html", "/cash-secured-put-calculator.html", "/covered-call-calculator.html", "/single-credit-card-payoff-calculator.html", "/credit-card-rewards-calculator.html", "/customer-acquisition-cost-calculator.html", "/days-payable-outstanding-calculator.html", "/dividend-discount-model-calculator.html", "/drip-calculator.html", "/dscr-calculator.html", "/earnings-per-share-calculator.html", "/glossary/", "/glossary/accounts-receivable-turnover/", "/glossary/black-scholes-model/", "/glossary/cash-conversion-cycle/", "/glossary/cash-secured-put/", "/glossary/credit-card-rewards/", "/glossary/customer-acquisition-cost/", "/glossary/days-payable-outstanding/", "/glossary/dividend-discount-model/", "/glossary/earnings-per-share/", "/glossary/interest-coverage-ratio/", "/glossary/profitability-index/", "/glossary/return-on-equity/", "/glossary/return-on-invested-capital/", "/glossary/sharpe-ratio/", "/glossary/stock-split/", "/glossary/substantially-equal-periodic-payments/", "/glossary/temporary-mortgage-buydown/", "/guides/", "/guides/2-1-vs-3-2-1-mortgage-buydown/", "/guides/72t-sepp-methods-and-rules/", "/guides/basic-eps-vs-diluted-eps/", "/guides/cash-back-vs-points-and-annual-fees/", "/guides/cash-conversion-cycle-vs-operating-cycle/", "/guides/cash-secured-put-vs-covered-call/", "/guides/customer-acquisition-cost-vs-roas/", "/guides/dividend-discount-model-vs-dividend-reinvestment/", "/guides/dpo-credit-purchases-vs-cogs/", "/guides/interest-coverage-vs-dscr/", "/guides/option-theoretical-value-vs-expiration-payoff/", "/guides/profitability-index-vs-npv/", "/guides/receivables-turnover-vs-dso/", "/guides/roe-dupont-analysis/", "/guides/roic-vs-roe-roi-and-wacc/", "/guides/sharpe-ratio-vs-total-return/", "/guides/stock-split-vs-reverse-stock-split/", "/interest-coverage-ratio-calculator.html", "/inventory-turnover-calculator.html", "/ira-calculator.html", "/mortgage-buydown-calculator.html", "/mortgage-calculator.html", "/npv-calculator.html", "/profitability-index-calculator.html", "/return-on-equity-calculator.html", "/roas-calculator.html", "/roi-calculator.html", "/roic-calculator.html", "/sharpe-ratio-calculator.html", "/stock-average-calculator.html", "/stock-split-calculator.html"])recordWordingUpdate(path,'2026-11-18');

// Related-reading cards display the edited guide summaries on these existing pages.
for(const path of ["/balance-transfer-calculator.html", "/break-even-calculator.html", "/budget-calculator.html", "/burn-rate-calculator.html", "/business-calculators.html", "/business-loan-calculator.html", "/capm-calculator.html", "/closing-cost-calculator.html", "/current-ratio-calculator.html", "/discount-points-calculator.html", "/irr-calculator.html", "/loan-calculators.html", "/margin-calculator.html", "/mirr-calculator.html", "/mortgage-comparison-calculator.html", "/payback-period-calculator.html", "/present-value-calculator.html", "/quick-ratio-calculator.html", "/real-estate-calculator.html", "/real-return-calculator.html", "/retirement-calculators.html", "/retirement-withdrawal-calculator.html", "/rmd-calculator.html", "/roth-conversion-ladder-calculator.html", "/savings-investment-calculators.html", "/stock-profit-calculator.html", "/wacc-calculator.html"])recordWordingUpdate(path,'2026-11-18');

// Revised definitions and their visible summaries; original calculation-check dates are retained.
for(const path of ["/glossary/weighted-average-cost-of-capital/", "/glossary/capital-asset-pricing-model/", "/glossary/bond-duration/", "/glossary/cd-early-withdrawal-penalty/", "/glossary/burn-rate/", "/glossary/lean-fire/", "/glossary/fat-fire/", "/glossary/", "/wacc-calculator.html", "/capm-calculator.html", "/bond-duration-calculator.html", "/bond-calculator.html", "/cd-early-withdrawal-penalty-calculator.html", "/cd-calculator.html", "/burn-rate-calculator.html", "/current-ratio-calculator.html", "/guides/how-to-calculate-wacc/", "/guides/capm-cost-of-equity-and-market-risk-premium/", "/guides/macaulay-vs-modified-duration/", "/guides/how-to-calculate-cd-early-withdrawal-penalty/", "/guides/gross-vs-net-burn-rate-and-cash-runway/"])recordWordingUpdate(path,'2026-11-18');

// Original specialist tools and their distinct companion articles and terms.
for(const path of ["/business-line-of-credit-calculator.html", "/triple-net-lease-calculator.html", "/arm-mortgage-calculator.html", "/portfolio-rebalancing-calculator.html", "/guides/business-line-of-credit-vs-term-loan/", "/guides/nnn-vs-gross-lease-cost/", "/guides/arm-vs-fixed-mortgage-rate-caps/", "/guides/rebalance-with-contributions-vs-selling/", "/glossary/business-line-of-credit/", "/glossary/triple-net-lease/", "/glossary/adjustable-rate-mortgage/", "/glossary/portfolio-rebalancing/"])recordWordingUpdate(path,'2026-11-18');

// Related reading, definitions and hub cards changed on these rendered pages.
for(const path of ["/1031-exchange-calculator.html", "/apr-calculator.html", "/basis-point-calculator.html", "/burn-rate-calculator.html", "/business-calculators.html", "/business-loan-calculator.html", "/capital-gains-tax-calculator.html", "/dca-calculator.html", "/dscr-calculator.html", "/financial-calculator.html", "/glossary/", "/guides/", "/home-maintenance-cost-calculator.html", "/investment-calculator.html", "/lease-calculator.html", "/loan-calculators.html", "/mortgage-calculator.html", "/mortgage-comparison-calculator.html", "/noi-calculator.html", "/operating-cash-flow-calculator.html", "/prorated-rent-calculator.html", "/real-estate-calculator.html", "/refinance-calculator.html", "/rental-property-calculator.html", "/savings-investment-calculators.html", "/stock-average-calculator.html", "/tax-income-calculators.html", "/vacancy-rate-calculator.html", "/arm-mortgage-calculator.html", "/business-line-of-credit-calculator.html", "/glossary/adjustable-rate-mortgage/", "/glossary/business-line-of-credit/", "/glossary/portfolio-rebalancing/", "/glossary/triple-net-lease/", "/guides/arm-vs-fixed-mortgage-rate-caps/", "/guides/business-line-of-credit-vs-term-loan/", "/guides/nnn-vs-gross-lease-cost/", "/guides/rebalance-with-contributions-vs-selling/", "/portfolio-rebalancing-calculator.html", "/triple-net-lease-calculator.html"])recordWordingUpdate(path,'2026-11-18');

// New independent calculations, comparison articles, definitions and index listings.
for(const path of ["/sortino-ratio-calculator.html","/gross-rent-multiplier-calculator.html","/debt-to-equity-ratio-calculator.html","/guides/sortino-vs-sharpe-target-and-downside/","/guides/grm-vs-cap-rate-gross-rent-and-noi/","/guides/debt-to-equity-definitions-and-capital-changes/","/glossary/sortino-ratio/","/glossary/gross-rent-multiplier/","/glossary/debt-to-equity-ratio/","/financial-calculator.html","/real-estate-calculator.html","/savings-investment-calculators.html","/business-calculators.html","/guides/","/glossary/"])recordWordingUpdate(path,'2026-11-18');

// Reviewed contextual links and SGR content; shared layout wording alone does not refresh all dates.
for(const path of ["/1031-exchange-calculator.html", "/apr-calculator.html", "/average-return-calculator.html", "/business-calculators.html", "/business-loan-calculator.html", "/cap-rate-calculator.html", "/capital-gains-tax-calculator.html", "/cash-on-cash-return-calculator.html", "/coast-fire-calculator.html", "/credit-utilization-calculator.html", "/current-ratio-calculator.html", "/debt-payoff-calculator.html", "/debt-to-equity-ratio-calculator.html", "/dividend-discount-model-calculator.html", "/dscr-calculator.html", "/financial-calculator.html", "/glossary/", "/glossary/sustainable-growth-rate/", "/guides/", "/guides/4-percent-rule/", "/guides/401k-vs-roth-ira/", "/guides/apr-vs-interest-rate/", "/guides/are-mortgage-points-worth-it/", "/guides/balance-transfer-vs-personal-loan/", "/guides/barista-fire-vs-coast-fire/", "/guides/biweekly-vs-monthly-mortgage-payments/", "/guides/cash-out-refinance-vs-heloc/", "/guides/debt-snowball-vs-avalanche/", "/guides/down-payment-and-closing-cost-cash/", "/guides/grm-vs-cap-rate-gross-rent-and-noi/", "/guides/gross-margin-vs-net-margin/", "/guides/how-does-a-1031-exchange-work/", "/guides/how-much-money-do-i-need-to-retire/", "/guides/how-much-to-budget-for-home-maintenance/", "/guides/how-soon-can-you-refinance-a-mortgage/", "/guides/how-to-calculate-capital-gains-tax/", "/guides/how-to-calculate-coast-fire/", "/guides/how-to-calculate-credit-utilization/", "/guides/how-to-calculate-debt-avalanche/", "/guides/how-to-calculate-debt-snowball/", "/guides/how-to-calculate-net-operating-income/", "/guides/how-to-calculate-rental-property-cash-flow/", "/guides/how-to-calculate-rental-vacancy-rate/", "/guides/how-to-calculate-stock-profit/", "/guides/how-to-prorate-rent-by-days/", "/guides/hsa-vs-fsa/", "/guides/is-refinancing-worth-it/", "/guides/nnn-vs-gross-lease-cost/", "/guides/pay-off-mortgage-or-invest/", "/guides/rent-vs-buy-a-house/", "/guides/roth-conversion-taxes/", "/guides/roth-ira-vs-traditional-ira/", "/guides/sba-7a-vs-504-loan-payments/", "/guides/should-i-pay-off-debt-or-save/", "/guides/simple-interest-vs-compound-interest/", "/guides/sustainable-growth-rate-vs-actual-growth/", "/home-maintenance-cost-calculator.html", "/house-affordability-calculator.html", "/investment-calculator.html", "/ira-calculator.html", "/mortgage-calculator.html", "/mortgage-payoff-calculator.html", "/noi-calculator.html", "/operating-cash-flow-calculator.html", "/personal-loan-calculator.html", "/refinance-calculator.html", "/rent-affordability-calculator.html", "/rental-property-calculator.html", "/retirement-calculator.html", "/return-on-equity-calculator.html", "/sustainable-growth-rate-calculator.html", "/vacancy-rate-calculator.html"])recordWordingUpdate(path,'2026-11-18');

for(const path of ["/cash-advance-fee-calculator.html", "/cobra-cost-calculator.html", "/guides/cash-advance-fees-vs-interest/", "/guides/cobra-premium-vs-payroll-deduction/", "/glossary/cash-advance-fee/", "/glossary/cobra-cost/"])recordWordingUpdate(path,'2026-11-18');

for(const path of ["/amortization-calculator.html", "/credit-card-minimum-payment-calculator.html", "/guides/how-to-read-amortization-and-loan-payments/", "/guides/credit-card-minimum-payment-and-payoff-time/"])recordWordingUpdate(path,'2026-11-19');

for(const path of ['/boat-loan-calculator.html','/compound-interest-calculator.html','/savings-calculator.html','/guides/how-to-calculate-boat-loan-payments/','/guides/compound-interest-with-monthly-contributions/','/guides/how-to-calculate-savings-goal/'])recordWordingUpdate(path,'2026-11-19');

for(const path of ['/mortgage-calculator.html','/401k-calculator.html','/balance-transfer-calculator.html','/guides/how-to-calculate-monthly-mortgage-payment/','/guides/how-401k-matching-works/','/guides/balance-transfer-vs-personal-loan/'])recordWordingUpdate(path,'2026-11-19');

for(const path of ['/mutual-fund-calculator.html','/investment-fee-calculator.html','/cd-calculator.html','/guides/mutual-fund-fees-and-investment-costs/','/guides/apr-vs-apy/'])recordWordingUpdate(path,'2026-11-19');

// Substantive fee, trade-equity and extra-payment scenario review.
Object.assign(contentUpdatedOn,{"/auto-loan-calculator.html": "2026-11-19", "/personal-loan-calculator.html": "2026-11-19", "/student-loan-calculator.html": "2026-11-19", "/guides/how-to-calculate-auto-loan-payments/": "2026-11-19", "/guides/how-to-calculate-personal-loan-payments/": "2026-11-19", "/guides/how-to-calculate-student-loan-payments/": "2026-11-19"});

// Substantive phase, closing-cash and multi-debt comparison review.
Object.assign(contentUpdatedOn,{"/heloc-calculator.html": "2026-11-19", "/home-equity-loan-calculator.html": "2026-11-19", "/debt-consolidation-calculator.html": "2026-11-19", "/guides/how-are-heloc-payments-calculated/": "2026-11-19", "/guides/how-to-calculate-home-equity-loan-payments/": "2026-11-19", "/guides/how-to-compare-debt-consolidation-loans/": "2026-11-19"});

// Substantive FHA/VA fee and ownership-budget scenario review.
Object.assign(contentUpdatedOn,{"/fha-loan-calculator.html": "2026-11-19", "/va-mortgage-calculator.html": "2026-11-19", "/house-affordability-calculator.html": "2026-11-19", "/guides/how-to-calculate-fha-loan-payments/": "2026-11-19", "/guides/how-to-calculate-va-loan-payments/": "2026-11-19", "/guides/how-much-house-can-i-afford/": "2026-11-19"});

// Substantive refinance, prepayment and rent/buy checkpoint review.
Object.assign(contentUpdatedOn,{"/refinance-calculator.html": "2026-11-19", "/mortgage-payoff-calculator.html": "2026-11-19", "/rent-vs-buy-calculator.html": "2026-11-19", "/guides/is-refinancing-worth-it/": "2026-11-19", "/guides/pay-off-mortgage-or-invest/": "2026-11-19", "/guides/rent-vs-buy-a-house/": "2026-11-19"});

// Tax-price workflows and selected-output correction, independently checked.
Object.assign(contentUpdatedOn,{"/sales-tax-calculator.html":"2026-11-19","/vat-calculator.html":"2026-11-19","/guides/tax-inclusive-prices-sales-tax-and-vat/":"2026-11-19"});
