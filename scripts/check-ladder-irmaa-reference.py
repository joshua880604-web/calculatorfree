"""Independent Decimal event-list oracle; official IRMAA figures transcribed separately in cents."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,sys
getcontext().prec=70
ROOT=Path(__file__).resolve().parents[1]
# CMS full Part B / Part D tables checked 2026-11-24. These are facts, not derived by the TS engine.
OFFICIAL={
 '2026':dict(single=[109000,137000,171000,205000],joint=[218000,274000,342000,410000],separate=391000,b=[0,8120,20290,32460,44630,48700],d=[0,1450,3750,6040,8330,9100],base=20290),
 '2027':dict(single=[112000,141000,177000,212000],joint=[224000,282000,354000,424000],separate=388000,b=[0,8370,20940,33500,46060,50240],d=[0,1540,3970,6400,8830,9640],base=20940)}
def irmaa(v,bridge=False):
 y=OFFICIAL[str(v['year'])];magi=D(str(v['agi']))+D(str(v['tax_exempt_interest'])) if bridge else D(str(v['magi']))
 def quote(income):
  if v['status']=='Married filing separately: lived together':ix=0 if income<=y['single'][0] else 4 if income<y['separate'] else 5
  else:
   joint=v['status']=='Married filing jointly';limits=y['joint'] if joint else y['single'];ix=sum(income>D(x) for x in limits)
   if income>=D(750000 if joint else 500000):ix=5
  b=D(y['b'][ix])/100 if v['coverage']!='Part D only' else D(0);d=D(y['d'][ix])/100 if v['coverage']!='Part B only' else D(0);people=D(str(v['people']))
  premium=(b+(D(y['base'])/100 if v['coverage']!='Part D only' else 0)+d+(D(str(v['part_d_plan'])) if v['coverage']!='Part B only' else 0))*people
  return b,d,(b+d)*people,premium
 b,d,total,premium=quote(magi);change=quote(magi+D(str(v['extra_income'])))[2]-total
 return {'Monthly IRMAA for selected people':total,'12-month IRMAA for selected people':total*12,'Monthly total premiums for selected people':premium,'Monthly Part B IRMAA per person':b,'Monthly Part D IRMAA per person':d,'MAGI used for tier lookup':magi,'Premium year':D(str(v['year'])),'Usual income tax year':D(str(int(v['year'])-2)),'Monthly IRMAA change in added-income scenario':change}
def ladder(v,bills=False):
 horizon=int(v['horizon_days' if bills else 'horizon_months']);term=int(v['renewal_days' if bills else 'renewal_months']);roll=v['maturity']=='Roll same face amount';renew=D(str(v['renewal_price' if bills else 'renewal_coupon']))
 cash=D(0);coupons=D(0);gain=D(0);redeemed=D(0);reinvested=D(0);face_remaining=D(0);cost_remaining=D(0);initial=D(0)
 # Model each rung separately, jumping between lifecycle events rather than looping global calendar periods.
 for line in v['rungs'].splitlines():
  parts=[D(x.strip()) for x in line.split(',')];face=parts[0];cost=face*parts[1]/100;initial+=cost
  if bills:coupon=D(0);step=int(parts[2]);due=step
  else:coupon=parts[2]/100;step=int(12/parts[4]);due=int(parts[3])*step
  begin=0
  while True:
   last=min(due,horizon)
   if not bills:
    n=(last-begin)//step;paid=face*coupon*D(step)/12*n;cash+=paid;coupons+=paid;gain+=paid
   if due>horizon:face_remaining+=face;cost_remaining+=cost;break
   redeemed+=face;cash+=face;gain+=face-cost
   if not roll or due==horizon:break
   begin=due;due+=term;cost=face*renew/100 if bills else face;cash-=cost;reinvested+=cost
   if not bills:coupon=renew/100;step=6
 return {'Retained cash through horizon':cash,'Realized discount gain through horizon' if bills else 'Coupons received through horizon':gain if bills else coupons,'Face amount still outstanding':face_remaining,'Initial purchase cost':initial,'Outstanding purchase cost, not market value':cost_remaining,'Realized cash-flow gain, not tax income':gain,'Gross principal redemptions through horizon':redeemed,'Principal spent on reinvestment':reinvested}
def calculate(f):return irmaa(f['values'],f['mode']=='agi-bridge') if f['id']=='irmaa' else ladder(f['values'],f['mode']=='treasury-bills')
p=ROOT/'docs/financial-clone/evidence/ladder-irmaa-reference-20261124.json'
if '--generate' in sys.argv:
 public=json.loads((ROOT/'docs/financial-clone/evidence/ladder-irmaa-public-examples-20261124.json').read_text());fixtures=[]
 for id,examples in public.items():
  for i,e in enumerate(examples):fixtures.append(dict(key=id+'-public-'+str(i+1),id=id,mode=e['mode'],values=e['values']))
 base=dict(public['irmaa'][0]['values'])
 for year,y in OFFICIAL.items():
  for status in ['Single / head of household / qualifying surviving spouse','Married filing jointly','Married filing separately: lived together','Married filing separately: lived apart all year']:
   joint=status=='Married filing jointly';sep=status=='Married filing separately: lived together';bounds=[y['single'][0],y['separate']] if sep else (y['joint'] if joint else y['single'])+[750000 if joint else 500000]
   values=[D(-100),D(0)]+[D(x)+shift for x in bounds for shift in [D('-.01'),D(0),D('.01')]]
   for coverage in ['Part B + Part D','Part B only','Part D only']:
    for income in values:
     fixtures.append(dict(key=f'{year}-{status}-{coverage}-{income}',id='irmaa',mode='known-magi',values={**base,'year':year,'status':status,'coverage':coverage,'people':'2' if joint else '1','magi':str(income)}))
 b=dict(public['bond-ladder'][0]['values']);bill=dict(public['bond-ladder'][3]['values'])
 extra=[('coupon-bonds',{**b,'horizon_months':1}),('coupon-bonds',{**b,'horizon_months':6}),('coupon-bonds',{**b,'rungs':'1000, 99, 0, 2, 2'}),('coupon-bonds',{**b,'rungs':'1000, 101, 3, 12, 12','horizon_months':36,'maturity':'Roll same face amount','renewal_coupon':0,'renewal_months':6}),('coupon-bonds',{**b,'rungs':'1000, 100, 5, 8, 4','horizon_months':19}),('treasury-bills',{**bill,'horizon_days':27}),('treasury-bills',{**bill,'horizon_days':28}),('treasury-bills',{**bill,'maturity':'Roll same face amount','horizon_days':100,'renewal_days':'28','renewal_price':100}),('treasury-bills',{**bill,'rungs':'1000, 100, 1','horizon_days':57,'maturity':'Roll same face amount','renewal_days':'28','renewal_price':99})]
 for j,(mode,v)in enumerate(extra):fixtures.append(dict(key='ladder-boundary-'+str(j),id='bond-ladder',mode=mode,values=v))
 for f in fixtures:f['expected']={k:str(v) for k,v in calculate(f).items()}
 p.write_text(json.dumps(dict(precision=70,method='Separate-rung event-list Decimal oracle and separately transcribed CMS cents tables',fixtures=fixtures),indent=2)+'\n')
d=json.loads(p.read_text());count=0
for f in d['fixtures']:
 actual=calculate(f);assert set(actual)==set(f['expected'])
 for k,v in actual.items():assert v==D(f['expected'][k]),(f['key'],k);count+=1
print(json.dumps(dict(passed=True,cases=len(d['fixtures']),metricChecks=count,precision=70)))
