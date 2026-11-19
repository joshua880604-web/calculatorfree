#!/usr/bin/env python3
"""Independent Decimal schedules for fixed-rate mortgage and housing scenarios."""
from decimal import Decimal,getcontext
from pathlib import Path
import json
getcontext().prec=70
D=lambda x:Decimal(str(x))
REFERENCE=Path(__file__).resolve().parents[1]/'docs/financial-clone/evidence/refinance-payoff-rentbuy-reference-20261119.json'
def payment(p,r,n):return p/D(n) if r==0 else p*r/(1-(1+r)**(-n))
def schedule(p,r,a,monthly=D(0),annual=D(0),once=D(0),once_month=1):
    balance=p;rows=[]
    while balance>D('1e-40'):
        month=len(rows)+1;interest=balance*r;extra=monthly+(annual if month%12==0 else 0)+(once if month==once_month else 0)
        paid=min(balance+interest,a+extra);reduction=paid-interest;balance-=reduction;rows.append([D(month),paid,interest,reduction,balance]);assert len(rows)<=12000
    return rows
def original_balance(v):
    p=D(v['principal']);r=D(v['rate'])/1200;n=int(D(v['years'])*12+D(v['months']));elapsed=int(v['elapsed']);a=payment(p,r,n)
    balance=p-a*elapsed if r==0 else p*(1+r)**elapsed-a*((1+r)**elapsed-1)/r
    return balance,a
def reference(calculator,mode,v):
    if calculator=='rent-vs-buy':
        assert D(v['tax_rate'])==0,'No tax-benefit assumptions are added by this review.'
        price=D(v['price']);down=price*D(v['down'])/100;p=price-down;r=D(v['rate'])/1200;n=int(D(v['years'])*12);a=payment(p,r,n)
        loan=schedule(p,r,a)if p else[];buy_initial=down+price*D(v['buy_closing'])/100;rent_initial=D(v['deposit'])+D(v['rental_costs'])
        portfolio=buy_initial-rent_initial;growth=(1+D(v['return'])/100)**(D(1)/12);buy_paid=buy_initial;rent_paid=rent_initial;balance=p;rows=[];cross=None;minimum_portfolio=portfolio
        for month in range(1,361):
            year=(month-1)//12;record=loan[month-1]if month<=len(loan)else None
            if record:balance=record[4]
            expense=(D(v['tax'])*(1+D(v['tax_growth'])/100)**year+sum(D(v[k])for k in ['insurance','hoa','maintenance'])*(1+D(v['cost_growth'])/100)**year)/12
            buy=(record[1]if record else D(0))+expense;rent=D(v['rent'])*(1+D(v['rent_growth'])/100)**year+D(v['renter_insurance'])*(1+D(v['cost_growth'])/100)**year/12
            portfolio=portfolio*growth+buy-rent;minimum_portfolio=min(minimum_portfolio,portfolio);buy_paid+=buy;rent_paid+=rent
            if month%12==0:
                year=month//12;equity=price*(1+D(v['appreciation'])/100)**year*(1-D(v['selling'])/100)-balance;wealth=portfolio+D(v['deposit'])
                if cross is None and equity>=wealth:cross=D(year)
                rows.append([D(year),equity,wealth,equity-wealth,buy_paid,rent_paid])
        metrics={'Buyer equity after 30 years':rows[-1][1],'Renter terminal wealth after 30 years':rows[-1][2]}
        if cross is not None:metrics['First year buying leads']=cross
        return metrics,rows,{'Buyer equity at year 10':rows[9][1],'Renter wealth at year 10':rows[9][2],'Buyer minus renter at year 10':rows[9][3],'Minimum modeled portfolio':minimum_portfolio}
    r=D(v['rate'])/1200
    if mode in ['original','known-normal']:balance,a=original_balance(v)
    else:balance=D(v['principal']);a=D(v['payment'])
    normal=schedule(balance,r,a);normal_interest=sum(row[2]for row in normal)
    if calculator=='mortgage-payoff':
        rows=schedule(balance,r,a,D(v.get('extra_monthly',0)),D(v.get('extra_yearly',0)),D(v.get('extra_once',0)),int(v.get('extra_once_month',1)))if mode=='remaining-extra'else normal
        interest=sum(row[2]for row in rows)
        return {'Current principal balance':balance,'Interest with strategy':interest,'Interest saved':normal_interest-interest,'Years to payoff':D(len(rows))/12},rows,{'Payments until payoff':D(len(rows)),'First scheduled outlay':rows[0][1]}
    cashout=D(v['cashout']);costs=D(v['fees'])+(balance+cashout)*D(v['points'])/100;p=balance+cashout+(costs if v['finance']=='Yes'else 0);new_a=payment(p,D(v['new_rate'])/1200,int(D(v['new_years'])*12));rows=schedule(p,D(v['new_rate'])/1200,new_a);reduction=a-new_a
    metrics={'New monthly payment':new_a,'Current monthly payment':a,'Monthly payment reduction':reduction,'Closing costs':costs,'Current future interest':normal_interest,'New total interest':sum(row[2]for row in rows)}
    if reduction>0:metrics['Simple closing-cost break-even (months)']=costs/reduction
    old_first=normal[:60];new_first=rows[:60];old_interest=sum(row[2]for row in old_first);new_interest=sum(row[2]for row in new_first)
    return metrics,rows,{'Current balance at month 60':old_first[-1][4],'New balance at month 60':new_first[-1][4],'Current payments through month 60':sum(row[1]for row in old_first),'New payments through month 60':sum(row[1]for row in new_first),'Five-year interest-plus-fee savings':old_interest-new_interest-costs,'New financed principal':p,'Cash received':cashout,'Upfront closing cash':costs if v['finance']=='No'else D(0)}

if __name__=='__main__':
    data=json.loads(REFERENCE.read_text());checks=0
    for case in data['cases']:
        metrics,rows,derived=reference(case['calculatorId'],case['mode'],case['values'])
        for key,value in case['expected'].items():assert abs(metrics[key]-D(value))<D('1e-35'),(case['label'],key);checks+=1
        for key in case['absentMetrics']:assert key not in metrics,(case['label'],key);checks+=1
        for key,value in case['derived'].items():assert abs(derived[key]-D(value))<D('1e-35'),(case['label'],key);checks+=1
        for selected in case['selectedRows']:
            for actual,expected in zip(rows[int(selected[0])-1],selected):assert abs(actual-D(expected))<D('1e-35'),case['label'];checks+=1
    print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
