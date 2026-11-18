#!/usr/bin/env python3
"""Recompute independent financial reference fixtures using Python standard-library arithmetic."""
from pathlib import Path
from decimal import Decimal as D, getcontext, ROUND_CEILING, ROUND_FLOOR
from datetime import date
from fractions import Fraction
import json
ROOT=Path(__file__).resolve().parents[1];getcontext().prec=80
models=json.loads((ROOT/'docs/financial-clone/evidence/specialist-four-reference-inputs-20261118.json').read_text());defaults={(c['id'],m['id']):m['values'] for c in models for m in c['modes']};fixtures=[]
def add(id,mode,title,patch,expected,**extra):
 values={**defaults[id,mode],**{k:str(v) for k,v in patch.items()}}
 fixtures.append({'id':id,'mode':mode,'title':title,'values':values,'expected':{k:str(v) for k,v in expected.items()},**extra})
def payment(p,rate,n):
 r=D(str(rate))/1200
 return p/D(n) if not r else p*r/(1-(1+r)**(-n))
def balance_after(p,rate,pmt,n):
 r=D(str(rate))/1200
 return p-pmt*n if not r else p*(1+r)**n-pmt*((1+r)**n-1)/r
# Daily credit references enumerate individual calendar days, separately from the production interval aggregation.
def credit_ledger(patch):
 v={**defaults['business-line-of-credit','ledger'],**patch};start=date.fromisoformat(v['start']);end=date.fromisoformat(v['end']);span=(end-start).days
 activity=[]
 for line in v['transactions'].splitlines():
  if line.strip():day,amount=line.split(',');activity.append((date.fromisoformat(day.strip()),D(amount.strip())))
 balance=D(v['opening']);total=D(0)
 from datetime import timedelta
 for day in [start+timedelta(days=i) for i in range(span)]:
  for when,amount in activity:
   if when==day:balance+=amount
  total+=balance
 interest=total*D(v['rate'])/100/D(v['basis'])
 return {'Modeled interest over selected dates':interest,'Interest plus entered fees':interest+D(v['fees']),'Closing principal balance':balance,'Average daily principal balance':total/span,'Days in modeled period':span}
for basis in ['365','360']:
 interest=D(25000)*D('.12')*30/D(basis)
 add('business-line-of-credit','interest','30 days on $25,000 with a '+basis+'-day basis',{'basis':basis},{'Modeled interest for entered period':interest,'Interest plus entered fees':interest+50})
add('business-line-of-credit','interest','Zero interest with a separately paid fee',{'rate':0},{'Modeled interest for entered period':0,'Interest plus entered fees':50})
for title,patch in [
 ('Two dated principal changes through December',{}),
 ('Start-day draw and last-included-day principal repayment',{'transactions':'2026-12-01, 5000\n2026-12-31, -3000'}),
 ('Leap day is included with a constant 365-day denominator',{'start':'2024-02-28','end':'2024-03-01','transactions':'2024-02-29, 1000','fees':'0'}),
 ('No activity leaves the opening principal unchanged',{'transactions':''})
]:add('business-line-of-credit','ledger',title,patch,credit_ledger(patch))
# Closed-form balances and cumulative principal, rather than the production month-by-month loop.
for title,patch in [('Three zero-rate payments',{'balance':'1200','rate':'0','payment':'400','monthly_fee':'0','max_months':'12'}),('Fixed payment with a monthly fee',{'balance':'1000','rate':'12','payment':'200','monthly_fee':'5','max_months':'12'}),('Horizon ends before payoff',{'balance':'1000','rate':'12','payment':'200','monthly_fee':'5','max_months':'2'}),('Default fixed-payment credit paydown',{})]:
 v={**defaults['business-line-of-credit','paydown'],**patch};p=D(v['balance']);apr=D(v['rate']);pay=D(v['payment']);fee=D(v['monthly_fee']);netpay=pay-fee;horizon=int(v['max_months']);steps=0;closing=p;totalpay=D(0)
 for n in range(1,horizon+1):
  candidate=balance_after(p,apr,netpay,n)
  if candidate<=D('1e-60'):
   prev=balance_after(p,apr,netpay,n-1);last=prev*(1+apr/1200)+fee;steps=n;closing=D(0);totalpay=pay*(n-1)+last;break
 else:steps=horizon;closing=balance_after(p,apr,netpay,horizon);totalpay=pay*horizon
 interest=totalpay-fee*steps-(p-closing)
 expected={'Interest over modeled payments':interest,'Total payments including fees':totalpay,'Principal remaining at model end':closing,'Monthly fees over modeled payments':fee*steps,'Payments modeled':steps}
 if not closing:expected['Modeled payoff time in months']=steps
 add('business-line-of-credit','paydown',title,patch,expected)
