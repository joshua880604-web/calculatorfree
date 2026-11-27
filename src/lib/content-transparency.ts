import {absoluteURL,siteConfig,siteName,type SiteConfig} from './site';
export const publisherName='CalculatorFree.io';
export const contactEmail='joshua880604@gmail.com';
export const correctionsEmailHref='mailto:'+contactEmail+'?subject='+encodeURIComponent('CalculatorFree.io correction or question');
// This dates the publishing/checking policy, not any calculator's numerical review.
export const editorialPolicyUpdatedOn='2026-11-02';
export function publisherIdentity(config:SiteConfig=siteConfig()){
 const aboutURL=absoluteURL('/about',config),url=absoluteURL('/',config);
 const logoURL=absoluteURL('/apple-touch-icon.png',config);
 return {
  '@type':'Organization',name:publisherName,
  description:'Free financial calculators with explanations, worked examples and stated calculation assumptions.',
  email:contactEmail,
  // Keep the existing identity so calculator and article references stay connected.
  ...(aboutURL?{'@id':aboutURL+'#publisher'}:{}),
  ...(url?{url}:{}),
  ...(logoURL?{logo:{'@type':'ImageObject',url:logoURL,contentUrl:logoURL,width:180,height:180}}:{}),
 };
}
export function websiteIdentity(config:SiteConfig=siteConfig()){
 const url=absoluteURL('/',config),publisher=publisherIdentity(config);
 return {
  '@type':'WebSite',name:publisherName,alternateName:siteName,inLanguage:'en',
  publisher:publisher['@id']?{'@id':publisher['@id']}:publisher,
  ...(url?{'@id':url+'#website',url}:{}),
 };
}
export function aboutPublisherSchema(config:SiteConfig=siteConfig()){
 const publisher=publisherIdentity(config),url=absoluteURL('/about',config);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'AboutPage',name:'About CalculatorFree.io',description:'Who publishes the calculators and guides, how content is prepared, and what numerical checks establish.',...(url?{'@id':url+'#page',url,mainEntity:{'@id':url+'#publisher'}}:{})},publisher,
 ]};
}
