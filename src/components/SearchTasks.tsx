import { calculatorPresetHref } from '@/lib/preset-links';

import SiteLink from "@/components/SiteLink";
import { searchTasks } from '@/lib/keyword-targets';
import {motherPageCopy} from '@/lib/mother-page-ui';
import { routeFor } from '@/lib/catalog';
import focusedTasks from '@/lib/focused-calculation-tasks.json';
import './repayment-help.css';

const repaymentChoices = {
 'amortization': {
  heading: 'Choose a loan repayment calculation',
  current: 'Use this amortization schedule to follow monthly principal, interest and balance, including entered extra principal.',
  links: [
   { id: 'mortgage', label: 'Include property tax and insurance', description: 'Use Mortgage Calculator to include entered housing costs alongside the loan payment.' },
   { id: 'mortgage-payoff', label: 'Compare paying off a mortgage early', description: 'Compare repayment with and without extra principal.' },
   { path: '/guides/how-to-read-amortization-and-loan-payments/', label: 'Understand the amortization formula', description: 'Work through the fixed-rate payment equation and the first schedule row.' },
  ],
 },
 'credit-card-minimum-payment': {
  heading: 'Choose a credit card repayment calculation',
  current: 'Use this calculator for a minimum that is recalculated each month, with an optional fixed extra amount above it.',
  links: [
   { id: 'credit-card', label: 'Keep a fixed total monthly payment', description: 'Use Credit Card Payoff Calculator to estimate a payoff date or solve for a payment.' },
   { id: 'credit-cards-payoff', label: 'Plan payments across several cards', description: 'Enter individual card balances, APRs and minimum payments.' },
   { path: '/guides/credit-card-minimum-payment-and-payoff-time/', label: 'Compare minimum-only and fixed payments', description: 'See why the same first payment can lead to different later payments and payoff times.' },
  ],
 },
} as const;

export default function SearchTasks({id}:{id:string}) {
 if (id === 'amortization' || id === 'credit-card-minimum-payment') {
  const choice = repaymentChoices[id];
  return <section className="search-tasks repayment-task-links" aria-label="Choose a repayment calculation">
   <h2>{choice.heading}</h2><p>{choice.current}</p>
   <ul>{choice.links.map(link => <li key={link.label}>
    <SiteLink href={'id' in link ? routeFor(link.id) : link.path}>{link.label}</SiteLink>: {link.description}
   </li>)}</ul>
  </section>;
 }
 const tasks=searchTasks[id];
 if(!tasks||(motherPageCopy[id]&&!Object.hasOwn(focusedTasks,id)))return null;
 return <section className="search-tasks" aria-label="Choose a calculation">
  <h2>Choose what to calculate</h2>
  {tasks.map(task=>{
   const href=calculatorPresetHref(routeFor(id),task.mode,task.values);
   return <div key={task.keyword}><h3>{task.keyword}</h3><p>{task.description}</p>
    {!Object.hasOwn(focusedTasks,id)&&task.aliases?.length ? <p>Related searches: {task.aliases.map((keyword,index)=><span key={keyword}>{index>0?' · ':''}<SiteLink href={href}>{keyword}</SiteLink></span>)}</p>:null}
    <SiteLink href={href}>Open this calculation</SiteLink></div>;
  })}
 </section>;
}
