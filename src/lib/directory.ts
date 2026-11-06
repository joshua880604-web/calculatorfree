import { calculatorPresetHref } from './preset-links';
import {calculators} from './catalog';
import {searchTasks} from './keyword-targets';

export { calculatorCategories as directoryGroups } from './calculator-categories';
import { calculatorCategory } from './calculator-categories';
export function directoryGroup(id:string,_category?:string){
 const group=calculatorCategory(id);
 if(!group)throw new Error('Assign a display category for calculator '+id);
 return group.id;
}
const toolAliases:Record<string,string[]>={
"cd-ladder":["5 year cd ladder", "certificate of deposit ladder", "cd ladder interest"],
"npv":["net present value", "xnpv", "discounted cash flows", "monthly npv"],
"lease-vs-buy-car":["car lease vs buy", "leasing versus buying a car", "lease vs finance a car"],
"mortgage-comparison":["compare mortgage offers", "mortgage comparison with points", "mortgage comparison with closing costs"],

 "1031-exchange":["like kind exchange", "tax deferred exchange", "1031 boot", "1031 exchange deadline"],
 "home-maintenance-cost":["home maintenance budget", "home repair reserve", "replacement reserve"],
 "vacancy-rate":["rental vacancy", "occupancy rate", "vacant unit days", "economic vacancy"],
 "credit-utilization":["credit card utilization", "credit usage", "credit utilization payment target"],
 "dca":["dollar cost averaging", "dollar-cost averaging", "equal dollar investing"],
 "rule-of-72":["rule of 72", "doubling time", "years to double"],
 "capital-gains-tax":["capital gains", "long term capital gains", "short term capital gains", "niit"],
 'retirement-withdrawal':['safe withdrawal rate','nest egg','retirement nest egg','retirement drawdown','retirement distribution','retirement savings withdrawal'],
 'balance-transfer':['credit card balance transfer','balance transfer fee','balance transfer savings'],
 dscr:['debt service coverage ratio','dscr loan','rental property dscr'],
 fsa:['health fsa','flexible spending account','fsa tax savings','fsa contribution'],
 'closing-cost':['closing costs','buyer closing costs','seller closing costs','cash to close','net seller proceeds'],
 'tax-equivalent-yield':['taxable equivalent yield','tax equivalent yield','municipal bond tax equivalent yield'],
 'treasury-bill':['t bill','t-bill','tbill','us treasury bill','treasury bill interest'],
 'mortgage-recast':['recast mortgage','recast mortgage calculator','recast calculator','mortgage recasting','loan recast'],
 pmi:['private mortgage insurance','pmi removal','pmi cancellation','mortgage insurance cancellation','ltv calculator'],
 'biweekly-mortgage':['bi-weekly mortgage payment','biweekly mortgage payment','biweekly payment','bi-weekly payment','fortnightly mortgage payment'],
 'discount-points':['mortgage points','discount point','mortgage points break even','points calculator','buy down rate'],
 'auto-loan':['car payment','car loan','vehicle finance'],
 'auto-lease':['car lease','vehicle lease'],
 'credit-card':['credit card','single credit card','credit card payment','credit card minimum payment'],
 'credit-cards-payoff':['credit cards payoff','multiple credit cards payoff','multiple credit card payment'],
 repayment:['repayment','loan repayment','loan payoff','early loan payoff'],
 rent:['rent','rent budget','rent affordability'],
 currency:['currency calculator','currency converter','manual currency converter'],
 'take-home-paycheck':['paycheck','take home pay','take-home-paycheck','gross to net pay','net pay'],
 'self-employment-tax':['self employment tax','self employed tax','1099 tax','freelance SE tax'],
 'income-tax':['federal tax','federal income tax'],
 '401k':['401(k)','401 k','employer match'],
 rmd:['required minimum distribution'],roi:['return on investment'],irr:['internal rate of return'],
 heloc:['home equity line of credit'],margin:['profit margin','gross profit margin','stock margin','currency margin'],date:['days between dates'],
 finance:['financial calculator','time value of money','tvm'],
};
export const directoryDescriptions:Record<string,string>={
 'mortgage-recast':'Lower P&I after a lump sum, or keep paying to finish sooner.',
 'interest-rate':'Find the rate needed to reach a target.',
 'interest':'Project a balance from a given rate.',
 'apr':'Compare interest and borrowing fees.',
 'margin':'Profit margin, or separate stock and FX collateral calculations.',
 'payment':'Solve for a loan payment or amount.',
};
export function directorySort(tools:typeof calculators,popular:string[]){
 const rank=(id:string)=>{const i=popular.indexOf(id);return i<0?popular.length:i;};
 return [...tools].sort((a,b)=>rank(a.id)-rank(b.id)||a.title.localeCompare(b.title,'en'));
}

