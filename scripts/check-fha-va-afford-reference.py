#!/usr/bin/env python3
"""Independent Decimal references using the documented FHA/VA model terms."""
from decimal import Decimal,getcontext,ROUND_HALF_UP
from pathlib import Path
import json
getcontext().prec=70
D=lambda x:Decimal(str(x))
REFERENCE=Path(__file__).resolve().parents[1]/'docs/financial-clone/evidence/fha-va-afford-reference-20261119.json'
def cents(value):return value.quantize(D('.01'),rounding=ROUND_HALF_UP)
def installment(p,r,n):return p/D(n) if r==0 else p*r/(1-(1+r)**(-n))

def reference(calculator,mode,v):
    if calculator=='house-affordability':
        income=D(v.get('income',0))/12
        budget=min(income*D(v['front'])/100,income*D(v['back'])/100-D(v['debt'])) if mode=='income' else D(v['budget'])
        factor=installment(D(1),D(v['rate'])/1200,int(D(v['years'])*12))
        fraction=D(v['down'])/100 if v['down_unit']=='Percent' else D(0)
        cash=D(v['down']) if v['down_unit']=='Dollars' else D(0)
        variable=D(0);fixed=D(0)
        for key,unit,annual in [('tax_rate','tax_unit',True),('insurance','insurance_unit',True),('hoa','hoa_unit',False),('maintenance','maintenance_unit',True)]:
            if v[unit].startswith('Percent'):variable+=D(v[key])/1200
            else:fixed+=D(v[key])/(12 if annual else 1)
        price=(budget-fixed+factor*cash)/(factor*(1-fraction)+variable)
        down=price*fraction+cash;loan=price-down
        return {'Estimated home price':price,'Down payment':down,'Loan amount':loan,'Monthly housing budget':budget},[],{'Other monthly housing costs':price*variable+fixed,'Monthly principal and interest':loan*factor}
    price=D(v['price']);down=price*D(v['down'])/100 if v['down_unit']=='Percent' else D(v['down']);base=price-down
    n=int(D(v['years'])*12+D(v['months']));r=D(v['rate'])/1200;is_fha=calculator=='fha-loan'
    if is_fha:
        assert v['mip_method']=='Automatic','Reference is scoped to the published automatic ordinary-loan cases.'
        value=min(price,D(v['appraised_value'])) if v['appraised_value'] else price;ltv=base/value
        annual=(D('.50') if ltv<=D('.95') else D('.55')) if n>180 else (D('.15') if ltv<=D('.90') else D('.40'))
        assert base<=D(726200),'Published cases stay within the lower loan-amount row.'
        insured=min(132,n) if ltv<=D('.90') else n;fee=cents(base*D('.0175'));financed=True
    else:
        tier=D(0) if v['exempt']=='Yes' else D('.0125') if down/price>=D('.10') else D('.015') if down/price>=D('.05') else D('.033') if v['repeat']=='Yes' else D('.0215')
        fee=base*tier;financed=v['fee_treatment']=='Finance fee'
    p=base+(fee if financed else 0);a=installment(p,r,n);premiums=[D(0)]*n
    if is_fha:
        # Published HUD method: original scheduled opening balances and stepwise cents rounding.
        balance=cents(p);rounded_payment=cents(a)
        for start in range(0,n,12):
            opening=[]
            for offset in range(12):
                if start+offset>=n:break
                opening.append(balance);interest=cents(cents(balance*D(v['rate']))/1200);balance=cents(max(D(0),balance+interest-rounded_payment))
            premium=cents(cents(cents(sum(opening)/12*annual/100)/D('1.0175'))/12)
            for month in range(start,min(start+12,n,insured)):premiums[month]=premium
    balance=p;rows=[];total_cost=D(0)
    while balance>D('1e-40'):
        i=len(rows);interest=balance*r
        extra=D(v['extra_monthly']) if i+1>=int(v['extra_start']) else D(0)
        if i+1>=int(v['extra_yearly_start']) and (i+1-int(v['extra_yearly_start']))%12==0:extra+=D(v['extra_yearly'])
        if i+1==int(v['extra_once_month']):extra+=D(v['extra_once'])
        assert not v['dated'],'No dated extra schedules are added by this content review.'
        paid=min(balance+interest,a+extra);principal=paid-interest;balance-=principal;year=i//12
        costs=sum((price*D(v[key])/100 if v[key+'_unit']=='Percent of home value' else D(v[key]))*(1+D(v[key+'_growth'])/100)**year/12 for key in ['tax','insurance','hoa','other'])+premiums[i]
        total_cost+=costs;rows.append([D(i+1),paid,interest,principal,balance,costs,paid+costs,*([premiums[i]]if is_fha else[])])
        assert len(rows)<=n
    result={'Monthly principal & interest':a,'Initial monthly total':rows[0][6],'Down payment':down,'Financed loan amount':p,'Upfront fee':fee,'Total interest':sum(row[2]for row in rows),'Total payments':sum(row[1]for row in rows),'Number of payments':D(len(rows)),'Total taxes and other costs':total_cost,'Total out of pocket':down+(D(0)if financed else fee)+sum(row[6]for row in rows)}
    if is_fha:result.update({'Annual FHA MIP rate':annual,'FHA loan-to-value ratio':ltv*100,'FHA MIP duration in years':D(insured)/12,'Initial monthly FHA MIP':premiums[0],'Total FHA MIP':sum(row[7]for row in rows)})
    return result,rows,{}

if __name__=='__main__':
    data=json.loads(REFERENCE.read_text());checks=0
    for row in data['cases']:
        metrics,rows,derived=reference(row['calculatorId'],row['mode'],row['values'])
        for key,value in row['expected'].items():assert abs(metrics[key]-D(value))<D('1e-35'),(row['label'],key);checks+=1
        for key,value in row['derived'].items():assert abs(derived[key]-D(value))<D('1e-35'),(row['label'],key);checks+=1
        for selected in row['selectedRows']:
            for actual,expected in zip(rows[int(selected[0])-1],selected):assert abs(actual-D(expected))<D('1e-35'),row['label'];checks+=1
    print(json.dumps({'passed':True,'cases':len(data['cases']),'numericChecks':checks,'decimalPrecision':70}))
