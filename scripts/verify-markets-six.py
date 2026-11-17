from pathlib import Path
import json
import mpmath as mp

mp.mp.dps = 80
ROOT = Path(__file__).resolve().parents[1]
M = mp.mpf
cases = []

def close(a, b):
    assert abs(a-b) < M('1e-65') * max(1, abs(a), abs(b))

def clean(x):
    if isinstance(x, dict): return {k: clean(v) for k,v in x.items()}
    if isinstance(x, list): return [clean(v) for v in x]
    if isinstance(x, mp.mpf): return mp.nstr(x, 70)
    return x

def add(topic, label, inputs, expected, convention):
    cases.append(clean({'topic':topic,'case':label,'inputs':inputs,'expected':expected,'convention':convention}))

for label, shares, price, cost, splits in [
    ('forward', '120','45','30',[[3,2]]),
    ('reverse-with-fraction','103','4','3',[[1,10]]),
    ('sequential','120','45','30',[[3,2],[1,5]])
]:
    factor=mp.fprod(M(a)/b for a,b in splits)
    n,p,c=M(shares)*factor,M(price)/factor,M(cost)/factor
    close(n*p,M(shares)*M(price));close(n*c,M(shares)*M(cost))
    add('stock-split',label,{'shares':shares,'price':price,'averageCost':cost,'newForOld':splits},
        {'factor':factor,'sharesAfter':n,'referencePriceAfter':p,'averageCostAfter':c,'totalReferenceValue':n*p,'totalAcquisitionCost':n*c},
        'Retain fractional theoretical shares; no invented broker rounding or cash-in-lieu policy. Reference price is proportional, not a market quote.')

for label,costs,customers in [('itemized',[12000,8000,5000],100),('known-total',[6000],40),('zero-cost',[0],25)]:
    total=sum(costs);value=M(total)/customers
    add('customer-acquisition-cost',label,{'nonoverlappingAcquisitionCosts':costs,'uniqueNewCustomers':customers},
        {'totalCost':total,'cac':value},'Use matched acquisition scope and unique new customers, not orders or repeat purchases.')

for label,dividend,basis,g,r in [('latest-dividend','2','D0','.04','.10'),('known-next-dividend','2.08','D1','.04','.10'),('zero-growth','3','D1','0','.08')]:
    d,g,r=M(dividend),M(g),M(r);d1=d*(1+g) if basis=='D0' else d
    value=d1/(r-g)
    add('dividend-discount-model',label,{'dividend':dividend,'basis':basis,'growth':g,'requiredReturn':r},
        {'nextDividend':d1,'modeledPresentValue':value},'Annual end-period dividends and perpetual stable growth; required return exceeds perpetual growth.')
close(M('2.08')/(M('.10')-M('.04')),M('104')/3)
d0=M(2);g1=M('.10');g2=M('.03');r=M('.08');years=2
dividends=[d0*(1+g1)**t for t in range(1,years+1)]
pv_dividends=mp.fsum(d/(1+r)**t for t,d in enumerate(dividends,1))
terminal=dividends[-1]*(1+g2)/(r-g2);pv_terminal=terminal/(1+r)**years
add('dividend-discount-model','two-stage',{'latestDividend':d0,'earlyGrowth':g1,'earlyYears':years,'terminalGrowth':g2,'annualRequiredReturn':r},
    {'earlyDividends':dividends,'terminalPriceAtYearN':terminal,'pvEarlyDividends':pv_dividends,'pvTerminalPrice':pv_terminal,'modeledPresentValue':pv_dividends+pv_terminal},
    'Stable stage begins after year N; terminal price at N is next dividend divided by r minus terminal growth; discount terminal by N periods.')

for label,income,pref,shares in [('known-average','1000000','100000','300000'),('loss','-100000','10000','50000'),('no-preferred-adjustment','900000','0','150000')]:
    common=M(income)-M(pref);value=common/M(shares)
    add('earnings-per-share',label,{'netIncome':income,'enteredPreferredEarningsAdjustment':pref,'weightedAverageCommonShares':shares},
        {'earningsAvailableToCommon':common,'basicEPS':value},'Basic EPS worksheet with a user-supplied preferred earnings adjustment; no automatic diluted or participating-security rules.')
