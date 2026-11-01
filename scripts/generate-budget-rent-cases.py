"""Independent Decimal60 monthly budget and ratio-constrained rent examples."""
from decimal import Decimal as D,getcontext
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return ('-'if x<0 else '')+f'${abs(x):,.2f}'
factors={'Monthly':D(1),'Annually':D(1)/12,'Biweekly':D(26)/12,'Weekly':D(52)/12}
def budget(label,**changes):
 counts={'Income':4,'Housing':7,'Transportation':6,'Debt':3,'Living':5,'Health':2,'Children':4,'Savings':4,'Miscellaneous':6};v={'tax':20}
 for group,count in counts.items():
  for i in range(count):v[group+'_'+str(i)]=0;v[group+'f'+str(i)]='Monthly'
 v.update(Income_0=6000,Housing_0=1500,Housing_3=200,Living_0=600,Debt_0=300,Savings_0=300,Health_0=1200,Healthf0='Annually');v.update(changes)
 gross=sum(D(v['Income_'+str(i)])*factors[v['Incomef'+str(i)]]for i in range(4));take=gross*(1-D(v['tax'])/100);out=sum(D(v[group+'_'+str(i)])*factors[v[group+'f'+str(i)]]for group,count in counts.items()if group!='Income'for i in range(count));surplus=take-out
 m={'Monthly take-home income':take,'Monthly spending and saving':out,'Monthly surplus / deficit':surplus,'Annual surplus / deficit':12*surplus}
 return dict(label=label,calculatorId='budget',mode='budget',values=v,metrics={k:float(x)for k,x in m.items()},display=[usd(take),usd(out),usd(surplus),usd(12*surplus)])
def rent(label,**changes):
 v=dict(income=60000,frequency='Annually',debts=500,housing_ratio=30,debt_ratio=36);v.update(changes);gross=D(v['income'])*factors[v['frequency']];housing=gross*D(v['housing_ratio'])/100;debt=gross*D(v['debt_ratio'])/100-D(v['debts']);result=max(D(0),min(housing,debt));m={'Monthly rent budget':result,'Gross monthly income':gross}
 return dict(label=label,calculatorId='rent',mode='affordability',values=v,metrics={k:float(x)for k,x in m.items()},display=[usd(gross),usd(v['debts']),usd(housing),usd(debt),usd(result)])
cases={'budgetplan':[budget('Base: annual health premium spread monthly'),budget('USD 2,500 biweekly gross pay',Income_0=2500,Incomef0='Biweekly'),budget('USD 1,200 health premium entered monthly',Healthf0='Monthly'),budget('Rent rises to USD 3,500',Housing_0=3500),budget('USD 4,800 take-home entered with zero tax',Income_0=4800,tax=0),budget('Emergency saving allocation rises to USD 900',Savings_0=900)],'rentbudget':[rent('Base: USD 500 monthly debt'),rent('No monthly debt',debts=0),rent('USD 1,000 monthly debt',debts=1000),rent('Debt exceeds selected ratio allowance',debts=1900),rent('USD 2,500 biweekly gross pay',income=2500,frequency='Biweekly'),rent('25% rent ratio selected',housing_ratio=25)]}
p=R/'src/lib/calculation-guide-cases.json';d=json.loads(p.read_text());d.update(cases);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'budget-rent-cases'})
for topic,rows in cases.items():
 with(R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='')as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5))
 if topic=='budgetplan':
  ys=[r['metrics']['Monthly surplus / deficit']for r in rows];labels=['Base','Biweekly\npay','Health bill\nmonthly','Higher\nrent','Net pay\n0% tax','Higher\nsaving'];title='Monthly surplus is what remains after spending and saving';ylabel='Monthly surplus / deficit (USD)';note='Hypothetical income and spending; all unlisted categories are zero.\nFrequency and saving allocations affect the result. Annual output is 12 × monthly, not a forecast.'
 else:
  ys=[r['metrics']['Monthly rent budget']for r in rows];labels=['Debt\n500','No\ndebt','Debt\n1,000','Debt\n1,900','Biweekly\npay','25% rent\nratio'];title='The tighter entered ratio limits the modeled rent budget';ylabel='Ratio-based monthly rent budget (USD)';note='USD 60,000 annual gross income except biweekly case; 30% rent / 36% total-debt assumptions except 25% case.\nNot a landlord decision, residual living-cost budget or public-housing rent calculation.'
 ax.bar(range(len(ys)),ys,color=['#6653cc'if y>=0 else'#b34d54'for y in ys]);ax.axhline(0,color='#475569',lw=.8);ax.set_xticks(range(len(ys)),labels);ax.set_ylim(min(0,min(ys))-max(ys)*.15,max(ys)*1.25);ax.set_title(title);ax.set_ylabel(ylabel)
 for i,y in enumerate(ys):ax.text(i,y+(max(ys)*.03)*(1 if y>=0 else-1),usd(y),ha='center',va='bottom'if y>=0 else'top',fontsize=9)
 fig.text(.5,.012,note,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
