import type {Values} from './types';
export function expansionFieldVisible(id:string,values:Values,key:string){
 if(id==='assumable-mortgage'&&['gap_rate','gap_months','gap_fees'].includes(key)){const gap=Number(values.price)-Number(values.assumed_balance)-Number(values.buyer_cash);return !Number.isFinite(gap)||gap>0;}
 if(id==='rsu-tax'&&key==='prior_supplemental')return values.method==='2026 optional supplemental method';
 if(id==='rsu-tax'&&key==='actual_federal')return values.method==='Enter actual federal withholding';
 if(id==='irmaa'&&key==='part_d_plan')return values.coverage!=='Part B only';
 if(id==='sba-loan'){if(['approval','fee_scope'].includes(key))return values.fee_method==='FY2027 standard schedule';if(key==='manual_fee')return values.fee_method==='Enter lender-confirmed fee';return true;}
 if(id!=='fsa')return true;
 if(key==='carry_limit')return values.unused_rule==='Carryover';
 if(key==='grace_expenses')return values.unused_rule==='Grace period';
 return true;
}
