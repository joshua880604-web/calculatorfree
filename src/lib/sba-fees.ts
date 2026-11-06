// Isolated standard 7(a) loans only, without relief or related 90-day loans.
// SBA Information Notice 5000-881797, effective 2026-10-01 through 2027-09-30.
export const sbaFeeSource='https://legacy.sba.gov/document/information-notice-5000-881797-fy-2027-7a-program-fees';
export function standard7aFee(gross:number,months:number,approval:string){
 const day=Date.parse(approval+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(approval)||!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==approval)throw Error('Enter a valid SBA approval date.');
 if(approval<'2026-10-01'||approval>'2027-09-30')throw Error('Automatic fees support FY2027 approvals only (October 1, 2026 through September 30, 2027). Use a lender-confirmed fee for other dates.');
 if(!Number.isFinite(gross)||gross<=0||gross>5000000||!Number.isInteger(months)||months<1||months>300)throw Error('Use a gross loan above zero and at most $5 million with a whole-month term from 1 to 300.');
 const guaranteed=gross*(gross<=150000?.85:.75);
 const fee=months<=12?guaranteed*.0025:gross<=150000?guaranteed*.02:gross<=700000?guaranteed*.03:Math.min(guaranteed,1000000)*.035+Math.max(0,guaranteed-1000000)*.0375;
 return {guaranteed,fee};
}