events=[{'shares':100000,'days':90},{'shares':200000,'days':275}]
average=mp.fsum(M(x['shares'])*x['days'] for x in events)/365
add('earnings-per-share','weighted-share-schedule',{'netIncome':1000000,'preferredEarningsAdjustment':100000,'segments':events},
    {'periodDays':365,'weightedAverageCommonShares':average,'basicEPS':M(900000)/average},
    'Segments cover the whole period without gaps or overlap; users must apply any retrospective corporate-action adjustments consistently.')

for label,mean,rf,sd,periods in [('known-annual','.12','.04','.16',1),('negative-excess','.02','.04','.10',1)]:
    period=(M(mean)-M(rf))/M(sd)
    add('sharpe-ratio',label,{'arithmeticMeanReturn':mean,'samePeriodRiskFreeReturn':rf,'samePeriodExcessReturnVolatility':sd,'periodsPerYear':periods},
        {'periodSharpe':period,'assumptionAnnualizedSharpe':period*mp.sqrt(periods)},'All rates are decimals for the same period. Constant same-period risk-free return. Annualization assumes zero serial correlation and stable moments.')
returns=[M('-.02'),M('.01'),M('.03'),M('0')];mean=mp.fsum(returns)/len(returns)
variance=mp.fsum((x-mean)**2 for x in returns)/(len(returns)-1);sd=mp.sqrt(variance)
period=mean/sd
add('sharpe-ratio','monthly-return-series',{'decimalMonthlyReturns':returns,'constantMonthlyRiskFreeReturn':'0','periodsPerYear':12},
    {'observations':4,'arithmeticMeanReturn':mean,'sampleExcessReturnVariance':variance,'sampleExcessReturnStdDev':sd,'periodSharpe':period,'assumptionAnnualizedSharpe':period*mp.sqrt(12)},
    'Use sample standard deviation (n-1) of excess returns. The square-root scaling is a stated assumption, not an exact compounded-return result.')
close(period*mp.sqrt(12),M(3)/mp.sqrt(13))

def bsm(s,k,r,q,sigma,t):
    s,k,r,q,sigma,t=map(M,[s,k,r,q,sigma,t]);spot=s*mp.exp(-q*t);strike=k*mp.exp(-r*t)
    if t==0: call=max(s-k,M(0));put=max(k-s,M(0))
    elif sigma==0: call=max(spot-strike,M(0));put=max(strike-spot,M(0))
    else:
        d1=(mp.log(s/k)+(r-q+sigma*sigma/2)*t)/(sigma*mp.sqrt(t));d2=d1-sigma*mp.sqrt(t)
        cdf=lambda x:mp.erfc(-x/mp.sqrt(2))/2
        call=spot*cdf(d1)-strike*cdf(d2);put=strike*cdf(-d2)-spot*cdf(-d1)
    close(call-put,spot-strike)
    assert call>=0 and put>=0
    return {'callPricePerShare':call,'putPricePerShare':put,'discountedSpot':spot,'discountedStrike':strike,'putCallParityDifference':spot-strike}

for label,values in [
    ('classic-no-dividend',['100','100','.05','0','.20','1']),
    ('continuous-dividend',['100','100','.05','.03','.20','1']),
    ('negative-continuous-interest',['100','110','-.02','.01','.30','2']),
    ('expiry-call-in-money',['120','100','.05','.03','.20','0']),
    ('expiry-put-in-money',['80','100','.05','.03','.20','0']),
    ('zero-volatility',['100','100','.05','.03','0','1'])
]:
    add('black-scholes',label,dict(zip(['spot','strike','annualContinuousRiskFreeRate','annualContinuousDividendYield','annualVolatility','years'],values)),
        bsm(*values),'European exercise; annual continuously compounded r and q; per-share model values; no American early exercise, discrete cash-dividend schedule or live quotes.')


