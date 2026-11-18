import {tool} from './helpers';
import {num,money,type Values,type Result} from '../types';
import {value,usd} from './expansion-common';

const signed=(key:string,label:string,initial:number,hint?:string)=>({...num(key,label,initial,'$',-1e12),max:1e12,...(hint?{hint}:{})});
const notes=[
 'Match every amount to the same reporting period, entity, currency and operating scope. All changes mean ending balance minus beginning balance. Positive operating-asset increases use cash; positive operating-liability increases release cash in the indirect reconciliation.',
 'The indirect worksheets require already reconciled operating changes: remove acquisitions, disposals, currency translation and other noncash or investing/financing balance movements before entering them. Cash, cash equivalents, borrowing balances and capital expenditure are not operating working-capital inputs.',
 'Net noncash adjustments are signed. Add back included depreciation or other noncash expenses once; subtract noncash income and investing/financing gains as applicable. The worksheet does not decide classification or find omitted statement adjustments.',
 'Direct mode uses entered operating cash receipts and payments, with interest and income-tax payments included in this U.S.-oriented illustration. Use the classifications required by your reporting framework and transaction facts; the tool does not prepare a complete compliant statement of cash flows.',
 'Operating cash flow excludes the separate investing and financing sections. It is not net income, EBITDA, free cash flow, cash available for dividends or the change in total cash. No company data, audit opinion or accounting-policy recommendation is supplied.',
];
const asResult=(rows:(string|number)[][],extra:ReturnType<typeof money>[]=[],additionalNotes:string[]=[]):Result=>{
 const total=rows.reduce((s,row)=>s+Number(row[1]),0);
 return {metrics:[money('Operating cash flow under entered assumptions',total),...extra],columns:['Reconciliation item','Signed cash-flow effect'],rows,notes:[...notes,...additionalNotes]};
};
export function operatingIndirect(v:Values):Result{
 const income=value(v,'net_income',-1e12,1e12),noncash=value(v,'noncash',-1e12,1e12);
 const ar=value(v,'ar_change',-1e12,1e12),inventory=value(v,'inventory_change',-1e12,1e12),assets=value(v,'other_assets_change',-1e12,1e12),ap=value(v,'ap_change',-1e12,1e12),liabilities=value(v,'other_liabilities_change',-1e12,1e12);
 const nwc=ar+inventory+assets-ap-liabilities;
 return asResult([['Net income',income],['Net noncash / nonoperating reconciliation adjustments',noncash],['Less increase / plus decrease in operating receivables',-ar],['Less increase / plus decrease in inventory',-inventory],['Less increase / plus decrease in other operating assets',-assets],['Plus increase / less decrease in trade payables',ap],['Plus increase / less decrease in other operating liabilities',liabilities]],[money('Net income used',income),money('Net noncash adjustments used',noncash),money('Increase in operating net working capital',nwc),money('Working-capital cash-flow effect',-nwc)]);
}
export function operatingNwc(v:Values):Result{
 const income=value(v,'net_income',-1e12,1e12),noncash=value(v,'noncash',-1e12,1e12),change=value(v,'nwc_change',-1e12,1e12);
 return asResult([['Net income',income],['Net noncash / nonoperating reconciliation adjustments',noncash],['Less increase / plus decrease in operating net working capital',-change]],[money('Net income used',income),money('Net noncash adjustments used',noncash),money('Increase in operating net working capital',change),money('Working-capital cash-flow effect',-change)],['Operating net working capital here means included operating current assets minus included operating current liabilities, excluding cash and interest-bearing debt. Do not also enter the component balance changes in this aggregate mode.']);
}
export function operatingDirect(v:Values):Result{
 const receipts=value(v,'receipts',-1e12,1e12),items=[['suppliers','Cash paid to suppliers'],['employees','Cash paid to employees'],['taxes','Operating income-tax cash payments'],['interest','Operating interest cash payments'],['other','Other operating cash payments']] as const;
 const payments=items.map(([key,label])=>({label,amount:value(v,key)})),outflow=payments.reduce((s,p)=>s+p.amount,0);
 return asResult([['Net operating cash receipts',receipts],...payments.map(p=>[p.label,-p.amount])],[money('Net operating cash receipts entered',receipts),money('Operating cash payments entered',outflow)],['Enter nonoverlapping cash payments as positive amounts; the table subtracts them. Net receipts can be negative if refunds exceed collections. Depreciation is not a cash payment and should not be subtracted here; debt principal, asset purchases and owner distributions belong outside this operating worksheet.']);
}
const common=()=>[signed('net_income','Net income for the reporting period',120000),signed('noncash','Net noncash / nonoperating adjustments',30000,'Signed net amount: add noncash expenses; subtract applicable noncash income or gains. Avoid double counting.')];
export const operatingCashFlowCalculator=tool('operating-cash-flow',[
 {id:'indirect',title:'Indirect: Component Changes',description:'Reconcile net income using signed adjustments and operating asset and liability changes.',fields:[...common(),signed('ar_change','Increase / (decrease) in operating receivables',15000),signed('inventory_change','Increase / (decrease) in inventory',10000),signed('other_assets_change','Increase / (decrease) in other operating assets',5000),signed('ap_change','Increase / (decrease) in trade payables',8000),signed('other_liabilities_change','Increase / (decrease) in other operating liabilities',2000)],formula:'OCF = net income + signed adjustments − operating asset increases + operating liability increases.',calculate:operatingIndirect},
 {id:'nwc',title:'Indirect: Known Working-Capital Change',description:'Use an already reconciled operating net working-capital change instead of entering components.',fields:[...common(),signed('nwc_change','Increase / (decrease) in operating net working capital',20000,'Ending minus beginning operating assets less operating liabilities. Exclude cash and interest-bearing debt.')],formula:'OCF = net income + signed adjustments − increase in operating net working capital.',calculate:operatingNwc},
 {id:'direct',title:'Direct: Cash Receipts & Payments',description:'Subtract nonoverlapping operating cash payments from operating cash receipts.',fields:[signed('receipts','Net operating cash receipts',600000),usd('suppliers','Cash paid to suppliers',300000),usd('employees','Cash paid to employees',100000),usd('taxes','Operating income-tax cash payments',30000),usd('interest','Operating interest cash payments',10000),usd('other','Other operating cash payments',30000)],formula:'OCF = operating cash receipts − operating cash payments.',calculate:operatingDirect},
], 'Calculate operating cash flow from net income and working-capital changes, or from operating cash receipts and payments. Inspect signed adjustments and the reconciliation.');