# Lease references aggregate each lease year directly, rather than the monthly production schedule.
def lease_reference(mode,patch):
 v={**defaults['triple-net-lease',mode],**patch};a=D(v['area']);b=a*D(v['base_rate'])*(12 if v['base_basis'].endswith('month') else 1)
 share=D(0)
 if mode=='building':share=a/D(v['building_area']);n=(D(v['taxes'])+D(v['insurance'])+D(v['cam']))*share
 else:n=a*D(v['nnn_rate'])*(12 if v['nnn_basis'].endswith('month') else 1)
 other=D(v['other_monthly']);up=D(v['upfront']);deposit=D(v['deposit']);free=int(v['free_months']);years=int(v['years']);recurring=[]
 for y in range(years):
  paidmonths=12-max(0,min(12,free-y*12));recurring.append(b*(1+D(v['base_growth'])/100)**y*D(paidmonths)/12+n*(1+D(v['nnn_growth'])/100)**y+other*12)
 first=(0 if free else b/12)+n/12+other
 expected={'First-year recurring occupancy cost':recurring[0],'First-year average monthly recurring cost':recurring[0]/12,'Total modeled nonrefundable occupancy cost':sum(recurring)+up,'First-month cash including deposit and upfront cost':first+up+deposit,'Refundable deposit kept separate':deposit}
 if mode=='building':expected['Area-based expense share']=share*100
 return expected
for mode,title,patch in [
 ('quoted','Annual per-square-foot quotes, one year',{'years':'1','base_growth':'0','nnn_growth':'0','upfront':'0','deposit':'0'}),
 ('building','Area-share expenses reconcile with the same NNN quote',{'years':'1','base_growth':'0','nnn_growth':'0','upfront':'0','deposit':'0'}),
 ('quoted','An explicitly all-in gross quote matches the initial total',{'base_rate':'30','nnn_rate':'0','years':'1','base_growth':'0','nnn_growth':'0','upfront':'0','deposit':'0'}),
 ('quoted','Monthly quotes normalize to the same annual cost',{'base_rate':'2','base_basis':'Per square foot per month','nnn_rate':'.5','nnn_basis':'Per square foot per month','years':'1','base_growth':'0','nnn_growth':'0','upfront':'0','deposit':'0'}),
 ('quoted','Two abated months leave NNN and other charges payable',{'years':'2','base_growth':'0','nnn_growth':'0','free_months':'2','other_monthly':'100'}),
 ('quoted','Separate annual base and NNN escalation',{'years':'3','upfront':'0','deposit':'0'}),
 ('quoted','A full year of base-rent abatement still has NNN charges',{'years':'1','free_months':'12','base_growth':'0','nnn_growth':'0','upfront':'0'}),
 ('quoted','Default five-year quoted lease',{}),
 ('building','Default five-year area-share lease',{})
]:add('triple-net-lease',mode,title,patch,lease_reference(mode,patch))
# ARM reference rate segments are specified by hand from the cases. Segment balances use a closed form.
def arm_reference(patch,segments):
 v={**defaults['arm-mortgage','scenario'],**patch};p=D(v['principal']);n=int(v['term_years'])*12;hold=int(v['holding_years'])*12;balance=p;elapsed=0;interest=D(0);heldInterest=D(0);heldBalance=None;initial=None;firstreset=None;highest=D(0)
 assert sum(k for k,r in segments)==n
 for count,rate in segments:
  pay=payment(balance,rate,n-elapsed)
  if initial is None:initial=pay
  if elapsed==int(v['fixed_years'])*12:firstreset=pay
  highest=max(highest,pay);new=balance_after(balance,rate,pay,count)
  interest+=pay*count-(balance-new)
  if elapsed<hold:
   k=min(count,hold-elapsed);hb=balance_after(balance,rate,pay,k);heldInterest+=pay*k-(balance-hb)
   if elapsed+k==hold:heldBalance=hb
  balance=new;elapsed+=count
 fixedpay=payment(p,v['fixed_compare_rate'],n);fb=balance_after(p,v['fixed_compare_rate'],fixedpay,hold);fi=fixedpay*hold-(p-fb)
 return {'Initial monthly principal and interest':initial,'First-reset monthly principal and interest':firstreset,'Highest modeled monthly principal and interest':highest,'ARM interest through holding period':heldInterest,'ARM principal after holding period':heldBalance,'Fixed-loan interest through holding period':fi,'Fixed-loan principal after holding period':fb,'ARM minus fixed interest through holding period':heldInterest-fi,'Full-model ARM interest':interest}
