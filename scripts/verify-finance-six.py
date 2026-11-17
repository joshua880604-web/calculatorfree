"""Independent 60-digit Decimal research fixtures; no production JavaScript imported."""
from pathlib import Path
from decimal import Decimal as D,localcontext
import json
ROOT=Path(__file__).resolve().parents[1];fixtures=[]
def case(tool,mode,values,expected,title):fixtures.append(dict(id=tool,mode=mode,values=values,expected={k:str(v) for k,v in expected.items()},title=title))
with localcontext() as ctx:
 ctx.prec=60
 for monthly,cap in [(False,0),(True,6000),(False,6000)]:
  s=1000 if monthly else 12000;annual=D(s)*(12 if monthly else 1);eligible=annual if cap==0 else min(annual,D(cap));gross=eligible*D('.03')+(annual-eligible)*D('.015')
  other='' if cap else '\n18000, 1.5, 0'
  if not cap:gross+=D(18000)*D('.015')
  v=dict(spend_period='Monthly' if monthly else 'Annual',categories=f'{s}, 3, {cap}'+other,fallback=1.5,annual_fee=95,usable_credits=0,bonus=200)
  case('credit-card-rewards','cashback',v,{'Gross modeled annual reward value':gross,'Recurring annual net rewards before card interest':gross-95,'First-year net including assumed one-time bonus':gross-95+200},'Monthly cap conversion' if monthly else 'Annual cash back cap '+str(cap))
 for spend,rate,cap,cpp in [(30000,2,0,1),(12000,3,6000,D('1.2'))]:
  eligible=D(spend) if not cap else min(D(spend),D(cap));pts=eligible*rate+(D(spend)-eligible);gross=pts*D(cpp)/100
  case('credit-card-rewards','points',dict(spend_period='Annual',categories=f'{spend}, {rate}, {cap}',fallback=1,cents_per_point=float(cpp),annual_fee=95,usable_credits=0,bonus=20000),{'Annual points / miles earned':pts,'Gross modeled annual reward value':gross,'Recurring annual net rewards before card interest':gross-95,'First-year net including assumed one-time bonus':gross-95+D(20000)*D(cpp)/100},'Points at cents value '+str(cpp))
 for ra,fa,rb,fb in [(2,95,1,0),(1,0,2,95)]:
  spend=D(30000);a=spend*D(ra)/100-fa;b=spend*D(rb)/100-fb
  case('credit-card-rewards','compare',dict(spend=30000,rate_a=ra,fee_a=fa,credits_a=0,rate_b=rb,fee_b=fb,credits_b=0),{'Recurring annual net advantage (A minus B)':a-b,'Plan A annual net before interest':a,'Plan B annual net before interest':b,'Annual spend where recurring net rewards match':D(fa-fb)/(D(ra-rb)/100)},'Flat plan rate A '+str(ra))
 for mode,days,sales in [('average',365,300000),('balances',365,300000),('average',90,90000),('average',366,300000)]:
  avg=D(15000) if days==90 else D(25000);v=dict(days=days,credit_sales=sales,**(dict(begin_ar=20000,end_ar=30000) if mode=='balances' else dict(average_ar=int(avg))))
  case('accounts-receivable-turnover',mode,v,{'Receivables turnover in selected period':D(sales)/avg,'Average-balance DSO / collection days':D(days)*avg/D(sales)},mode+' '+str(days)+' days')
 for mode,days,amount,avg in [('purchases',365,500000,50000),('balances',365,500000,50000),('cogs',365,400000,50000),('purchases',90,90000,10000)]:
  v=dict(days=days,**(dict(begin_ap=40000,end_ap=60000) if mode=='balances' else dict(average_ap=avg)),**({'cogs':amount} if mode=='cogs' else {'purchases':amount}))
  case('days-payable-outstanding',mode,v,{'Days payable outstanding':D(days)*D(avg)/D(amount),'Payables turnover in selected period':D(amount)/D(avg)},mode+' '+str(days)+' days')
 for dio,dso,dpo in [(45,30,60),(20,5,40)]:
  case('cash-conversion-cycle','days',dict(dio=dio,dso=dso,dpo=dpo),{'Cash conversion cycle (days)':D(dio+dso-dpo),'Operating cycle before payables (days)':D(dio+dso)},'Component days '+str((dio,dso,dpo)))
 for mode,days in [('purchases',365),('cogs',365),('purchases',90)]:
  v=dict(days=days,inventory=80000,cogs=400000,average_ar=25000,credit_sales=600000,average_ap=50000,**(dict(purchases=500000) if mode=='purchases' else {}));dio=D(days)*80000/400000;dso=D(days)*25000/600000;dpo=D(days)*50000/(400000 if mode=='cogs' else 500000)
  case('cash-conversion-cycle',mode,v,{'Cash conversion cycle (days)':dio+dso-dpo,'Operating cycle before payables (days)':dio+dso,'Inventory days (DIO)':dio,'Average-balance collection days (DSO)':dso,'Payables days (DPO)':dpo},mode+' '+str(days)+' days')
 for mode in ['nopat','ebit','balances']:
  nopat=D(150000);capital=D(1250000)
  v=dict(nopat=150000,**(dict(begin_capital=1000000,end_capital=1500000) if mode=='balances' else dict(capital=1250000)),wacc=8)
  if mode=='ebit':v=dict(ebit=200000,tax_rate=25,loss_tax='No assumed tax benefit on a loss',capital=1250000,wacc=8)
  case('roic',mode,v,{'Annual return on invested capital':nopat/capital*100,'Annual NOPAT used':nopat,'ROIC minus WACC (percentage points)':nopat/capital*100-8,'Simplified annual economic profit':nopat-capital*D('.08')},mode+' annual operating model')
 case('roic','nopat',dict(nopat=-50000,capital=1250000,wacc=8),{'Annual return on invested capital':D(-4),'Simplified annual economic profit':D(-150000)},'Known negative NOPAT')
 for policy,lossnopat in [('No assumed tax benefit on a loss',D(-50000)),('Apply simplified tax rate to a loss',D(-37500))]:
  case('roic','ebit',dict(ebit=-50000,tax_rate=25,loss_tax=policy,capital=1250000,wacc=8),{'Annual NOPAT used':lossnopat,'Annual return on invested capital':lossnopat/1250000*100},policy)
 for mode,income in [('ebit',100000),('bridge',100000),('ebit',-10000),('ebit',0)]:
  interest=D(30000) if mode=='bridge' else D(25000);target=D(3);v=dict(net_income=56000,income_tax=14000,interest=int(interest),target=3) if mode=='bridge' else dict(ebit=income,interest=int(interest),target=3)
  case('interest-coverage-ratio',mode,v,{'EBIT interest coverage (times)':D(income)/interest,'EBIT needed for selected target coverage':interest*target,'EBIT headroom / shortfall against target':D(income)-interest*target},mode+' EBIT '+str(income))
assert len({(x['id'],x['mode']) for x in fixtures})==16
out=ROOT/'docs/financial-clone/evidence/finance-six-decimal-20261117.json';out.write_text(json.dumps(dict(precision=60,generatedOn='2026-11-17',method='Independent Python Decimal arithmetic; no production calculator imported',fixtures=fixtures),indent=2)+'\n')
print(json.dumps(dict(cases=len(fixtures),modes=16,file=str(out))))
