"""Independent 60-digit Decimal references; no website engine imports."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return ('-' if x<0 else '')+f'${abs(x):,.2f}'
def project(p,c,r,n,due=False,tax=D(0)):
 b=p;accrued=D(0);taxes=D(0)
 for m in range(1,n+1):
  if due:b+=c
  interest=b*r;b+=interest;accrued+=max(D(0),interest)
  if not due:b+=c
  if m%12==0 or m==n:
   t=accrued*tax;taxes+=t;b-=t;accrued=D(0)
 return b,p+c*n,taxes

def saving(label,mode='goal-contribution',**changes):
 v=dict(principal=2000,end=20000,years=5,months=0,rate=4,rate_type='APY',compound='Monthly',annual=0,timing='End of period',tax=0,inflation=0);v.update(changes)
 p=D(v['principal']);r=(1+D(str(v['rate']))/100)**(D(1)/12)-1 if v['rate_type']=='APY' else D(str(v['rate']))/1200;due=v['timing']=='Beginning of period';tax=D(v['tax'])/100;target=D(v['end'])
 if mode=='goal-time':
  v.pop('years');v.pop('months');c=D(v['monthly']);n=next(n for n in range(2401) if project(p,c,r,n,due,tax)[0]>=target)
 else:
  n=v['years']*12+v['months'];a=project(p,D(0),r,n,due,tax)[0];coefficient=project(p,D(1),r,n,due,tax)[0]-a;c=max(D(0),(target-a)/coefficient)
 b,paid,taxes=project(p,c,r,n,due,tax);m={'Ending balance':b,'Total contributions':paid,'Starting amount':p,'Additional contributions':paid-p,'Net investment earnings':b-paid,'Tax on interest':taxes,'Inflation-adjusted balance':b}
 if mode=='goal-time':m.update({'Years to savings goal':D(n)/12,'Months to savings goal':n})
 else:m['Required monthly deposit']=c
 return dict(label=label,calculatorId='savings',mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(c),str(n)+' months',usd(b),usd(taxes)])
def simple(label,mode='balance',**changes):
 v=dict(principal=10000,balance=12000,rate=5,rate_unit='Annual',years=4,term_unit='Years');v.update(changes);v.pop(mode)
 rp={'Annual':1,'Monthly':12,'Daily':365}[v['rate_unit']];tp={'Years':1,'Months':12,'Days':365}[v['term_unit']]
 if mode=='balance':x=D(v['principal'])*(1+D(str(v['rate']))/100*rp*D(v['years'])/tp)
 elif mode=='principal':x=D(v['balance'])/(1+D(str(v['rate']))/100*rp*D(v['years'])/tp)
 elif mode=='years':x=(D(v['balance'])/D(v['principal'])-1)/(D(str(v['rate']))/100*rp)*tp
 else:x=(D(v['balance'])/D(v['principal'])-1)*tp/(D(v['years'])*rp)*100
 labelMetric={'balance':'Balance','principal':'Principal','years':'Term','rate':'Rate'}[mode];result=usd(x) if mode in ['balance','principal'] else f'{x:,.4f}'+('%' if mode=='rate' else ' '+v['term_unit'].lower());rateText='Solved' if mode=='rate' else str(v['rate'])+'% '+v['rate_unit'].lower();timeText='Solved' if mode=='years' else str(v['years'])+' '+v['term_unit'].lower()
 return dict(label=label,calculatorId='simple-interest',mode=mode,values=v,metrics={labelMetric:float(x)},display=[labelMetric,rateText,timeText,result])
cases={'savinggoal':[saving('No interest, end-month deposits',rate=0),saving('4% APY, end-month deposits'),saving('4% APY, beginning-month deposits',timing='Beginning of period'),saving('4% APY, 20% modeled interest tax',tax=20),saving('Time needed with USD 300 monthly',mode='goal-time',monthly=300),saving('Existing savings already exceed target',principal=21000)],'simple':[simple('Annual rate, four years'),simple('Monthly rate, twelve months',rate=1,rate_unit='Monthly',years=12,term_unit='Months'),simple('Annual rate, ninety days',rate=6,years=90,term_unit='Days'),simple('Solve starting principal',mode='principal'),simple('Solve term in months',mode='years',term_unit='Months'),simple('Solve annual rate',mode='rate')]}
p=R/'src/lib/calculation-guide-cases.json';d=json.loads(p.read_text());d.update(cases);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'savings-simple-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='savinggoal':
  ys=[r['metrics']['Required monthly deposit'] for r in rows[:4]];labels=['0%\nEnd month','4% APY\nEnd month','4% APY\nBeginning month','4% APY\n20% interest tax'];title='A savings deadline: deposits, yield, timing and tax';ylabel='Required monthly deposit (USD)';note='USD 2,000 starting savings, USD 20,000 target, 60 months; hypothetical constant rates.\nOnly the four matched-deadline cases are charted. Tax is the model’s year-end haircut, not a tax return.'
 else:
  ys=[r['metrics']['Balance']-r['values']['principal'] for r in rows[:3]];labels=['5% annual\n4 years','1% monthly\n12 months','6% annual\n90 / 365 years'];title='Simple interest depends on both the rate period and time unit';ylabel='Interest on unchanged USD 10,000 principal (USD)';note='Three different rate/time scenarios, not equal-horizon offers. No deposits, repayments, fees or compounding.\nDaily conversion uses 365 days; actual contracts may use a different day-count convention.'
 ax.bar(range(len(ys)),ys,color='#6653cc');ax.set_xticks(range(len(ys)),labels);ax.set_ylim(0,max(ys)*1.25);ax.set_title(title);ax.set_ylabel(ylabel)
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=10)
 fig.text(.5,.012,note,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
