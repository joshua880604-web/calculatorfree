import {payment} from '../finance';
export function comparisonLoan(principal:number,annualRate:number,months:number,horizon:number,extra=0){
 const scheduled=payment(principal,annualRate/12,months),rows:number[][]=[];
 let balance=principal,interest=0,paid=0;
 for(let month=1;month<=horizon;month++){
  const charge=balance*annualRate/12,amount=month<=months?(month===months?balance+charge:Math.min(balance+charge,scheduled+extra)):0;
  balance=Math.max(0,balance+charge-amount);if(balance<1e-8)balance=0;
  interest+=charge;paid+=amount;rows.push([month,amount,charge,balance]);
 }
 return {scheduled,rows,balance,interest,paid};
}
export function feeAdjustedRate(principal:number,scheduled:number,months:number){
 if(scheduled*months<=principal+1e-8)return 0;
 const pv=(r:number)=>r===0?scheduled*months:scheduled*-Math.expm1(-months*Math.log1p(r))/r;
 let low=0,high=1;
 while(pv(high)>principal){high*=2;if(high>1e15)throw Error('Fees leave too little net funding for a supported annual-rate estimate.');}
 for(let i=0;i<160;i++){const mid=(low+high)/2;if(pv(mid)>principal)low=mid;else high=mid;}
 return (low+high)/2*1200;
}
