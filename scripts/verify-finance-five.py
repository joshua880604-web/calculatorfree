"""Independent Decimal check of the published hypothetical cases (stdlib only)."""
import json
from decimal import Decimal as D, localcontext
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
content = json.loads((ROOT / 'src/lib/finance-five-content.json').read_text())
records = []
with localcontext() as ctx:
    ctx.prec = 60
    for tool, guide in content.items():
        for case in guide['examples']:
            raw = case['values']
            v = {k: D(str(x)) for k, x in raw.items()}
            mode = case['mode']
            if tool == 'wacc':
                p = v.get('preferred', D(0))
                total = v['equity'] + v['debt'] + p
                weighted = (v['equity'] * v['equity_cost'] + v['debt'] * v['debt_cost'] * (1-v['tax']/100) + p*v.get('preferred_cost', D(0))) / total
                outputs = {'Weighted average cost of capital': weighted}
            elif tool == 'capm':
                premium = v['premium'] if mode == 'premium' else v['market_return']-v['risk_free']
                outputs = {'CAPM required annual return / cost of equity': v['risk_free']+v['beta']*premium}
            elif tool == 'bond-duration':
                m, n = v['frequency'], int(v['periods'])
                factor = 1+v['yield']/100/m
                flows = [v['face']*v['coupon']/100/m + (v['face'] if j == n else 0) for j in range(1,n+1)]
                present = [cf / factor**j for j, cf in enumerate(flows,1)]
                price = sum(present)
                mac = sum(p*D(j)/m for j,p in enumerate(present,1))/price
                mod = mac/factor
                convexity = sum(D(j*(j+1))*p for j,p in enumerate(present,1))/(m*m*factor*factor*price)
                outputs = {'Macaulay duration (years)': mac,'Modified duration (years)': mod,'Modeled bond price':price,'Convexity (years squared)':convexity,'DV01: first-order value of one basis point':price*mod/D(10000)}
            elif tool == 'cd-early-withdrawal-penalty':
                penalty = v['penalty'] if mode == 'dollars' else v['principal']*v['rate']/100*(v['penalty_days']/v['day_basis'] if mode == 'days' else v['penalty_months']/12)
                outputs = {'Early withdrawal penalty':penalty,'Estimated net proceeds after penalty':v['principal']+v['accrued']-penalty,'Principal reduction after accrued interest':max(D(0),penalty-v['accrued'])}
            elif tool == 'burn-rate':
                net = (v['start_cash']+v['excluded']-v['end_cash'])/v['months'] if mode == 'history' else v['outflows']-v['inflows']
                cash = v['end_cash'] if mode == 'history' else v['cash']
                outputs = {'Monthly net operating cash burn': net,'Months until entered cash reserve':max(D(0),cash-v['reserve'])/net,'Months until zero cash':cash/net}
            else:
                raise ValueError(tool)
            focus = case['expected']
            difference = abs(outputs[focus['label']]-D(str(focus['value'])))
            assert difference < D('0.0000001'), (tool,case['title'],difference)
            records.append({'calculator':tool,'mode':mode,'case':case['title'],'inputs':raw,'decimalResults':{k:str(x) for k,x in outputs.items()},'publishedFocusDifference':str(difference)})
assert len(records) == 13
destination = ROOT / 'docs/financial-clone/evidence/finance-five-decimal-20261116.json'
destination.write_text(json.dumps({'precision':60,'checkedOn':'2026-11-16','status':'13 published hypothetical cases verified; numerical cross-check, not an external professional review','cases':records},indent=2)+'\n')
print('Verified 13 published cases with 60-digit Decimal arithmetic.')
