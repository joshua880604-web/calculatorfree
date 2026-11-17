import {tool} from './helpers';
import {money,metric,type Values,type Result} from '../types';
import {usd,value,integer,whole} from './expansion-common';
import {ratioMetric} from './working-capital-common';
const costItems=[['advertising','Acquisition advertising',12000],['people','Allocated acquisition personnel cost',8000],['agency','Allocated agency / contractor cost',2000],['software','Allocated acquisition software cost',1000],['other','Other acquisition costs not counted above',2000]] as const;
export function customerAcquisitionCost(v:Values,itemized=false):Result {
 const customers=integer(v,'customers',0,1e12),costs=itemized?costItems.map(([key,label])=>({label,amount:value(v,key)})):[{label:'Entered acquisition cost',amount:value(v,'cost')}];
 const total=costs.reduce((s,c)=>s+c.amount,0),cac=customers>0?total/customers:null;
 return {metrics:[ratioMetric('Acquisition cost per unique new customer',cac,'Undefined: no new customers','money'),money('Total acquisition cost included',total),metric('Unique new customers in the selected scope',customers)],columns:['Nonoverlapping acquisition cost','Amount (USD)'],rows:costs.map(c=>[c.label,c.amount]),notes:[
  'CAC = included acquisition costs / unique new customers in the matching scope. Count a customer once when first acquired. Orders, repeat purchases, leads, sign-ups and website visits are different denominators.',
  'Choose one period, customer definition and attribution scope. Reflect sales-cycle lag and cohort choices in the data you enter. This worksheet does not infer channel attribution, prove causality or reconcile delayed conversions.',
  itemized?'The itemized amounts must not overlap. Allocate only the acquisition-related portion of shared people, agency and software costs. Do not include a salary or an agency invoice again inside advertising or other costs.':'The known total must already reflect your selected acquisition-cost definition. It can include more than advertising; a paid-ad-only cost per attributed customer is a narrower measure and should be labeled as such.',
  'Zero new customers leave CAC undefined, even if cost is zero. Zero included cost with positive new customers gives an arithmetic zero, which can reflect an incomplete cost scope rather than costless acquisition.',
  'ROAS divides attributed revenue by ad spend; it is not CAC. Neither the ratio nor a comparison with an unverified LTV establishes business profitability. No universal good-CAC threshold, advertising budget recommendation or automatic customer data is supplied.'
 ]};
}
const customers=()=>whole('customers','Unique new customers in the same scope',100,'customers',0,1e12);
export const customerAcquisitionCostCalculator=tool('customer-acquisition-cost',[
 {id:'total',title:'Known Acquisition Cost',description:'Use an already reconciled cost total and matching unique new customers.',fields:[usd('cost','Total acquisition cost for the selected scope',25000),customers()],formula:'CAC = acquisition costs / unique new customers for the same scope.',calculate:v=>customerAcquisitionCost(v)},
 {id:'itemized',title:'Itemized Acquisition Costs',description:'Reconcile nonoverlapping acquisition costs before dividing by new customers.',fields:[...costItems.map(([k,label,n])=>usd(k,label,n)),customers()],formula:'CAC = sum of included acquisition cost components / unique new customers.',calculate:v=>customerAcquisitionCost(v,true)}
], 'Calculate customer acquisition cost from a known total or itemized costs. Match costs with unique new customers and distinguish CAC from ROAS.');
