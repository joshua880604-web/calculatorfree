"""Independent Decimal60 simplified lease and manual-tax rebate references."""
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
def payment(p,r,n):return p/n if not r else p*r/(1-(1+r)**-n)
def lease(label,mode='payment',**changes):
 v=dict(price=35000,residual=20000,down=3000,trade=0,fees=700,months=36,rate=5,rate_unit='APR (%)',tax=7);v.update(changes);n=D(v['months']);res=D(v['residual']);mf=D(str(v['rate'])) if v['rate_unit']=='Money factor' else D(str(v['rate']))/2400;taxrate=D(v['tax'])/100
 if mode=='price':
  v.pop('price');cap=(D(v['payment'])/(1+taxrate)+res/n-res*mf)/(1/n+mf);price=cap+v['down']+v['trade']-v['fees']
 else:price=D(v['price']);cap=price-v['down']-v['trade']+v['fees']
 dep=(cap-res)/n;rent=(cap+res)*mf;base=dep+rent;tax=base*taxrate;paid=base+tax;total=paid*n+v['down'];m={'Vehicle price':price,'Monthly lease payment':paid,'Monthly depreciation charge':dep,'Monthly rent charge':rent,'Monthly tax':tax,'Total lease cash outlay':total,'Money factor':mf}
 return dict(label=label,calculatorId='auto-lease',mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(price),usd(paid),usd(rent),usd(total)])
def rebate(label,**changes):
 v=dict(price=35000,down=5000,months=60,cashback=2500,standard=7,low=2.9,tax_state='Manual',trade=0,owed=0,tax=0,fees=0,trade_credit='Yes',rebate_tax='No',finance_fees='Yes');v.update(changes);n=v['months']
 def option(rebate,rate):
  taxable=max(D(0),D(v['price'])-(D(v['trade']) if v['trade_credit']=='Yes' else 0)-(D(rebate) if v['rebate_tax']=='Yes' else 0));tax=taxable*D(v['tax'])/100;charges=tax+D(v['fees']);p=D(v['price'])-rebate-v['down']-v['trade']+v['owed']+(charges if v['finance_fees']=='Yes' else 0);up=D(v['down'])+(0 if v['finance_fees']=='Yes' else charges);a=payment(p,D(str(rate))/1200,n);return a,a*n,tax,up
 a,totalA,taxA,upA=option(v['cashback'],v['standard']);b,totalB,taxB,upB=option(0,v['low']);adv=totalB+upB-totalA-upA;m={'Monthly payment with cash back':a,'Monthly payment with low rate':b,'Total payments with cash back':totalA,'Total payments with low rate':totalB,'Sales tax with cash back':taxA,'Sales tax with low rate':taxB,'Cash-back upfront cash':upA,'Low-rate upfront cash':upB,'Cash-back cost advantage':adv}
 return dict(label=label,calculatorId='cash-back-or-low-interest',mode='compare',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(a),usd(b),usd(totalA+upA),usd(totalB+upB),usd(adv)])
cases={'lease':[lease('Base: 5% illustrative rate equivalent'),lease('Quoted money factor 0.0025',rate=.0025,rate_unit='Money factor'),lease('USD 22,000 residual',residual=22000),lease('No cash capital reduction',down=0),lease('Solve price from USD 500 monthly',mode='price',payment=500)],'rebate':[rebate('USD 2,500 rebate, 60 months'),rebate('USD 4,000 rebate, 60 months',cashback=4000),rebate('USD 2,500 rebate, 36 months',months=36),rebate('7% manual tax, USD 500 fees; no rebate tax credit',tax=7,fees=500),rebate('Same manual tax and fees; rebate tax credit selected',tax=7,fees=500,rebate_tax='Yes')]}
p=R/'src/lib/calculation-guide-cases.json';x=json.loads(p.read_text());x.update(cases);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'lease-rebate-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='lease':
  ys=[r['metrics']['Monthly lease payment'] for r in rows];labels=['Base','MF\n0.0025','Residual\nUSD 22,000','No cash\ncapital reduction','USD 500\nprice solver'];ax.set_ylabel('Tax-inclusive monthly lease payment (USD)');ax.set_title('Lease payment changes with rent factor, residual and cash reduction');note='Base: USD 35,000 price, 20,000 residual, 3,000 down, 700 capitalized fees; 36 months, 7% monthly tax.'
 else:
  ys=[r['metrics']['Cash-back cost advantage'] for r in rows];labels=['Rebate 2,500\n60 months','Rebate 4,000\n60 months','Rebate 2,500\n36 months','Manual tax\nNo rebate credit','Manual tax\nRebate credit'];ax.set_ylabel('Low-rate outflow minus cash-back outflow (USD)');ax.set_title('Positive advantage favors rebate; negative favors low rate');ax.axhline(0,color='#475569',lw=.8);note='USD 35,000 price, 5,000 down; rebate with 7% vs promotional 2.9%. Inputs are hypothetical.'
 ax.bar(range(5),ys,color=['#6653cc' if y>=0 else '#b34d54' for y in ys]);ax.set_xticks(range(5),labels)
 if topic=='lease':ax.set_ylim(0,max(ys)*1.25)
 else:ax.set_ylim(min(ys)-450,max(ys)+450)
 for i,y in enumerate(ys):ax.text(i,y+(max(abs(z) for z in ys)*.025)*(1 if y>=0 else -1),usd(y),ha='center',va='bottom' if y>=0 else 'top',fontsize=9)
 fig.text(.5,.012,note+'\nNo live offers, eligibility, state tax determination or complete ownership-cost comparison.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
