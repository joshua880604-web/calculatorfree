import content from '@/lib/practical-guide-content.json';
import cases from '@/lib/remaining-tool-cases.json';
import {calculatorPresetHref} from '@/lib/preset-links';
import SiteLink from './SiteLink';
import './decision-guide.css';
export default function RemainingFinanceReference({id}:{id:string}){
 const rows=cases[id as keyof typeof cases];if(!rows)return null;
 const guide=content.find(g=>g.ids.includes(id));const path=guide?'/guides/'+guide.slug+'/':'/guides/compound-interest-with-monthly-contributions/';
 return <section aria-labelledby="practical-model-examples"><h2 id="practical-model-examples">Compare a baseline with one input change</h2><p>{guide?.answer??'Interest growth depends on contribution timing, compounding and the entered tax and inflation assumptions. The same growth method is explained in the linked compound-interest guide.'}</p><p>These are model-generated reproduction examples, not independent validation or real market results. Each link restores the complete case inputs. Review the full output and assumptions before comparing plans.</p><ul>{rows.map((r,i)=><li key={i}><SiteLink href={calculatorPresetHref(r.path,r.mode,r.values)}>{r.label}: reproduce {r.tool}</SiteLink></li>)}</ul><p><SiteLink href={path}>Read the method, examples and limitations →</SiteLink></p></section>;
}
