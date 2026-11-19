#!/usr/bin/env python3
"""Independent Decimal references for the 2026-11-19 content review."""
from decimal import Decimal, getcontext
from pathlib import Path
import json
getcontext().prec = 70
D = lambda x: Decimal(str(x))
ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT/'docs/financial-clone/evidence/mortgage-match-transfer-reference-20261119.json'

def reference(calculator, mode, v):
    if calculator == 'mortgage':
        price = D(v['price']); down = price*D(v['down'])/100 if v['down_unit'] == 'Percent' else D(v['down'])
        principal = price-down; n = int(D(v['years'])*12+D(v['months'])); r = D(v['rate'])/1200
        payment = principal/D(n) if r == 0 else principal*r/(1-(1+r)**(-n))
        pmi = D(v['pmi'])/12 if v['pmi_unit'] == 'Dollars' else principal*D(v['pmi'])/1200
        costs = []
        for month in range(1,n+1):
            year = (month-1)//12
            total = sum(D(v[k])/12*(1+D(v[k+'_growth'])/100)**year for k in ['tax','insurance','hoa','other'])
            if month <= D(v['pmi_years'])*12: total += pmi
            costs.append(total)
        return {'Monthly principal & interest':payment,'Initial monthly total':payment+costs[0],
                'Down payment':down,'Financed loan amount':principal,'Initial monthly PMI':pmi,
                'Total interest':payment*n-principal,'Total taxes and other costs':sum(costs),
                'Total out of pocket':down+payment*n+sum(costs)}, {'month13total':payment+costs[12],'month13costs':costs[12]}
    if calculator == '401k':
        salary = D(v['salary']); eligible = min(salary,D(360000)); limit = D(24500)
        first = D(v['limit1'])/100; second = D(v['limit2'])/100; m1 = D(v['match1'])/100; m2 = D(v['match2'])/100
        minimum = ((first+second) if m2 > 0 and second > 0 else first if m1 > 0 else D(0))*eligible/salary
        maximum = min(D(1),limit/salary); possible = minimum <= maximum
        employee = min(salary*minimum,limit)
        match = min(min(employee,eligible*first)*m1+min(max(D(0),employee-eligible*first),eligible*second)*m2,max(D(0),min(salary,D(72000))-min(employee,limit)))
        return {('Minimum contribution rate for full match' if possible else 'Rate required for full match (unattainable)'):minimum*100,
                'Maximum steady contribution rate':maximum*100,'Age-based annual employee limit (2026)':limit,
                ('Annual contribution to maximize match' if possible else 'Annual contribution at employee limit'):employee,
                'Contribution per month':employee/12,'Employer annual match':match,'Total annual additions':employee+match}, {}
    def offer(prefix):
        return {'fee':max(D(v['balance'])*D(v[prefix+'fee_rate'])/100,D(v[prefix+'fee_min'])),
                'financed':v[prefix+'fee_payment']=='Added to balance','intro':D(v[prefix+'intro'])/100,
                'months':int(v[prefix+'months']),'after':D(v[prefix+'after'])/100}
    def project(o):
        balance = D(v['balance'])+(o['fee'] if o['financed'] else 0); interest = D(0); at_promo = balance if o['months']==0 else D(0)
        count = 0; boundary = {}
        while balance > D('1e-45') and count < 1200:
            count += 1; opening = balance; rate = o['intro'] if count <= o['months'] else o['after']; charge = opening*rate/12
            paid = min(opening+charge,D(v['payment'])); balance = opening+charge-paid; interest += charge
            if count == o['months']:at_promo = balance
            if count in [o['months'],o['months']+1]:boundary[str(count)] = [D(count),rate*100,opening,charge,paid,balance]
        assert balance < D('1e-45')
        return {'interest':interest,'count':D(count),'promoBalance':at_promo,'balance':balance,'boundary':boundary}
    a = offer('a_'); b = offer('b_') if mode=='offers' else {'fee':D(0),'financed':False,'intro':D(0),'months':0,'after':D(v['current_apr'])/100}
    ra = project(a); rb = project(b); other = 'Offer B' if mode=='offers' else 'Original card'
    original = D(v['balance'])+(a['fee'] if a['financed'] else 0); rate = a['intro']/12
    needed = original/D(a['months']) if rate == 0 else original*rate/(1-(1+rate)**(-a['months']))
    saving = rb['interest']+b['fee']-ra['interest']-a['fee']
    return {('Total borrowing-cost savings: A vs B' if mode=='offers' else 'Total borrowing-cost savings from transfer'):saving,
            'Transfer fee: offer A':a['fee'],'Interest: offer A':ra['interest'],'Borrowing cost: offer A':ra['interest']+a['fee'],
            'Months to repay: offer A':ra['count'],'Balance when offer A promotion ends':ra['promoBalance'],
            'Monthly payment to clear offer A during promotion':needed,
            'Interest: '+other:rb['interest'],'Fee: '+other:b['fee'],'Months to repay: '+other:rb['count'],
            'Unpaid balance after projection: offer A':ra['balance'],'Unpaid balance after projection: '+other:rb['balance']}, {'boundary':ra['boundary']}

if __name__ == '__main__':
    data = json.loads(REFERENCE.read_text()); checks = 0
    for row in data['cases']:
        actual, extra = reference(row['calculatorId'],row['mode'],row['values'])
        for key,value in row['expected'].items():
            assert abs(actual[key]-D(value)) < D('1e-40'),(row['label'],key); checks += 1
        if row['calculatorId']=='mortgage':
            for key,value in row['extra'].items():assert abs(extra[key]-D(value))<D('1e-40');checks += 1
        if row['calculatorId']=='balance-transfer':
            for period,values in row['extra']['boundary'].items():
                for actual_value,expected in zip(extra['boundary'][period],values):assert abs(actual_value-D(expected))<D('1e-40');checks += 1
    print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
