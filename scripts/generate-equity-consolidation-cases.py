"""Offline Decimal60 loan-cost references; no dependency on the website engine."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(v):return ('-' if v<0 else '')+f'${abs(v):,.2f}'
def payment(p,r,n):return p/n if not r else p*r/(1-(1+r)**-n)
def fixed_schedule(p,r,a):
 b=D(p);interest=D(0);paid=D(0);count=0
 while b>D('1e-40'):
  i=b*r;out=min(a,b+i);b=max(D(0),b+i-out);paid+=out;interest+=i;count+=1
  if count>12000:raise ValueError('Schedule did not exhaust')
 return interest,paid,count

def equity(label,years=15,closing=1500,finance=False):
 p=D(60000);fee=D(closing);balance=p+(fee if finance else 0);net=p-(0 if finance else fee);n=years*12;r=D('.08')/12;a=payment(balance,r,n);interest,paid,count=fixed_schedule(balance,r,a);lo=D(0);hi=D(1)
 for _ in range(240):
  z=(lo+hi)/2;pv=a*(1-(1+z)**-n)/z
  if pv>net:lo=z
  else:hi=z
 apr=(lo+hi)/2*1200;v=dict(principal=60000,years=years,months=0,rate=8,closing=closing,treatment='Financed' if finance else 'Paid upfront');m={'Payment per period':a,'Total interest':interest,'Total payments':paid,'Number of payments':count,'Net proceeds':net,'Nominal APR':apr}
 return dict(label=label,calculatorId='home-equity-loan',mode='loan',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(a),usd(net),usd(paid),usd(paid-net)])
def consolidation(label,years=4,fees=3,finance=True):
 oldp=D(12000);old_interest,old_paid,old_count=fixed_schedule(oldp,D('.12')/12,D(300));fee=oldp*D(fees)/100;balance=oldp+(fee if finance else 0);r=D('.08')/12;n=years*12;a=payment(balance,r,n);interest,paid,count=fixed_schedule(balance,r,a);saving=old_interest-interest-fee;v=dict(debts='Loan A, 12000, 300, 12',new_rate=8,years=years,fees=fees,finance='Yes' if finance else 'No');m={'Payment per period':a,'Total interest':interest,'Total payments':paid,'Number of payments':count,'Origination fee':fee,'Current plan total interest':old_interest,'Interest and fee savings':saving}
 return dict(label=label,calculatorId='debt-consolidation',mode='comparison',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(a),usd(interest+fee),usd(saving),str(count)])
cases={'equity':[equity('15 years, no closing costs',closing=0),equity('15 years, USD 1,500 upfront costs'),equity('15 years, USD 1,500 financed costs',finance=True),equity('10 years, USD 1,500 upfront costs',years=10),equity('20 years, USD 1,500 upfront costs',years=20)],'consolidation':[consolidation('4 years, 3% fee financed'),consolidation('8 years, 3% fee financed',years=8),consolidation('4 years, 3% fee upfront',finance=False),consolidation('4 years, no origination fee',fees=0)]}
p=R/'src/lib/calculation-guide-cases.json';x=json.loads(p.read_text());x.update(cases);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'equity-consolidation-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='equity':
  ys=[r['metrics']['Total payments']-r['metrics']['Net proceeds'] for r in rows];labels=['15 years\nNo closing cost','15 years\nUpfront cost','15 years\nFinanced cost','10 years\nUpfront cost','20 years\nUpfront cost'];ax.set_ylabel('Payments minus net initial cash (USD)');ax.set_title('Home equity loan: term and entered closing costs change cash cost');note='USD 60,000 base amount, hypothetical 8% fixed rate; USD 1,500 closing costs unless stated zero.'
 else:
  ys=[r['metrics']['Total interest']+r['metrics']['Origination fee'] for r in rows];labels=['4 years\nFinanced fee','8 years\nFinanced fee','4 years\nUpfront fee','4 years\nNo fee'];ax.set_ylabel('New loan interest plus origination fee (USD)');ax.set_title('Debt consolidation: a longer term can offset a lower rate');ax.axhline(rows[0]['metrics']['Current plan total interest'],color='#c46620',ls='--',label='Current plan interest');ax.legend();note='Current: USD 12,000 at 12%, fixed USD 300/month. New rate: hypothetical 8%; fee 3% unless zero.'
 ax.bar(range(len(ys)),ys,color='#6653cc');ax.set_xticks(range(len(ys)),labels);ax.set_ylim(0,max(ys)*1.25)
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
 fig.text(.5,.012,note+'\nFixed monthly models, not current offers, approval or a personal recommendation.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
