"""Independent Decimal fixtures. No TypeScript calculator is imported or executed."""
from decimal import Decimal as D, localcontext
from pathlib import Path
import json, hashlib
ROOT=Path(__file__).resolve().parents[1]
fixtures=[]
def case(tool,mode,values,expected,title):
    fixtures.append(dict(id=tool,mode=mode,values=values,expected={k:str(v) for k,v in expected.items()},title=title))
with localcontext() as ctx:
    ctx.prec=60
    p=D(300000);r=D('0.07')/12;n=360
    # Present-value series for the contract, separate from production's expm1 payment formula.
    full=p/sum((1+r)**(-k) for k in range(1,n+1))
    for plan,rates in [('2-1',[5,6]),('3-2-1',[4,5,6]),('1-0',[6]),('1-1',[6,6])]:
        pays=[p/sum((1+D(a)/1200)**(-k) for k in range(1,n+1)) for a in rates]
        subsidy=sum(12*(full-x) for x in pays)
        case('mortgage-buydown',plan,dict(principal=300000,rate=7,months=360),{'First-year borrower monthly P&I':pays[0],'Contract monthly P&I at note rate':full,'Total temporary subsidy funding':subsidy},plan+' payments at original principal and term')
    for s in [0,45,50,60]:
        net=D('2.5')*200-4
        case('cash-secured-put','expiration',dict(strike=50,premium=2.5,contracts=2,multiplier=100,fees=4,stock=s),{'Modeled expiration profit / loss':net-max(D(50-s),D(0))*200,'Expiration breakeven per share':D(50)-net/200,'Maximum expiration loss at zero stock price':10000-net},'Expiration stock '+str(s))
    case('profitability-index','known-pv',dict(initial=10000,pv=12000),{'Profitability index':D('1.2'),'Net present value':2000},'Already discounted future PV')
    for frequency,peryear in [('Annual',1),('Quarterly',4),('Monthly',12)]:
        pv=sum(D(4000)/(D('1.1')**(D(k)/peryear)) for k in range(1,4))
        case('profitability-index','periodic',dict(initial=10000,flows='4000\n4000\n4000',frequency=frequency,rate=10),{'Profitability index':pv/10000,'Net present value':pv-10000},frequency+' future flows start after time zero')
    for initial,future in [(1000,1500),(10000,13000)]:
        pv=D(future)/D('1.1')
        case('profitability-index','periodic',dict(initial=initial,flows=str(future),frequency='Annual',rate=10),{'Profitability index':pv/initial,'Net present value':pv-initial},'Project size '+str(initial))
    for mode,values in [('average',dict(equity=1250000)),('balances',dict(begin_equity=1000000,end_equity=1500000)),('dupont',dict(equity=1250000,sales=2000000,assets=2500000))]:
        for income in [200000,-200000]:
            case('return-on-equity',mode,dict(income=income,**values),{'Return on equity':D(income)/1250000*100},mode+' income '+str(income))
    tables=json.loads((ROOT/'src/lib/sepp-tables.json').read_text());mort=tables['mortality']
    assert len(mort)==121 and len(tables['singleLife'])==121
    assert tables['singleLife']['50']==36.2 and tables['singleLife']['51']==35.3
    assert mort['50']==.001656 and mort['120']==.4
    base=dict(birth='1973-08-15',start='2023-12-01',valuation='2022-12-31',balance=400000)
    period=D('36.2')
    case('72t','rmd',base,{'Estimated first-year annual SEPP amount':D(400000)/period},'IRS age-50 first-year RMD method')
    for rate in [D(0),D('.04'),D('.05')]:
        factor=period if rate==0 else (1-(1+rate)**(-period))/rate
        case('72t','amortization',dict(base,rate=float(rate*100),afr_prior=0,afr_second=0),{'Estimated first-year annual SEPP amount':D(400000)/factor,'Calculation divisor / annuity factor':factor},'Fixed amortization rate '+str(rate))
        # Backward actuarial recursion, independent from production's forward survival sum.
        factor=D(0)
        for age in range(119,49,-1):
            q=D(str(mort[str(age)]));factor=(1-q)*(1+factor)/(1+rate)
        case('72t','annuitization',dict(base,rate=float(rate*100),afr_prior=0,afr_second=0),{'Estimated first-year annual SEPP amount':D(400000)/factor,'Calculation divisor / annuity factor':factor},'Mortality annuity-immediate rate '+str(rate))
        if rate==D('.04'):
            assert abs(factor-D('18.1568'))<D('.00005')
            assert abs(D(400000)/factor-D(22030))<D('.5')
    assert abs(D(400000)/((1-D('1.04')**(-period))/D('.04'))-D(21102))<D('.5')
out=ROOT/'docs/financial-clone/evidence/finance-next-five-decimal-20261117.json'
out.write_text(json.dumps(dict(precision=60,generatedOn='2026-11-17',method='Independent Python Decimal; mortgage PV sum; SEPP annuity backward recursion; IRS rounded example reconciliation',tableSHA256=hashlib.sha256((ROOT/'src/lib/sepp-tables.json').read_bytes()).hexdigest(),fixtures=fixtures),indent=2)+'\n')
print(json.dumps(dict(file=str(out),cases=len(fixtures),modes=len({(x['id'],x['mode']) for x in fixtures}))))
