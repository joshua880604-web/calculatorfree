"""Independent Decimal60 housing references and offline static charts, not a runtime dependency."""
from pathlib import Path
from decimal import Decimal as D,getcontext
import json,csv,os
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1]
def usd(x):return ('-' if x<0 else '')+f'${abs(x):,.2f}'
def pay(p,rate,n):
 i=D(str(rate))/1200
 return D(p)/n if not i else D(p)*i/(1-(1+i)**-n)
def row(label,id,mode,v,m,display):return dict(label=label,calculatorId=id,mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=display)
def seller(label,years=30,due=60,rate=6,io=False):
 p=D(240000);i=D(rate)/1200;n=years*12;a=p*i if io else pay(p,rate,n);b=p;interest=D(0);paid=D(0)
 for _ in range(due):
  g=b*i;inst=g if io else min(a,b+g);b=max(D(0),b+g-inst);interest+=g;paid+=inst
 if b<D('1e-45'):b=D(0)
 v={'price':300000,'down':60000,'rate':rate,'due':due}
 if not io:v['years']=years
 return row(label,'seller-financing','interest-only' if io else 'amortized',v,{'Regular monthly payment':a,'Balloon principal after final installment':b,'Total due in final month':inst+b,'Seller-financed principal':p,'Total interest through maturity':interest,'Total loan payments including balloon':paid+b},[usd(a),usd(b),usd(inst+b),usd(interest)])
def flip(label,**changes):
 v=dict(price=150000,closing=4500,rehab=35000,contingency=10,months=6,holding=600,sale=250000,selling=6,sale_fixed=1500,financing='Interest-only loan',loan=120000,rate=10,points=2);v.update(changes);loan=D(v['loan']) if v['financing']=='Interest-only loan' else D(0);interest=loan*D(v['rate'])/100*v['months']/12;points=loan*D(v['points'])/100;rehab=D(v['rehab'])*(1+D(v['contingency'])/100);cost=D(v['price'])+v['closing']+rehab+D(v['months'])*v['holding']+interest+points;selling=D(v['sale'])*D(v['selling'])/100+v['sale_fixed'];profit=D(v['sale'])-selling-cost;cash=cost-loan;be=(cost+v['sale_fixed'])/(1-D(v['selling'])/100)
 return row(label,'fix-and-flip','project',v,{'Net project profit before income tax':profit,'Total cash required before sale':cash,'Net sale cash after loan payoff':D(v['sale'])-selling-loan,'Project cash-on-cash ROI':profit/cash*100,'Break-even sale price':be,'Loan interest and points':interest+points,'Budgeted renovation including contingency':rehab},[usd(cost),usd(profit),usd(cash),usd(be)])
def schedule(p,rate,n,extra=0):
 b=D(p);i=D(str(rate))/1200;a=pay(p,rate,n);rows=[]
 for m in range(1,n+1):
  g=b*i;paid=min(a+D(extra),b+g);b=max(D(0),b+g-paid);rows.append(b)
  if b<D('1e-45'):break
 return rows

def pmi(label,premium=.5,extra=0,down=10):
 value=D(400000);p=value*(1-D(down)/100);rate=D(str(premium)) if down<20 else D(0);monthly=p*rate/100/12;original=schedule(p,6.5,360);actual=schedule(p,6.5,360,extra)
 def reach(rows,f):return 0 if p<=value*D(f) else next(i+1 for i,b in enumerate(rows) if b<=value*D(f))
 req=min(reach(original,'.8'),reach(actual,'.8'));auto= min(reach(original,'.78'),181);reqStop=min(req+1,auto);reqMonths=sum(m<reqStop for m in range(1,len(actual)+1)) if rate else 0;autoMonths=sum(m<auto for m in range(1,len(actual)+1)) if rate else 0
 v={'price':400000,'down':down,'appraisal':'','rate':6.5,'years':30,'first_due':'2026-11-01','annual_pmi':premium,'extra':extra};m={'Initial monthly PMI':monthly,'Original loan amount':p,'Original loan-to-value ratio':p/value*100,'Scheduled monthly P&I':pay(p,6.5,360),'PMI if 80% request is approved':monthly*reqMonths,'PMI using automatic termination only':monthly*autoMonths,'Payments with PMI if request approved':reqMonths,'Payments with PMI under automatic scenario':autoMonths}
 if rate:m['80% request benchmark']=req;m['Scheduled 78% benchmark']=reach(original,'.78')
 return row(label,'pmi','quote',v,m,[usd(monthly),str(reqMonths),str(autoMonths),usd(monthly*reqMonths)])
base=dict(income=100000,debt=500,front=28,back=36,down=20,down_unit='Percent',rate=6,years=30,tax_rate=1.2,tax_unit='Percent of home value',insurance=1500,insurance_unit='Dollars per year',hoa=0,hoa_unit='Dollars per month',maintenance=0,maintenance_unit='Dollars per year')
def afford(label,mode='income',**changes):
 v={**base,**changes};budget=min(D(v['income'])/12*D(v['front'])/100,D(v['income'])/12*D(v['back'])/100-D(v['debt'])) if mode=='income' else D(v['budget']);a=pay(1,v['rate'],v['years']*12);percent=v['down_unit']=='Percent';downFraction=D(v['down'])/100 if percent else D(0);fixedDown=D(0) if percent else D(v['down']);variable=D(v['tax_rate'])/1200;fixed=D(v['insurance'])/12+D(v['hoa'])+D(v['maintenance'])/12;price=(budget-fixed+a*fixedDown)/(a*(1-downFraction)+variable);down=price*downFraction if percent else fixedDown
 if mode=='budget':
  for k in ['income','debt','front','back']:v.pop(k)
 return row(label,'house-affordability',mode,v,{'Estimated home price':price,'Down payment':down,'Loan amount':price-down,'Monthly housing budget':budget},[usd(budget),usd(price),usd(down),usd(price-down)])
