"""Independent high-precision closed-form references for four comparison tools.
Run: python scripts/four-comparison-reference.py
"""
import json
from decimal import Decimal as D,getcontext
getcontext().prec=65
P=D(300000);r=D('0.065')/12;n=360;h=60
payment=P*r/(1-(1+r)**(-n));bal=P*(1+r)**h-payment*((1+r)**h-1)/r
carP=D(30000);cr=D('.06')/12;cp=carP*cr/(1-(1+cr)**(-60));cb=carP*(1+cr)**36-cp*((1+cr)**36-1)/cr
refs={'mortgage':{'payment':float(payment),'balance':float(bal),'interest':float(payment*h+bal-P)},'car':{'payment':float(cp),'balance':float(cb),'netCost':float(D(8000)+cp*36+D(7200)-D(23000)+cb)},'mixedLadderWealth':float(D(1000)*D('1.04')*D('1.06')**2+D(2000)*D('1.05')**2*D('1.06')),'npvAnnual':float(-D(10000)+sum(D(4000)/D('1.1')**i for i in range(1,4)))}
print(json.dumps(refs,indent=2))
