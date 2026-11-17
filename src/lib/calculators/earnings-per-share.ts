import {tool} from './helpers';
import {num,area,money,metric,type Values,type Result} from '../types';
import {usd,value,integer,whole} from './expansion-common';
import {lines,cell} from './remaining-inputs';
import {ratioMetric} from './working-capital-common';
export function earningsPerShare(v:Values,schedule=false):Result {
 const income=value(v,'net_income',-1e12),preferred=value(v,'preferred_adjustment'),common=income-preferred;
 let shares:number,rows:(string|number)[][]=[];
 if(schedule){
  const days=integer(v,'period_days',1,3660),segments=lines(v.share_schedule,2,100).map(([s,d])=>({shares:cell(s),days:cell(d,1,3660)}));
  if(segments.some(x=>!Number.isInteger(x.days))||segments.reduce((s,x)=>s+x.days,0)!==days)throw Error('Segment days must be whole numbers that add up to the full reporting-period days.');
  shares=segments.reduce((s,x)=>s+x.shares*(x.days/days),0);
  rows=segments.map((x,i)=>[i+1,x.shares,x.days,x.days/days*100,x.shares*(x.days/days)]);
 }else{shares=value(v,'average_shares');rows=[['Net income',income],['Entered preferred earnings adjustment',-preferred],['Earnings available to common',common],['Weighted average common shares',shares]];}
 return {metrics:[ratioMetric('Basic earnings per common share',shares>0?common/shares:null,'Undefined: zero weighted average shares','money'),money('Entered earnings available to common',common),metric('Weighted average common shares used',shares),money('Entered preferred earnings adjustment',preferred)],columns:schedule?['Segment','Common shares outstanding','Days in segment','Period weight (%)','Weighted shares']:['Matched-period measure','Value'],rows,notes:[
  'Basic EPS = earnings available to common shareholders / weighted average common shares for the same period. This simplified worksheet obtains common earnings by subtracting your entered preferred earnings adjustment from net income. Ordinary common dividends are not that adjustment.',
  schedule?'Segments must cover the full entered reporting period, with no gaps or overlaps. Enter shares outstanding during each segment, not shares newly issued. The tool weights by segment days / reporting-period days and verifies that the days sum exactly.':'The supplied average should represent the whole earnings period. A closing share count is not automatically a weighted average when issues, buybacks or other changes occurred.',
  'Any required retrospective split, consolidation or bonus-share restatement must already be reflected consistently in your share data. This tool does not identify those events or automatically interpret their accounting treatment.',
  'The preferred earnings adjustment is your already-checked amount. Participating securities, cumulative preferred rights, taxes, allocation rules and numerator scope can require more work than a simple dividend subtraction. No complete US GAAP or IFRS reporting compliance is inferred.',
  'Losses produce a negative basic EPS when average shares are positive. Zero average shares make EPS undefined. Diluted EPS involves additional numerator, denominator and anti-dilution rules; it is not automatically calculated here. Basic EPS is not a share price or an investment return.'
 ]};
}
const earnings=()=>[{...usd('net_income','Net income for the reporting period',1000000),min:-1e12},usd('preferred_adjustment','Preferred earnings adjustment already checked',100000,'Do not enter ordinary common-share dividends here.')];
export const earningsPerShareCalculator=tool('earnings-per-share',[
 {id:'known-average',title:'Known Weighted Average Shares',description:'Use an already reconciled weighted average common-share count.',fields:[...earnings(),{...num('average_shares','Weighted average common shares for this period',300000,'shares'),max:1e12}],formula:'Basic EPS = (net income − entered preferred earnings adjustment) / weighted average common shares.',calculate:v=>earningsPerShare(v)},
 {id:'weighted-schedule',title:'Weighted Share Schedule',description:'Reconcile a complete day-weighted schedule before calculating basic EPS.',fields:[...earnings(),whole('period_days','Days in the full reporting period',365,'days',1,3660),area('share_schedule','Common shares outstanding, days in segment','100000, 90\n200000, 275','One segment per line, without thousands separators. Days must sum to the full reporting period. Use consistently restated shares where required. Up to 100 segments.')],formula:'Average shares = sum(shares × segment days) / full period days; basic EPS = common earnings / average shares.',calculate:v=>earningsPerShare(v,true)}
], 'Calculate basic earnings per share from matched-period common earnings and weighted average shares. Reconcile a share schedule and distinguish basic from diluted EPS.');
