"""Independent Decimal60 FHA/VA example arithmetic and HUD-style premium rounding."""
from decimal import Decimal as D,getcontext,ROUND_HALF_UP
from pathlib import Path
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return ('-' if x<0 else '')+f'${abs(x):,.2f}'
def cents(x):return D(x).quantize(D('.01'),rounding=ROUND_HALF_UP)
def pay(p,r,n):return p/n if not r else p*r/(1-(1+r)**-n)
def base_values(price,down,years):
 return dict(price=price,down=down,down_unit='Percent',years=years,months=0,rate=6,start='2026-11-01',tax=0,tax_unit='Dollars',insurance=0,insurance_unit='Dollars',hoa=0,hoa_unit='Dollars',other=0,other_unit='Dollars',tax_growth=0,insurance_growth=0,hoa_growth=0,other_growth=0,extra_monthly=0,extra_yearly=0,extra_once=0,extra_once_month=1,extra_start=1,extra_yearly_start=12,dated='')
def loan_totals(p,rate,n):
 a=pay(p,rate,n);b=p;interest=D(0);total=D(0)
 for _ in range(n):i=b*rate;out=min(a,b+i);b=max(D(0),b+i-out);interest+=i;total+=out
 return a,interest,total

def fha_premiums(p,a,months,upfront,annual,duration):
 b=cents(p);installment=cents(a);rows=[]
 for start in range(0,months,12):
  openings=[]
  for month in range(start,min(start+12,months)):
   openings.append(b);interest=cents(cents(b*6)/1200);b=cents(max(D(0),b+interest-installment))
  yearly=cents(cents(sum(openings)/12*annual/100)/(1+upfront/100));monthly=cents(yearly/12)
  rows.extend(monthly if i<duration else D(0) for i in range(start,min(start+12,months)))
 return rows

def fha(label,down=3.5,years=30,annual='.55',duration=360,ownership=False):
 v=base_values(300000,down,years);v.update(appraised_value='',mip_method='Automatic')
 if ownership:v.update(tax=3600,insurance=1200,hoa=600)
 downcash=D(300000)*D(str(down))/100;base=D(300000)-downcash;fee=cents(base*D('.0175'));p=base+fee;n=years*12;a,interest,total=loan_totals(p,D('.06')/12,n);premiums=fha_premiums(p,a,n,D('1.75'),D(annual),duration);cost=D(v['tax']+v['insurance']+v['hoa']+v['other'])/12;initial=a+premiums[0]+cost;m={'Monthly principal & interest':a,'Initial monthly total':initial,'Down payment':downcash,'Financed loan amount':p,'Upfront fee':fee,'Annual FHA MIP rate':D(annual),'FHA loan-to-value ratio':base/300000*100,'FHA MIP duration in years':D(min(duration,n))/12,'Initial monthly FHA MIP':premiums[0],'Total FHA MIP':sum(premiums),'Total interest':interest,'Total payments':total,'Number of payments':n}
 return dict(label=label,calculatorId='fha-loan',mode='monthly',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(downcash),usd(a),usd(premiums[0]),usd(initial)])
def va(label,down=0,fee_percent='2.15',repeat='No',exempt=False,finance=True):
 v=base_values(400000,down,30);v.update(repeat=repeat,exempt='Yes' if exempt else 'No',fee_treatment='Finance fee' if finance else 'Pay upfront');cash=D(400000)*D(str(down))/100;base=D(400000)-cash;fee=base*D(fee_percent)/100;p=base+(fee if finance else 0);a,interest,total=loan_totals(p,D('.06')/12,360);m={'Monthly principal & interest':a,'Initial monthly total':a,'Down payment':cash,'Financed loan amount':p,'Upfront fee':fee,'Total interest':interest,'Total payments':total,'Number of payments':360,'Total out of pocket':cash+(0 if finance else fee)+total}
 return dict(label=label,calculatorId='va-mortgage',mode='monthly',values=v,metrics={k:float(x) for k,x in m.items()},display=[usd(cash),usd(fee),usd(p),usd(a)])
cases={'fha':[fha('3.5% down, 30 years'),fha('10% down, 30 years',down=10,annual='.5',duration=132),fha('3.5% down, 15 years',years=15,annual='.4',duration=180),fha('Base plus entered tax, insurance and HOA',ownership=True)],'va':[va('First use, no down payment, fee financed'),va('First use, fee paid upfront',finance=False),va('First use, 5% down',down=5,fee_percent='1.5'),va('First use, 10% down',down=10,fee_percent='1.25'),va('Subsequent use, no down payment',repeat='Yes',fee_percent='3.3'),va('Exemption assumed established',exempt=True,fee_percent='0')]}
p=R/'src/lib/calculation-guide-cases.json';x=json.loads(p.read_text());x.update(cases);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'fha-va-cases'})
for topic,rows in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for row in rows:w.writerow([row['label'],json.dumps(row['values'],sort_keys=True),json.dumps(row['metrics'],sort_keys=True)])
 fig,ax=plt.subplots(figsize=(9,5));key='Initial monthly total' if topic=='fha' else 'Monthly principal & interest';ys=[r['metrics'][key] for r in rows];ax.bar(range(len(ys)),ys,color='#6653cc');ax.set_ylim(0,max(ys)*1.25)
 labels=['3.5% down\n30 years','10% down\n30 years','3.5% down\n15 years','Base + entered\nproperty costs'] if topic=='fha' else ['First use\nFee financed','First use\nFee upfront','5% down','10% down','Subsequent use\nNo down','Assumed\nexemption']
 ax.set_xticks(range(len(ys)),labels);ax.set_ylabel('Initial monthly total incl. FHA MIP (USD)' if topic=='fha' else 'Monthly principal & interest (USD)');ax.set_title('FHA: down payment, term and entered costs change the initial payment' if topic=='fha' else 'VA: funding fee and down payment change the financed balance')
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=8)
 note='USD 300,000 purchase, 6% hypothetical rate; ordinary forward-loan premium terms documented in HUD ML2023-05.' if topic=='fha' else 'USD 400,000 purchase, 6% hypothetical rate, 30 years; zero entered property costs. Not a cash-to-close estimate.'
 fig.text(.5,.012,note+'\nNo loan approval, appraisal eligibility or exemption determination.',ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.065,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
print(json.dumps(cases,indent=2))
