#!/usr/bin/env python3
"""Independent Decimal cash-flow references; no website implementation imports."""
from decimal import Decimal, getcontext
from pathlib import Path
import json
getcontext().prec = 70
D = lambda x: Decimal(str(x))
REFERENCE = Path(__file__).resolve().parents[1]/'docs/financial-clone/evidence/equity-heloc-consolidation-reference-20261119.json'

def schedule(principal, rate, periods):
    payment = principal/D(periods) if rate == 0 else principal*rate/(1-(1+rate)**(-periods))
    balance = principal; rows = []
    while balance > D('1e-40'):
        interest = balance*rate; paid = min(payment,balance+interest); reduction = paid-interest; balance -= reduction
        rows.append([D(len(rows)+1),paid,interest,reduction,balance])
        assert len(rows) <= periods
    return payment,rows

def cash_apr(net, payments):
    if abs(sum(payments)-net) < D('1e-40'):return D(0)
    low,high = D(0),D(1)
    for _ in range(240):
        mid=(low+high)/2; discount=D(1)/(1+mid); factor=discount; present=D(0)
        for payment in payments:
            present += payment*factor; factor *= discount
        if present > net:low=mid
        else:high=mid
    return (low+high)/2*1200

def existing_debts(raw):
    debts=[]
    for line in raw.splitlines():
        name,balance,minimum,rate=[x.strip() for x in line.split(',')]
        debts.append({'balance':D(balance),'minimum':D(minimum),'rate':D(rate)/1200})
    budget=sum(d['minimum'] for d in debts); rows=[]; total_interest=D(0)
    while any(d['balance']>D('1e-40') for d in debts):
        interest=D(0)
        for debt in debts:
            if debt['balance']>D('1e-40'):
                charge=debt['balance']*debt['rate']; debt['balance']+=charge; interest+=charge
        available=budget;paid=D(0)
        for debt in debts:
            take=min(debt['balance'],debt['minimum']);debt['balance']-=take;available-=take;paid+=take
        for debt in sorted(debts,key=lambda d:d['rate'],reverse=True):
            take=min(debt['balance'],max(D(0),available));debt['balance']-=take;available-=take;paid+=take
        total_interest+=interest
        rows.append([D(len(rows)+1),paid,interest,sum(d['balance'] for d in debts),*[d['balance'] for d in debts]])
        assert len(rows)<=12000
    return total_interest,rows

def reference(calculator,mode,v):
    if mode=='maximum-credit':
        secured=D(v['value'])*D(v['ltv'])/100
        return {'Estimated maximum HELOC':max(D(0),secured-D(v['mortgage'])),'Maximum total secured debt':secured},[],[]
    if calculator=='heloc':
        p=D(v['principal']);rate=D(v['rate'])/1200;draw=int(D(v['draw'])*12);n=int(D(v['years'])*12)
        closing=D(v['closing'])*(p/100 if v['closing_unit']=='Percent' else 1);allocated=D(v['charge'])/12
        a,repay=schedule(p,rate,n)
        rows=[[D(m+1),p*rate+allocated,p*rate,D(0),p] for m in range(draw)]
        rows += [[row[0]+draw,*row[1:]] for row in repay]
        return {'Monthly draw payment':p*rate+allocated if draw else D(0),'Monthly repayment':a,
                'Cash disbursed at closing':p-closing if v['closing_treatment']=='Deducted from loan' else p,
                'Closing costs paid upfront':closing if v['closing_treatment']=='Upfront' else D(0),
                'Net initial proceeds after closing costs':p-closing,
                'Total interest':draw*p*rate+sum(row[2] for row in repay),
                'Fees and annual charges':closing+draw*allocated,'Annual fees during draw':draw*allocated,
                'Nominal APR including fees':cash_apr(p-closing,[row[1] for row in rows])},rows,[]
    if calculator=='home-equity-loan':
        principal=D(v['principal']);fee=D(v['closing']);p=principal+(fee if v['treatment']=='Financed' else 0)
        net=principal-(D(0) if v['treatment']=='Financed' else fee);rate=D(v['rate'])/1200;n=int(D(v['years'])*12+D(v['months']))
        a,rows=schedule(p,rate,n)
        return {'Payment per period':rows[0][1],'Total interest':sum(row[2] for row in rows),'Total payments':sum(row[1] for row in rows),'Number of payments':D(len(rows)),'Net proceeds':net,'Nominal APR':cash_apr(net,[row[1] for row in rows])},rows,[]
    principal=sum(D(line.split(',')[1].strip()) for line in v['debts'].splitlines());fee=principal*D(v['fees'])/100
    p=principal+(fee if v['finance']=='Yes' else 0);rate=D(v['new_rate'])/1200;n=int(D(v['years'])*12)
    a,rows=schedule(p,rate,n);current_interest,current_rows=existing_debts(v['debts']);interest=sum(row[2] for row in rows)
    return {'Payment per period':rows[0][1],'Total interest':interest,'Total payments':sum(row[1] for row in rows),'Number of payments':D(len(rows)),'Origination fee':fee,'Current plan total interest':current_interest,'Interest and fee savings':current_interest-interest-fee},rows,current_rows

if __name__=='__main__':
    data=json.loads(REFERENCE.read_text());checks=0
    for case in data['cases']:
        metrics,rows,current=reference(case['calculatorId'],case['mode'],case['values'])
        for key,value in case['expected'].items():
            assert abs(metrics[key]-D(value))<D('1e-35'),(case['label'],key);checks+=1
        for field,actual_rows in [('selectedRows',rows),('currentPlanRows',current)]:
            for selected in case[field]:
                for actual,expected in zip(actual_rows[int(selected[0])-1],selected):
                    assert abs(actual-D(expected))<D('1e-35'),case['label'];checks+=1
    print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
