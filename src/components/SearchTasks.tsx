import { calculatorPresetHref } from '@/lib/preset-links';

import SiteLink from "@/components/SiteLink";
import { searchTasks } from '@/lib/keyword-targets';
import {motherPageCopy} from '@/lib/mother-page-ui';
import { routeFor } from '@/lib/catalog';
import focusedTasks from '@/lib/focused-calculation-tasks.json';
export default function SearchTasks({id}:{id:string}) {
 const tasks=searchTasks[id];
 if(!tasks||motherPageCopy[id])return null;
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
