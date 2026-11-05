import type {Values} from './types';
export function expansionFieldVisible(id:string,values:Values,key:string){
 if(id!=='fsa')return true;
 if(key==='carry_limit')return values.unused_rule==='Carryover';
 if(key==='grace_expenses')return values.unused_rule==='Grace period';
 return true;
}
