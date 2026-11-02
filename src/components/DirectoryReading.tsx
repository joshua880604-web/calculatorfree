import SiteLink from './SiteLink';
import {editorialGuides} from '@/lib/editorial-guides';
import {routeFor} from '@/lib/catalog';
import './directory-reading.css';

const selections=[
 {path:'/guides/how-to-calculate-monthly-mortgage-payment/',id:'mortgage',label:'Mortgage Calculator'},
 {path:'/guides/how-to-calculate-coast-fire/',id:'coast-fire',label:'Coast FIRE Calculator'},
 {path:'/guides/how-to-calculate-rental-property-cash-flow/',id:'rental-property',label:'Rental Property Calculator'},
];

export default function DirectoryReading(){
 return <div className="directory-reading">
  <section aria-labelledby="directory-guides-heading">
   <div className="directory-reading-heading"><h2 id="directory-guides-heading">Practical financial guides</h2><SiteLink href="/guides/">Browse all guides →</SiteLink></div>
   <p className="directory-reading-intro">Work through an example, check the assumptions, then try your own numbers in the matching calculator.</p>
   <div className="directory-guide-cards">{selections.map(selection=>{
    const guide=editorialGuides.find(item=>item.path===selection.path);
    if(!guide)throw new Error('Missing homepage guide: '+selection.path);
    return <article key={guide.path}>
     <h3><SiteLink href={guide.path}>{guide.heading}</SiteLink></h3>
     <p>{guide.cardIntro}</p>
     <SiteLink className="directory-guide-tool" href={routeFor(selection.id)}>Try the {selection.label} →</SiteLink>
    </article>;
   })}</div>
  </section>
  <section className="directory-about" aria-labelledby="directory-about-heading">
   <h2 id="directory-about-heading">About CalculatorFree.io</h2>
   <p>CalculatorFree.io provides free financial calculators for people comparing a mortgage, evaluating a rental property, or planning savings and retirement. Explore monthly housing costs, debt payoff strategies, investment growth and FIRE milestones without creating an account. Start with the decision you need to make: a lower monthly payment, enough cash to cover a rental’s expenses, or a portfolio that could support your retirement budget.</p>
   <p>A result is more useful when you can see what drives it. Our tools include editable assumptions, calculation explanations, worked examples and source references. Supported tools also provide schedules, scenario comparisons and exports. Change one assumption at a time to understand its effect, and check each tool’s scope, rule year and exclusions. Examples illustrate the model under stated inputs; they are not forecasts. Read our <SiteLink href="/methodology">methodology and checking limitations</SiteLink>.</p>
   <p>Calculations run in your browser, and the site does not save your inputs to a user account. Shared links and exports can contain values you choose to include; favorites, theme preferences and advertising have separate <SiteLink href="/privacy">privacy details</SiteLink>. Many tools use U.S. financial rules, with their applicable scope stated on the page. Results are educational estimates, not personalized financial, investment or tax advice. Read the <SiteLink href="/disclaimer">disclaimer</SiteLink> and use our <SiteLink href="/about#contact">contact and corrections channel</SiteLink> to report a problem.</p>
  </section>
 </div>;
}
