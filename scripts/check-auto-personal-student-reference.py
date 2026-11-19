#!/usr/bin/env python3
"""Independent equal-month loan references; no website implementation imports."""
from decimal import Decimal, getcontext
from pathlib import Path
import json
getcontext().prec = 70
D = lambda x: Decimal(str(x))
REFERENCE = Path(__file__).resolve().parents[1]/'docs/financial-clone/evidence/auto-personal-student-reference-20261119.json'

def installment(p, r, n):
    return p/n if r == 0 else p*r/(1-(1+r)**(-n))

def reference(calculator, mode, v):
    r = D(v['rate'])/1200
    n = int(D(v['months'])) if calculator == 'auto-loan' else int(D(v['years'])*12+D(v['months']))
    other = {}
    if calculator == 'auto-loan':
        assert v['tax_state'] == 'Manual', 'This reference does not assert state tax rules.'
        tax_rate = D(v['tax'])/100
        trade = D(v['trade']) if v['trade_credit'] == 'Yes' else D(0)
        rebate = D(v['rebate']) if v['rebate_tax'] == 'Yes' else D(0)
        offset = -D(v['rebate'])-D(v['down'])-D(v['trade'])+D(v['owed'])
        if mode == 'price':
            financed = installment(D(1),r,n)
            financed = D(v['payment'])/financed
            price = (financed-offset-D(v['fees'])+tax_rate*(trade+rebate))/(1+tax_rate) if v['finance_fees']=='Yes' else financed-offset
            assert price >= trade+rebate
        else:
            price = D(v['price'])
        tax = max(D(0), price-trade-rebate)*tax_rate
        charges = tax+D(v['fees'])
        p = price+offset+(charges if v['finance_fees']=='Yes' else 0)
        other = {'Vehicle price':price,'Sales tax':tax,'Upfront cash':D(v['down'])+(charges if v['finance_fees']=='No' else 0)}
    else:
        p = D(v['principal'])
        if calculator == 'personal-loan':
            fees = p*D(v['origination'])/100+D(v['documentation'])+D(v['other_fee'])
            net = p if v['treatment']=='Financed' else p-fees
            p += fees if v['treatment']=='Financed' else 0
    a = installment(p,r,n)
    balance = p
    rows = []
    while balance > D('1e-40'):
        month = len(rows)+1
        extra = D(0)
        if calculator == 'student-loan' and mode == 'extra':
            extra = D(v['extra_monthly'])+(D(v['extra_yearly']) if month%12==0 else 0)+(D(v['extra_once']) if month==int(v['extra_once_month']) else 0)
        interest = balance*r
        paid = min(balance+interest,a+extra)
        principal = paid-interest
        balance -= principal
        rows.append([D(month),paid,interest,principal,balance])
        assert len(rows) <= 12000
    result = {'Payment per period':rows[0][1],'Total interest':sum(row[2] for row in rows),'Total payments':sum(row[1] for row in rows),'Number of payments':D(len(rows)),**other}
    if calculator == 'personal-loan':
        payment = a+D(v['insurance'])
        low,high = D(0),D(1)
        for _ in range(240):
            mid=(low+high)/2
            present=payment*(1-(1+mid)**(-n))/mid
            if present > net:low=mid
            else:high=mid
        result.update({'Payment including insurance':payment,'Loan fees':fees,'Net proceeds after fees':net,'Nominal APR including insurance':(low+high)/2*1200})
    return result, rows

if __name__ == '__main__':
    data = json.loads(REFERENCE.read_text()); checks = 0
    for case in data['cases']:
        metrics, rows = reference(case['calculatorId'],case['mode'],case['values'])
        for key,value in case['expected'].items():
            assert abs(metrics[key]-D(value)) < D('1e-35'), (case['label'],key)
            checks += 1
        for selected in case['selectedRows']:
            for actual,expected in zip(rows[int(selected[0])-1],selected):
                assert abs(actual-D(expected)) < D('1e-35'),case['label']
                checks += 1
    print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
