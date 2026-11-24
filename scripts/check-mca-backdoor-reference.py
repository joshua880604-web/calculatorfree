"""Independent 70-digit Decimal IRA allocation and per-day discount-factor root."""
from decimal import Decimal as D,getcontext,ROUND_CEILING
from pathlib import Path
from datetime import date,timedelta
import json,itertools,sys
getcontext().prec=70
ROOT=Path(__file__).resolve().parents[1];p=ROOT/'docs/financial-clone/evidence/mca-backdoor-reference-20261124.json'
M=dict(advance=50000,factor=1.3,withheld_fees=1500,funding_date='2026-12-01',first_debit='2026-12-02',calendar='Weekdays (Mon–Fri only)',remittances=130)
S={k:v for k,v in M.items() if k!='remittances'};S.update(sales_per_interval=5000,holdback=10)
R=dict(case_scope='Ordinary case; basis confirmed',prior_basis=0,current_nondeductible=7500,year_end_iras=92500,outstanding_rollovers=0,converted=7500,assumed_rate=24)
F={**R,'next_year_contribution':0,'other_distributions':10000}
DEFAULTS={('merchant-cash-advance','fixed-remittances'):M,('merchant-cash-advance','sales-holdback'):S,('backdoor-roth-ira','conversion-only'):R,('backdoor-roth-ira','full-year'):F}
def calc(id,mode,v):
 n=lambda k:D(str(v[k]))
 if id=='backdoor-roth-ira':
  late=n('next_year_contribution') if mode=='full-year' else D(0);other=n('other_distributions') if mode=='full-year' else D(0)
  basis=n('prior_basis')+n('current_nondeductible');eligible=basis-late;pool=n('year_end_iras')+n('outstanding_rollovers')+n('converted')+other
  fraction=min(D(1),eligible/pool) if pool else D(0);free=n('converted')*fraction;otherfree=other*fraction;tax=n('converted')-free
  d={'Taxable portion of 2026 Roth conversions':tax,'Nontaxable portion of 2026 Roth conversions':free,'Assumed incremental tax on conversions':tax*n('assumed_rate')/100,'Total nondeductible basis before allocation':basis,'Basis eligible for 2026 allocation':eligible,'Pro-rata denominator including converted and distributed amounts':pool,'Taxable other IRA distributions in this worksheet':other-otherfree,'Nontaxable other IRA distributions in this worksheet':otherfree,'Basis used across conversion and other distributions':free+otherfree,'Remaining IRA basis after 2026 allocation':basis-free-otherfree,'Early-2027 contribution excluded from 2026 allocation':late,'December 31 IRA values plus included outstanding rollovers':n('year_end_iras')+n('outstanding_rollovers')}
  if pool:d['Nontaxable allocation percentage']=fraction*100
  return d
 gross=n('advance');total=gross*n('factor');net=gross-n('withheld_fees')
 payment=n('sales_per_interval')*n('holdback')/100 if mode=='sales-holdback' else total/n('remittances')
 count=int((total/payment).to_integral_value(rounding=ROUND_CEILING)) if mode=='sales-holdback' else int(n('remittances'))
 start=date.fromisoformat(v['funding_date']);t=date.fromisoformat(v['first_debit']);flows=[]
 for i in range(count):
  amount=min(payment,total-payment*i);flows.append(((t-start).days,amount))
  t+=timedelta(days=7 if v['calendar']=='Weekly (every 7 days)' else 1)
  if v['calendar'].startswith('Weekdays'):
   while t.weekday()>4:t+=timedelta(days=1)
 d={'Net cash received at funding':net,'Total contracted remittances':total,'Factor markup above gross advance':total-gross,'Fees withheld at funding':n('withheld_fees'),'Total financing cash cost above net funding':total-net,'Total cash cost divided by net funding':(total/net-1)*100,'Initial scheduled remittance':flows[0][1],'Final scheduled remittance':flows[-1][1],'Assumed number of remittances':D(count),'Calendar days from funding to final remittance':D(flows[-1][0])}
 # Solve for the one-calendar-day discount factor, independent of the engine's log-annual discount search.
 lo=D(0);hi=D(1)
 if total==net:annual=D(0)
 else:
  for _ in range(170):
   mid=(lo+hi)/2;pv=sum(amount*mid**day for day,amount in flows)
   if pv>net:hi=mid
   else:lo=mid
  annual=(((lo+hi)/2)**(-365)-1)*100
 if annual<=1000000:d['Illustrative effective annual IRR, not legal APR']=annual
 return d
