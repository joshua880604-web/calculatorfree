"""Independent Decimal reference; never imports the TypeScript implementation."""
import json
from decimal import Decimal, getcontext
from pathlib import Path

getcontext().prec = 80
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'docs/financial-clone/evidence'
data = json.loads((EVIDENCE / 'ratio-property-three-reference-inputs-20261118.json').read_text())
fixtures = []
for source in data['fixtures']:
    f = dict(source)
    v = f['values']
    D = lambda key: Decimal(v[key])
    expected, undefined, rows = {}, [], []
    if f['id'] == 'sortino-ratio':
        target = D('target')
        if f['mode'] == 'return-series':
            import re
            returns = [Decimal(s) for s in re.split(r'[\s,;]+', v['returns']) if s]
            mean = sum(returns) / len(returns)
            shortfalls = [min(r - target, Decimal(0)) for r in returns]
            downside = (sum(s * s for s in shortfalls) / len(returns)).sqrt()
            rows = [[i + 1, r, target, s, s * s] for i, (r, s) in enumerate(zip(returns, shortfalls))]
            expected['All observations in denominator'] = len(returns)
            expected['Observations strictly below target'] = sum(r < target for r in returns)
        else:
            mean, downside = D('mean_return'), D('downside_deviation')
        expected.update({'Arithmetic mean return per period': mean, 'Fixed target return per period': target, 'Downside deviation per period': downside, 'Mean return minus target': mean - target})
        if downside == 0:
            undefined.append('Sortino ratio for one observation period')
        else:
            expected['Sortino ratio for one observation period'] = (mean - target) / downside
    elif f['id'] == 'gross-rent-multiplier':
        monthly = v['rent_period'] == 'Monthly'
        if f['mode'] == 'rent':
            price, grm = D('price'), D('grm')
            rent = price / grm
            expected['Required gross rent (' + v['rent_period'].lower() + ')'] = rent / (12 if monthly else 1)
        else:
            rent = D('rent') * (12 if monthly else 1)
            if f['mode'] == 'price':
                grm = D('grm')
                price = rent * grm
            else:
                price = D('price')
                grm = price / rent
        expected.update({'Gross rent multiplier (annual rent basis)': grm, 'Price implied by entered rent and GRM' if f['mode'] == 'price' else 'Property price used': price, 'Annual gross scheduled rent': rent, 'Monthly equivalent gross scheduled rent': rent / 12, 'Gross annual rent yield before expenses': rent / price * 100})
    else:
        debt, equity = D('debt'), D('equity')
        changes = f['mode'] == 'changes'
        repayment = D('repayment') if changes else Decimal(0)
        injection = D('equity_injection') if changes else Decimal(0)
        after_d, after_e = debt - repayment, equity + injection
        label = 'Debt-to-equity after entered changes' if changes else 'Debt-to-equity ratio'
        capital_label = 'Selected numerator / (numerator + book equity)'
        if after_e > 0:
            expected[label] = after_d / after_e
            expected[capital_label] = after_d / (after_d + after_e) * 100
        else:
            undefined += [label, capital_label]
        expected.update({'Selected numerator amount used': after_d, 'Book equity used': after_e})
        if changes:
            if equity > 0:
                expected['Debt-to-equity before entered changes'] = debt / equity
            else:
                undefined.append('Debt-to-equity before entered changes')
            expected['Entered repayment from existing company cash'] = repayment
            expected['New equity capital retained in the company'] = injection
        states = [(debt, equity), (after_d, equity), (debt, after_e), (after_d, after_e)] if changes else [(debt, equity)]
        rows = [[d, e, d / e if e > 0 else None, d / (d + e) * 100 if e > 0 else None] for d, e in states]
    f['expected'] = {k: str(v) for k, v in expected.items()}
    f['undefinedMetrics'] = undefined
    f['referenceRows'] = [[str(x) if x is not None else None for x in row] for row in rows]
    fixtures.append(f)

out = {'date': data['date'], 'method': 'Independent Python Decimal arithmetic, precision 80; all-observation target shortfalls; explicit balance-sheet changes.', 'fixtures': fixtures}
target = EVIDENCE / 'ratio-property-three-reference-20261118.json'
target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(f'Generated {len(fixtures)} independent reference cases, {sum(len(f["expected"]) for f in fixtures)} numeric metrics and {sum(len(f["undefinedMetrics"]) for f in fixtures)} undefined states.')