armcases=[
 ('scenario','Entered index reaches 7% then 7.5%',{},[(60,5),(12,7),(288,D('7.5'))]),
 ('upward-caps','Upward-cap stress reaches 7%, 9%, then 10%',{},[(60,5),(12,7),(12,9),(276,10)]),
 ('scenario','Falling index descends through symmetric caps to the floor',{'initial_rate':'6','first_cap':'1','periodic_cap':'1','margin':'1','floor':'2','indices':'0','holding_years':'10'},[(60,6),(12,5),(12,4),(12,3),(264,2)]),
 ('scenario','Six-month resets follow successive entered indices',{'term_years':'15','initial_rate':'4','first_cap':'1','periodic_cap':'1','lifetime_cap':'3','margin':'2','floor':'2','indices':'8\n0','reset_months':'6'},[(60,4),(6,5),(6,4),(6,3),(102,2)]),
 ('upward-caps','Zero-rate, zero-cap amortization',{'initial_rate':'0','first_cap':'0','periodic_cap':'0','lifetime_cap':'0','fixed_compare_rate':'0'},[(60,0),(300,0)]),
 ('scenario','A zero lifetime increase blocks a high index',{'first_cap':'2','periodic_cap':'2','lifetime_cap':'0','indices':'20'},[(60,5),(300,5)])
]
for mode,title,patch,segments in armcases:add('arm-mortgage',mode,title,patch,arm_reference(patch,segments),referenceRateSegments=[{'months':n,'annualRate':str(r)} for n,r in segments])
# Portfolio reference uses exact Fraction ratios and a separate integer largest-remainder routine.
def apportioned(total,weights):
 total=int(total);sumw=sum(weights)
 if not total:return [0]*len(weights)
 q=[Fraction(total*w,sumw) for w in weights];floors=[x.numerator//x.denominator for x in q]
 order=sorted(range(len(q)),key=lambda i:(-(q[i]-floors[i]),i))
 for i in order[:total-sum(floors)]:floors[i]+=1
 return floors

def portfolio_reference(mode,patch):
 v={**defaults['portfolio-rebalancing',mode],**patch};rows=[line.split(',') for line in v['assets'].splitlines() if line.strip()];amounts=[int(D(x[1].strip())*100) for x in rows];weights=[int(D(x[2].strip())*1000000) for x in rows];start=sum(amounts);flow=int(D(v['cash_change'])*100);fees=int(D(v['fees'])*100);net=flow-fees;end=start+net;targets=apportioned(end,weights)
 if mode=='contributions':changes=apportioned(net,[max(0,t-a) for t,a in zip(targets,amounts)])
 else:changes=[t-a for t,a in zip(targets,amounts)]
 after=[a+c for a,c in zip(amounts,changes)];gap=sum(abs(a-t) for a,t in zip(after,targets));expected={'Total modeled buys':D(sum(max(0,c) for c in changes))/100,'Total modeled sells':D(sum(max(0,-c) for c in changes))/100,'Post-cost portfolio value':D(end)/100,'Total absolute dollar gap from rounded targets':D(gap)/100,'Entered transaction costs':D(fees)/100}
 if not any(a>0 and w==0 for a,w in zip(amounts,weights)):
  required=max([Fraction(start)]+[Fraction(a*100000000,w) for a,w in zip(amounts,weights) if w]);requiredcent=-(-required.numerator//required.denominator);expected['Minimum net new cash for a no-sale target']=D(requiredcent-start)/100
 return expected,{'currentCents':amounts,'targetCents':targets,'changeCents':changes,'afterCents':after}
for mode,title,patch in [
 ('trades','Full 60/40 rebalance of a 70/30 holding',{}),
 ('contributions','A $10,000 contribution leaves target deviations',{}),
 ('contributions','A $20,000 contribution reaches cent-rounded targets',{'cash_change':'20000'}),
 ('trades','A withdrawal and fees reduce the allocatable portfolio',{'cash_change':'-10000','fees':'100'}),
 ('contributions','New cash covers separately entered transaction costs',{'cash_change':'20000','fees':'100'}),
 ('trades','A final cent follows the largest fractional target',{'assets':'A, .01, 33.333333\nB, .01, 33.333333\nC, .01, 33.333334','cash_change':'.01'}),
 ('contributions','A held zero-target asset cannot disappear without a sale',{'assets':'A, 100, 0\nB, 0, 100','cash_change':'100'}),
 ('trades','New cash creates a portfolio from zero current holdings',{'assets':'A, 0, 60\nB, 0, 40','cash_change':'100'})
]:
 expected,allocation=portfolio_reference(mode,patch);add('portfolio-rebalancing',mode,title,patch,expected,referenceAllocation=allocation)
report={'checkedOn':'2026-11-18','method':'Independent Python Decimal (80-digit), explicit calendar-day enumeration, closed-form amortization with hand-specified ARM rate segments, annual lease aggregation, and Fraction-based exact cent allocation. No production calculator code is imported.','fixtures':fixtures}
stored=json.loads((ROOT/'docs/financial-clone/evidence/specialist-four-reference-20261118.json').read_text())
assert report==stored, 'Independent reference values changed; inspect the arithmetic and inputs.'
print(json.dumps({'fixtures':len(fixtures),'numericChecks':sum(len(f['expected']) for f in fixtures),'byId':{id:sum(f['id']==id for f in fixtures) for id in sorted(set(f['id'] for f in fixtures))}}))
