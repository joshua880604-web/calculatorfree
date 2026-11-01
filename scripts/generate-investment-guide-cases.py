"""Offline Decimal60 reference cases and static figures; not a runtime/build dependency."""
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
def row(label,id,mode,v,m,display):return dict(label=label,calculatorId=id,mode=mode,values=v,metrics={k:float(x) for k,x in m.items()},display=display)
def profit(label,**changes):
 v=dict(shares=100,buy=50,sell=60,buy_fee_unit='USD',buy_fee=5,sell_fee_unit='USD',sell_fee=5,dividends=0);v.update(changes);q=D(str(v['shares']));purchase=q*D(v['buy']);sale=q*D(v['sell']);bf=D(str(v['buy_fee']))*(purchase/100 if v['buy_fee_unit']=='Percent' else 1);sf=D(str(v['sell_fee']))*(sale/100 if v['sell_fee_unit']=='Percent' else 1);cost=purchase+bf;gain=sale-sf+D(v['dividends'])-cost;be=(cost+(D(v['sell_fee']) if v['sell_fee_unit']=='USD' else 0)-D(v['dividends']))/(q*(1-(D(v['sell_fee'])/100 if v['sell_fee_unit']=='Percent' else 0)))
 return row(label,'stock-profit','trade',v,{'Net profit / loss before income tax':gain,'Net return on purchase cost':gain/cost*100,'Break-even sale price per share':max(D(0),be),'Total purchase cost including fees':cost,'Net sale proceeds after fees':sale-sf,'Total trading fees':bf+sf},[usd(cost),usd(gain),f'{gain/cost*100:.4f}%',usd(max(D(0),be))])
def average(label,lots,market):
 q=sum(D(str(r[0])) for r in lots);gross=sum(D(str(a))*D(str(b)) for a,b,c in lots);fees=sum(D(str(c)) for a,b,c in lots);cost=gross+fees;gain=q*D(market)-cost;values={'lots':json.dumps([dict(shares=str(a),price=str(b),fee=str(c)) for a,b,c in lots],separators=(',',':')),'market':market}
 return row(label,'stock-average','purchases',values,{'Average cost per share including buy fees':cost/q,'Total shares held':q,'Total purchase cost including fees':cost,'Weighted purchase price excluding fees':gross/q,'Total buy fees':fees,'Unrealized gain / loss before sale fees and tax':gain},[str(q),usd(cost/q),usd(cost),usd(gain)])
def solve(flows):
 def npv(r):return sum(D(v)/(1+r)**i for i,v in enumerate(flows))
 lo=D('-.99');hi=D(5);assert npv(lo)*npv(hi)<0
 for _ in range(240):
  mid=(lo+hi)/2
  if npv(mid)>0:lo=mid
  else:hi=mid
 return (lo+hi)/2

def irr_case(label,flows,roots=None):
 rs=[D(x) for x in roots] if roots else [solve(flows)]
 for root in rs:assert abs(sum(D(v)/(1+root)**t for t,v in enumerate(flows)))<D('1e-45')
 v={'initial':-flows[0],'flows':', '.join(str(x) for x in flows[1:])};m={f'Annual IRR {i+1}':r*100 for i,r in enumerate(rs)}
 return row(label,'irr','irregular',v,m,[str(flows),' / '.join(f'{r*100:.4f}%' for r in rs),str(len(flows)-1)+(' year' if len(flows)==2 else ' years')])
def mirr_case(label,flows,finance=8,reinvest=10,period='Annually'):
 k={'Annually':1,'Quarterly':4,'Monthly':12}[period];n=len(flows)-1;f=(1+D(finance)/100)**(D(1)/k)-1;r=(1+D(reinvest)/100)**(D(1)/k)-1;pv=sum(-D(v)/(1+f)**t for t,v in enumerate(flows) if v<0);fv=sum(D(v)*(1+r)**(n-t) for t,v in enumerate(flows) if v>0);p=(fv/pv)**(D(1)/n)-1;annual=(1+p)**k-1
 return row(label,'mirr','cashflows',{'flows':'\n'.join(map(str,flows)),'period':period,'finance':finance,'reinvest':reinvest},{'Effective annual MIRR':annual*100,'MIRR per cash-flow period':p*100,'Present value of outflows':pv,'Terminal value of reinvested inflows':fv,'Number of cash-flow periods':n,'Horizon in years':D(n)/k},[usd(pv),usd(fv),f'{p*100:.4f}%',f'{annual*100:.4f}%'])
cases={'stockprofit':[profit('Base: sell at USD 60'),profit('Sell at USD 40',sell=40),profit('Percentage fees plus cash dividends',buy_fee_unit='Percent',buy_fee=.5,sell_fee_unit='Percent',sell_fee=1,dividends=200),profit('2.5 fractional shares',shares=2.5,buy=40,sell=45,buy_fee=1,sell_fee=1),profit('Zero sale price',sell=0),profit('Unchanged price plus USD 200 dividends',sell=50,dividends=200)],
 'stockaverage':[average('100 shares at USD 50',[(100,50,5)],40),average('Add 100 shares at USD 40',[(100,50,5),(100,40,5)],40),average('Unequal purchases; compare at USD 45',[(100,50,5),(50,40,5)],45),average('Add 100 shares at USD 60',[(100,50,5),(100,60,5)],40),average('Fractional purchases; compare at USD 45',[(1.5,40,1),(.5,60,1)],45)],
 'irr':[irr_case('USD 1,100 received in year 1',[-1000,1100]),irr_case('USD 1,210 received in year 1',[-1000,1210]),irr_case('USD 1,210 received in year 2',[-1000,0,1210]),irr_case('USD 900 received in year 1',[-1000,900]),irr_case('Two positive annual roots',[-100,230,-132],['.1','.2']),irr_case('Unequal annual receipts',[-10000,3000,4000,5000])],
 'mirr':[mirr_case('Base: 10% reinvestment',[-10000,3000,4000,5000]),mirr_case('0% reinvestment',[-10000,3000,4000,5000],reinvest=0),mirr_case('5% reinvestment',[-10000,3000,4000,5000],reinvest=5),mirr_case('Later outlay, 8% financing',[-10000,-2000,6000,9000]),mirr_case('Later outlay, 20% financing',[-10000,-2000,6000,9000],finance=20),mirr_case('USD 900 received in year 1',[-1000,900],finance=0,reinvest=0),mirr_case('Two quarterly periods',[-1000,100,1100],period='Quarterly')]}
