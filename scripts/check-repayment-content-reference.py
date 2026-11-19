"""Recompute public repayment examples using Decimal, without the JS engine."""
import json
from decimal import Decimal as D,getcontext
from pathlib import Path
getcontext().prec=70
data=json.loads((Path(__file__).resolve().parents[1]/'docs/financial-clone/evidence/repayment-content-reference-20261119.json').read_text())
checks=0
for case in data['cases']:
 v=case['values'];p=D(v['principal']);rate=D(v['rate'])/1200;balance=p;paid=D(0);total_interest=D(0);rows=[]
 if case['calculatorId']=='amortization':
  n=int(D(v['years'])*12+D(v['months']));scheduled=p/n if not rate else p*rate/(1-(1+rate)**(-n))
 elif case['calculatorId']=='credit-card':scheduled=D(v['payment'])
 for month in range(1,1201):
  if balance<=D('1e-7'):break
  interest=balance*rate;extra=D(0)
  if case['calculatorId']=='credit-card-minimum-payment':
   minimum=min(balance+interest,max(D(v['floor']),balance*D(v['minimum'])/100+(interest if v['interest_extra']=='Yes'else 0)));scheduled=minimum+D(v['extra'])
  if case['calculatorId']=='amortization':
   if month>=int(v['extra_start']):extra+=D(v['extra_monthly'])
   if month>=int(v['extra_yearly_start'])and(month-int(v['extra_yearly_start']))%12==0:extra+=D(v['extra_yearly'])
   if month==int(v['extra_once_month']):extra+=D(v['extra_once'])
   assert not v['dated']
  payment=min(balance+interest,scheduled+extra);principal=payment-interest;balance=max(D(0),balance-principal);paid+=payment;total_interest+=interest;rows.append([D(month),payment,interest,principal,balance])
 assert balance<=D('1e-7')
 expected={'Total interest':total_interest,'Total payments':paid}
 if case['calculatorId']=='credit-card-minimum-payment':expected.update({'Months to repay':D(len(rows)),'Initial payment including extra':rows[0][1],'Initial modeled minimum payment':min(p+p*rate,max(D(v['floor']),p*D(v['minimum'])/100+(p*rate if v['interest_extra']=='Yes'else 0)))})
 else:expected.update({'Number of payments':D(len(rows)),'Payment per period':rows[0][1]})
 for label,number in expected.items():assert number==D(case['expected'][label]),(case['key'],label);checks+=1
 for row in case['selectedScheduleRows']:
  for a,b in zip(rows[int(row[0])-1],row):assert a==D(b),(case['key'],row[0]);checks+=1
print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
