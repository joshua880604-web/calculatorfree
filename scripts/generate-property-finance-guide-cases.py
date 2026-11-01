"""Offline reference cases and SVG figures. Decimal arithmetic is independent of site engines."""
from pathlib import Path
from decimal import Decimal as D,getcontext
import os,json,csv
os.environ.setdefault('MPLCONFIGDIR','/tmp/calculatorfree-matplotlib')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
getcontext().prec=60
R=Path(__file__).resolve().parents[1];DATA=R/'public/data/calculation-guides';IMG=R/'public/images/guides'
def usd(v):return ('-' if v<0 else '')+f'${abs(v):,.2f}'
def row(label,id,mode,v,m,display):return {'label':label,'calculatorId':id,'mode':mode,'values':v,'metrics':{k:float(x) for k,x in m.items()},'display':display}
def installment(p,rate,years):
 i=D(rate)/1200;n=years*12
 return D(p)/n if not i else D(p)*i/(1-(1+i)**(-n))
def debt_schedule(p,rate,years,months=None):
 b=D(p);i=D(rate)/1200;a=installment(p,rate,years);interest=D(0);paid=D(0)
 for _ in range(months if months is not None else years*12):
  gain=b*i;pay=min(a,b+gain);b=max(D(0),b+gain-pay);interest+=gain;paid+=pay
 return b,interest,paid
base_noi={'period':'Monthly','rent':4000,'other_income':100,'vacancy':5,'taxes':400,'insurance':150,'repairs':250,'management':300,'utilities':100,'hoa':0,'other_expenses':50}
expense_keys=['taxes','insurance','repairs','management','utilities','hoa','other_expenses']
def noi(label,changes):
 v={**base_noi,**changes};f=D(1) if v['period']=='Annually' else D(12);rent=D(v['rent']);other=D(v['other_income']);loss=rent*D(v['vacancy'])/100;income=rent-loss+other;cost=sum(D(v[k]) for k in expense_keys);n=(income-cost)*f
 m={'Annual net operating income':n,'Monthly net operating income':n/12,'Effective annual operating income':income*f,'Annual operating expenses':cost*f,'Annual vacancy and collection loss':loss*f}
 return row(label,'noi','operating-income',v,m,[usd(income*f),usd(cost*f),usd(n)])
def cap(label,value=300000,noi=18000,worksheet=False):
 n=D(noi);value=D(value)
 if worksheet:
  v={**base_noi,'value':int(value),'target':6};n=D(31800);mode='rental'
 else:v={'value':int(value),'noi':noi,'target':6};mode='noi'
 m={'Capitalization rate':n/value*100,'Annual net operating income':n,'Annual NOI needed at target cap rate':value*D('.06'),'NOI surplus / shortfall versus target':n-value*D('.06')}
 if n>0:m['Indicated value at target cap rate']=n/D('.06')
 return row(label,'cap-rate',mode,v,m,[usd(value),usd(n),f'{n/value*100:.4f}%',usd(n/D('.06')) if n>0 else 'Not meaningful: nonpositive NOI'])
base_rental={'price':300000,'financed':'Yes','down':25,'rate':6,'years':30,'closing':6000,'repairs':10000,'repaired_value':0,'rent':2500,'other_income':0,'vacancy':5,'management':8,'tax':3600,'insurance':1500,'hoa':0,'maintenance':3000,'other':0,'rent_growth':0,'other_income_growth':0,'tax_growth':0,'insurance_growth':0,'hoa_growth':0,'maintenance_growth':0,'other_growth':0,'appreciation':0,'hold':1,'sale_known':'No','sale_price':300000,'selling':6}
def rental(label,changes):
 v={**base_rental,**changes};debt=D(v['price'])*(1-D(v['down'])/100) if v['financed']=='Yes' else D(0);initial=D(v['price'])-debt+v['closing']+v['repairs'];income=D(v['rent'])*12*(1-D(v['vacancy'])/100)+D(v['other_income'])*12;cost=sum(D(v[k]) for k in ['tax','insurance','hoa','maintenance','other'])+income*D(v['management'])/100;n=income-cost
 balance,interest,paid=debt_schedule(debt,v['rate'],v['years'],12) if debt else (D(0),D(0),D(0));flow=n-paid;proceeds=D(v['price'])*D('.94')-balance
 m={'Initial cash investment':initial,'First-year cash flow':flow,'Capitalization rate':n/D(v['price'])*100,'First-year cash-on-cash':flow/initial*100,'Net sale proceeds':proceeds,'Total investment profit':flow+proceeds-initial}
 return row(label,'rental-property','projection',v,m,[usd(n),usd(paid),usd(flow),usd(flow/12)])
base_heloc={'principal':50000,'rate':8,'draw':10,'years':20,'closing':0,'closing_unit':'Dollars','closing_treatment':'Upfront','charge':0}
def heloc(label,changes):
 v={**base_heloc,**changes};p=D(v['principal']);draw=v['draw']*12;interestOnly=p*D(v['rate'])/1200;annualFee=D(v['charge']);a=installment(p,v['rate'],v['years']);b,interest,paid=debt_schedule(p,v['rate'],v['years']);closing=D(v['closing']);deduct=v['closing_treatment']=='Deducted from loan'
 m={'Monthly draw payment':interestOnly+annualFee/12 if draw else D(0),'Monthly repayment':a,'Total interest':draw*interestOnly+interest,'Fees and annual charges':closing+D(v['draw'])*annualFee,'Annual fees during draw':D(v['draw'])*annualFee,'Net initial proceeds after closing costs':p-closing,'Cash disbursed at closing':p-closing if deduct else p,'Closing costs paid upfront':D(0) if deduct else closing}
 return row(label,'heloc','draw-repay',v,m,[usd(m['Monthly draw payment']),usd(a),usd(m['Total interest']),usd(m['Net initial proceeds after closing costs'])])
