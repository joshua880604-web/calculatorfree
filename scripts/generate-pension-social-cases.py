"""Offline Decimal60 valuation references, independent of the website engine."""
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
def pv(amount,years,discount,cola,delay=0):
 return sum((D(amount)*(1+D(str(cola))/100)**(m//12)/(1+D(str(discount))/100)**(D(delay)+D(m+1)/12) for m in range(max(0,int(years*12)))),D(0))
def pension(label,life=85,discount=0,cola=0):
 value=pv(2000,life-65,discount,cola);m={'Present value of pension':value,'Lump sum':D(300000),'Pension value advantage':value-300000,'Undiscounted break-even years':D(300000)/(2000*12)}
 return dict(label=label,calculatorId='pension',mode='lump',values=dict(age=65,life=life,lump=300000,monthly=2000,**{'return':discount},cola=cola),metrics={k:float(v) for k,v in m.items()},display=[usd(value),usd(D(300000)),usd(value-300000),str(D('12.5'))])
def social(label,life=90,discount=0,cola=0,age1=62,monthly1=1400):
 age2=70;monthly2=2480;base=min(age1,age2);one=pv(monthly1,life-age1,discount,cola,age1-base);two=pv(monthly2,life-age2,discount,cola,age2-base);m={'First option present value':one,'Second option present value':two,'Second option advantage':two-one}
 return dict(label=label,calculatorId='social-security',mode='compare',values=dict(age1=age1,monthly1=monthly1,age2=age2,monthly2=monthly2,life=life,**{'return':discount},cola=cola),metrics={k:float(v) for k,v in m.items()},display=[usd(one),usd(two),usd(two-one),str(base)])
cases={'pension':[pension('Horizon age 85, zero discount'),pension('Horizon age 75, zero discount',life=75),pension('Horizon age 85, 5% discount',discount=5),pension('Horizon age 85, 5% discount, 2% COLA',discount=5,cola=2)],'social':[social('62 vs 70; horizon 90; zero discount'),social('62 vs 70; horizon 75; zero discount',life=75),social('62 vs 70; horizon 90; 3% discount',discount=3),social('62 vs 70; horizon 90; 3% discount, 2% COLA',discount=3,cola=2),social('67 vs 70; horizon 90; 3% discount',discount=3,age1=67,monthly1=2000)]}
p=R/'src/lib/calculation-guide-cases.json';x=json.loads(p.read_text());x.update(cases);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'pension-social-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='pension':
  ys=[r['metrics']['Present value of pension'] for r in rows];ax.bar(range(4),ys,color='#6653cc');ax.axhline(300000,color='#c46620',ls='--',label='Entered lump sum: USD 300,000');ax.set_xticks(range(4),['Age 85\n0% discount','Age 75\n0% discount','Age 85\n5% discount','Age 85\n5% discount, 2% COLA']);ax.set_ylabel('Pension present value at age 65 (USD)');ax.set_ylim(0,max(ys)*1.25);ax.set_title('Same USD 2,000 starting pension; horizon and assumptions differ')
  for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
  note='USD 2,000 monthly end payments; anniversary COLA when entered. Deterministic horizons, not mortality probabilities.'
 else:
  x=list(range(4));a=[r['metrics']['First option present value'] for r in rows[:4]];b=[r['metrics']['Second option present value'] for r in rows[:4]];ax.bar([i-.18 for i in x],a,.36,color='#6653cc',label='Start 62: USD 1,400/month');ax.bar([i+.18 for i in x],b,.36,color='#268c88',label='Start 70: USD 2,480/month');ax.set_xticks(x,['Horizon 90\n0% discount','Horizon 75\n0% discount','Horizon 90\n3% discount','Horizon 90\n3% discount, 2% COLA']);ax.set_ylabel('Benefit present value at age 62 (USD)');ax.set_title('Entered claim-date quotes; horizon and discount change valuation');note='First four cases only. Quotes are hypothetical nominal amounts at each claiming date, not computed SSA entitlements.'
 ax.legend(fontsize=9);fig.text(.5,.012,note+'\nNo tax, survivor coordination, eligibility or personal recommendation.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
