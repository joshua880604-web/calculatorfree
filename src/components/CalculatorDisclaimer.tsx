
import SiteLink from "@/components/SiteLink";
import disclaimers from '@/lib/calculator-disclaimers.json';
export default function CalculatorDisclaimer({id}:{id:string}) {
  const text=disclaimers[id as keyof typeof disclaimers];
  if(!text)throw new Error('Missing calculator disclaimer: '+id);
  return <aside className="calculator-disclaimer" aria-labelledby="calculator-disclaimer-heading">
    <h2 id="calculator-disclaimer-heading">Important information &amp; limitations</h2>
    <p>{text}</p>
    <p className="disclaimer-purpose">For educational and planning purposes only. Results are not professional advice or a substitute for official records, applicable rules or contractual terms. <SiteLink href="/methodology.html">Review our methodology and sources</SiteLink>. Read our <SiteLink href="/disclaimer">financial disclaimer</SiteLink>.</p>
  </aside>;
}
