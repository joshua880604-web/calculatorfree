import businessTerms from './business-two-glossary.json';
import { calculatorPresetHref } from './preset-links';
import data from './glossary-data.json';
import companionTerms from './companion-glossary-data.json';
import catalog from './catalog-data.json';
import {absoluteURL, directoryPath, siteConfig, type SiteConfig} from './site';

export type GlossaryExampleCalculation = {
  id:string;mode:string;values:Record<string,string|number>;
  expected:{label:string;value:number;tolerance?:number}[];
};
export type GlossaryTerm = {
  slug:string;name:string;title:string;description:string;category:string;aliases:string[];
  definition:string;explanation:string;formula:string;formulaNote:string;
  example:{title:string;intro:string;steps:string[];answer:string;assumptions:string;calculator?:GlossaryExampleCalculation;calculationNote?:string};
  pitfall:{title:string;text:string};tools:{id:string;text:string}[];related:string[];
  sources:{title:string;url:string}[];checkedOn:string;updatedOn?:string;scope?:string;
  guides?:{title:string;path:string}[];
  comparison?:{topic:"cap";heading:string;paragraphs:string[];questions:{question:string;answer:string}[];chart:string};
  sections?:{id:string;title:string;paragraphs:string[];table?:{caption:string;headers:string[];rows:string[][]}}[];
  questions?:{question:string;answer:string}[];
};
export const glossaryCategories=['Saving & investing','Retirement','Loans & debt','Housing & property','Tax & income','Business & pricing','Everyday money'];
export const glossaryPath='/glossary/';
export const glossaryTerms=[...data,...companionTerms,...businessTerms] as GlossaryTerm[];
const newToolGlossaryLinks:Record<string,{id:string;text:string}[]>={
 'certificate-of-deposit':[{id:'cd-ladder',text:'Build staggered maturities and compare reinvestment with retained cash.'}],
 'net-present-value':[{id:'npv',text:'Discount periodic or actual-date signed cash flows, including the time-zero investment.'}],
 'lease-residual-value':[{id:'lease-vs-buy-car',text:'Compare a quoted lease with purchase resale equity over the same term.'}],
 'apr':[{id:'mortgage-comparison',text:'Compare fixed-rate offers, fees and a modeled annual-rate estimate.'}],
 'mortgage-points':[{id:'mortgage-comparison',text:'Compare points, payments and borrowing costs over your holding period.'}]
};
for(const term of glossaryTerms)if(newToolGlossaryLinks[term.slug]){term.tools=[...term.tools,...newToolGlossaryLinks[term.slug]];term.checkedOn='2026-11-06';}
export const expandedGlossarySlugs=['health-savings-account','brrrr-method','sequence-of-returns-risk','return-on-ad-spend','landed-cost','cost-basis','house-hacking','loan-seasoning','cash-out-refinance','withdrawal-rate','after-repair-value','vacancy-rate','capital-expenditure','debt-service-coverage-ratio','dividend-yield'];
expandedGlossarySlugs.push(...businessTerms.map(term=>term.slug),'dollar-cost-averaging',...companionTerms.map(term=>term.slug));
export const glossaryTermPath=(slug:string)=>`${glossaryPath}${slug}/`;
export const glossaryTerm=(slug:string)=>glossaryTerms.find(term=>term.slug===slug);
export const glossaryForCalculator=(id:string)=>glossaryTerms.filter(term=>term.tools.some(tool=>tool.id===id));
export function glossaryExampleLink(example:GlossaryExampleCalculation){
  const path=catalog.find(tool=>tool.id===example.id)?.local_route;
  if(!path)throw new Error('Unknown glossary calculator: '+example.id);
  return calculatorPresetHref(path,example.mode,example.values);
}
export function glossarySchema(term?:GlossaryTerm,config:SiteConfig=siteConfig()){
  const setURL=absoluteURL(glossaryPath,config),url=term?absoluteURL(glossaryTermPath(term.slug),config):setURL;
  const entity=term?{
    '@type':'DefinedTerm',name:term.name,description:term.definition,alternateName:term.aliases,
    ...(url?{'@id':url+'#term',url,inDefinedTermSet:{'@id':setURL+'#terms',name:'Financial glossary'}}:{}),
  }:{
    '@type':'DefinedTermSet',name:'Financial glossary',description:'Plain-English finance definitions, worked examples and related calculators.',
    ...(setURL?{'@id':setURL+'#terms',url:setURL}:{}),
    hasDefinedTerm:glossaryTerms.map(item=>({'@type':'DefinedTerm',name:item.name,description:item.definition,...(setURL?{url:absoluteURL(glossaryTermPath(item.slug),config)}:{})})),
  };
  const graph:Record<string,unknown>[]=[entity];
  if(url){
    graph.push({'@type':'WebPage','@id':url+'#page',url,name:term?.title??'Financial Glossary',mainEntity:{'@id':url+(term?'#term':'#terms')},inLanguage:'en'});
    graph.push({'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'Financial calculators',item:absoluteURL(directoryPath,config)},
      {'@type':'ListItem',position:2,name:'Glossary',item:setURL},
      ...(term?[{'@type':'ListItem',position:3,name:term.name,item:url}]:[]),
    ]});
  }
  return {'@context':'https://schema.org','@graph':graph};
}