p=R/'src/lib/calculation-guide-cases.json';all_=json.loads(p.read_text());all_.update(cases);p.write_text(json.dumps(all_,indent=2,ensure_ascii=False)+'\n')
for topic,rs in cases.items():
 with (R/f'public/data/calculation-guides/{topic}-cases.csv').open('w',newline='') as f:
  w=csv.writer(f);w.writerow(['Case','Complete inputs (JSON)','Unrounded reference metrics (JSON)'])
  for r in rs:w.writerow([r['label'],json.dumps(r['values'],sort_keys=True),json.dumps(r['metrics'],sort_keys=True)])
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','svg.hashsalt':'calculatorfree-investment-guides'})
def save(fig,topic,note):
 fig.text(.5,.012,note,ha='center',fontsize=8,color='#475569');fig.tight_layout(rect=(0,.05,1,1));fig.savefig(R/f'public/images/guides/{topic}-guide.svg',facecolor='white',metadata={'Date':None});plt.close(fig)
fig,ax=plt.subplots(figsize=(9,5));prices=[40,50,60];ys=[100*p-5-5005 for p in prices];ax.bar(range(3),ys,color=['#b34d54' if y<0 else '#6653cc' for y in ys]);ax.axhline(0,color='#475569',lw=.8);ax.set_xticks(range(3),['USD 40','USD 50','USD 60']);ax.set_xlabel('Hypothetical sale price per share');ax.set_ylabel('Net profit / loss (USD)');ax.set_title('100 shares bought at USD 50; USD 5 fee on each side');ax.set_ylim(-1300,1300)
for i,y in enumerate(ys):ax.text(i,y+(40 if y>=0 else -40),usd(y),ha='center',va='bottom' if y>=0 else 'top')
save(fig,'stockprofit','No dividends, income tax or borrowing; all shares sold in full. Scenario prices are not forecasts.')
fig,axes=plt.subplots(1,2,figsize=(9,5));base=cases['stockaverage'][:2]
for ax,key,title in zip(axes,['Average cost per share including buy fees','Total purchase cost including fees'],['Cost per share (USD)','Total cash invested (USD)']):
 ys=[r['metrics'][key] for r in base];ax.bar(range(2),ys,color=['#16837b','#6653cc']);ax.set_xticks(range(2),['Original','After adding']);ax.set_title(title);ax.set_ylim(0,max(ys)*1.25)
 for i,y in enumerate(ys):ax.text(i,y+max(ys)*.025,usd(y),ha='center')
fig.suptitle('A lower average cost can require more cash at risk',fontsize=13)
save(fig,'stockaverage','100 shares at USD 50, then 100 at USD 40; USD 5 fee per purchase. No recommendation to average down.')
fig,ax=plt.subplots(figsize=(9,5));ys=[21,10,-10];ax.bar(range(3),ys,color=['#6653cc','#6653cc','#b34d54']);ax.axhline(0,color='#475569',lw=.8);ax.set_xticks(range(3),['USD 1,210\nat year 1','USD 1,210\nat year 2','USD 900\nat year 1']);ax.set_ylabel('Effective annual IRR (%)');ax.set_title('Same USD 1,000 initial outlay; change receipt amount or timing');ax.set_ylim(-16,29)
for i,y in enumerate(ys):ax.text(i,y+(1 if y>=0 else -1),f'{y:.2f}%',ha='center',va='bottom' if y>=0 else 'top')
save(fig,'irr','Single terminal receipt cases; year-two case includes a zero at year one. Not a comparison of investment risk.')
fig,ax=plt.subplots(figsize=(9,5));rs=[cases['mirr'][1],cases['mirr'][2],cases['mirr'][0]];ys=[r['metrics']['Effective annual MIRR'] for r in rs];ax.bar(range(3),ys,color='#6653cc');ax.set_xticks(range(3),['0%','5%','10%']);ax.set_xlabel('Effective annual reinvestment assumption');ax.set_ylabel('Effective annual MIRR (%)');ax.set_title('Same annual cash flows; change only reinvestment rate');ax.set_ylim(0,max(ys)*1.3)
for i,y in enumerate(ys):ax.text(i,y+.25,f'{y:.4f}%',ha='center')
save(fig,'mirr','Cash flows: -10000, 3000, 4000, 5000 at years 0–3; financing assumption 8%. Hypothetical, not achieved returns.')
print({'cases':{k:len(v) for k,v in cases.items()},'metricChecks':sum(len(r['metrics']) for rs in cases.values() for r in rs)})
