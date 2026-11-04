import {money,num,select,number as n,type Mode} from '../types';
import rules from '../official-rules.json';
import {roth401kComparisonScope} from '../roth-401k-scope';

export const roth401kComparisonMode:Mode={
 id:'roth-vs-traditional',
 title:'Roth vs Traditional',
 description:'Compare prospective employee contributions using the same take-home budget or the same contribution amount. Qualified Roth withdrawals and flat income-tax assumptions are required; this is not a tax-return calculation. Employer money and existing balances are excluded.',
 fields:[
  select('basis','Comparison basis',['Same take-home budget','Same employee contribution']),
  {...num('amount','Annual amount: budget or contribution',7800,'USD/year'),max:10000000,hint:'In budget mode this is the reduction in spendable pay. In contribution mode it is the employee contribution to each alternative.'},
  {...num('years','Years until assumed qualified withdrawal',30,'years',1),max:80,step:1,hint:'Whole years. Qualification requirements, including applicable age and five-tax-year rules, must be checked separately.'},
  {...num('rate','Assumed annual investment return',6,'%',-99),max:100,hint:'Effective annual return, before fees. Contributions occur at each year end.'},
  {...num('current_tax','Current assumed income-tax saving rate',22,'%'),max:99.9,hint:'Rate of income tax avoided on the traditional contribution; not a payroll-tax saving or an automatic tax-bracket calculation.'},
  {...num('retirement_tax','Assumed withdrawal income-tax rate',22,'%'),max:100,hint:'Flat illustrative rate applied to the traditional ending balance. A qualified Roth withdrawal is assumed untaxed.'},
  {...num('allowance','Assumed annual employee contribution allowance',rules.retirement_contributions.employee_401k_limit,'USD/year'),max:10000000,hint:'Defaults to the 2026 basic $24,500 limit. Enter the allowance applicable to your plan and circumstances. No age, catch-up or future-limit eligibility is determined.'},
 ],
 formula:'Same budget: traditional contribution = budget / (1 − current tax-saving rate); Roth contribution = budget. Same contribution: both contribute the entered amount. Balance at each year end = prior balance × (1 + return) + contribution. Traditional after-tax value = balance × (1 − withdrawal tax); Roth assumes a qualified withdrawal.',
 calculate(v){
  const years=n(v,'years'),amount=n(v,'amount'),current=n(v,'current_tax')/100,futureTax=n(v,'retirement_tax')/100,rate=n(v,'rate')/100,allowance=n(v,'allowance');
  if(!Number.isInteger(years)||years<1||years>80)throw Error('Enter whole years from 1 to 80.');
  if(current<0||current>=1||futureTax<0||futureTax>1||rate<=-1||amount<0||allowance<0)throw Error('Check the contribution, return and tax assumptions.');
  if(!['Same take-home budget','Same employee contribution'].includes(v.basis))throw Error('Choose a comparison basis.');
  const budget=v.basis==='Same take-home budget';
  const requestedTraditional=budget?amount/(1-current):amount,requestedRoth=amount;
  if(Math.max(requestedTraditional,requestedRoth)>allowance+1e-7)throw Error('This amount exceeds the entered employee contribution allowance for an alternative. Reduce it, change the allowance if appropriate, or use the same-contribution comparison. No unused-budget account is modeled.');
  // Accept only floating-point roundoff at the entered allowance, never a material excess.
  const traditional=Math.min(allowance,requestedTraditional),roth=Math.min(allowance,requestedRoth),traditionalCost=traditional*(1-current);
  let tb=0,rb=0;const rows:(string|number)[][]=[];
  for(let year=1;year<=years;year++){tb=tb*(1+rate)+traditional;rb=rb*(1+rate)+roth;rows.push([year,traditional,roth,tb,rb]);}
  const traditionalNet=tb*(1-futureTax);
  return {
   metrics:[money('Traditional after-tax value',traditionalNet),money('Roth qualified after-tax value',rb),money('After-tax difference (Roth minus traditional)',rb-traditionalNet),money('Annual traditional contribution',traditional),money('Annual Roth contribution',roth),money('Annual traditional take-home cost',traditionalCost),money('Annual Roth take-home cost',roth),money('Annual modeled tax saving on traditional',traditional*current),money('Traditional account before withdrawal tax',tb),money('Roth account before withdrawal tax',rb)],
   columns:['Year','Traditional employee contribution','Roth employee contribution','Traditional year-end balance','Roth year-end balance'],rows,
   chart:[{label:'Traditional after assumed tax',value:traditionalNet},{label:'Roth if qualified',value:rb}],
   notes:[roth401kComparisonScope,budget?'The alternatives use the same annual reduction in spendable pay. The traditional tax saving is reflected in the larger affordable contribution, not invested again in a separate account.':'The alternatives contribute the same employee amount but use different take-home budgets. Current tax savings are not invested in another account, so this is not a complete household-wealth comparison.','Contributions occur at year end, with constant amounts and an effective annual return. Annual rows show account balances before withdrawal tax. The final tax adjustment is a hypothetical valuation, not a scheduled retirement-income or early-withdrawal calculation.','The allowance is user-entered and held fixed. The default is the 2026 basic employee limit, not an allowance certified for this individual or a forecast of future limits. Employer match, existing balances, other employers’ plans, fees, inflation and tax-return interactions are excluded.'],
  };
 }
};
