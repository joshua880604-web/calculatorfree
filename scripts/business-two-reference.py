"""Independent Decimal closed-form references. Run from repository root."""
import json
from decimal import Decimal as D,getcontext
getcontext().prec=65
p=D(250000);r=D('.10')/12;n=120
pay=p*r/(1-(1+r)**(-n))
def loan(p,annual,n,h):
 r=annual/12;pay=p/n if not r else p*r/(1-(1+r)**(-n))
 balance=p-pay*h if not r else p*(1+r)**h-pay*((1+r)**h-1)/r
 return pay,balance,pay*h+balance-p
bank=loan(D(500000),D('.065'),300,120)
cdc=loan(D(408000),D('.06'),300,300)
refs={'7a_payment':float(pay),'7a_total_interest':float(pay*n-p),'7a_fee':5625,'7a_net':243375,'inventory_turns':4,'inventory_dio':91.25,'quarterly_dio':22.5,'target_average':125000,'504_zero_bank_balloon':300000,'504_zero_monthly':3000,'504_financed_fee_monthly':float(D(500000)/300+D(408000)/300+50),'504_financed_total_cost':25000,'504_bank_payment':float(bank[0]),'504_bank_balloon':float(bank[1]),'504_bank_interest':float(bank[2]),'504_cdc_payment':float(cdc[0]),'504_cdc_interest':float(cdc[2]),'504_total_cost':float(bank[2]+cdc[2]+D(25000))}
print(json.dumps(refs,indent=2))
