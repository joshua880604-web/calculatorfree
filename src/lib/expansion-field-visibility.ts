import type {Values} from './types';
export function expansionFieldVisible(id:string,values:Values,key:string){
 if(id==='sba-loan'){if(['approval','fee_scope'].includes(key))return values.fee_method==='FY2027 standard schedule';if(key==='manual_fee')return values.fee_method==='Enter lender-confirmed fee';return true;}
 if(id!=='fsa')return true;
 if(key==='carry_limit')return values.unused_rule==='Carryover';
 if(key==='grace_expenses')return values.unused_rule==='Grace period';
 return true;
}
