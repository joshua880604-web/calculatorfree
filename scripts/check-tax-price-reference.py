"""Independent Decimal pricing identities; no application calculation imports."""
import csv
import json
from decimal import Decimal, getcontext, ROUND_HALF_UP
from pathlib import Path
from urllib.parse import urlencode

getcontext().prec = 70
ROOT = Path(__file__).resolve().parents[1]
D = Decimal
cases = []

def add(key, tool, mode, label, known, values, net, tax, gross, rate, display=True):
    expected = dict(zip(['net','tax','gross','rate'], map(str, [net,tax,gross,rate])))
    assert net + tax == gross and net * rate / 100 == tax
    cases.append(dict(key=key, calculatorId=tool, mode=mode, label=label, known=known,
                      values=values, expected=expected, display=display))

net, rate = D('100'), D('7')
tax = net * rate / 100
gross = net + tax
add('sales-add','sales-tax','after','Add an entered sales-tax rate','Net $100; rate 7%',{'before':'100','rate':'7'},net,tax,gross,rate)
add('sales-remove','sales-tax','before','Recover the price before sales tax','Gross $107; rate 7%',{'after':'107','rate':'7'},gross/(1+rate/100),tax,gross,rate)
add('sales-rate','sales-tax','rate','Recover the rate from two prices','Net $100; gross $107',{'before':'100','after':'107'},net,tax,gross,(gross/net-1)*100)
add('sales-zero','sales-tax','after','Zero entered sales-tax rate','Net $100; rate 0%',{'before':'100','rate':'0'},net,D(0),net,D(0),False)
net,tax,gross,rate = D(100),D(20),D(120),D(20)
vat_pairs=[
 ('rate-net','Add VAT from a net price','Net $100; rate 20%',{'rate':'20','net':'100'}),
 ('rate-gross','Remove VAT from a gross price','Gross $120; rate 20%',{'rate':'20','gross':'120'}),
 ('rate-tax','Recover prices from the tax amount','Tax $20; rate 20%',{'rate':'20','tax':'20'}),
 ('net-gross','Recover VAT from net and gross','Net $100; gross $120',{'net':'100','gross':'120'}),
 ('net-tax','Recover VAT from net and tax','Net $100; tax $20',{'net':'100','tax':'20'}),
 ('gross-tax','Recover VAT from gross and tax','Gross $120; tax $20',{'gross':'120','tax':'20'}),
]
for key,label,known,pair in vat_pairs:
    values={k:pair.get(k,'') for k in ['rate','net','gross','tax']}
    # Independently reconstruct from each pair, rather than calling the site's solver.
    if key=='rate-net': n=D(values['net']); r=D(values['rate']); t=n*r/100; g=n+t
    elif key=='rate-gross': r=D(values['rate']); g=D(values['gross']); n=g/(1+r/100); t=g-n
    elif key=='rate-tax': r=D(values['rate']); t=D(values['tax']); n=t/(r/100); g=n+t
    elif key=='net-gross': n=D(values['net']); g=D(values['gross']); t=g-n; r=t/n*100
    elif key=='net-tax': n=D(values['net']); t=D(values['tax']); g=n+t; r=t/n*100
    else: g=D(values['gross']); t=D(values['tax']); n=g-t; r=t/n*100
    add('vat-'+key,'vat','any-two',label,known,values,n,t,g,r)
add('vat-zero','vat','any-two','Zero entered VAT rate','Net $100; rate 0%',{'rate':'0','net':'100','gross':'','tax':''},D(100),D(0),D(100),D(0),False)
cent=D('.01')
rounding={'lineTax':str((D('.05')*D('.07')).quantize(cent,rounding=ROUND_HALF_UP)*3),
          'basketTax':str((D('.05')*3*D('.07')).quantize(cent,rounding=ROUND_HALF_UP))}
assert rounding=={'lineTax':'0.00','basketTax':'0.01'}
reference={'checkedOn':'2026-11-19','decimalPrecision':70,'cases':cases,'rounding':rounding}
evidence=ROOT/'docs/financial-clone/evidence/tax-price-reference-20261119.json'
evidence.write_text(json.dumps(reference,indent=2)+'\n')
rows=[]
for c in cases:
    if not c['display']:continue
    rows.append({**{k:v for k,v in c.items() if k not in ['display']},
                 'amounts':[f'${D(c["expected"][k]):,.2f}' for k in ['net','tax','gross']]+[f'{D(c["expected"]["rate"]):g}%']})
(ROOT/'src/lib/tax-price-reference.json').write_text(json.dumps({'checkedOn':'2026-11-19','rows':rows},indent=2)+'\n')
target=ROOT/'public/data/reviewed-scenarios/tax-price-20261119.csv'
with target.open('w',newline='') as f:
    out=csv.writer(f);out.writerow(['Task','Calculator','Mode','Complete inputs','Net amount','Tax amount','Gross amount','Rate (%)','Restore link'])
    for c in cases:
        if c['display']:
            href='/'+c['calculatorId']+'-calculator#calc='+urlencode({'share_version':'1','mode':c['mode'],**c['values']})
            out.writerow([c['label'],c['calculatorId'],c['mode'],json.dumps(c['values'],separators=(',',':')),*[c['expected'][k] for k in ['net','tax','gross','rate']],href])
print(json.dumps({'passed':True,'independentCases':len(cases),'numericChecks':len(cases)*4+2,'displayedTasks':len(rows),'decimalPrecision':70}))
