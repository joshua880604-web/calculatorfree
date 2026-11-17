import {tool} from './helpers';
import {num,area,money,metric,type Values,type Result} from '../types';
import {usd,value,bounded,integer,whole} from './expansion-common';
import {lines,cell} from './remaining-inputs';

export function stockSplit(v:Values,chain=false):Result {
 const shares=value(v,'shares',0,1e12),price=value(v,'price'),cost=value(v,'average_cost');
 const splits=chain?lines(v.splits,2,30).map(([a,b])=>[cell(a,1,1e6),cell(b,1,1e6)]):[[integer(v,'new_shares',1,1e6),integer(v,'old_shares',1,1e6)]];
 if(splits.some(pair=>pair.some(x=>!Number.isInteger(x))))throw Error('Each split ratio must use positive whole numbers: new shares, old shares.');
 let factor=1;const rows:(string|number)[][]=[];
 splits.forEach(([a,b],i)=>{factor=bounded(factor*(a/b));if(factor<1e-30||factor>1e30)throw Error('The cumulative split ratio is outside the supported range.');rows.push([i+1,`${a}-for-${b}`,factor,bounded(shares*factor),bounded(price/factor),bounded(cost/factor)]);});
 return {metrics:[metric('Theoretical shares after splits',bounded(shares*factor)),money('Proportional reference price per share',bounded(price/factor)),money('Adjusted average acquisition cost per share',bounded(cost/factor)),metric('Cumulative new-for-old split factor',factor),money('Total reference holding value',bounded(shares*price)),money('Total acquisition cost preserved',bounded(shares*cost))],columns:['Step','New-for-old ratio','Cumulative factor','Theoretical shares','Reference price per share','Average acquisition cost per share'],rows,notes:[
  'A ratio of 3 new shares for 2 old shares multiplies quantity by 1.5 and divides the proportional reference price and average acquisition cost per share by 1.5. Reverse splits use the same convention, such as 1 new for 10 old. Sequential ratios multiply in order.',
  'Theoretical fractional shares are retained. No broker rounding, cash-in-lieu payment or corporate-action eligibility is assumed. Check the issuer and broker terms before using a resulting fractional entitlement.',
  'The total reference holding value and total acquisition cost are unchanged by these proportional calculations. The reference price is not an actual post-split market quote, a predicted gain or a valuation.',
  'Average acquisition cost is an economic allocation across the intact position. This is not lot-level tax-basis reporting. Fees, sales, transfers, cash settlements, spinoffs and other corporate actions are not modeled.'
 ]};
}
const fields=()=>[{...num('shares','Shares held before the first split',120,'shares'),max:1e12},usd('price','Reference share price before the first split',45),usd('average_cost','Average acquisition cost per share before splits',30)];
export const stockSplitCalculator=tool('stock-split',[
 {id:'single',title:'Single Split / Reverse Split',description:'Adjust one intact position using an explicit new-for-old ratio.',fields:[...fields(),whole('new_shares','New shares in the ratio',3,'new',1,1e6),whole('old_shares','Old shares in the ratio',2,'old',1,1e6)],formula:'Factor = new / old; new quantity = old quantity × factor; proportional price and average cost per share divide by factor.',calculate:v=>stockSplit(v)},
 {id:'chain',title:'Sequential Splits',description:'Apply several proportional splits and inspect every step.',fields:[...fields(),area('splits','Split ratios in order: new shares, old shares','3, 2\n1, 5','One ratio per line. Positive whole numbers, without thousands separators. Up to 30 splits; theoretical fractions are retained.')],formula:'Cumulative factor = product of each new/old ratio; apply it to the initial position.',calculate:v=>stockSplit(v,true)}
], 'Calculate forward and reverse stock splits, theoretical share counts, proportional reference prices and average acquisition costs. Inspect a sequence of splits.');
