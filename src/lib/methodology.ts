import { calculatorPresetHref } from './preset-links';
import {calculators,routeFor} from './calculators';
import rules from './official-rules.json';
import tax2025 from './tax-2025.json';
import cpi from './cpi-data.json';
import snapshot from './currency-snapshot.json';
import policy from './policy-rules.json';
import {absoluteURL,siteConfig,type SiteConfig} from './site';

export const methodologyPath='/methodology.html';
export const methodologyCheckedOn='2026-10-25';
export const projectURL='https://github.com/joshua880604-web/calculatorfree';
export const sourceURL=projectURL+'/blob/static-preview-20261021/';
export const assumptionSpecs=[
 {id:'retirement',mode:'required',key:'inflation',source:'retirement-core.ts',basis:'An editable illustration of constant future price growth. It is not a BLS forecast, a Federal Reserve target or an estimate of your personal spending inflation.'},
 {id:'retirement',mode:'required',key:'return',source:'retirement-core.ts',basis:'A hypothetical constant effective annual return. No historical-average return series, asset allocation or personal risk assessment is used to derive this preset.'},
 {id:'investment',mode:'end',key:'rate',source:'investment.ts',basis:'A hypothetical annual rate with the compounding frequency selected in the form. It is not a current savings offer or a forecast of market returns.'},
 {id:'investment-fee',mode:'impact',key:'rate',source:'evergreen.ts',basis:'An illustrative annual return for comparing fees. The form separately specifies whether that return is before or after fund fees; it is not a recommended portfolio return.'},
 {id:'401k',mode:'projection',key:'return',source:'retirement-core.ts',basis:'A constant annual investment-return illustration. The model does not select investments or estimate returns from the assets in your plan.'},
 {id:'401k',mode:'projection',key:'inflation',source:'retirement-core.ts',basis:'A constant future-inflation illustration used to express purchasing power. This preset is separate from the historical CPI dataset.'},
 {id:'real-return',mode:'rate',key:'inflation',source:'evergreen.ts',basis:'An illustrative annual inflation input for the exact nominal-to-real conversion. Different tools can have different starting values; this is not a site-wide forecast.'},
 {id:'emergency-fund',mode:'goal',key:'months',source:'evergreen.ts',basis:'A sample reserve target chosen for illustration. Your appropriate reserve depends on expenses, income stability and access to funds; the tool does not assess those circumstances.'},
 {id:'loan',mode:'amortized',key:'rate',source:'other.ts',basis:'A hypothetical borrowing rate, not a lender quote. Select the actual compounding and payment frequency and include applicable fees when comparing borrowing costs.'},
 {id:'social-security',mode:'ideal',key:'cola',source:'retirement-core.ts',basis:'A hypothetical constant future COLA, applied while waiting from age 62 and after claiming. The PIA input is in age 62 dollars and discount rate is nominal. This is not a forecast or a fixed government rate.'},
] as const;
export function defaultAssumptions(){
 return assumptionSpecs.map(spec=>{
  const calc=calculators.find(calc=>calc.id===spec.id)!,mode=calc.modes.find(mode=>mode.id===spec.mode)!,field=mode.fields.find(field=>field.key===spec.key)!;
  if(!field)throw new Error('Methodology assumption is missing: '+spec.id+'/'+spec.key);
  return {...spec,label:field.label,calculator:calc.title,modeTitle:mode.title,value:field.value,unit:field.unit??'',path:calculatorPresetHref(routeFor(calc.id),mode.id),sourcePath:sourceURL+'src/lib/calculators/'+spec.source};
 });
}
const monthName=(year:number,period:string)=>new Date(Date.UTC(year,Number(period.slice(1))-1,1)).toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
export function methodologyDatasets(){
 const months=cpi.records.filter(record=>/^M(0[1-9]|1[0-2])$/.test(record.period)).sort((a,b)=>a.year-b.year||a.period.localeCompare(b.period));
 return [
  {id:'policy',name:'Selected U.S. policy conditions and versioned rules',version:'2025/2026 MFS AMT;2026 active-QBI minimum;VA purchase fees effective2023-04-07',checked:policy.reviewed_on,
   scope:'MFS spouse itemization disables the standard deduction. NIIT includes entered eligible net passive income. Active QBI requires material participation and the stated net-income threshold. VA manufactured-home-only prior use retains first-use rates. Social Security ideal-age comparisons use age 62-dollar PIA with assumed COLA during waiting and claiming. These selected conditions do not establish full tax-return, benefit-entitlement or loan-approval coverage.',
   sources:[{title:'Versioned policy register, scope and official sources',url:sourceURL+'src/lib/policy-rules.json'},{title:'IRS: NIIT income and exclusions',url:policy.scope_sources.niit},{title:'IRS: MFS standard deduction and 2026 changes',url:policy.scope_sources.mfs_standard_deduction},{title:'26 USC 55: AMT and MFS increase',url:policy.mfs_amt_increase.sources[2]},{title:'26 USC 199A: active-QBI minimum',url:policy.active_qbi_minimum.sources[0]},{title:'VA: purchase funding fees and prior use',url:policy.va_purchase.sources[0]},{title:'SSA: COLA before and after claiming',url:policy.social_security.sources[0]}]},
  {id:'tax',name:'U.S. federal tax rules',version:`Selected ${tax2025.year} and ${rules.federal_income_tax.year} rules`,checked:rules.verified_at,
   scope:'Bundled tax tables and selected deductions/credits use the stated tax year. The tools are not a complete return-preparation system; state/local tax, eligibility and withholding treatment depend on the selected model.',
   sources:[{title:'IRS: 2025 ordinary-income brackets',url:tax2025.ordinary_brackets_source},{title:'IRS: updated deductions and 2026 inflation adjustments',url:rules.federal_income_tax.source_url}]},
  {id:'retirement',name:'U.S. retirement limits and RMD factors',version:`${rules.retirement_contributions.year} contribution limits; IRS Publication 590-B (${rules.rmd_uniform_lifetime.publication_year}) factors`,checked:rules.verified_at,
   scope:'Projections hold the bundled contribution limits constant in future years. RMD tools use the stated owner-account table and supported ages/distribution years. Inherited-account rules and all plan-specific exceptions are not modeled.',
   sources:[{title:'IRS: 401(k) and IRA contribution limits',url:rules.retirement_contributions.source_url},{title:'IRS: Publication 590-B distribution tables',url:rules.rmd_uniform_lifetime.source_url}]},
  {id:'inflation',name:'Historical U.S. inflation',version:`BLS CPI-U ${cpi.series}; monthly coverage ${monthName(months[0].year,months[0].period)}–${monthName(months.at(-1)!.year,months.at(-1)!.period)}`,checked:cpi.asof,
   scope:'U.S. city average, all items, not seasonally adjusted. Published annual averages are separate observations. Missing or unsupported periods are rejected, not filled with assumed values. Historical CPI is not the source of future-inflation presets.',
   sources:[{title:'BLS: historical CPI table',url:cpi.metadata_source_url},{title:'BLS: CPI definitions and limitations',url:'https://www.bls.gov/cpi/questions-and-answers.htm'}]},
  {id:'currency',name:'Currency reference snapshot',version:`Frankfurter reference dates ${snapshot.date_range.earliest}–${snapshot.date_range.latest}`,checked:snapshot.accessed_at,
   scope:'Downloaded reference rates are bundled with the site; each component quote keeps its own date. Cross rates use the ratio of the two stored USD quotes. This is not a live market feed, and retail spreads or transaction fees are not included. A manually entered rate is supplied by you.',
   sources:[{title:'Frankfurter: reference-rate documentation',url:'https://frankfurter.dev/'},{title:'Bundled snapshot and component dates',url:sourceURL+'src/lib/currency-snapshot.json'}]},
 ];
}
export const validationExamples=[
 {title:'Zero-interest loan',id:'loan',mode:'amortized',values:{principal:12000,years:1,months:0,rate:0,compound:'Monthly',pay:'Monthly'},label:'Payment per period',expected:1000,explanation:'$12,000 repaid over 12 monthly payments at 0%: $12,000 ÷ 12 = $1,000 per payment.'},
 {title:'Annual compounding',id:'compound-interest',mode:'growth',values:{principal:1000,years:2,months:0,rate:5,compound:'Annually',annual:0,monthly:0,timing:'End of period',tax:0,inflation:0},label:'Ending balance',expected:1102.5,explanation:'$1,000 at 5%, compounded annually for two years, with no cash flows, taxes or fees: $1,000 × 1.05 × 1.05 = $1,102.50.'},
];
export function exampleLink(example:typeof validationExamples[number]){
 return calculatorPresetHref(routeFor(example.id),example.mode,example.values);
}
export function methodologySchema(config:SiteConfig=siteConfig()){
 const url=absoluteURL(methodologyPath,config);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebPage',name:'Calculation methodology and sources',description:'How calculator models are checked, how illustrative defaults differ from sourced data, and what the models cover.',inLanguage:'en',...(url?{'@id':url,url,hasPart:['validation','default-assumptions','data-sources','model-scope','corrections'].map(id=>({'@type':'WebPageElement','@id':url+'#'+id}))}:{})},
  ...(url?[{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Financial calculators',item:absoluteURL('/financial-calculator.html',config)},{'@type':'ListItem',position:2,name:'Methodology',item:url}]}]:[]),
 ]};
}
