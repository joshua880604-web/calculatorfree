import SiteLink from "@/components/SiteLink";
import DirectoryReading from './DirectoryReading';

import {directoryGroups,directoryGroup,directorySort} from "@/lib/directory";
import {categoryPaths,categoryHref} from '@/lib/calculator-categories';
import CategoryToolList from './CategoryToolList';
import QuickCalculator from "./QuickCalculator";
import CalculatorSearch from "./CalculatorSearch";
import SiteBenefits, { FreeBadge } from "./SiteBenefits";
import { calculators, routeFor } from "@/lib/catalog";

const featured = [
  ["mortgage", "Estimate your monthly payment"],
  ["compound-interest", "See how your savings can grow"],
  ["coast-fire", "Find your Coast FIRE number"],
  ["loan", "Compare payments and interest"],
  ["roi", "Compare investment returns"],
  ["retirement", "Plan your retirement savings"],
];
export default function Directory({ propertyOnly = false }: { propertyOnly?: boolean }) {
  const searchable=calculators.filter(c=>!propertyOnly||directoryGroup(c.id)==="mortgage-housing");
  const tools=searchable.filter(c=>c.id!=="real-estate");
  const groups=directoryGroups.map(g=>({...g,tools:directorySort(tools.filter(c=>directoryGroup(c.id,c.category)===g.id),g.popular)})).filter(g=>g.tools.length);
  return (
    <div className="calculator-directory">
      <p className="directory-intro">{propertyOnly
        ? "Calculators for mortgages, property investment, and home ownership."
        : "Find the right tool for your loans, savings, retirement, taxes, and everyday calculations."}</p>
      <div className={propertyOnly ? undefined : "directory-tools"}>
      <CalculatorSearch id="directory-search" {...(propertyOnly ? {tools:searchable} : {})} minimal={!propertyOnly}/>
      {!propertyOnly&&<div className="directory-quick"><QuickCalculator/></div>}
      {!propertyOnly && <section className="featured-tools" aria-labelledby="featured-heading">
        <div className="benefits-mobile-badge"><FreeBadge /></div>
        <h2 id="featured-heading">Featured financial calculators</h2>
        <div className="featured-grid">{featured.map(([id, description]) => {
          const calculator = calculators.find(c => c.id === id)!;
          return <SiteLink key={id} href={routeFor(id)}><strong>{calculator.title}</strong><span>{description}</span></SiteLink>;
        })}</div>
        <SiteBenefits showMobileBadge={false} />
      </section>}
      </div>
      {!propertyOnly&&<aside className="directory-publisher-callout" aria-labelledby="publisher-callout-heading">
        <div><h2 id="publisher-callout-heading">For writers &amp; bloggers</h2><p>Add a free, ad-free calculator to your website.</p></div>
        <SiteLink href="/embed-resources">Browse embeddable calculators →</SiteLink>
      </aside>}
      {groups.length > 1 && <nav className="directory-categories" aria-label="Calculator categories">
        <span>Browse by category</span>
        <div>{groups.map(({ id, title, tools }) => <SiteLink href={"#" + id} key={id}>{title}<span>{tools.length}</span></SiteLink>)}</div>
      </nav>}
      <div className="directory-list-heading"><h2>All calculators</h2></div>
      <div className="directory-grid" id="calculator-list">
        {groups.map(group => { const {id,title,tools}=group; return <section key={id} id={id} aria-labelledby={id + "-heading"} tabIndex={-1}>
          {group.aliases.map(anchor=><span key={anchor} id={anchor} aria-hidden="true"/>)}
          <h3 id={id + "-heading"}>{categoryPaths[id]?<SiteLink href={categoryHref(id)}>{title}</SiteLink>:title}<span>{tools.length}</span></h3>
          <CategoryToolList group={group} tools={tools}/>
          {categoryPaths[id]&&<SiteLink className="category-overview" href={categoryHref(id)}>Browse {title.toLowerCase()} tools »</SiteLink>}
        </section>; })}
      </div>
      {!propertyOnly&&<DirectoryReading/>}
    </div>
  );
}
