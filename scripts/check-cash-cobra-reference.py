"""Recalculate committed references independently from the TypeScript engine."""
import json
from decimal import Decimal, getcontext
from pathlib import Path

getcontext().prec = 70
data = json.loads((Path(__file__).resolve().parents[1] / 'docs/financial-clone/evidence/cash-cobra-reference-20261118.json').read_text())
count = 0
for case in data['fixtures']:
    v = case['values']
    d = lambda key: Decimal(v[key])
    if case['id'] == 'cash-advance-fee':
        fees = max(d('amount') * d('fee_rate') / 100, d('minimum_fee')) + d('atm_fee')
        opening = d('amount') + (fees if v['fee_treatment'].startswith('Finance fees') else 0)
        rate = d('apr') / 100 / d('day_basis')
        interest = opening * rate * d('days') if v['interest_method'].startswith('Simple') else opening * ((1 + rate) ** int(v['days']) - 1)
        expected = {'Total modeled cost': fees + interest, 'Estimated interest': interest, 'Total fees': fees, 'Total cash needed including repayment': d('amount') + fees + interest, 'Ending card balance before repayment': opening + interest, 'Interest-bearing starting balance': opening}
    else:
        prior = d('employee_share') if case['mode'] == 'contributions' else d('previous_payment')
        full = prior + d('employer_share') if case['mode'] == 'contributions' else d('total_premium')
        fee = full * d('admin_rate') / 100
        payment = full + fee - d('monthly_subsidy')
        expected = {'Estimated monthly amount you pay': payment, 'Estimated cost for selected months': payment * d('months'), 'Monthly change from previous employee payment': payment - prior, 'Total monthly plan premium': full, 'Monthly administrative charge': fee}
    assert set(expected) == set(case['expected'])
    for label, amount in expected.items():
        assert amount == Decimal(case['expected'][label]), (case['key'], label)
        count += 1
print(json.dumps({'passed': True, 'cases': len(data['fixtures']), 'metricChecks': count, 'precision': 70}))