annual={k:v*12 for k,v in base_noi.items() if k in ['rent','other_income',*expense_keys]};annual['period']='Annually'
cases={'noi':[noi('Base: 5% rent loss',{}),noi('20% rent loss',{'vacancy':20}),noi('100% rent loss',{'vacancy':100}),noi('Same base amounts entered annually',annual),noi('USD 1,000 monthly routine repairs',{'repairs':1000})],
 'cap':[cap('Base: USD 300,000 value'),cap('USD 360,000 value',value=360000),cap('USD 240,000 value',value=240000),cap('Zero annual NOI',noi=0),cap('USD 6,000 annual operating loss',noi=-6000),cap('Rental worksheet: USD 500,000 value',value=500000,worksheet=True)],
 'rental':[rental('Base: 6% loan, 5% rent loss',{}),rental('15% rent loss',{'vacancy':15}),rental('8% loan rate',{'rate':8}),rental('USD 2,000 monthly rent',{'rent':2000}),rental('Cash purchase: no financing',{'financed':'No'})],
 'heloc':[heloc('Base: 8%, 20-year repayment',{}),heloc('10% throughout',{'rate':10}),heloc('10-year repayment',{'years':10}),heloc('USD 120 annual draw fee',{'charge':120}),heloc('USD 1,000 deducted closing cost',{'closing':1000,'closing_treatment':'Deducted from loan'}),heloc('0% rate throughout',{'rate':0})]}
p=R/'src/lib/calculation-guide-cases.json';x=json.loads(p.read_text());x.update(cases);p.write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
for topic,rs in cases.items():
 with (DATA/f'{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Mode','Complete inputs (JSON)','Reference metrics before display rounding (JSON)'])
  for r in rs:w.writerow([r['label'],r['mode'],json.dumps(r['values'],sort_keys=True),json.dumps(r['metrics'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-property-finance-guides'})
def save(fig,topic,note):
 fig.text(.5,.012,note,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.04,1,1));fig.savefig(IMG/f'{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Annual net operating income'] for r in cases['noi'][:3]];ax.bar(range(3),ys,color=['#6653cc' if y>=0 else '#b34d54' for y in ys]);ax.axhline(0,color='#475569',lw=.8);ax.set_xticks(range(3),['5%','20%','100%']);ax.set_xlabel('Loss applied to scheduled rent');ax.set_ylabel('Annual property NOI (USD)');ax.set_title('Same scheduled rent and operating expenses; change rent loss');ax.set_ylim(-20000,42000)
for i,y in enumerate(ys):ax.text(i,y+(900 if y>=0 else -1100),usd(y),ha='center',va='bottom' if y>=0 else 'top')
save(fig,'noi','USD 4,000 monthly rent + USD 100 other income; USD 1,250 monthly costs; before financing and capital costs.')
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['Capitalization rate'] for r in cases['cap'][:3]];ax.bar(range(3),ys,color='#6653cc');ax.set_xticks(range(3),['USD 300,000','USD 360,000','USD 240,000']);ax.set_xlabel('Entered price or market value');ax.set_ylabel('Capitalization rate (%)');ax.set_title('Same USD 18,000 annual NOI; different property values');ax.set_ylim(0,9)
for i,y in enumerate(ys):ax.text(i,y+.15,f'{y:.2f}%',ha='center')
save(fig,'cap','Only value changes in this chart; no financing, appreciation or acquisition expenses in the ratio.')
fig,ax=plt.subplots(figsize=(9,5));ys=[r['metrics']['First-year cash flow']/12 for r in cases['rental']];ax.bar(range(5),ys,color=['#6653cc' if y>=0 else '#b34d54' for y in ys]);ax.axhline(0,color='#475569',lw=.8);ax.set_xticks(range(5),['Base','15%\nrent loss','8%\nloan','USD 2,000\nrent','Cash\npurchase']);ax.set_ylabel('First-year cash flow / 12 (USD)');ax.set_title('Same rental purchase: change one assumption from the base');ax.set_ylim(-550,1950)
for i,y in enumerate(ys):ax.text(i,y+(40 if y>=0 else -45),usd(y),ha='center',va='bottom' if y>=0 else 'top',fontsize=10)
save(fig,'rental','Annual average before income tax and separate capital reserves; cash purchase requires more upfront capital.')
fig,ax=plt.subplots(figsize=(9,5));draw=[r['metrics']['Monthly draw payment'] for r in cases['heloc'][:3]];repay=[r['metrics']['Monthly repayment'] for r in cases['heloc'][:3]];ax.bar([i-.18 for i in range(3)],draw,width=.36,color='#16837b',label='Interest-only draw');ax.bar([i+.18 for i in range(3)],repay,width=.36,color='#6653cc',label='Amortizing repayment');ax.set_xticks(range(3),['8%, 20 years\nrepayment','10%, 20 years\nrepayment','8%, 10 years\nrepayment']);ax.set_ylabel('Modeled monthly payment (USD)');ax.set_title('USD 50,000 balance: interest-only versus principal repayment');ax.set_ylim(0,800);ax.legend(loc='upper left',fontsize=9)
for i,(a,b) in enumerate(zip(draw,repay)):
 for dx,y in [(-.18,a),(.18,b)]:ax.text(i+dx,y+13,f'{y:,.2f}',ha='center',fontsize=9)
save(fig,'heloc','Full balance at start, no further draws, constant stated rate within each scenario, no fees in chart.')
print(json.dumps({'caseCounts':{k:len(v) for k,v in cases.items()},'metricChecks':sum(len(r['metrics']) for rs in cases.values() for r in rs)}))
