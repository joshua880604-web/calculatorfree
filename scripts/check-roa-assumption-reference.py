"""Independent Decimal closed-form balance/interest reference; no TypeScript engine imports."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,itertools,sys
getcontext().prec=70
ROOT=Path(__file__).resolve().parents[1];p=ROOT/'docs/financial-clone/evidence/roa-assumption-reference-20261124.json'
R=dict(net_income=120000,beginning_assets=800000,ending_assets=1200000,revenue=1500000,target_roa=12)
K={k:v for k,v in R.items() if k not in ['beginning_assets','ending_assets']};K['average_assets']=1000000
A=dict(price=450000,assumed_balance=300000,assumed_rate=3,remaining_months=240,assumption_fees=3000,new_rate=6.5,new_months=360,new_fees=6000,horizon_months=60)
F={**A,'buyer_cash':50000,'gap_rate':9,'gap_months':120,'gap_fees':2000}
DEFAULTS={('return-on-assets','balances'):R,('return-on-assets','known-average'):K,('assumable-mortgage','cash-gap'):A,('assumable-mortgage','financed-gap'):F}
def closed(principal,rate,term,h):
 principal=D(principal);r=D(rate)/1200;n=int(term);t=min(n,int(h))
 if not principal:return (D(0),)*4
 payment=principal/n if not r else principal*r*(1+r)**n/((1+r)**n-1)
 balance=D(0) if t==n else (principal-payment*t if not r else principal*(1+r)**t-payment*((1+r)**t-1)/r)
 paid=payment*t;interest=paid-(principal-balance)
 return payment,balance,paid,interest

def calc(id,mode,v):
 v={k:D(str(x)) for k,x in v.items()}
 if id=='return-on-assets':
  avg=v['average_assets'] if mode=='known-average' else (v['beginning_assets']+v['ending_assets'])/2
  result={'Average total assets used':avg,'Net income for entered period':v['net_income'],'Net income at your target ROA':avg*v['target_roa']/100,'Target net income minus actual net income':avg*v['target_roa']/100-v['net_income']}
  if avg:result.update({'Return on assets for entered period':v['net_income']/avg*100,'Asset turnover for entered period':v['revenue']/avg})
  if v['revenue']:result['Net profit margin for entered period']=v['net_income']/v['revenue']*100
  return result
 gap=v['price']-v['assumed_balance'];cash=v['buyer_cash'] if mode=='financed-gap' else gap;second=gap-cash
 a=closed(v['assumed_balance'],v['assumed_rate'],v['remaining_months'],v['horizon_months']);g=closed(second,v.get('gap_rate',0),v.get('gap_months',1),v['horizon_months']);n=closed(v['price']-cash,v['new_rate'],v['new_months'],v['horizon_months'])
 af=v['assumption_fees']+(v.get('gap_fees',0) if second else 0);nf=v['new_fees'];ac=af+a[3]+g[3];nc=nf+n[3]
 return {'New-loan cost minus assumption cost through horizon':nc-ac,'Initial assumption plus gap-loan monthly P&I':a[0]+g[0],'Initial new-loan monthly P&I':n[0],'Initial monthly P&I difference: new minus assumption':n[0]-a[0]-g[0],'Purchase price minus assumed balance':gap,'Gap loan principal':second,'Cash at closing: assumption scenario':cash+af,'Cash at closing: new-loan scenario':cash+nf,'Assumption scenario interest plus fees through horizon':ac,'New-loan interest plus fees through horizon':nc,'Assumption total debt remaining at horizon':a[1]+g[1],'New-loan debt remaining at horizon':n[1],'Assumption cash through horizon including debt payoff':v['price']+ac,'New-loan cash through horizon including debt payoff':v['price']+nc,'Comparison horizon in months':v['horizon_months']}
if '--generate' in sys.argv:
 fixtures=[]
 def add(id,mode,key,patch={}):
  v={**DEFAULTS[id,mode],**patch};fixtures.append(dict(key=key,id=id,mode=mode,values=v,expected={k:str(x) for k,x in calc(id,mode,v).items()}))
 for (id,mode),v in DEFAULTS.items():add(id,mode,mode+'-default')
 for mode,income,revenue in itertools.product(['balances','known-average'],[-120000,0,120000],[0,1500000]):add('return-on-assets',mode,f'{mode}-{income}-{revenue}',dict(net_income=income,revenue=revenue))
 add('return-on-assets','balances','zero-assets',dict(beginning_assets=0,ending_assets=0))
 add('return-on-assets','known-average','zero-known-assets',dict(average_assets=0))
 add('return-on-assets','balances','one-zero-endpoint',dict(beginning_assets=0,ending_assets=1200000))
 add('return-on-assets','known-average','negative-target',dict(target_roa=-10,net_income=-50000))
 for mode,rate,horizon in itertools.product(['cash-gap','financed-gap'],[0,3,9],[1,60,240,600]):add('assumable-mortgage',mode,f'{mode}-rate{rate}-h{horizon}',dict(assumed_rate=rate))
 for mode in ['cash-gap','financed-gap']:
  add('assumable-mortgage',mode,mode+'-all-zero-rates',dict(assumed_rate=0,new_rate=0,**(dict(gap_rate=0) if mode=='financed-gap' else {})))
  add('assumable-mortgage',mode,mode+'-all-one-month',dict(remaining_months=1,new_months=1,**(dict(gap_months=1) if mode=='financed-gap' else {})))
  add('assumable-mortgage',mode,mode+'-new-cheaper',dict(assumed_rate=12,new_rate=2,assumption_fees=9000,new_fees=0))
 add('assumable-mortgage','financed-gap','zero-gap-loan',dict(buyer_cash=150000,gap_fees=999999))
 add('assumable-mortgage','financed-gap','no-cash-contribution',dict(buyer_cash=0))
 add('assumable-mortgage','cash-gap','price-equals-balance',dict(price=300000))
 add('assumable-mortgage','financed-gap','long-zero-gap-term',dict(remaining_months=600,new_months=600,gap_months=600,gap_rate=0,horizon_months=600))
 add('assumable-mortgage','cash-gap','large-principal-low-rate',dict(price=1000000000,assumed_balance=900000000,assumed_rate=.000001,new_rate=.000001,remaining_months=600,new_months=600,horizon_months=600,assumption_fees=0,new_fees=0))
 add('assumable-mortgage','financed-gap','large-principal-high-rate',dict(price=1000000000,assumed_balance=700000000,buyer_cash=100000000,assumed_rate=30,new_rate=30,gap_rate=30,remaining_months=600,new_months=600,gap_months=600,horizon_months=600))
 add('assumable-mortgage','cash-gap','tiny-principal-low-rate',dict(price=1,assumed_balance=.01,assumed_rate=.000001,new_rate=.000001,remaining_months=600,new_months=600,horizon_months=600,assumption_fees=0,new_fees=0))
 add('return-on-assets','known-average','large-signed-income',dict(net_income=-1000000000000,average_assets=1000000000000,revenue=1000000000000,target_roa=-100))
 p.write_text(json.dumps(dict(precision=70,method='Independent closed-form annuity balance and cumulative interest; same-period Decimal accounting ratios',fixtures=fixtures),indent=2)+'\n')
d=json.loads(p.read_text());checks=0
for f in d['fixtures']:
 actual=calc(f['id'],f['mode'],f['values']);assert set(actual)==set(f['expected'])
 for label,n in actual.items():assert n==D(f['expected'][label]);checks+=1
print(json.dumps(dict(passed=True,cases=len(d['fixtures']),metrics=checks,precision=70)))
