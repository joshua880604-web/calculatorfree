"""Independent Decimal60 fixed-monthly loan references and offline static charts."""
from pathlib import Path
from decimal import Decimal as D,getcontext
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return f'${x:,.2f}'
def payment(p,r,n):return p/n if not r else p*r/(1-(1+r)**-n)
def schedule(p,r,n,extra=D(0)):
 a=payment(p,r,n);b=p;interest=D(0);paid=D(0);count=0;first=None
 while b>D('1e-40'):
  g=b*r;out=min(a+extra,b+g);b=max(D(0),b+g-out);interest+=g;paid+=out;count+=1
  if first is None:first=out
  if count>n+1:raise ValueError('Schedule did not finish')
 return first,interest,paid,count

def fee(label,id='personal-loan',**updates):
 v=dict(principal=20000,years=3,months=0,rate=12,origination=3,documentation=0,other_fee=0,treatment='Deducted from proceeds',insurance=0)
 if id=='business-loan':v.update(principal=12000,years=1,documentation=120,other_fee=20,compound='Monthly',pay='Monthly')
 v.update(updates);p=D(v['principal']);r=D(v['rate'])/1200;n=int(v['years']*12+v['months']);fees=p*D(v['origination'])/100+v['documentation']+v['other_fee'];balance=p+(fees if v['treatment']=='Financed' else 0);net=p-(0 if v['treatment']=='Financed' else fees);a,interest,paid,count=schedule(balance,r,n);allpay=a+D(v['insurance']);lo=D(0);hi=D(1)
 for _ in range(240):
  z=(lo+hi)/2;pv=allpay*n if not z else allpay*(1-(1+z)**-n)/z
  if pv>net:lo=z
  else:hi=z
 apr=(lo+hi)/2*1200;total=paid+D(v['insurance'])*n;cost=total-net
 m={'Payment per period':a,'Payment including insurance':allpay,'Total interest':interest,'Total payments':paid,'Number of payments':count,'Loan fees':fees,'Net proceeds after fees':net,'Nominal APR including insurance':apr}
 return dict(label=label,calculatorId=id,mode='repayment',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(net),usd(allpay),usd(total),usd(cost)])
def student(label,years=10,extra=0):
 v=dict(principal=30000,years=years,months=0,rate=6);mode='normal'
 if extra:mode='extra';v.update(extra_monthly=extra,extra_yearly=0,extra_once=0,extra_once_month=1)
 a,interest,paid,count=schedule(D(30000),D('.06')/12,years*12,D(extra));m={'Payment per period':a,'Total interest':interest,'Total payments':paid,'Number of payments':count}
 return dict(label=label,calculatorId='student-loan',mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(a),usd(interest),str(count),usd(paid)])
cases={'personal':[fee('36 months, no origination fee',origination=0),fee('36 months, fee deducted'),fee('36 months, fee financed',treatment='Financed'),fee('60 months, fee deducted',years=5)],'student':[student('10-year fixed monthly schedule'),student('20-year term, same balance and rate',years=20),student('10-year contract + USD 100 monthly',extra=100),student('10-year contract + USD 200 monthly',extra=200)],'business':[fee('12 months, USD 500 fees deducted',id='business-loan'),fee('24 months, same fees deducted',id='business-loan',years=2),fee('12 months, USD 500 fees financed',id='business-loan',treatment='Financed'),fee('12 months + USD 10 insurance per payment',id='business-loan',insurance=10)]}
p=R/'src/lib/calculation-guide-cases.json';d=json.loads(p.read_text());d.update(cases);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'loan-guide-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for r in rows:w.writerow([r['label'],json.dumps(r['values'],sort_keys=True),json.dumps(r['metrics'],sort_keys=True)])
 ys=[r['metrics']['Total interest'] if topic=='student' else r['metrics']['Total payments']+r['values']['insurance']*r['metrics']['Number of payments']-r['metrics']['Net proceeds after fees'] for r in rows]
 labels={'personal':['No fee\n36 months','Deducted fee\n36 months','Financed fee\n36 months','Deducted fee\n60 months'],'student':['10 years','20 years','10-year contract\n+ USD 100/month','10-year contract\n+ USD 200/month'],'business':['12 months\ndeducted fee','24 months\ndeducted fee','12 months\nfinanced fee','12 months\n+ insurance']}[topic]
 fig,ax=plt.subplots(figsize=(9,5));ax.bar(range(4),ys,color='#6653cc');ax.set_xticks(range(4),labels);ax.set_ylim(0,max(ys)*1.25);ax.set_ylabel('Total interest (USD)' if topic=='student' else 'Modeled cash outflow minus net proceeds (USD)');ax.set_title({'personal':'Personal loan: fees and term change total borrowing cost','student':'Student loan: term and extra principal change interest','business':'Business loan: compare term, fees and insurance'}[topic])
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
 notes={'personal':'USD 20,000 base principal, 12% hypothetical fixed rate. Fee 3% unless stated zero. Monthly periods.','student':'USD 30,000 balance, 6% hypothetical fixed rate. Monthly-period model, not daily servicer accrual.','business':'USD 12,000 base amount, 12% hypothetical rate, monthly compounding/payments. USD 500 fees.'}
 fig.text(.5,.012,notes[topic]+'\nHypothetical calculations, not loan offers, approval or current program rules.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
