"""Independent 70-digit Decimal oracle. Daily enumeration differs from TS interval grouping."""
from decimal import Decimal as D,getcontext,ROUND_CEILING
from datetime import date,timedelta
from pathlib import Path
import json,sys
getcontext().prec=70
ROOT=Path(__file__).resolve().parents[1]
def calc(id,mode,v):
 d=lambda k:D(str(v[k]))
 if id=='ebitda':
  ebit=d('net_income')+d('interest')+d('income_tax') if mode=='net-income' else d('operating_income')+d('other_income')
  total=ebit+d('depreciation')+d('amortization');out={'EBITDA':total,'EBIT':ebit}
  if d('revenue')>0:out['EBITDA margin']=total/d('revenue')*100
  return out
 if id=='invoice-factoring':
  advance=d('invoice')*d('advance_rate')/100;reserve=d('invoice')-advance;periods=d('days')/d('interval')
  if v['billing']=='Started periods':periods=periods.to_integral_value(rounding=ROUND_CEILING)
  fees=(advance if v['fee_base']=='Advance amount' else d('invoice'))*d('fee_rate')/100*periods+d('other_fees')
  return {'Total net proceeds':d('invoice')-fees,'Advance received today':advance,'Reserve before fees':reserve,'Total fees':fees,'Signed settlement after fees':reserve-fees,'Additional amount owed at settlement':max(D(0),fees-reserve)}
 if id=='average-daily-balance' and mode=='segments':
  daily=[]
  for line in v['segments'].splitlines():
   bal,days=line.split(',');daily += [D(bal.strip())]*int(days)
 else:
  start=date.fromisoformat(v['start']);end=date.fromisoformat(v['end']);events={}
  for line in v.get('transactions',v.get('draws','')).splitlines():
   when,amt=line.split(',');key=date.fromisoformat(when.strip());events[key]=events.get(key,D(0))+D(amt.strip())
  daily=[];balance=d('opening');cursor=start
  while cursor<=end:
   balance+=events.get(cursor,D(0));daily.append(balance);cursor+=timedelta(days=1)
 average=sum(daily)/len(daily)
 if id=='average-daily-balance':return {'Average daily balance':average,'Estimated simple cycle interest':max(D(0),average)*d('apr')/100*len(daily)/d('day_basis'),'Balance-days total':sum(daily),'Cycle days':D(len(daily))}
 interest=sum(x*d('apr')/100/d('day_basis') for x in daily)
 return {'Total construction interest':interest,'Interest plus entered fees':interest+d('fees'),'Ending drawn principal':daily[-1],'Undrawn commitment':d('commitment')-daily[-1],'Average drawn balance':average,'Interest days':D(len(daily))}
p=ROOT/'docs/financial-clone/evidence/expansion-four-reference-20261124.json'
if '--generate' in sys.argv:
 public=json.loads((ROOT/'docs/financial-clone/evidence/expansion-four-public-examples-20261124.json').read_text());fixtures=[]
 for id,examples in public.items():
  for i,e in enumerate(examples):fixtures.append(dict(key=id+'-public-'+str(i+1),id=id,mode=e['mode'],values=e['values']))
 def extra(id,mode,key,patch):
  base=next(f for f in fixtures if f['id']==id and f['mode']==mode);fixtures.append(dict(key=key,id=id,mode=mode,values={**base['values'],**patch}))
 extra('ebitda','net-income','tax-interest-benefits',dict(net_income=100,interest=-20,income_tax=-10,depreciation=0,amortization=0,revenue=1000))
 extra('ebitda','net-income','zero-revenue',dict(revenue=0))
 extra('invoice-factoring','fees','advance-fee-base',dict(fee_base='Advance amount'))
 extra('invoice-factoring','fees','zero-days-fixed-fees',dict(days=0,billing='Started periods'))
 extra('invoice-factoring','fees','exact-period',dict(days=30,billing='Started periods'))
 extra('average-daily-balance','ledger','inclusive-first-last',dict(transactions='2026-11-01, 100\n2026-11-30, -600'))
 extra('average-daily-balance','ledger','leap-day',dict(start='2028-02-28',end='2028-03-01',opening=100,transactions='2028-02-29, 50',day_basis='360'))
 extra('average-daily-balance','ledger','negative-credit',dict(opening=-100,transactions=''))
 extra('average-daily-balance','ledger','constant-no-events',dict(transactions=''))
 extra('construction-loan','draws','zero-rate',dict(apr=0))
 extra('construction-loan','draws','no-draws',dict(draws='',opening=10000))
 extra('construction-loan','draws','single-day',dict(start='2026-11-01',end='2026-11-01',draws='2026-11-01, 1000',day_basis='360'))
 extra('construction-loan','draws','unsorted-same-day',dict(draws='2026-11-16, 20000\n2026-11-01, 50000\n2026-11-16, 30000'))
 for f in fixtures:f['expected']={k:str(v) for k,v in calc(f['id'],f['mode'],f['values']).items()}
 p.write_text(json.dumps(dict(precision=70,method='Python Decimal with daily enumeration and hand-selected scenarios',fixtures=fixtures),indent=2)+'\n')
data=json.loads(p.read_text());checks=0
for f in data['fixtures']:
 result=calc(f['id'],f['mode'],f['values']);assert set(result)==set(f['expected'])
 for k,value in result.items():assert value==D(f['expected'][k]),(f['key'],k);checks+=1
print(json.dumps(dict(passed=True,cases=len(data['fixtures']),metricChecks=checks,precision=70)))
