"""Independent Decimal60 finite cash-flow sums; no engine imports."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return ('-'if x<0 else'')+f'${abs(x):,.2f}'
def fv(label,**changes):
 v=dict(principal=10000,periods=10,rate=5,payment=1000,timing='End of period');v.update(changes);p=D(v['principal']);n=v['periods'];r=D(str(v['rate']))/100;c=D(v['payment']);start=v['timing']=='Beginning of period';value=p*(1+r)**n+sum(c*(1+r)**(n-k)for k in range(0 if start else 1,n if start else n+1));paid=p+c*n;m={'Future value':value,'Total contributions':paid,'Interest earned':value-paid}
 return dict(label=label,calculatorId='future-value',mode='growth',values=v,metrics={k:float(x)for k,x in m.items()},display=[str(v['rate'])+'%',str(n),usd(c),usd(value),usd(value-paid)])
def pv(label,mode='lump',**changes):
 v=dict(future=10000,periods=10,rate=5);v.update(changes)
 if mode=='annuity':v.setdefault('payment',1000);v.setdefault('timing','End of period')
 n=v['periods'];r=D(str(v['rate']))/100;lump=D(v['future'])/(1+r)**n;start=v.get('timing')=='Beginning of period';payments=sum(D(v['payment'])/(1+r)**k for k in range(0 if start else 1,n if start else n+1))if mode=='annuity'else D(0);m={'Present value':lump+payments,'Lump-sum present value':lump,'Payments present value':payments}
 return dict(label=label,calculatorId='present-value',mode=mode,values=v,metrics={k:float(x)for k,x in m.items()},display=[str(v['rate'])+'%',usd(v['future']),usd(lump),usd(payments),usd(lump+payments)])
cases={'futurevalue':[fv('Base: 5% per year, ten years'),fv('Beginning-year deposits',timing='Beginning of period'),fv('Zero periodic rate',rate=0),fv('No recurring deposits',payment=0),fv('0.5% per month, sixty months',periods=60,rate=.5,payment=100),fv('Negative 2% periodic return',rate=-2)],'presentvalue':[pv('Lump sum: 5% discount, ten years'),pv('Lump sum: 8% discount, ten years',rate=8),pv('Lump sum plus end-year payments',mode='annuity'),pv('Lump sum plus beginning-year payments',mode='annuity',timing='Beginning of period'),pv('Lump sum and payments at zero rate',mode='annuity',rate=0),pv('Payments only, no terminal lump sum',mode='annuity',future=0)]}
p=R/'src/lib/calculation-guide-cases.json';d=json.loads(p.read_text());d.update(cases);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'future-present-cases'})
for topic,rows in cases.items():
 with(R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='')as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5));key='Future value'if topic=='futurevalue'else'Present value';ys=[r['metrics'][key]for r in rows]
 if topic=='futurevalue':labels=['Base','Beginning\ndeposits','Zero\nrate','No\ndeposits','Monthly\ncase','Negative\nreturn'];title='Future value reflects both contributions and periodic growth';note='Base: USD 10,000 start +1,000 at each of ten year ends, 5% annual hypothetical return.\nMonthly case has sixty USD 100 deposits at 0.5% monthly. Different horizons and contributions are not equal-cost offers.'
 else:labels=['Lump\n5%','Lump\n8%','Lump +\nend payments','Lump +\nbegin payments','Zero\nrate','Payments\nonly'];title='Present value separates the terminal amount and payment stream';note='Ten annual periods; USD 10,000 terminal amount and/or USD 1,000 recurring payments as labeled.\nDiscount assumptions are hypothetical. No market valuation, risk assessment, tax or product recommendation.'
 ax.bar(range(len(ys)),ys,color='#6653cc');ax.set_xticks(range(len(ys)),labels);ax.set_ylim(0,max(ys)*1.25);ax.set_title(title);ax.set_ylabel(key+' (USD)')
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=8)
 fig.text(.5,.012,note,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
