"""Independent Decimal60 vehicle/boat examples using explicit manual tax assumptions."""
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
def pay(p,r,n):return p/n if not r else p*r/(1-(1+r)**-n)
def pv(a,r,n):return a*n if not r else a*(1-(1+r)**-n)/r
def schedule(p,r,n):
 a=pay(p,r,n);b=p;interest=D(0);paid=D(0);count=0
 for _ in range(n):
  i=b*r;out=min(a,b+i);b=max(D(0),b+i-out);interest+=i;paid+=out;count+=1
 return a,interest,paid,count

def auto(label,**changes):
 v=dict(tax_state='Manual',price=35000,months=60,rate=6,rebate=0,down=5000,trade=0,owed=0,tax=7,fees=500,trade_credit='Yes',rebate_tax='No',finance_fees='Yes');v.update(changes);price=D(v['price']);taxable=max(D(0),price-(D(v['trade']) if v['trade_credit']=='Yes' else 0)-(D(v['rebate']) if v['rebate_tax']=='Yes' else 0));tax=taxable*D(v['tax'])/100;charges=tax+D(v['fees']);financed=price-v['rebate']-v['down']-v['trade']+v['owed']+(charges if v['finance_fees']=='Yes' else 0);up=D(v['down'])+(0 if v['finance_fees']=='Yes' else charges);a,interest,paid,count=schedule(financed,D(v['rate'])/1200,v['months']);m={'Vehicle price':price,'Sales tax':tax,'Upfront cash':up,'Payment per period':a,'Total interest':interest,'Total payments':paid,'Number of payments':count}
 return dict(label=label,calculatorId='auto-loan',mode='payment',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(a),usd(up),usd(financed),usd(interest)])
def boat(label,mode='payment',**changes):
 v=dict(price=50000,down=10000,trade=0,tax=7,fees=500,finance='Yes',rate=7,years=10);v.update(changes);n=v['years']*12;r=D(v['rate'])/1200;finance=v['finance']=='Yes'
 if mode=='price':
  v.pop('price');price=(pv(D(v['payment']),r,n)+v['down']+v['trade']-(v['fees'] if finance else 0))/(1+D(v['tax'])/100 if finance else D(1))
 else:price=D(v['price'])
 tax=price*D(v['tax'])/100;charges=tax+D(v['fees']);financed=price-v['down']-v['trade']+(charges if finance else 0);up=D(v['down'])+(0 if finance else charges);a,interest,paid,count=schedule(financed,r,n);m={'Boat price':price,'Sales tax':tax,'Upfront cash':up,'Payment per period':a,'Total interest':interest,'Total payments':paid,'Number of payments':count}
 return dict(label=label,calculatorId='boat-loan',mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(price),usd(a),usd(up),usd(interest)])
cases={'auto':[auto('60 months, financed tax and fees'),auto('72 months, financed tax and fees',months=72),auto('60 months, tax and fees upfront',finance_fees='No'),auto('USD 8,000 trade, USD 11,000 owed',trade=8000,owed=11000),auto('USD 8,000 down payment',down=8000)],'boat':[boat('10 years, financed tax and fees'),boat('20 years, financed tax and fees',years=20),boat('10 years, tax and fees upfront',finance='No'),boat('Solve price from USD 700 monthly',mode='price',payment=700),boat('10 years, 0% entered interest',rate=0)]}
p=R/'src/lib/calculation-guide-cases.json';d=json.loads(p.read_text());d.update(cases);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'auto-boat-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Total interest'] for r in rows];ax.bar(range(5),ys,color='#6653cc');ax.set_ylim(0,max(ys)*1.25)
 labels={'auto':['60 months\nFinanced charges','72 months\nFinanced charges','60 months\nUpfront charges','Trade 8k\nOwed 11k','Down 8k'],'boat':['10 years\nFinanced charges','20 years\nFinanced charges','10 years\nUpfront charges','USD 700/month\nSolved price','10 years\n0% interest']}[topic]
 ax.set_xticks(range(5),labels);ax.set_ylabel('Total loan interest (USD)');ax.set_title('Auto loan: term, cash and trade debt change interest' if topic=='auto' else 'Boat loan: compare interest, term and entered financing choices')
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
 note='USD 35,000 price, 6% nominal rate, manual 7% tax, USD 500 fees; base down USD 5,000.' if topic=='auto' else 'Base: USD 50,000 price, 7% nominal rate, full-price 7% tax, USD 500 fees, down USD 10,000.'
 fig.text(.5,.012,note+'\nHypothetical inputs, not current offers, jurisdiction tax advice or full ownership costs.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
