#!/usr/bin/env python3
"""Independent monthly cash-flow reference; no application code imports."""
from decimal import Decimal, getcontext
from pathlib import Path
import json

getcontext().prec = 70
D = lambda value: Decimal(str(value))
ROOT = Path(__file__).resolve().parents[1]
REFERENCE = ROOT / 'docs/financial-clone/evidence/growth-savings-boat-reference-20261119.json'

def growth(values, monthly=None, months=None):
    v = values
    n = int(D(v.get('years', 0))*12+D(v.get('months', 0))) if months is None else months
    rate = D(v['rate'])/100
    frequency = {'Annually':1, 'Monthly':12, 'Daily':365}[v['compound']]
    effective = 1+rate if v.get('rate_type') == 'APY' else (1+rate/D(frequency))**frequency
    r = effective**(D(1)/12)-1
    initial = D(v['principal']); balance = initial; paid = initial; taxed = D(0); accrued = D(0)
    original = initial; original_accrued = D(0)
    deposit = D(v.get('monthly', 0)) if monthly is None else monthly
    annual = D(v.get('annual', 0)); due = v['timing'] == 'Beginning of period'
    for month in range(1, n+1):
        c = deposit*(1+D(v.get('monthly_increase', 0))/100)**((month-1)//12)
        a = annual*(1+D(v.get('annual_increase', 0))/100)**((month-1)//12)
        before = c+(a if month % 12 == 1 else 0) if due else D(0)
        balance += before; paid += before
        interest = balance*r; balance += interest; accrued += max(D(0), interest)
        original_interest = original*r; original += original_interest; original_accrued += max(D(0), original_interest)
        after = c+(a if month % 12 == 0 else 0) if not due else D(0)
        balance += after; paid += after
        if month % 12 == 0 or month == n:
            haircut = accrued*D(v.get('tax', 0))/100
            balance -= haircut; taxed += haircut; accrued = D(0)
            original -= original_accrued*D(v.get('tax', 0))/100; original_accrued = D(0)
    years = D(n)/12
    return {'Ending balance':balance, 'Total contributions':paid, 'Starting amount':initial,
            'Additional contributions':paid-initial, 'Net investment earnings':balance-paid,
            'Net earnings from starting amount':original-initial,
            'Net earnings from additional deposits':balance-paid-(original-initial),
            'Tax on interest':taxed,
            'Inflation-adjusted balance':balance/(1+D(v.get('inflation', 0))/100)**years}

def reference(calculator, mode, values):
    v = values
    if calculator == 'boat-loan':
        r = D(v['rate'])/1200; n = int(D(v['years'])*12); down = D(v['down']); trade = D(v['trade']); fees = D(v['fees']); taxrate = D(v['tax'])/100
        factor = D(n) if r == 0 else (1-(1+r)**(-n))/r
        financed = v['finance'] == 'Yes'
        price = D(v['price']) if mode == 'payment' else (D(v['payment'])*factor+down+trade-(fees if financed else 0))/(1+(taxrate if financed else 0))
        tax = price*taxrate; principal = price-down-trade+(tax+fees if financed else 0)
        payment = principal/factor
        return {'Boat price':price, 'Sales tax':tax, 'Upfront cash':down+(0 if financed else tax+fees), 'Payment per period':payment,
                'Total interest':payment*n-principal, 'Total payments':payment*n, 'Number of payments':D(n)}
    if mode == 'conversion':
        f = {'Annually':1, 'Monthly':12, 'Daily':365}; r = D(v['rate'])/100; effective = (1+r/f[v['from']])**f[v['from']]
        return {'Equivalent interest rate':D(f[v['to']])*(effective**(D(1)/f[v['to']])-1)*100, 'Effective annual yield':(effective-1)*100}
    if mode == 'goal-contribution':
        zero = growth(v, monthly=D(0))['Ending balance']; unit = growth(v, monthly=D(1))['Ending balance']
        deposit = max(D(0), (D(v['end'])-zero)/(unit-zero))
        return {'Required monthly deposit':deposit, **growth(v, monthly=deposit)}
    if mode == 'goal-time':
        for months in range(2401):
            result = growth(v, months=months)
            if result['Ending balance'] >= D(v['end']):
                return {'Years to savings goal':D(months)/12, 'Months to savings goal':D(months), **result}
        raise ValueError('Target not reached within 200 years')
    return growth(v)

if __name__ == '__main__':
    data = json.loads(REFERENCE.read_text()); count = 0
    for case in data['cases']:
        actual = reference(case['calculatorId'], case['mode'], case['values'])
        for label, expected in case['expected'].items():
            assert abs(actual[label]-D(expected)) < D('1e-45'), (case['label'], label)
            count += 1
    print(json.dumps({'passed':True, 'cases':len(data['cases']), 'numericChecks':count, 'decimalPrecision':70}))
