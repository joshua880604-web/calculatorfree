"""Independent Decimal checks for the published companion-article examples.

The cases spell out the displayed arithmetic rather than importing application
calculations. Run from the repository root before publishing edited tables.
"""
from decimal import Decimal as D, getcontext
from pathlib import Path
from datetime import date, timedelta
import json

getcontext().prec = 60
cases = []


def case(key, topic, calculator, mode, values, metrics):
    cases.append(dict(key=key, topic=topic, calculatorId=calculator, mode=mode,
                      values=values, metrics={label: str(n) for label, n in metrics.items()}))


exchange = dict(basis=200000, replacement=500000, cash_received=0,
                debt_relieved=150000, debt_assumed=150000, cash_paid=0, expenses=0)
case('exchange-full', 'exchange-1031', '1031-exchange', 'exchange', exchange, {
    'Realized gain / loss in modeled exchange': D(500000)-D(200000),
    'Gain recognized under simplified boot rules': D(0),
    'Deferred gain / unrecognized loss': D(300000),
    'Modeled replacement basis before special adjustments': D(200000)})
case('exchange-cash', 'exchange-1031', '1031-exchange', 'exchange',
     {**exchange, 'replacement': 475000, 'cash_received': 25000}, {
         'Realized gain / loss in modeled exchange': D(475000)+D(25000)-D(200000),
         'Gain recognized under simplified boot rules': D(25000),
         'Deferred gain / unrecognized loss': D(300000)-D(25000),
         'Modeled replacement basis before special adjustments': D(200000)})
case('exchange-debt', 'exchange-1031', '1031-exchange', 'exchange',
     {**exchange, 'replacement': 450000, 'debt_relieved': 200000,
      'debt_assumed': 125000, 'cash_paid': 50000}, {
         'Net liability relief treated as boot': D(200000)-D(125000)-D(50000),
         'Gain recognized under simplified boot rules': D(25000),
         'Realized gain / loss in modeled exchange': D(450000)+D(25000)-D(200000),
         'Deferred gain / unrecognized loss': D(250000)})
case('exchange-expense', 'exchange-1031', '1031-exchange', 'exchange',
     {**exchange, 'replacement': 475000, 'cash_received': 25000, 'expenses': 5000}, {
         'Net boot after qualifying exchange expenses': D(25000)-D(5000),
         'Realized gain / loss in modeled exchange': D(475000)+D(20000)-D(200000),
         'Gain recognized under simplified boot rules': D(20000),
         'Deferred gain / unrecognized loss': D(275000)})
case('maintenance-percent', 'maintenance-budget', 'home-maintenance-cost', 'allowance',
     dict(home_value=400000, rate=1, increase=0, years=1), {
         'First-year annual maintenance allowance': D(400000)*D('.01'),
         'First-year monthly maintenance allowance': D(4000)/D(12)})
case('maintenance-pool', 'maintenance-budget', 'home-maintenance-cost', 'components',
     dict(routine=1200, reserve=6000, components='First replacement, 6000, 1\nSecond replacement, 6000, 2'), {
         'Monthly contribution to replacement reserve': D(6000)/D(24),
         'Monthly budget including routine maintenance': D(6000)/D(24)+D(1200)/D(12),
         'Ending replacement reserve in modeled horizon': D(0)})
case('maintenance-now', 'maintenance-budget', 'home-maintenance-cost', 'components',
     dict(routine=1200, reserve=500, components='Due now, 1000, 0\nDue next year, 1200, 1'), {
         'Immediate replacement cash shortfall': D(1000)-D(500),
         'Monthly contribution to replacement reserve': D(1200)/D(12),
         'Monthly budget including routine maintenance': D(200)})
case('vacancy-snapshot', 'rental-vacancy', 'vacancy-rate', 'snapshot',
     dict(units=10, vacant=2, rent=1500), {
         'Physical vacancy rate': D(2)/D(10)*D(100),
         'Annualized rent loss at snapshot vacancy': D(2)*D(1500)*D(12)})
