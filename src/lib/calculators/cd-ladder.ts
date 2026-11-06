import {tool} from './helpers';
import {area,money,select,type Values,type Result} from '../types';
import {integer,whole,percentage,choose,bounded} from './expansion-common';
import {lines,cell} from './remaining-inputs';
type Rung={principal:number;balance:number;due:number;apy:number};
function project(input:Rung[],horizon:number,term:number,apy:number,withdraw:boolean){
 const rungs=input.map(x=>({...x})),rows:(number|string)[][]=[],events:(number|string)[][]=[];
 let cash=0;
 for(let month=1;month<=horizon;month++){
  rungs.forEach((r,index)=>{
   if(r.balance===0)return;
   r.balance=bounded(r.balance*Math.exp(Math.log1p(r.apy)/12));
   if(month===r.due){
    const interest=r.balance-r.principal,atEnd=month===horizon;
    const released=atEnd?r.balance:withdraw?interest:0;
    cash+=released;
    events.push([month,index+1,r.principal,interest,r.balance,released,atEnd?'Cash at horizon':withdraw?'Renew principal; retain interest in cash':'Renew principal and interest']);
    if(atEnd)r.balance=0;
    else {if(withdraw)r.balance=r.principal;r.principal=r.balance;r.apy=apy;r.due=month+term;}
   }
  });
  const assets=rungs.reduce((s,r)=>s+r.balance,0);rows.push([month,assets,cash,assets+cash]);
 }
 return {assets:rungs.reduce((s,r)=>s+r.balance,0),cash,rows,events};
}
export function cdLadder(v:Values):Result{
 const input=lines(v.rungs,3,20).map(([a,t,r])=>{const principal=cell(a,.01),due=cell(t,1,120);if(!Number.isInteger(due))throw Error('Each initial term must be a whole number of months.');return {principal,balance:principal,due,apy:cell(r,0,100)/100};});
 const horizon=integer(v,'horizon',1,600),term=integer(v,'renewal_term',1,120),renewal=cell(v.renewal_apy,0,100)/100,withdraw=choose(v,'interest',['Reinvest at maturity','Withdraw interest at maturity'])==='Withdraw interest at maturity';
 const total=input.reduce((s,r)=>s+r.principal,0),r=project(input,horizon,term,renewal,withdraw),single=project([{principal:total,balance:total,due:Math.max(...input.map(x=>x.due)),apy:cell(v.single_apy,0,100)/100}],horizon,term,renewal,withdraw);
 return {metrics:[money('Ending ladder wealth',r.assets+r.cash),money('Total ladder earnings',r.assets+r.cash-total),money('Accrued assets still in CDs',r.assets),money('Retained cash at horizon',r.cash),money('Initial principal',total),money('Single-CD ending wealth',single.assets+single.cash),money('Ladder minus single-CD wealth',r.assets+r.cash-single.assets-single.cash)],columns:['Month','Accrued CD assets','Retained cash','Total wealth'],rows:r.rows,
 additionalTables:[{title:'Ladder maturity events',columns:['Month','Rung','Maturing principal','Interest earned','Maturity value','Cash retained','Action'],rows:r.events,note:'Accrued balances before maturity are assets, not penalty-free cash. Interest is released only at maturity in this model.'},{title:'Single-CD comparison',columns:['Month','Accrued CD assets','Retained cash','Total wealth'],rows:single.rows}],
 notes:['Each row is an initial CD: amount, whole-month term, effective annual percentage yield (APY). APY is converted to an equivalent monthly growth factor; balances keep fractional cents. No extra contributions are modeled.',
 'Before the horizon, each maturing CD renews for the entered renewal term at the assumed renewal APY. Reinvest rolls all proceeds; withdraw retains earned interest in zero-interest cash and renews the principal. This is a scenario, not a bank auto-renewal instruction or rate forecast.',
 'A maturity exactly at the horizon becomes cash. Other CD balances include accrued growth but may be locked until maturity. The single-CD comparison uses the same total principal, horizon and renewal assumptions, the longest initial rung term, and its separately entered initial APY.',
 'No early withdrawals, penalties, taxes, bank compounding conventions, callable or brokered-CD price changes are modeled. Deposit insurance depends on the institution, ownership category and aggregate eligible deposits; this tool does not verify coverage.']};
}
export const cdLadderCalculator=tool('cd-ladder',[{id:'ladder',title:'Build a CD Ladder',description:'Enter initial rungs and compare renewal scenarios with one longer-term CD.',fields:[area('rungs','Initial CDs: amount, term in months, APY (%)','10000, 12, 4\n10000, 24, 4\n10000, 36, 4\n10000, 48, 4\n10000, 60, 4','One CD per line; no currency symbols or thousands separators. Up to 20 rungs.'),whole('horizon','Comparison horizon',60,'months',1,600),whole('renewal_term','Term for each renewed CD',60,'months',1,120),percentage('renewal_apy','Assumed APY for future renewals',4),select('interest','Interest at maturity',['Reinvest at maturity','Withdraw interest at maturity']),percentage('single_apy','Initial APY for the single-CD comparison',4)],formula:'CD value = principal × (1 + APY)^(months / 12). Ending wealth = accrued CD assets + retained cash.',calculate:cdLadder}], 'Build a five-year CD ladder or customize up to 20 rungs. Estimate maturity proceeds, retained cash and renewal outcomes using your own APY assumptions.');
