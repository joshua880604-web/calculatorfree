"""Independent Decimal references for limited 2026 stock-compensation worksheets."""
from decimal import Decimal as D,getcontext
from datetime import date
from pathlib import Path
import json,sys,itertools
getcontext().prec=70
ROOT=Path(__file__).resolve().parents[1]
def anniv(s,years):
 d=date.fromisoformat(s)
 try:return d.replace(year=d.year+years)
 except ValueError:return date(d.year+years,2,28)
def calc(f):
 v=f['values'];d=lambda k:D(str(v[k]))
 if f['id']=='rsu-tax' and f['mode']=='delivery':
  wage=d('shares')*d('fmv')
  # Difference of cumulative piecewise withholding gives the award allocation.
  def federal(total):return min(total,D(1000000))*D('.22')+max(D(0),total-D(1000000))*D('.37')
  fed=federal(d('prior_supplemental')+wage)-federal(d('prior_supplemental')) if v['method']=='2026 optional supplemental method' else d('actual_federal')
  withholding=fed+d('other_withholding');net=wage-withholding;estimated=wage*d('assumed_federal_rate')/100
  return {'Value after allocated withholding':net,'Taxable wage value at delivery':wage,'Federal income tax withheld':fed,'Other allocated withholding':d('other_withholding'),'Total allocated withholding':withholding,'Net share equivalent, not broker rounding':net/d('fmv'),'Federal tax under your marginal-rate assumption':estimated,'Assumed federal tax minus federal withholding':estimated-fed}
 if f['id']=='rsu-tax':
  basis=d('sold_shares')*d('income_fmv');net=d('sold_shares')*d('sale_price')-d('fees');gain=net-basis;long=date.fromisoformat(v['sold'])>anniv(v['acquired'],1);tax=max(D(0),gain)*d('long_rate' if long else 'short_rate')/100
  return {'Capital gain / loss on sold shares':gain,'Adjusted basis of sold shares':basis,'Net sale proceeds before assumed tax':net,'Assumed capital-gain tax on positive gain':tax,'Net sale cash after assumed capital-gain tax':net-tax,'Capital holding-period classification':D(int(long)),'Calendar holding days':D((date.fromisoformat(v['sold'])-date.fromisoformat(v['acquired'])).days)}
 if f['mode']=='discount-price':
  base=min(d('grant_fmv'),d('purchase_fmv')) if v['price_base']=='Lower of grant / purchase FMV' else d('purchase_fmv');paid=base*(1-d('discount')/100);option=d('grant_fmv')*(1-d('discount')/100)
 else:paid=d('paid');option=d('grant_option')
 sold=date.fromisoformat(v['sale']);qualified=sold>anniv(v['grant'],2) and sold>anniv(v['purchase'],1);long=sold>anniv(v['purchase'],1);cost=d('shares')*paid;net=d('shares')*d('sale_price')-d('fees')
 wage_unit=min(max(D(0),d('grant_fmv')-option),max(D(0),d('sale_price')-paid)) if qualified else max(D(0),d('purchase_fmv')-paid)
 wage=wage_unit*d('shares');basis=cost+wage;capital=net-basis;tax=wage*d('ordinary_rate')/100+max(D(0),capital)*d('long_rate' if long else 'short_rate')/100
 return {'Capital gain / loss after compensation basis':capital,'Ordinary compensation income at disposition':wage,'Adjusted basis of sold shares':basis,'Original purchase cost':cost,'Net sale proceeds before assumed tax':net,'Assumed income tax: compensation plus positive capital gain':tax,'Economic profit / loss before assumed tax':net-cost,'Economic profit / loss after assumed tax':net-cost-tax,'Disposition date-test result':D(int(qualified)),'Capital holding-period classification':D(int(long)),'Actual purchase price per share used':paid,'Grant-date as-if-exercised option price used':option,'Calendar days after purchase':D((sold-date.fromisoformat(v['purchase'])).days)}
p=ROOT/'docs/financial-clone/evidence/rsu-espp-reference-20261124.json'
if '--generate' in sys.argv:
 public=json.loads((ROOT/'docs/financial-clone/evidence/rsu-espp-public-examples-20261124.json').read_text());fixtures=[]
 for id,examples in public.items():
  for j,e in enumerate(examples):fixtures.append(dict(key=id+'-public-'+str(j+1),id=id,mode=e['mode'],values=e['values']))
 def extra(id,mode,key,patch):
  base=next(f for f in fixtures if f['id']==id and f['mode']==mode);fixtures.append(dict(key=key,id=id,mode=mode,values={**base['values'],**patch}))
 for prior in [0,998000,'999999.99',1000000,'1000000.01',2000000]:extra('rsu-tax','delivery','supplemental-'+str(prior),dict(prior_supplemental=prior))
 extra('rsu-tax','delivery','fractional-share-delivery',dict(shares='12.5',fmv='23.45',other_withholding=0))
 extra('rsu-tax','delivery','all-withheld',dict(method='Enter actual federal withholding',actual_federal=5000,other_withholding=0))
 for acquired,sold in [('2025-11-24','2026-11-24'),('2025-11-23','2026-11-24'),('2024-02-29','2026-02-28'),('2025-01-01','2026-01-01'),('2025-01-01','2026-01-02')]:extra('rsu-tax','sale','rsu-hold-'+acquired+'-'+sold,dict(acquired=acquired,sold=sold))
 extra('rsu-tax','sale','same-day-zero-gain',dict(acquired='2026-11-24',sale_price=50,fees=0))
 for grant,purchase,price in itertools.product(['2024-11-23','2024-11-24','2024-11-25'],['2025-11-23','2025-11-24','2025-11-25'],[0,60,68,80,120]):extra('espp-tax','known-price',f'espp-bound-{grant}-{purchase}-{price}',dict(grant=grant,purchase=purchase,sale_price=price))
 for sale in ['2026-02-27','2026-02-28','2026-03-01']:extra('espp-tax','known-price','leap-grant-'+sale,dict(grant='2024-02-29',purchase='2024-06-01',sale=sale))
 extra('espp-tax','known-price','fees-affect-capital-not-fmv',dict(sale_price=70,fees=300))
 extra('espp-tax','known-price','fixed-option-above-original-fmv',dict(grant_option=110,paid=110,purchase_fmv=120))
 for base,discount in itertools.product(['Lower of grant / purchase FMV','Purchase-date FMV only'],[0,10,15]):extra('espp-tax','discount-price',f'derive-{base}-{discount}',dict(price_base=base,discount=discount))
 for f in fixtures:f['expected']={k:str(v) for k,v in calc(f).items()}
 p.write_text(json.dumps(dict(precision=70,method='Python Decimal; cumulative piecewise withholding differences, calendar replacement and independently written compensation/basis formulas; published IRS Example 10/11 price cases included',fixtures=fixtures),indent=2)+'\n')
data=json.loads(p.read_text());checks=0
for f in data['fixtures']:
 result=calc(f);assert set(result)==set(f['expected'])
 for k,v in result.items():assert v==D(f['expected'][k]),(f['key'],k);checks+=1
print(json.dumps(dict(passed=True,cases=len(data['fixtures']),metricChecks=checks,precision=70)))
