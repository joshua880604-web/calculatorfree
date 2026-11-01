import test from 'node:test';
import assert from 'node:assert/strict';
import {runCalculation} from '../src/lib/calculators';

const calculate=(principal:string,years:string,months:string,payment:string)=>runCalculation('interest-rate','rate',{principal,years,months,payment});
const close=(actual:number,expected:number,tolerance=0.000001)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);
test('Loan-rate results recover independently calculated rate and cost fixtures',()=>{
  // 60-digit Decimal annuity fixtures; no production payment/solver helper generates expectations.
  for(const fixture of [
    {principal:'10000',years:'1',payment:'900',annual:14.45214813770271,total:10800,interest:800},
    {principal:'20000',years:'5',payment:'386.6560305885654',annual:6,total:23199.361835313924,interest:3199.361835313924},
    {principal:'10000',years:'1',payment:'800',annual:-7.470128090143889,total:9600,interest:-400},
  ]){
    const r=calculate(fixture.principal,fixture.years,'0',fixture.payment),m=Object.fromEntries(r.metrics.map(m=>[m.label,m.value]));
    close(m['Annual interest rate'],fixture.annual);
    close(m['Total scheduled payments'],fixture.total);
    close(m['Total interest'],fixture.interest);
    close(m['Monthly interest rate'],fixture.annual/12);
    assert.ok(r.notes?.some(n=>n.includes('APR')));
    if(fixture.annual<0)assert.ok(r.notes?.some(n=>n.includes('negative')));
  }
});
test('Zero-cost loans report exact zero without removing cost distinctions',()=>{
  const m=Object.fromEntries(calculate('12000','1','0','1000').metrics.map(m=>[m.label,m.value]));
  assert.equal(m['Annual interest rate'],0);assert.equal(m['Monthly interest rate'],0);
  assert.equal(m['Effective annual rate'],0);assert.equal(m['Total scheduled payments'],12000);
  assert.equal(m['Total interest'],0);
});
test('Whole-month terms can be expressed in years or additional months; fractional installments are rejected',()=>{
  assert.deepEqual(calculate('10000','1','6','650'),calculate('10000','1.5','0','650'));
  assert.throws(()=>calculate('10000','1','0.5','900'),/whole number/);
  assert.throws(()=>calculate('0','1','0','900'));
  assert.throws(()=>calculate('10000','1','0','0'));
});
