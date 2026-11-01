"""Independent Decimal60 accumulation and finite-payout references, offline only."""
from decimal import Decimal as D,getcontext,ROUND_CEILING
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return ('-' if x<0 else '')+f'${abs(x):,.2f}'
def accumulation(label,rate=5,begin=False):
 p=D(10000);b=p;add=D(0);r=(1+D(rate)/100)**(D(1)/12)-1
 for month in range(1,61):
  deposit=D(200)+(1000 if (month%12==1 if begin else month%12==0) else 0)
  if begin:b+=deposit
  b*=1+r
  if not begin:b+=deposit
  add+=deposit
 v=dict(principal=10000,annual=1000,monthly=200,timing='Beginning of period' if begin else 'End of period',rate=rate,years=5);m={'Annuity future value':b,'Starting principal':p,'Total additions':add,'Total contributions':p+add,'Growth':b-p-add}
 return dict(label=label,calculatorId='annuity',mode='growth',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(p+add),usd(b),usd(b-p-add),'Beginning' if begin else 'End'])
def payout(label,principal=300000,rate=5,frequency='Monthly',years=20,chosen=None):
 p=D(principal);f={'Monthly':12,'Quarterly':4,'Annually':1}[frequency];r=(1+D(rate)/100)**(D(1)/f)-1;v=dict(principal=principal,rate=rate,frequency=frequency);b=p;total=D(0)
 if chosen is None:
  v['years']=years;n=D(str(years))*f;a=p/n if not r else p*r/(1-(1+r)**(-n));count=int(n.to_integral_value(rounding=ROUND_CEILING));last=D(0)
  for i in range(1,count+1):
   fraction=n-(count-1) if i==count else D(1);b*=(1+r)**fraction;last=b if i==count else min(a,b);b-=last;total+=last
  m={'Payment each period':a,'Total payments':total,'Total investment earnings':total-p};display=[usd(a),str(count),usd(last),usd(total)];mode='length'
 else:
  v['payment']=chosen;a=D(chosen);count=0;last=D(0)
  while b>D('1e-40'):
   b*=1+r;last=min(a,b);b-=last;total+=last;count+=1
   if count>12000:raise ValueError('Non-exhausting example')
  m={'Payout duration in years':D(count)/f,'Number of payments':count,'Total payouts':total,'Total investment earnings':total-p};display=[usd(a),str(count),usd(last),usd(total)];mode='payment'
 return dict(label=label,calculatorId='annuity-payout',mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=display)
cases={'annuity':[accumulation('5% effective return, end deposits'),accumulation('5% effective return, beginning deposits',begin=True),accumulation('0% return, end deposits',rate=0),accumulation('-2% return, end deposits',rate=-2)],'payout':[payout('Monthly payouts over 20 years'),payout('Monthly payouts over 30 years',years=30),payout('Quarterly payouts over 20 years',frequency='Quarterly'),payout('USD 1,200, zero return, one year',principal=1200,rate=0,years=1),payout('USD 1,200, 12%, 1.5 annual periods',principal=1200,rate=12,frequency='Annually',years=1.5),payout('USD 500 chosen payment, zero return',principal=1200,rate=0,chosen=500)]}
p=R/'src/lib/calculation-guide-cases.json';x=json.loads(p.read_text());x.update(cases);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'annuity-pair-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='annuity':
  ys=[row['metrics']['Annuity future value'] for row in rows];labels=['5%\nEnd deposits','5%\nBeginning deposits','0%\nEnd deposits','-2%\nEnd deposits'];ax.set_ylabel('Modeled ending balance (USD)');ax.set_title('Same USD 27,000 contributed; return and deposit timing differ');note='USD 10,000 initial + USD 200/month + USD 1,000/year for 5 years. Effective annual returns.'
 else:
  ys=[rows[0]['metrics']['Payment each period']*12,rows[1]['metrics']['Payment each period']*12,rows[2]['metrics']['Payment each period']*4];labels=['20 years\nMonthly × 12','30 years\nMonthly × 12','20 years\nQuarterly × 4'];ax.set_ylabel('Regular payout × payments per year (USD)');ax.set_title('Same USD 300,000 principal and hypothetical 5% annual return');note='Selected full-period cases only. Annualized scheduled payouts are not guaranteed annual income.'
 ax.bar(range(len(ys)),ys,color='#6653cc');ax.set_xticks(range(len(ys)),labels);ax.set_ylim(0,max(ys)*1.25)
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
 fig.text(.5,.012,note+'\nNo mortality credits, taxes, fees, inflation adjustment or insurer contract pricing.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
