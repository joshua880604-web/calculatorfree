"""Independent annual ROE × retention reference; does not import the JS model."""
import json
from decimal import Decimal, getcontext
from pathlib import Path

getcontext().prec = 80
root = Path(__file__).resolve().parents[1] / 'docs/financial-clone/evidence'
source = json.loads((root / 'sgr-reference-inputs-20261118.json').read_text())
fixtures = []
for raw in source['fixtures']:
    f = dict(raw)
    v, expected = f['values'], {}
    D = lambda key: Decimal(v[key])
    if f['mode'] == 'financials':
        income, dividends = D('net_income'), D('dividends')
        equity = (D('equity_begin') + D('equity_end')) / 2
        roe, payout = income / equity * 100, dividends / income * 100
        expected.update({'Annual net income used': income, 'Annual dividends paid': dividends, 'Current-year earnings retained': income - dividends, 'Two-point average book equity': equity})
    else:
        roe = D('roe')
        payout = D('payout') if f['mode'] == 'ratios' else Decimal(0)
    if f['mode'] == 'target':
        growth = D('target_growth')
        retention = growth / roe * 100
        payout = 100 - retention
    else:
        retention = 100 - payout
        growth = roe * retention / 100
    expected.update({'Annual SGR under entered assumptions': growth, 'Required earnings retention' if f['mode'] == 'target' else 'Earnings retention ratio': retention, 'Implied dividend payout ratio' if f['mode'] == 'target' else 'Dividend payout ratio': payout, 'Annual ROE used': roe})
    f['expected'] = {key: str(value) for key, value in expected.items()}
    fixtures.append(f)
target = root / 'sgr-reference-20261118.json'
target.write_text(json.dumps({'date': source['date'], 'method': 'Independent Decimal arithmetic, 80 digits, explicitly specified annual ROE × retention approximation.', 'fixtures': fixtures}, ensure_ascii=False, indent=2) + '\n')
print(f'{len(fixtures)} cases, {sum(len(f["expected"]) for f in fixtures)} independent numeric reference values.')
