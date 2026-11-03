import {publisherIdentity} from './content-transparency';
import {embedResourcesPath,embedResourcesReviewedOn} from './embed-resources';
import {motherPageIds,motherPageReviewedOn} from './mother-page-ui';
import {guidesPath,editorialGuides} from './editorial-guides';
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
    searchTasks[calc.id]?.[0].description ?? calc.intro,
    config,
  );
}
// Dates record reviewed content changes, never the current build time.
export const contentUpdatedOn: Record<string, string> = {
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
  ...Object.fromEntries(editorialGuides.map(guide=>[guide.path,guide.updatedOn??guide.publishedOn])),
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