if '--generate' in sys.argv:
 fixtures=[]
 def add(id,mode,key,patch={}):
  v={**DEFAULTS[id,mode],**patch};fixtures.append(dict(key=key,id=id,mode=mode,values=v,expected={k:str(x) for k,x in calc(id,mode,v).items()}))
 for (id,mode) in DEFAULTS:add(id,mode,mode+'-default')
 for mode,end,converted in itertools.product(['conversion-only','full-year'],[0,92500],[0,3750,7500]):add('backdoor-roth-ira',mode,f'{mode}-end{end}-convert{converted}',dict(year_end_iras=end,converted=converted))
 for prior,late in itertools.product([0,2500,20000],[0,3750,7500]):add('backdoor-roth-ira','full-year',f'prior{prior}-late{late}',dict(prior_basis=prior,next_year_contribution=late,year_end_iras=82500))
 for patch,key in [(dict(year_end_iras=0,converted=7600),'conversion-growth'),(dict(year_end_iras=0,converted=5000),'basis-exceeds-pool'),(dict(year_end_iras=0,converted=0),'zero-pool'),(dict(outstanding_rollovers=10000),'outstanding-rollover'),(dict(prior_basis=1e12,current_nondeductible=0,year_end_iras=1e12,converted=1e12),'large-basis')]:add('backdoor-roth-ira','conversion-only',key,patch)
 for calendar in ['Every calendar day','Weekdays (Mon–Fri only)','Weekly (every 7 days)']:
  for count in [1,5,20]:add('merchant-cash-advance','fixed-remittances',f'{calendar}-count{count}',dict(calendar=calendar,remittances=count))
 for mode in ['fixed-remittances','sales-holdback']:
  add('merchant-cash-advance',mode,mode+'-zero-cost',dict(factor=1,withheld_fees=0))
  add('merchant-cash-advance',mode,mode+'-fractional',dict(advance=12345.67,factor=1.17,withheld_fees=123.45))
  add('merchant-cash-advance',mode,mode+'-higher-fees',dict(withheld_fees=5000))
 add('merchant-cash-advance','sales-holdback','reduced-final',dict(advance=1000,factor=1.3,withheld_fees=0,sales_per_interval=3000,holdback=10))
 add('merchant-cash-advance','sales-holdback','slower-sales',dict(sales_per_interval=2500))
 add('merchant-cash-advance','fixed-remittances','large-scale',dict(advance=1e9,withheld_fees=30000000,remittances=10))
 add('merchant-cash-advance','fixed-remittances','tiny-scale',dict(advance=1,factor=1,withheld_fees=0,remittances=1))
 add('merchant-cash-advance','fixed-remittances','leap-weekend',dict(funding_date='2024-02-28',first_debit='2024-02-29',remittances=4))
 p.write_text(json.dumps(dict(precision=70,method='Independent per-day discount-factor root and direct Form 8606 ordinary allocation, no TypeScript imports',fixtures=fixtures),indent=2)+'\n')
d=json.loads(p.read_text());checks=0
for f in d['fixtures']:
 actual=calc(f['id'],f['mode'],f['values']);assert set(actual)==set(f['expected'])
 for k,v in actual.items():assert v==D(f['expected'][k]);checks+=1
print(json.dumps(dict(passed=True,cases=len(d['fixtures']),metrics=checks,precision=70)))
