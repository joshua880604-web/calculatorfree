import test from 'node:test';import assert from 'node:assert/strict';
import {embedReport} from '../src/lib/embed-reports';import {calculators,defaults,runCalculation} from '../src/lib/calculators';
for(const id of ['drip','mortgage-vs-invest','roth-conversion-ladder'])test('Embedded report selects existing model columns: '+id,()=>{
 const c=calculators.find(c=>c.id===id)!,m=c.modes[0],r=runCalculation(id,m.id,defaults(m)),report=embedReport(id,r)!;assert.ok(report);const source=r.additionalTables!.find(t=>t.title===report.title)!;
 assert.equal(report.totalRows,source.rows.length);assert.ok(report.rows.length<=20);
 if(id==='mortgage-vs-invest'){assert.deepEqual(report.rows,source.rows.slice(0,20).map(r=>[r[0],r[3],r[6],r[7]]));assert.equal(report.columns.length,4);}else{assert.deepEqual(report.rows,source.rows.slice(0,20));assert.deepEqual(report.columns,source.columns);}
});
test('Long conversion reports are bounded and empty results have no extra report',()=>{
 const c=calculators.find(c=>c.id==='roth-conversion-ladder')!,m=c.modes[0],r=runCalculation(c.id,m.id,{...defaults(m),age:'18',years:'40',pretax:'10000000'});assert.equal(embedReport(c.id,r)!.rows.length,20);assert.equal(embedReport(c.id,r)!.totalRows,40);assert.equal(embedReport('roi',{metrics:[]}),null);
});

test('Loan and investment widget schedules preserve model columns and cap excerpts without recomputing values',()=>{
 for(const id of ['amortization','mortgage','bond','depreciation','investment-fee']){
  const c=calculators.find(c=>c.id===id)!,m=c.modes[0],r=runCalculation(id,m.id,defaults(m));
  if(!r.rows?.length)continue;
  const report=embedReport(id,r)!;assert.deepEqual(report.columns,r.columns);assert.deepEqual(report.rows,r.rows.slice(0,20));assert.equal(report.totalRows,r.rows.length);assert.ok(report.rows.length<=20);
 }
});
