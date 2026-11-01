import tools from './embed-tools.json';
import descriptions from './embed-resource-copy.json';
import {calculatorCategory} from './calculator-categories';
import {hasBlogSnippetKit} from './blog-snippet-access';
import {absoluteURL,siteConfig} from './site';
export const embedResourcesPath='/embed-resources';
export const embedResourcesReviewedOn='2026-11-02';
export const embedResources=tools.map(tool=>({...tool,path:'/'+tool.slug,hasSnippetKit:hasBlogSnippetKit(tool.id),description:descriptions[tool.id as keyof typeof descriptions]}));
export const embedResourceGroups=[
 {id:'fire-retirement',title:'FIRE & Retirement',category:'retirement'},
 {id:'property-mortgages',title:'Property & Mortgages',category:'mortgage-housing'},
 {id:'debt',title:'Debt',category:'loans-debt'},
 {id:'investing',title:'Investing',category:'saving-investing'},
 {id:'business',title:'Business',category:'business-finance'},
 {id:'sales-income',title:'Sales Tax & Commission',category:'tax-salary'},
 {id:'shopping',title:'Discounts',category:'everyday'},
].map(group=>({...group,tools:embedResources.filter(tool=>calculatorCategory(tool.id)?.id===group.category)}));
export function embedResourcesSchema(config=siteConfig()){
 const url=absoluteURL(embedResourcesPath,config);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage',...(url?{'@id':url+'#page',url}:{}),name:'Free embeddable financial calculators',description:'Ad-free hosted calculators for personal and commercial blogs, with visible attribution.',dateModified:embedResourcesReviewedOn},
  {'@type':'ItemList',name:'Supported calculator embeds',numberOfItems:embedResources.length,itemListElement:embedResources.map((tool,i)=>({'@type':'ListItem',position:i+1,name:tool.title,...(absoluteURL(tool.path,config)?{url:absoluteURL(tool.path,config)}:{})}))}
 ]};
}