type Tool=typeof calculators[number];
export type DirectoryResult={tool:Tool;href:string;score:number};
const searchName=(s:string)=>s.toLowerCase().replace(/\b401[\s(-]*k\)?/g,'401k').replace(/\b(?:calculators?|free|online)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const sameWords=(a:string,b:string)=>a.split(' ').sort().join(' ')===b.split(' ').sort().join(' ');
const containsTerms=(label:string,query:string)=>{
 const words=searchName(label).split(' ');
 return query.split(' ').every(term=>words.some(word=>word.startsWith(term)));
};
const taskOverrides: {names:string[];id:string;mode:string;values?:Record<string,string>}[]=[
 {names:['irr with dates','xirr'],id:'average-return',mode:'cashflows'},
 {names:['401k with catch up contributions','401k catch up contributions'],id:'401k',mode:'projection'},
 {names:['debt payoff snowball','debt payoff with snowball','snowball debt payoff'],id:'debt-snowball',mode:'snowball'},
 {names:['social security age 66 vs 70','social security 66 vs 70'],id:'social-security',mode:'compare',values:{age1:'66',age2:'70'}},
 {names:['social security age 62 vs 67','social security 62 vs 67'],id:'social-security',mode:'compare',values:{age1:'62',age2:'67'}},
 {names:['currency euro to usd','euro to usd','eur to usd'],id:'currency',mode:'snapshot',values:{from:'EUR',to:'USD'}},
 {names:['2025 tax','2025 income tax','2025 federal income tax'],id:'income-tax',mode:'federal',values:{year:'2025'}},
];
function taskMatch(c:Tool,query:string,exactOnly=false){
 const matches=(searchTasks[c.id]??[]).flatMap(task=>[task.keyword,...task.aliases??[]].map(label=>({task,exact:sameWords(searchName(label),query),matches:containsTerms(label,query)}))).filter(x=>x.exact||(!exactOnly&&x.matches)).sort((a,b)=>Number(b.exact)-Number(a.exact));
 if(!matches.length)return undefined;
 const best=matches.filter(x=>x.exact===matches[0].exact);
 return new Set(best.map(x=>JSON.stringify([x.task.mode,x.task.values]))).size===1?best[0].task:undefined;
}
function taskHref(c:Tool,task?:{mode:string;values?:Record<string,string>}){
 return task?calculatorPresetHref(c.local_route,task.mode,task.values):c.local_route;
}
// Names and direct tool aliases take precedence over use-case text. In particular,
// a short name such as "401" must not also surface every tool mentioning 401(k).
export function directorySearch(tools:typeof calculators,query:string):DirectoryResult[]{
 const name=searchName(query);
 if(!name)return query.trim()&&!/^(?:free|online|calculators?|\s)+$/i.test(query)?[]:tools.map(tool=>({tool,href:tool.local_route,score:9}));
 const override=taskOverrides.find(x=>x.names.some(label=>sameWords(searchName(label),name)));
 if(override){const tool=tools.find(c=>c.id===override.id);return tool?[{tool,href:taskHref(tool,override),score:0}]:[];}
 const primary=tools.flatMap(tool=>{
  const title=searchName(tool.title),aliases=toolAliases[tool.id]??[];
  const score=title===name?0:aliases.some(a=>searchName(a)===name)?1:containsTerms(tool.title,name)?2:aliases.some(a=>containsTerms(a,name))?3:undefined;
  return score===undefined?[]:[{tool,score,href:taskHref(tool,title===name?undefined:taskMatch(tool,name,true))}];
 });
 const results=primary.length?primary:tools.flatMap(tool=>{
  const labels=(searchTasks[tool.id]??[]).flatMap(t=>[t.keyword,...t.aliases??[]]);
  if(!labels.some(label=>containsTerms(label,name)))return [];
  return [{tool,href:taskHref(tool,taskMatch(tool,name)),score:labels.some(label=>sameWords(searchName(label),name))?4:5}];
 });
 return results.sort((a,b)=>a.score-b.score||Number(a.tool.category==='Everyday Tools')-Number(b.tool.category==='Everyday Tools')||a.tool.title.localeCompare(b.tool.title,'en'));
}
export function directoryMatch(c:Tool,query:string){return !query.trim()||directorySearch(calculators,query).some(x=>x.tool.id===c.id);}
export function directoryTarget(tools:typeof calculators,query:string){
 if(!searchName(query))return undefined;
 const results=directorySearch(tools,query),exact=results.filter(x=>x.score<=1);
 return exact.length===1?exact[0].tool:exact.length===0&&results.length===1?results[0].tool:undefined;
}
export function directoryScore(c:Tool,query:string){return directorySearch(calculators,query).find(x=>x.tool.id===c.id)?.score??99;}
