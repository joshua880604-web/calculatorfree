#!/usr/bin/env python3
"""Independent Decimal references, without application imports."""
from decimal import Decimal, getcontext
from pathlib import Path
import json
getcontext().prec = 70
D = lambda x: Decimal(str(x))
ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT/'docs/financial-clone/evidence/fund-fees-cd-reference-20261119.json'

def reference(id, mode, v):
    if id == 'mutual-fund':
        n = int(D(v['years'])*12+D(v['months'])); grossfactor = (1+D(v['rate'])/100)**(D(1)/12)
        factor = ((1+D(v['rate'])/100)*(1-D(v['expense'])/100))**(D(1)/12)
        front = 1-D(v['front'])/100; balance = D(v['principal'])*front; gross = D(v['principal']); paid = balance; rows = []
        for month in range(1,n+1):
            cash = D(v['monthly'])+(D(v['annual']) if month%12 == 0 else 0)
            balance = balance*factor+cash*front; gross = gross*grossfactor+cash; paid += cash*front
            rows.append([D(month),paid,balance-paid,balance])
        end = balance*(1-D(v['back'])/100)
        return {'Net redemption value':end,'Balance without charges':gross,'Effect of fees and lost growth':gross-end}, rows
    if id == 'investment-fee':
        def path(fund,advisor):
            balance = D(v['balance']); gross = balance; fees = D(0); rows = []
            for year in range(1,int(v['years'])+1):
                grown = balance*(1+D(v['rate'])/100)
                fundfee = grown*fund/100 if v['basis']=='Before fund fees' else D(0)
                advisorfee = (grown-fundfee)*advisor/100
                balance = grown-fundfee-advisorfee+D(v['deposit']); fees += fundfee+advisorfee
                gross = gross*(1+D(v['rate'])/100)+D(v['deposit'])
                rows.append([D(year),balance,fundfee,advisorfee,fees])
            return balance, fees, gross, rows
        a,fees,gross,rows = path(D(v['fund']),D(v['advisor']))
        if mode == 'compare':
            b,bfees,_,brows = path(D(v['fund_b']),D(v['advisor_b']))
            return {'Option A ending balance':a,'Option B ending balance':b,'Option B balance advantage':b-a,'Option A modeled fees paid':fees,'Option B modeled fees paid':bfees}, [[x[0],x[1],y[1]] for x,y in zip(rows,brows)]
        return {'Ending balance after modeled fees':a,'Modeled fees paid':fees,'Ending balance without modeled fees':gross,'Balance reduction including lost growth':gross-a}, rows
    months = D(v['years'])*12+D(v['months']); rate = D(v['rate'])/100
    frequency = {'Annually':1,'Monthly':12,'Daily':365}.get(v['compound'])
    factor = (1+rate)**(D(1)/12) if v['rate_type']=='APY' else (1+rate/D(frequency))**(D(frequency)/12)
    end = D(v['principal'])*factor**months; interest = end-D(v['principal']); tax = max(D(0),interest)*D(v['tax'])/100
    rows = []; previous = D(v['principal'])
    for month in range(1,int(months)+1):
        balance = D(v['principal'])*factor**month
        rows.append([D(month),balance-previous,balance-D(v['principal']),balance]); previous = balance
    return {'Maturity balance':end,'Interest earned':interest,'Tax on interest':tax,'After-tax balance':end-tax,'Effective annual yield (APY)':(factor**12-1)*100,'Selected CD term in months':months}, rows

if __name__ == '__main__':
    data = json.loads(REFERENCE.read_text()); checks = 0
    for case in data['cases']:
        metrics,rows = reference(case['calculatorId'],case['mode'],case['values'])
        for k,v in case['expected'].items():assert abs(metrics[k]-D(v))<D('1e-40'),(case['label'],k);checks += 1
        for selected in case['selectedRows']:
            actual = rows[int(selected[0])-1]
            for a,e in zip(actual,selected):assert abs(a-D(e))<D('1e-40');checks += 1
    print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
