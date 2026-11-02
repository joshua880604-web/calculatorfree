
import SiteLink from "@/components/SiteLink";
import {siteName} from "@/lib/site";
import {categoryNavigation,sidebarTools} from '@/lib/calculator-categories';
import ThemeChoices from "./ThemeChoices";
import FavoritesMenu from "./FavoritesMenu";
import MobileNavigation from "./MobileNavigation";
import CalculatorSearch from "./CalculatorSearch";
import SiteBenefits, { FreeBadge } from "./SiteBenefits";
import { calculators, routeFor } from "@/lib/calculators";
const primaryCategoryIds=['mortgage-housing','loans-debt','saving-investing','retirement'];
function NavigationMenu({label,id,links}:{label:string;id:string;links:{title:string;href:string}[]}){
  return <details className="nav-menu" name="desktop-navigation">
    <summary aria-controls={id}>{label}<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></summary>
    <div className="nav-panel" id={id}>{links.map(link=><SiteLink href={link.href} key={link.href}>{link.title}</SiteLink>)}</div>
  </details>;
}
export function Header() {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <SiteLink className="brand" href="/financial-calculator.html" aria-label={`${siteName} home`}>
            <svg className="calculator-mark" viewBox="0 0 32 36" width="32" height="36" aria-hidden="true" focusable="false">
              <rect width="32" height="36" rx="8" fill="#e5f3f0" />
              <rect x="6" y="6" width="20" height="6" rx="2" fill="#003b66" />
              <path d="M7 19h6m-3-3v6M7 28h6" fill="none" stroke="#003b66" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="16" width="9" height="15" rx="3" fill="#ffda78" />
              <path d="M20.5 22h4m-4 4h4" fill="none" stroke="#003b66" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="brand-wordmark"><span>Calculator</span><span className="brand-free">Free</span><span className="brand-domain">.io</span></span>
          </SiteLink>
          <MobileNavigation/>
          <div className="header-actions">
          <FavoritesMenu/>
          <details className="theme-menu theme-tools"><summary>Theme</summary><div className="theme-panel"><strong>Appearance</strong><ThemeChoices/><small>Saved in this browser.</small></div></details>
          <span className="header-description">
            <FreeBadge />
          </span>
          </div>
        </div>
      </header>
      <nav className="top-nav" aria-label="Main navigation">
        <div className="desktop-navigation">
          <SiteLink href="/financial-calculator.html">All calculators</SiteLink>
          {categoryNavigation.filter(link=>primaryCategoryIds.includes(link.id)).map(link=><SiteLink key={link.id} href={link.href}>{link.id==='mortgage-housing'?'Mortgages':link.title}</SiteLink>)}
          <NavigationMenu label="More" id="desktop-more-links" links={categoryNavigation.filter(link=>!primaryCategoryIds.includes(link.id))}/>
          <NavigationMenu label="Learn" id="desktop-learn-links" links={[{title:'Glossary',href:'/glossary/'},{title:'Guides',href:'/guides/'}]}/>
        </div>
      </nav>
    </>
  );
}
export function Sidebar({calculatorId,categoryId}:{calculatorId?:string;categoryId?:string}={}) {
  const context=sidebarTools(calculatorId,categoryId);
  const ids=context.ids;
  return (
    <aside className="sidebar">
      <CalculatorSearch id="sidebar-search" compact/>
      <SiteBenefits />
      <section className="side-group" aria-labelledby="side-financial-heading">
      <h2 className="side-heading" id="side-financial-heading">
        <SiteLink href={context.href}>{context.title}</SiteLink>
      </h2>
      <div className="side-links">
        {ids.map((id) => {
          const c = calculators.find((x) => x.id === id)!;
          return (
            <SiteLink key={id} href={routeFor(id)}>
              {c.title.replace(" Calculator", "")}
            </SiteLink>
          );
        })}
      </div>
      <SiteLink className="more-tools" href={context.href}>
        Browse all tools »
      </SiteLink>
      </section>
      <section className="side-group side-group-secondary" aria-labelledby="side-categories-heading">
      <h2 className="side-heading" id="side-categories-heading">Browse categories</h2>
      <nav className="side-category-links" aria-label="Calculator categories">{categoryNavigation.map(link=><SiteLink key={link.id} href={link.href}>{link.title}</SiteLink>)}</nav>
      </section>
      <div className="side-note">
        <h3>Plan with clear assumptions</h3>
        <p>
          Compare scenarios and review the formula, dates, and calculation
          details for each tool.
        </p>
      </div>
    </aside>
  );
}
export function Footer() {
  return (
    <footer>
      <div>
        <SiteLink href="/financial-calculator.html">All Financial Calculators</SiteLink>
        <span> · </span>
        <SiteLink href="/about.html">About</SiteLink>
        <span> · </span>
        <SiteLink href="/about#contact">Contact &amp; corrections</SiteLink>
        <span> · </span>
        <SiteLink href="/privacy.html">Privacy</SiteLink>
        <span> · </span>
        <SiteLink href="/disclaimer">Disclaimer</SiteLink>
        <span> · </span>
        <SiteLink href="/methodology.html">Methodology &amp; sources</SiteLink>
        <span> · </span>
        <SiteLink href="/methodology#editorial-policy">Authorship &amp; review</SiteLink>
        <span> · </span>
        <SiteLink href="/glossary/">Glossary</SiteLink>
        <span> · </span>
        <SiteLink href="/guides/">Guides</SiteLink>
        <span> · </span>
        <SiteLink href="/embed-resources">Embed calculators</SiteLink>
      </div>
      <p>
        © {new Date().getFullYear()} {siteName}. Independent planning
        tools.
      </p>
    </footer>
  );
}
