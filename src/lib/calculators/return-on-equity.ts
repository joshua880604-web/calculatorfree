import {tool} from './helpers';
import {money,metric,type Values,type Result,type Metric} from '../types';
import {usd,value} from './expansion-common';
export function returnOnEquity(v:Values,mode:'average'|'balances'|'dupont'='average'):Result{
 const income=value(v,'income',-1e12),average=mode==='balances'?(value(v,'begin_equity',-1e12)+value(v,'end_equity',-1e12))/2:value(v,'equity',-1e12),usable=average>0&&!(mode==='balances'&&(value(v,'begin_equity',-1e12)<=0||value(v,'end_equity',-1e12)<=0));
 const roe:Metric=usable?metric('Return on equity',income/average*100,'percent'):{...metric('Return on equity',0,'percent'),displayValue:average===0?'Undefined: zero average equity':'Not meaningful: nonpositive or crossing equity'};
 const metrics=[roe,money('Average equity used',average),money('Period net income entered',income)];
 const rows:(string|number)[][]=[['Net income',income],['Average equity',average]];
 if(mode==='dupont'){
  const sales=value(v,'sales'),assets=value(v,'assets',.01),margin=sales>0?income/sales:0,turn=sales/assets,mult=usable?assets/average:0;
  metrics.push(sales>0?metric('Net profit margin',margin*100,'percent'):{...metric('Net profit margin',0),displayValue:'Undefined: zero sales'},metric('Asset turnover',turn),usable?metric('Equity multiplier',mult):{...metric('Equity multiplier',0),displayValue:'Not meaningful: nonpositive equity'},usable&&sales>0?metric('DuPont return on equity',margin*turn*mult*100,'percent'):{...metric('DuPont return on equity',0),displayValue:'Unavailable for these denominators'});
  rows.push(['Sales',sales],['Average assets',assets]);
 }
 return {metrics,columns:['Period-matched financial input','Amount'],rows,notes:[
 'ROE = period net income / average book equity. Match the income period and ownership scope: use common-shareholder earnings with common equity, or a consistently defined total-equity pair. Annualize a partial period only with an explicitly chosen method; this tool reports the entered period as-is.',
 mode==='balances'?'Average equity is the two-point arithmetic mean of beginning and ending equity. Major capital changes during the period may require a more representative time-weighted average. If either endpoint is nonpositive, this mode suppresses ROE rather than presenting a healthy performance score.':'Average equity is the amount you entered, not market capitalization or a property’s current sale equity. The tool cannot detect intra-period equity crossings from a single average.',
 'A negative profit with positive equity gives a valid negative ROE. Zero or negative equity can create undefined or misleading ratios, so the primary ROE is suppressed. It is not reported as a real 0% result.',
 mode==='dupont'?'Three-factor DuPont = net margin × asset turnover × equity multiplier. Use sales, income, average assets and average equity from the same period and consolidation scope. Zero sales makes the margin and DuPont product unavailable even if direct ROE can still be computed.':'A high ROE can reflect leverage or reduced equity from buybacks as well as profitability. Compare consistent periods and businesses; no universal good/bad threshold is imposed.',
 'Corporate accounting ROE is different from rental-property cash yield on current equity. No live financial-statement lookup, ROIC, property reinvestment recommendation or stock recommendation is included.']};
}
const income=()=>({...usd('income','Net income for the period',200000),min:-1e12});
const equity=()=>({...usd('equity','Average book equity for the period',1250000),min:-1e12});
export const returnOnEquityCalculator=tool('return-on-equity',[
 {id:'average',title:'Known Average Equity',description:'Use a period-matched net income and known average book equity.',fields:[income(),equity()],formula:'ROE = net income / average equity × 100%.',calculate:v=>returnOnEquity(v)},
 {id:'balances',title:'Beginning & Ending Equity',description:'Estimate average equity using two period-end book balances.',fields:[income(),{...usd('begin_equity','Beginning book equity',1000000),min:-1e12},{...usd('end_equity','Ending book equity',1500000),min:-1e12}],formula:'Average equity = (beginning + ending equity) / 2; ROE = net income / average equity.',calculate:v=>returnOnEquity(v,'balances')},
 {id:'dupont',title:'Three-Factor DuPont',description:'Separate profitability, asset efficiency and financial leverage.',fields:[income(),equity(),usd('sales','Sales for the same period',2000000),usd('assets','Average assets for the same period',2500000)],formula:'ROE = (income / sales) × (sales / average assets) × (average assets / average equity).',calculate:v=>returnOnEquity(v,'dupont')}
], 'Calculate corporate return on equity from average or beginning and ending equity. Use three-factor DuPont analysis to separate margin, turnover and leverage.');