fixtures=[]
for c in cases:
 topic=c['topic'];i=c['inputs'];e=c['expected'];label=c['case']
 if topic=='stock-split':
  mode='chain' if len(i['newForOld'])>1 else 'single'
  v=dict(shares=i['shares'],price=i['price'],average_cost=i['averageCost'])
  v.update({'splits':'\n'.join(f'{a}, {b}' for a,b in i['newForOld'])} if mode=='chain' else dict(new_shares=i['newForOld'][0][0],old_shares=i['newForOld'][0][1]))
  expected={'Theoretical shares after splits':e['sharesAfter'],'Proportional reference price per share':e['referencePriceAfter'],'Adjusted average acquisition cost per share':e['averageCostAfter'],'Total reference holding value':e['totalReferenceValue'],'Total acquisition cost preserved':e['totalAcquisitionCost']}
 elif topic=='customer-acquisition-cost':
  mode='itemized' if label=='itemized' else 'total';costs=i['nonoverlappingAcquisitionCosts'];v=dict(customers=i['uniqueNewCustomers'])
  v.update(dict(advertising=costs[0],people=costs[1],agency=0,software=0,other=costs[2]) if mode=='itemized' else dict(cost=sum(costs)))
  expected={'Acquisition cost per unique new customer':e['cac'],'Total acquisition cost included':e['totalCost']}
 elif topic=='dividend-discount-model':
  mode='two-stage' if label=='two-stage' else 'stable'
  if mode=='stable':v=dict(dividend=i['dividend'],growth=M(i['growth'])*100,required_return=M(i['requiredReturn'])*100,dividend_basis='Latest annual dividend (D0)' if i['basis']=='D0' else 'Next annual dividend (D1)')
  else:v=dict(dividend=i['latestDividend'],growth=M(i['terminalGrowth'])*100,required_return=M(i['annualRequiredReturn'])*100,early_growth=M(i['earlyGrowth'])*100,years=i['earlyYears'])
  expected={'Modeled dividend-discount value per share':e['modeledPresentValue']}
  if mode=='two-stage':expected.update({'Terminal price at end of early stage':e['terminalPriceAtYearN'],'PV of explicit early-stage dividends':e['pvEarlyDividends'],'PV of stable-stage terminal value':e['pvTerminalPrice']})
 elif topic=='earnings-per-share':
  mode='weighted-schedule' if label=='weighted-share-schedule' else 'known-average'
  v=dict(net_income=i['netIncome'],preferred_adjustment=i.get('enteredPreferredEarningsAdjustment',i.get('preferredEarningsAdjustment')))
  v.update(dict(period_days=365,share_schedule='\n'.join(f"{s['shares']}, {s['days']}" for s in i['segments'])) if mode=='weighted-schedule' else dict(average_shares=i['weightedAverageCommonShares']))
  expected={'Basic earnings per common share':e['basicEPS']}
  if mode=='weighted-schedule':expected['Weighted average common shares used']=e['weightedAverageCommonShares']
 elif topic=='sharpe-ratio':
  mode='return-series' if label=='monthly-return-series' else 'statistics'
  v=dict(risk_free=M(i.get('samePeriodRiskFreeReturn',i.get('constantMonthlyRiskFreeReturn')))*100,periods_per_year=i['periodsPerYear'])
  v.update(dict(returns=', '.join(str(M(n)*100) for n in i['decimalMonthlyReturns'])) if mode=='return-series' else dict(mean_return=M(i['arithmeticMeanReturn'])*100,std_dev=M(i['samePeriodExcessReturnVolatility'])*100))
  expected={'Sharpe ratio for one observation period':e['periodSharpe'],'Assumption-annualized Sharpe ratio':e['assumptionAnnualizedSharpe']}
 elif topic=='black-scholes':
  mode='european';v=dict(spot=i['spot'],strike=i['strike'],risk_free=M(i['annualContinuousRiskFreeRate'])*100,dividend_yield=M(i['annualContinuousDividendYield'])*100,volatility=M(i['annualVolatility'])*100,time_unit='Years',time=i['years'])
  expected={'European call theoretical value per share':e['callPricePerShare'],'European put theoretical value per share':e['putPricePerShare'],'Put-call parity residual per share':0}
 fixtures.append({'id':topic,'mode':mode,'title':label.replace('-',' ').capitalize(),'values':{k:str(v) for k,v in v.items()},'expected':clean(expected)})
gold=next(f for f in fixtures if f['id']=='black-scholes')
fixtures.append({**gold,'title':'Calendar-day conversion','values':{**gold['values'],'time_unit':'Calendar days / 365','time':'365'}})
assert len(fixtures)==24 and len({f['id']+':'+f['mode'] for f in fixtures})==11
output=ROOT/'docs/financial-clone/evidence/markets-six-reference-20261117.json'
output.write_text(json.dumps({'method':'Independent 80-digit mpmath arithmetic; Gaussian probabilities from erfc, separate from JavaScript adaptive-quadrature implementation.','precisionDigits':80,'fixtures':fixtures},indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'fixtures':len(fixtures),'modes':11,'path':str(output)}))
