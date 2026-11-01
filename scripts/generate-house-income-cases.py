"""Independent Decimal60 income examples; offline authoring only."""
from pathlib import Path
from decimal import Decimal as D, getcontext
import json, csv, os
os.environ.setdefault('MPLCONFIGDIR', '/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec = 60
root = Path(__file__).resolve().parents[1]
base = json.loads((root/'src/lib/calculation-guide-cases.json').read_text())['afford'][0]['values']
rows = []
for income in [60000, 80000, 100000, 150000, 200000]:
    v = {**base, 'income': income}
    budget = min(D(income)/12*D('.28'), D(income)/12*D('.36')-500)
    i = D('.06')/12
    factor = i/(1-(1+i)**-360)
    price = (budget-D(125))/(factor*D('.8')+D('.012')/12)
    rows.append({'income': income, 'calculatorId': 'house-affordability', 'mode': 'income', 'values': v,
                 'metrics': {'Monthly housing budget': float(budget), 'Estimated home price': float(price),
                             'Down payment': float(price*D('.2')), 'Loan amount': float(price*D('.8'))}})
(root/'src/lib/house-affordability-income-cases.json').write_text(json.dumps(rows, indent=2)+'\n')
with (root/'public/data/calculation-guides/house-income-cases.csv').open('w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['Gross annual household income (USD)', 'Complete inputs (JSON)', 'Unrounded reference metrics (JSON)'])
    for r in rows: w.writerow([r['income'], json.dumps(r['values'], sort_keys=True), json.dumps(r['metrics'], sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans', 'font.size':11, 'axes.spines.top':False,
                     'axes.spines.right':False, 'svg.fonttype':'none', 'svg.hashsalt':'house-income-cases'})
fig, ax = plt.subplots(figsize=(9,5))
ys = [r['metrics']['Estimated home price'] for r in rows]
ax.bar(range(5), ys, color='#6653cc')
ax.set_xticks(range(5), [f"USD {r['income']/1000:g}k" for r in rows])
ax.set_xlabel('Gross annual household income')
ax.set_ylabel('Modeled home price (USD)')
ax.set_title('Different incomes; same debt, financing and property costs')
ax.set_ylim(0, max(ys)*1.22)
for n, y in enumerate(ys): ax.text(n, y+max(ys)*.025, f'${y:,.0f}', ha='center', fontsize=9)
fig.text(.5, .012, 'USD 500 monthly debt; 28%/36% limits; 20% down; 6% / 30 years; tax 1.2%; insurance USD 1,500/year.\nHypothetical inputs, not rate quotes or lending limits. PMI, HOA, maintenance and closing costs excluded.',
         ha='center', fontsize=8, color='#475569')
fig.tight_layout(rect=(0,.075,1,1))
fig.savefig(root/'public/images/guides/house-income-guide.svg', facecolor='white', metadata={'Date':None})
print(json.dumps([{'income':r['income'], **r['metrics']} for r in rows], indent=2))
