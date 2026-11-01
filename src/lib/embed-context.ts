import type {Values} from './types';
// Visible context belongs with the inputs and results, outside optional model notes.
export function embedContext(id:string,values:Values){
 if(id==='self-employment-tax'){
  const year=values.year==='2025'?'2025':'2026';
  return {label:`U.S. self-employment tax · Tax year ${year}`,scope:'Regular SE tax plus the self-employment portion of Additional Medicare tax. Excludes ordinary federal income tax, state tax and wage-only Additional Medicare tax. The quarterly reserve is not a required estimated-tax payment.',disclaimer:'Planning estimate, not a tax return or professional tax advice.'};
 }
 if(id==='salary')return {label:'Gross salary conversion · Before tax',scope:'Converts pay frequencies using 52 weeks and your work schedule. It does not deduct income tax, payroll tax or benefits and is not a take-home pay estimate.',disclaimer:'Illustrative pay conversion; confirm actual pay and paid-leave terms with your employer.'};
 return null;
}
const spouseKeys=['spouse_profit','spouse_ss_wages','spouse_medicare_wages'];
export function embedFieldVisible(id:string,values:Values,key:string){
 if(id!=='self-employment-tax'||!spouseKeys.includes(key))return true;
 // Keep nonzero drafts visible when switching away from joint filing so errors are recoverable.
 return values.filing==='Married filing jointly'||spouseKeys.some(k=>(values[k]!==undefined&&values[k].trim()==='')||!Number.isFinite(Number(values[k]??0))||Number(values[k]??0)!==0);
}
