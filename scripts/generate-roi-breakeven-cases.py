"""Offline Decimal60 case references and charts, independent of website engines."""
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
def roi(label,cost,returned,years):
 c=D(cost);v=D(returned);y=D(str(years));total=(v/c-1)*100;annual=((v/c)**(1/y)-1)*100 if v else D(-100)
 return dict(label=label,calculatorId='roi',mode='length',values=dict(cost=cost,returned=returned,years=years),metrics={'Investment gain':float(v-c),'Return on investment':float(total),'Annualized return':float(annual)},display=[usd(v-c),f'{total:,.4f}%',f'{annual:,.4f}%',str(years)])
def be(label,fixed=10000,variable=30,profit=0):
 p=D(50);f=D(fixed);v=D(variable);cm=p-v;exact=(f+D(profit))/cm;whole=int(exact.to_integral_value(rounding=ROUND_CEILING));m={'Units for target profit' if profit else 'Break-even units (whole units)':whole,'Revenue at whole units':whole*p,'Theoretical units':exact,'Contribution margin per unit':cm,'Contribution margin ratio':cm/p*100,'Profit at whole units':whole*cm-f};values=dict(fixed=fixed,price=50,variable=variable)
 if profit:values['profit']=profit
 return dict(label=label,calculatorId='break-even',mode='profit' if profit else 'units',values=values,metrics={k:float(x) for k,x in m.items()},display=[str(whole),usd(whole*p),usd(cm),usd(whole*cm-f)])
cases={'roi':[roi('Gross endpoint example',10000,12000,1),roi('Entry and exit fees included once',10100,11900,1),roi('Loss over two years',10000,8000,2),roi('Zero terminal recovery',10000,0,1),roi('50% total gain over five years',10000,15000,5),roi('40% total gain over two years',10000,14000,2)],'breakeven':[be('Base: USD 20 unit contribution'),be('USD 10,001 fixed cost',fixed=10001),be('USD 5,000 target profit',profit=5000),be('USD 35 variable cost per unit',variable=35)]}
p=R/'src/lib/calculation-guide-cases.json';d=json.loads(p.read_text());d.update(cases);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'roi-breakeven-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for r in rows:w.writerow([r['label'],json.dumps(r['values'],sort_keys=True),json.dumps(r['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='roi':
  xs=list(range(6));a=[r['metrics']['Return on investment'] for r in rows];b=[r['metrics']['Annualized return'] for r in rows];ax.bar([x-.18 for x in xs],a,.36,label='Total ROI',color='#6653cc');ax.bar([x+.18 for x in xs],b,.36,label='Annualized return',color='#268c88');ax.set_xticks(xs,['Gross','With\nfees','Loss\n2 years','Zero\nrecovery','5-year\ngain','2-year\ngain']);ax.axhline(0,color='#475569',lw=.8);ax.set_ylabel('Return (%)');ax.set_title('Costs, losses and holding periods change the comparison');ax.legend();note='Hypothetical single-cost / terminal-value cases; no interim cash flows, tax or risk adjustment.'
 else:
  ys=[next(v for k,v in r['metrics'].items() if k in ['Units for target profit','Break-even units (whole units)']) for r in rows];ax.bar(range(4),ys,color='#6653cc');ax.set_xticks(range(4),['Base','Fixed cost\nUSD 10,001','Target profit\nUSD 5,000','Variable cost\nUSD 35']);ax.set_ylabel('Whole units required');ax.set_ylim(0,900);ax.set_title('Required volume changes with fixed cost, target and unit contribution')
  for i,y in enumerate(ys):ax.text(i,y+15,str(int(y)),ha='center')
  note='USD 50 price per unit. Base: USD 10,000 fixed cost and USD 30 variable cost, same period.'
 fig.text(.5,.012,note+'\nControlled calculations, not observed performance or a business recommendation.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps({'caseCounts':{k:len(v) for k,v in cases.items()},'metricChecks':sum(len(r['metrics']) for rs in cases.values() for r in rs)}))
