import { type Calculator, type Field, type Metric, type Result, type Values } from '../lib/types';
import {embedContext,embedFieldVisible} from '../lib/embed-context';
import {embedReport} from '../lib/embed-reports';
import { guardAttribution } from './attribution';
import {stockLotDrafts,type StockLotDraft} from '../lib/stock-lots';
import {coastFieldVisible} from '../lib/coast-household';

type Widget = { id: string; title: string; category:string; mainURL: string; modes: {id:string;title:string;fields:Field[]}[]; initial: Result };
const config = JSON.parse(document.getElementById('embed-data')!.textContent!) as Widget;
const form = document.querySelector<HTMLFormElement>('#embed-form')!, fieldset = document.getElementById('embed-fields')!;
const output = document.getElementById('embed-result')!, status = document.getElementById('embed-status')!;
const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
const modePicker = document.querySelector<HTMLSelectElement>('#embed-mode');
let active = config.modes[0], token = 0;
let model: Promise<typeof import('../lib/calculate-client')> | undefined;
function loadModel() {
 return model??=import('../lib/calculate-client').catch(()=>{model=undefined;throw new Error('The calculator could not load. Check your connection and try again, or open the full calculator.');});
}
function metricText(metric: Metric) {
  if (metric.displayValue !== undefined) return metric.displayValue;
  if (metric.format==='money') return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(metric.value);
  return new Intl.NumberFormat('en-US',{maximumFractionDigits:metric.format==='percent'?5:6}).format(metric.value)+(metric.format==='percent'?'%':'');
}
function renderResult(result: Result) {
  output.replaceChildren();
  const heading=document.createElement('h2');heading.textContent='Result · CalculatorFree.io';output.append(heading);
  const context=embedContext(config.id,Object.fromEntries(new FormData(form)) as Values,active.id);if(context){const scope=document.createElement('p');scope.className='embed-result-context';scope.textContent=context.label;output.append(scope);}
  const list=document.createElement('dl');list.className='metrics';
  for(const metric of result.metrics){const row=document.createElement('div'),term=document.createElement('dt'),value=document.createElement('dd');term.textContent=metric.label;value.textContent=metricText(metric);row.append(term,value);list.append(row);}output.append(list);
  if(result.notes?.length){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Assumptions and limitations';details.append(summary);for(const note of result.notes){const p=document.createElement('p');p.textContent=note;details.append(p);}output.append(details);}
  const report=embedReport(config.id,result);
  if(report){
   const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=report.title==='Calculation details'?report.title:'Key comparison · '+report.title;details.className='embed-key-report';details.append(summary);let rendered=false;
   details.addEventListener('toggle',()=>{if(!details.open||rendered)return;rendered=true;
    const help=document.createElement('p');help.textContent='Scroll the table horizontally on smaller screens. Figures are model scenarios, not forecasts.';details.append(help);
    const region=document.createElement('div');region.className='embed-report-scroll';region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label',report.title);
    const table=document.createElement('table'),caption=document.createElement('caption');caption.textContent=report.title;table.append(caption);
    const head=document.createElement('thead'),header=document.createElement('tr');for(const label of report.columns){const th=document.createElement('th');th.scope='col';th.textContent=label;header.append(th);}head.append(header);table.append(head);
    const body=document.createElement('tbody');for(const row of report.rows){const tr=document.createElement('tr');row.forEach((value,i)=>{const cell=document.createElement(i===0?'th':'td');if(i===0)(cell as HTMLTableCellElement).scope='row';cell.textContent=typeof value==='number'?new Intl.NumberFormat('en-US',/tax year/i.test(report.columns[i])?{useGrouping:false,maximumFractionDigits:0}:{maximumFractionDigits:report.columns[i].includes('%')?4:2}).format(value):value;tr.append(cell);});body.append(tr);}table.append(body);region.append(table);details.append(region);
    const note=document.createElement('p');note.textContent=report.note+(report.totalRows>report.rows.length?' Showing the first '+report.rows.length+' of '+report.totalRows+' rows.':'');details.append(note);
    const more=document.createElement('a');more.href=config.mainURL;more.target='_blank';more.rel='nofollow noopener';more.textContent='Open full calculator for complete reports and assumptions →';details.append(more);
   });output.append(details);
  }
  output.hidden=false;
}
function renderStockLots(field:Field){
 const wrap=document.createElement('div');wrap.className='field-wide stock-purchases';
 const hidden=document.createElement('textarea');hidden.name=field.key;hidden.hidden=true;hidden.value=String(field.value);wrap.append(hidden);
 const help=document.createElement('p');help.textContent='One security, purchases only. Enter shares, price and a total USD buy fee for each purchase.';help.className='notice';wrap.append(help);
 let rows:StockLotDraft[];try{rows=stockLotDrafts(hidden.value);}catch{const message=document.createElement('p');message.textContent='Purchases could not be read. Use Reset to restore example purchases.';wrap.append(message);fieldset.append(wrap);return;}
 const list=document.createElement('div'),add=document.createElement('button'),counter=document.createElement('span');add.type='button';add.textContent='+ Add purchase';counter.className='debt-count';wrap.append(list,add,counter);
 const commit=()=>{hidden.value=JSON.stringify(rows);};
 const render=()=>{list.replaceChildren();rows.forEach((row,index)=>{const card=document.createElement('fieldset');card.className='debt-card';const legend=document.createElement('legend');legend.textContent='Purchase '+(index+1);card.append(legend);const fields=document.createElement('div');fields.className='debt-inputs stock-purchase-inputs';
 for(const key of ['shares','price','fee'] as const){const group=document.createElement('div'),label=document.createElement('label'),input=document.createElement('input');input.id='embed-stock-lot-'+index+'-'+key;label.htmlFor=input.id;label.textContent=({shares:'Shares bought',price:'Price per share (USD)',fee:'Total purchase fee (USD)'})[key];input.type='number';input.min=String(key==='shares'?1e-8:0);input.max='1000000000';input.step='any';input.required=true;input.value=row[key];input.addEventListener('input',()=>{row[key]=input.value;commit();});group.append(label,input);fields.append(group);}card.append(fields);
 const remove=document.createElement('button');remove.type='button';remove.textContent='Remove purchase';remove.setAttribute('aria-label','Remove purchase '+(index+1));remove.disabled=rows.length===1;remove.addEventListener('click',()=>{rows=rows.filter((_,i)=>i!==index);commit();render();add.focus();changed();});card.append(remove);list.append(card);});add.disabled=rows.length>=30;counter.textContent=rows.length+' of 30 purchases';};
 add.addEventListener('click',()=>{rows.push({shares:'',price:'',fee:'0'});commit();render();list.querySelector<HTMLInputElement>('.debt-card:last-child input')?.focus();changed();});render();fieldset.append(wrap);
}
function syncStockFees(){
 if(config.id!=='stock-profit')return;const values=Object.fromEntries(new FormData(form)) as Values;
 for(const key of ['buy_fee','sell_fee']){const wrap=fieldset.querySelector<HTMLElement>('[data-field="'+key+'"]'),input=wrap?.querySelector<HTMLInputElement>('input'),label=wrap?.querySelector('label');const percentage=values[key+'_unit']==='Percent';if(input)input.max=percentage?'100':'1000000000';if(label)label.textContent=active.fields.find(f=>f.key===key)!.label+' ('+(percentage?'%':'USD')+')';}
}
function renderDebts(field:Field){
 const wrap=document.createElement('div');wrap.className='debt-editor field-wide';
 const hidden=document.createElement('textarea');hidden.name=field.key;hidden.value=String(field.value);hidden.hidden=true;wrap.append(hidden);
 const help=document.createElement('p');help.textContent='Enter each balance separately. Use a nickname, not an account number. Minimum payments are included in your total monthly budget.';help.className='notice';wrap.append(help);
 const list=document.createElement('div');wrap.append(list);const add=document.createElement('button');add.type='button';add.textContent='+ Add debt';
 const counter=document.createElement('span');counter.className='debt-count';wrap.append(add,counter);
 type Row={name:string;balance:string;minimum:string;apr:string};const keys=['name','balance','minimum','apr'] as const;
 const labels={name:'Debt nickname',balance:'Balance ($)',minimum:'Minimum monthly payment ($)',apr:'APR (%)'};
 const lines=hidden.value.split('\n').filter(line=>line.trim());
 if(lines.length>20||lines.some(line=>line.split(',').length!==4)){
  hidden.hidden=false;hidden.rows=5;const label=document.createElement('label');hidden.id='embed-debts';label.htmlFor=hidden.id;label.textContent='Debts: one line per name, balance, minimum, APR';wrap.prepend(label);add.remove();counter.remove();fieldset.append(wrap);return;
 }
 let rows:Row[]=lines.map(line=>{const [name,balance,minimum,apr]=line.split(',').map(x=>x.trim());return {name,balance,minimum,apr};});if(!rows.length)rows=[{name:'',balance:'',minimum:'',apr:''}];
 const commit=()=>{hidden.value=rows.map(row=>keys.map(k=>row[k]).join(',')).join('\n');};
 function draw(){list.replaceChildren();rows.forEach((row,index)=>{
  const card=document.createElement('fieldset');card.className='debt-card';const legend=document.createElement('legend');legend.textContent='Debt '+(index+1);card.append(legend);const inputs=document.createElement('div');inputs.className='debt-inputs';
  keys.forEach(key=>{const box=document.createElement('div'),label=document.createElement('label'),input=document.createElement('input');input.id='embed-debt-'+index+'-'+key;label.htmlFor=input.id;label.textContent=labels[key];input.type=key==='name'?'text':'number';if(key==='name')input.maxLength=80;else{input.min='0';input.step='any';input.inputMode='decimal';}input.required=true;input.value=row[key];input.addEventListener('input',()=>{row[key]=key==='name'?input.value.replace(/[,\r\n]/g,' '):input.value;if(key==='name')input.value=row[key];commit();});box.append(label,input);inputs.append(box);});card.append(inputs);
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove debt';remove.setAttribute('aria-label','Remove debt '+(index+1));remove.disabled=rows.length===1;remove.addEventListener('click',()=>{rows.splice(index,1);commit();draw();changed();add.focus();});card.append(remove);list.append(card);
 });add.disabled=rows.length>=20;counter.textContent=rows.length+' of 20 debts';}
 add.addEventListener('click',()=>{rows.push({name:'Debt '+(rows.length+1),balance:'',minimum:'',apr:''});commit();draw();changed();list.querySelector<HTMLInputElement>('.debt-card:last-child input')?.focus();});draw();fieldset.append(wrap);
}
function renderRentals(field:Field){
 const wrap=document.createElement('div');wrap.className='rental-editor field-wide';
 const hidden=document.createElement('textarea');hidden.name=field.key;hidden.hidden=true;hidden.value=String(field.value);wrap.append(hidden);
 const help=document.createElement('p');help.className='notice';help.textContent='Add only spaces rented to others. Use nicknames, not tenant names. Leave out your own room or unit.';wrap.append(help);
 type Row={name:string;rent:string};let rows:Row[]=[];
 try{const seed=JSON.parse(hidden.value);if(!Array.isArray(seed)||seed.length>10)throw Error('Invalid rent list');rows=seed.map(x=>({name:String(x.name??''),rent:String(x.rent??'')}));}catch{hidden.hidden=false;hidden.id='embed-rental-json';const label=document.createElement('label');label.htmlFor=hidden.id;label.textContent='Tenant spaces: JSON name and rent records';wrap.prepend(label);fieldset.append(wrap);return;}
 const list=document.createElement('div'),add=document.createElement('button'),count=document.createElement('span');add.type='button';add.textContent='+ Add rented space';count.className='debt-count';wrap.append(list,add,count);
 const commit=()=>{hidden.value=JSON.stringify(rows.map(row=>({name:row.name,rent:row.rent.trim()===''?null:Number(row.rent)})));};
 function draw(){list.replaceChildren();rows.forEach((row,index)=>{const card=document.createElement('fieldset');card.className='debt-card';const legend=document.createElement('legend');legend.textContent='Rented space '+(index+1);card.append(legend);
  for(const key of ['name','rent'] as const){const label=document.createElement('label'),input=document.createElement('input');input.id='embed-rental-'+index+'-'+key;label.htmlFor=input.id;label.textContent=key==='name'?'Space nickname':'Monthly rent (USD)';input.type=key==='name'?'text':'number';input.required=true;if(key==='name')input.maxLength=40;else{input.min='0';input.max='1000000000';input.step='any';}input.value=row[key];input.addEventListener('input',()=>{row[key]=input.value;commit();});card.append(label,input);}
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove rented space';remove.setAttribute('aria-label','Remove rented space '+(index+1));remove.addEventListener('click',()=>{rows.splice(index,1);commit();draw();changed();add.focus();});card.append(remove);list.append(card);
 });count.textContent=rows.length+' of 10 spaces';add.disabled=rows.length>=10;}
 add.addEventListener('click',()=>{rows.push({name:'Space '+(rows.length+1),rent:''});commit();draw();changed();list.querySelector<HTMLInputElement>('.debt-card:last-child input')?.focus();});draw();fieldset.append(wrap);
}

function renderFields(){
  fieldset.replaceChildren();
  for(const field of active.fields){
    const wrap=document.createElement('div'),label=document.createElement('label');wrap.className='field';wrap.dataset.field=field.key;label.htmlFor='embed-field-'+field.key;label.textContent=field.label+(field.unit?' ('+field.unit+')':'');
    if(field.key==='lots'&&config.id==='stock-average'){renderStockLots(field);continue;}
    if(field.key==='rentals'&&config.id==='house-hacking'){renderRentals(field);continue;}
    if(field.key==='debts'&&['debt-snowball','debt-avalanche','credit-cards-payoff'].includes(config.id)){renderDebts(field);continue;}
    const input=field.type==='select'?document.createElement('select'):field.type==='textarea'?document.createElement('textarea'):document.createElement('input');input.id=label.htmlFor;input.name=field.key;
    if(input instanceof HTMLSelectElement){for(const value of field.options??[]){const option=document.createElement('option');option.value=value;option.textContent=value;input.append(option);}}
    else if(input instanceof HTMLTextAreaElement){input.rows=5;input.required=!field.optional;wrap.classList.add('field-wide');}
    else {input.type=field.type==='date'?'date':'number';if(input.type==='number'){input.step=String(field.step??'any');if(field.min!==undefined)input.min=String(field.min);if(field.max!==undefined)input.max=String(field.max);}input.required=!field.optional;}
    input.value=String(field.value);wrap.append(label,input);
    if(field.hint){const hint=document.createElement('small');hint.id=input.id+'-hint';hint.textContent=field.hint;input.setAttribute('aria-describedby',hint.id);wrap.append(hint);}fieldset.append(wrap);
  }
  syncHousehold();syncStockFees();
}
function syncHousehold(){
  const context=embedContext(config.id,Object.fromEntries(new FormData(form)) as Values,active.id),aside=document.getElementById('embed-context');
  if(context&&aside){
    const label=aside.querySelector('strong'),paragraphs=aside.querySelectorAll('p');if(label)label.textContent=context.label;
    if(paragraphs[0])paragraphs[0].textContent=context.scope;
    if(paragraphs[1]){const sourceLink=paragraphs[1].querySelector('a');const credit=sourceLink?.cloneNode(true);paragraphs[1].replaceChildren(document.createTextNode(context.disclaimer+' '));if(credit)paragraphs[1].append(credit);}
  }
  if(config.id==='self-employment-tax'){
    const values=Object.fromEntries(new FormData(form)) as Values;
    for(const wrap of fieldset.querySelectorAll<HTMLElement>('[data-field]'))wrap.hidden=!embedFieldVisible(config.id,values,wrap.dataset.field!);
    const context=embedContext(config.id,values),label=document.querySelector('#embed-context strong');if(context&&label)label.textContent=context.label;return;
  }
  if(config.id!=='coast-fire'&&config.id!=='fix-and-flip')return;
  const values=Object.fromEntries(new FormData(form)) as Values;
  for(const wrap of fieldset.querySelectorAll<HTMLElement>('[data-field]')){
    const visible=config.id==='coast-fire'?coastFieldVisible(values,wrap.dataset.field!):!(values.financing==='Cash'&&['loan','rate','points'].includes(wrap.dataset.field!));wrap.hidden=!visible;
    const input=wrap.querySelector<HTMLInputElement|HTMLSelectElement>('input,select');if(input)input.disabled=!visible;
  }
}
function changed(){syncHousehold();syncStockFees();token++;submit.disabled=false;form.setAttribute('aria-busy','false');output.hidden=true;status.textContent='Inputs changed. Select Calculate to update the result.';}
form.addEventListener('input',changed);form.addEventListener('change',changed);
modePicker?.addEventListener('change',()=>{active=config.modes.find(mode=>mode.id===modePicker.value)!;renderFields();changed();});
form.addEventListener('submit',async event=>{
  event.preventDefault();const request=++token,modeId=active.id,values=Object.fromEntries(new FormData(form)) as Values;
  submit.disabled=true;form.setAttribute('aria-busy','true');status.textContent='Calculating…';
  try{const client=await loadModel();if(request!==token)return;const result=await client.runClientCalculation(config.id,config.category,modeId,values);if(request!==token)return;renderResult(result);status.textContent='Calculation updated.';}
  catch(error){if(request!==token)return;output.hidden=true;status.textContent=error instanceof Error?error.message:'The calculator could not load. Check your connection and try again.';}
  finally{if(request===token){submit.disabled=false;form.setAttribute('aria-busy','false');}}
});
form.addEventListener('reset',event=>{event.preventDefault();token++;active=config.modes[0];if(modePicker)modePicker.value=active.id;renderFields();renderResult(config.initial);status.textContent='Inputs reset to example values.';submit.disabled=false;form.setAttribute('aria-busy','false');});
// Browser-native validation and the same shared model validation both remain active.
renderFields();renderResult(config.initial);submit.disabled=false;
guardAttribution(document.querySelector<HTMLElement>('footer#embed-credit')!,config.mainURL);
