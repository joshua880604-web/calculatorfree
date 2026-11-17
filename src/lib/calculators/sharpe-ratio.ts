import {tool} from './helpers';
import {area,metric,type Values,type Result} from '../types';
import {value,percentage,integer,whole} from './expansion-common';
import {ratioMetric} from './working-capital-common';
export function sharpeRatio(v:Values,series=false):Result {
 const rf=value(v,'risk_free',-100,1000)/100,periods=integer(v,'periods_per_year',1,3660);
 let mean:number,sd:number,observations=0;let rows:(string|number)[][]=[];
 if(series){
  const parts=(v.returns??'').trim().split(/[\s,;]+/).filter(Boolean);
  if(parts.length<2||parts.length>2000)throw Error('Enter 2 to 2000 equally spaced percentage returns, without thousands separators.');
  const returns=parts.map(s=>{const n=Number(s);if(!Number.isFinite(n)||n< -100||n>1e6)throw Error('Return values must be finite percentages between -100 and 1000000.');return n/100;});
  // Welford updates avoid cancellation in small variances around a nonzero mean.
  let m=0,m2=0;returns.forEach((x,i)=>{const e=x-rf,delta=e-m;m+=delta/(i+1);m2+=delta*(e-m);rows.push([i+1,x*100,rf*100,e*100]);});
  mean=m;sd=Math.sqrt(Math.max(0,m2/(returns.length-1)));observations=returns.length;
 }else{mean=value(v,'mean_return',-100,1e6)/100-rf;sd=value(v,'std_dev',0,1e6)/100;rows=[['Arithmetic mean return (%)',(mean+rf)*100],['Same-period fixed risk-free return (%)',rf*100],['Same-period excess-return standard deviation (%)',sd*100]];}
 const ratio=sd>0?mean/sd:null;
 return {metrics:[ratioMetric('Sharpe ratio for one observation period',ratio,'Undefined: zero excess-return volatility'),ratioMetric('Assumption-annualized Sharpe ratio',ratio===null?null:ratio*Math.sqrt(periods),'Undefined: zero excess-return volatility'),metric('Arithmetic mean excess return per period',mean*100,'percent'),metric('Excess-return standard deviation per period',sd*100,'percent'),metric('Assumed observation periods per year',periods),...(series?[metric('Return observations in the sample',observations)]:[])],columns:series?['Observation','Simple return (%)','Fixed risk-free return (%)','Excess return (%)']:['Matching-period statistic','Value'],rows,notes:[
  'The period Sharpe ratio is arithmetic mean excess return divided by the standard deviation of those excess returns. Sharpe measure and Sharpe ratio refer to this same task here. All returns, the fixed risk-free return and volatility must describe the same observation period.',
  series?'Series inputs are simple percentage returns at equally spaced intervals, not prices or currency profits. Sample standard deviation uses n − 1. The risk-free return is assumed constant for every observation; its variance is zero, so subtracting it does not change the standard deviation.':'Use arithmetic mean return and matching-period excess-return volatility. A geometric CAGR is not the same statistic. If the risk-free return varies through history, use a consistently computed excess-return volatility rather than blindly substituting portfolio volatility.',
  'The annualized illustration multiplies the period Sharpe ratio by sqrt(entered periods per year). This assumes zero serial correlation and stable return moments with additive aggregation. It is not an exact compounded-return rule and does not correct for autocorrelation. Enter 1 for statistics already measured over one year; 12 monthly or 252 trading-day periods are assumptions, not inferred calendars.',
  'Zero volatility leaves the ratio undefined; negative excess return gives a negative Sharpe ratio. The result is not squared or converted into a positive score. A small sample or a nearly constant series can make the ratio unstable.',
  'This worksheet does not fetch market prices, reconcile deposits or fees, optimize portfolios, compare a strategy with a universal good/bad threshold or predict future performance. Use consistent total-return, cost and risk-free conventions before comparing two results.'
 ]};
}
const common=()=>[percentage('risk_free','Fixed risk-free return for one observation period',4,-100,1000),whole('periods_per_year','Observation periods per year for annualization',1,'periods/year',1,3660)];
export const sharpeRatioCalculator=tool('sharpe-ratio',[
 {id:'statistics',title:'Known Matching-Period Statistics',description:'Use matched arithmetic return and volatility statistics.',fields:[percentage('mean_return','Arithmetic mean return for one observation period',12,-100,1e6),percentage('std_dev','Excess-return standard deviation for the same period',16,0,1e6),...common()],formula:'Period Sharpe = (arithmetic mean return − fixed risk-free return) / excess-return standard deviation; assumed annual Sharpe = period Sharpe × sqrt(N).',calculate:v=>sharpeRatio(v)},
 {id:'return-series',title:'Periodic Return Series',description:'Compute sample excess-return statistics from your manual return series.',fields:[area('returns','Equally spaced simple returns (%)','-2, 1, 3, 0','Enter percentages, not prices: 1 means 1%. Separate values by commas, spaces or newlines. Up to 2000 observations.'),...common().map(f=>f.key==='risk_free'?{...f,value:0}: {...f,value:12})],formula:'Period Sharpe = mean(excess returns) / sample standard deviation(excess returns), using n − 1.',calculate:v=>sharpeRatio(v,true)}
], 'Calculate Sharpe ratio from matching-period statistics or manual return observations. Inspect excess returns, sample volatility and explicit annualization assumptions.');