cases={'seller':[seller('Base: 30-year amortization, month 60 due'),seller('Month 120 due',due=120),seller('15-year amortization, month 60 due',years=15),seller('Interest-only, month 60 due',io=True),seller('0% interest, month 60 due',rate=0),seller('Full 30-year amortization',due=360)],
 'flip':[flip('Base: six-month financed project'),flip('Sale delayed to month nine',months=9),flip('USD 50,000 rehab before contingency',rehab=50000),flip('USD 210,000 sale price',sale=210000),flip('Cash purchase, no loan',financing='Cash')],
 'pmi':[pmi('0.50% quote, no extra principal'),pmi('0.30% quote',premium=.3),pmi('0.80% quote',premium=.8),pmi('USD 500 extra principal',extra=500),pmi('20% down payment',down=20)],
 'afford':[afford('Base: USD 500 monthly other debt'),afford('USD 1,000 monthly other debt',debt=1000),afford('2% annual property tax',tax_rate=2),afford('USD 300 monthly HOA',hoa=300),afford('USD 2,500 fixed housing budget',mode='budget',budget=2500)]}
p=R/'src/lib/calculation-guide-cases.json';all_=json.loads(p.read_text());all_.update(cases);p.write_text(json.dumps(all_,indent=2,ensure_ascii=False)+'\n')
for t,rs in cases.items():
 with (R/f'public/data/calculation-guides/{t}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for r in rs:w.writerow([r['label'],json.dumps(r['values'],sort_keys=True),json.dumps(r['metrics'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-housing-guides'})
def save(fig,t,note):
 fig.text(.5,.012,note,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.05,1,1));fig.savefig(R/f'public/images/guides/{t}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
fig,axes=plt.subplots(1,2,figsize=(9,5));rs=[cases['seller'][0],cases['seller'][2],cases['seller'][3]]
for ax,key,title in zip(axes,['Regular monthly payment','Balloon principal after final installment'],['Regular monthly installment (USD)','Residual principal at month 60 (USD)']):
 ys=[r['metrics'][key] for r in rs];ax.bar(range(3),ys,color='#6653cc');ax.set_xticks(range(3),['30-year\namortization','15-year\namortization','Interest\nonly']);ax.set_title(title,fontsize=10);ax.set_ylim(0,max(ys)*1.25)
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,f'{y:,.0f}',ha='center',fontsize=9)
fig.suptitle('Same USD 240,000 note at 6%; different principal repayment',fontsize=12)
save(fig,'seller','All three mature after month 60. Final amount due includes that installment PLUS residual principal.')
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Net project profit before income tax'] for r in cases['flip']];ax.bar(range(5),ys,color=['#6653cc' if y>=0 else '#b34d54' for y in ys]);ax.axhline(0,color='#475569',lw=.8);ax.set_xticks(range(5),['Base','Nine-month\nhold','USD 50,000\nrehab','USD 210,000\nsale','Cash\npurchase']);ax.set_ylabel('Project profit before income tax (USD)');ax.set_title('Same house-flip assumptions; change one item from the base');ax.set_ylim(-17000,48000)
for i,y in enumerate(ys):ax.text(i,y+(1000 if y>=0 else -1000),usd(y),ha='center',va='bottom' if y>=0 else 'top',fontsize=9)
save(fig,'flip','Base: USD 150,000 purchase, 6-month hold, 10% interest-only acquisition loan; scenarios are not ARV forecasts.')
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['PMI if 80% request is approved'] for r in cases['pmi'][:4]];ax.bar(range(4),ys,color='#6653cc');ax.set_xticks(range(4),['0.50%\nquote','0.30%\nquote','0.80%\nquote','0.50% quote\n+ USD 500 extra']);ax.set_ylabel('Modeled PMI paid if request approved (USD)');ax.set_title('Same 90% original-LTV loan; quoted rate and extra principal');ax.set_ylim(0,max(ys)*1.25)
for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
save(fig,'pmi','USD 360,000 original principal, 6.5%, 30 years. Approval assumed; extra principal itself is not a PMI saving.')
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Estimated home price'] for r in cases['afford'][:4]];ax.bar(range(4),ys,color='#6653cc');ax.set_xticks(range(4),['Base','USD 1,000\nother debt','2% annual\nproperty tax','USD 300\nmonthly HOA']);ax.set_ylabel('Estimated home price (USD)');ax.set_title('Same USD 100,000 gross income; budget sensitivity');ax.set_ylim(0,max(ys)*1.25)
for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center',fontsize=9)
save(fig,'afford','28%/36% are entered planning assumptions, not approval rules. 20% down, 6% loan, 30-year term.')
print({'cases':{k:len(v) for k,v in cases.items()},'metricChecks':sum(len(r['metrics']) for rs in cases.values() for r in rs)})
