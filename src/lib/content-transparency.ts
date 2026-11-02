import {absoluteURL,siteConfig,type SiteConfig} from './site';
export const publisherName='CalculatorFree.io';
export const contactEmail='joshua880604@gmail.com';
export const correctionsEmailHref='mailto:'+contactEmail+'?subject='+encodeURIComponent('CalculatorFree.io correction or question');
// This dates the publishing/checking policy, not any calculator's numerical review.
export const editorialPolicyUpdatedOn='2026-11-02';
export function publisherIdentity(config:SiteConfig=siteConfig()){
 const url=absoluteURL('/about',config);
 return {'@type':'Organization',name:publisherName,...(url?{'@id':url+'#publisher',url}:{})};
}
export function aboutPublisherSchema(config:SiteConfig=siteConfig()){
 const publisher=publisherIdentity(config),url=absoluteURL('/about',config);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'AboutPage',name:'About CalculatorFree.io',description:'Who publishes the calculators and guides, how content is prepared, and what numerical checks establish.',...(url?{'@id':url+'#page',url,mainEntity:{'@id':url+'#publisher'}}:{})},publisher,
 ]};
}