case('vacancy-period', 'rental-vacancy', 'vacancy-rate', 'period',
     dict(available_days=3650, vacant_days=365, scheduled_rent=180000, uncollected=2000), {
         'Physical vacancy rate': D(365)/D(3650)*D(100),
         'Estimated vacancy rent loss for period': D(180000)/D(10),
         'Rent after vacancy and collection loss': D(180000)-D(18000)-D(2000),
         'Modeled economic rental loss rate': D(20000)/D(180000)*D(100)})
case('credit-weighted', 'credit-utilization', 'credit-utilization', 'cards',
     dict(cards='900, 1000\n100, 9000', target=10), {
         'Overall credit utilization': D(1000)/D(10000)*D(100),
         'Payment to reach overall target': D(0),
         'Payments to bring every card to target': D(900)-D(1000)*D('.10')})
case('credit-payment', 'credit-utilization', 'credit-utilization', 'cards',
     dict(cards='1500, 5000\n500, 5000', target=10), {
         'Overall credit utilization': D(2000)/D(10000)*D(100),
         'Payment to reach overall target': D(2000)-D(10000)*D('.10'),
         'Payments to bring every card to target': D(1500)-D(5000)*D('.10')})
tax = dict(year='2026', filing='Single', holding='Long term: more than one year',
           ordinary=40000, preferential=0, proceeds=30000, basis=10000,
           selling_fees=0, magi=60000, other_nii=0, niit='Include NIIT scenario', state=0)
case('gain-long', 'capital-gains', 'capital-gains-tax', 'sale', tax, {
    'Realized capital gain / loss': D(20000),
    'Additional regular federal income tax': (D(20000)-(D(49450)-D(40000)))*D('.15'),
    'Estimated additional tax from the sale': D('1582.50')})
case('gain-short', 'capital-gains', 'capital-gains-tax', 'sale',
     {**tax, 'ordinary': 60000, 'proceeds': 20000,
      'holding': 'Short term: one year or less', 'magi': 80000}, {
         'Additional regular federal income tax': D(10000)*D('.22'),
         'Estimated additional tax from the sale': D(2200)})
case('gain-niit', 'capital-gains', 'capital-gains-tax', 'sale',
     {**tax, 'ordinary': 150000, 'magi': 195000}, {
         'Additional regular federal income tax': D(20000)*D('.15'),
         'Additional net investment income tax': D(15000)*D('.038'),
         'Estimated additional tax from the sale': D(3000)+D(570)})
case('gain-high', 'capital-gains', 'capital-gains-tax', 'sale',
     {**tax, 'ordinary': 500000, 'proceeds': 60000, 'basis': 0,
      'niit': 'Exclude NIIT scenario'}, {
         'Additional regular federal income tax': D(45500)*D('.15')+D(14500)*D('.20')})
for key, prices, fee in [('falling', [12, 10, 8], 0), ('falling-fee', [12, 10, 8], 3),
                         ('rising', [12, 14, 16], 0)]:
    shares = sum((D(120)-D(fee))/D(price) for price in prices)
    value = shares*D(prices[-1])
    lump = (D(360)-D(fee))/D(prices[0])*D(prices[-1])
    case('dca-'+key, 'lump-dca', 'dca', 'prices',
         dict(budget=120, fee=fee, prices='\n'.join(map(str, prices)), terminal=prices[-1]), {
             'Total shares purchased': shares,
             'Average cost per share including fees': D(360)/shares,
             'Market value at comparison price': value,
             'Unrealized DCA gain / loss before sale fees and tax': value-D(360),
             'DCA value minus lump-sum value': value-lump})
case('rule72-eight', 'rule-72-term', 'rule-of-72', 'time', dict(rate=8), {
    'Exact doubling time': D(2).ln()/D('1.08').ln(),
    'Rule of 72 doubling-time approximation': D(72)/D(8)})

out = Path('src/lib/companion-guide-cases.json')
out.write_text(json.dumps(cases, indent=2)+'\n')
start = date(2026, 11, 5)
assert str(start+timedelta(days=45)) == '2026-12-20'
assert str(start+timedelta(days=180)) == '2027-05-04'
print(json.dumps(dict(decimal_precision=getcontext().prec, numeric_cases=len(cases), calendar_checks=2)))
