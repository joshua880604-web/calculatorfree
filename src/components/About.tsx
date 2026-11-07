import ContactEmail from './ContactEmail';
import {publisherName,aboutPublisherSchema} from '@/lib/content-transparency';
import {serializeSchema} from '@/lib/site';
import SiteLink from './SiteLink';
import {siteName} from '@/lib/site';

export default function About() {
  return <article className="about-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeSchema(aboutPublisherSchema())}}/>
    <section aria-labelledby="publisher"><h2 id="publisher">Who publishes this site</h2>
    <p>{publisherName} is the publishing identity for this website. Calculator explanations and guides are attributed to the site. That attribution identifies the publisher; it does not represent an individual professional qualification, a financial-adviser license or an independent review.</p>
    <p>AI tools assist drafting and implementation. We document the calculation methods, example inputs, source references and limitations so readers can inspect what a result means. Read our <SiteLink href="/methodology#editorial-policy">authorship, checking and review policy</SiteLink> for the distinction between arithmetic checks and professional review.</p></section>
    <p>{siteName} provides free, independent financial calculators in English, with a focus on everyday financial decisions in the United States. Our tools help you explore borrowing costs, savings goals, investment assumptions, retirement planning and selected tax scenarios before making a decision.</p>
    <h2>Understand the numbers behind a decision</h2>
    <p>A useful estimate explains what goes into it. Our calculators show their inputs, assumptions and results, with formulas, worked examples and schedules where applicable. You can compare scenarios, inspect how interest or repayments change over time, and export supported results as a CSV or PNG. The <SiteLink href="/glossary/">financial glossary</SiteLink> explains terms used throughout the tools.</p>
    <p>Start with <SiteLink href="/real-estate-calculator.html">Mortgage &amp; Housing</SiteLink>, <SiteLink href="/loan-calculators.html">Loans &amp; Debt</SiteLink> or <SiteLink href="/savings-investment-calculators.html">Savings &amp; Investing</SiteLink>, or browse <SiteLink href="/financial-calculator.html">all calculators</SiteLink> to find a specific task.</p>
    <h2>U.S. scope and clearly stated assumptions</h2>
    <p>Mortgage insurance, federal taxes and retirement rules depend on the details of the selected calculator. Each tool explains its supported scope and important exclusions. Check the stated tax year, data date, payment frequency and rate convention before using a result. Tools for general mathematics or other tax systems, including VAT, have their own scope; their availability does not imply that those rules apply throughout the United States.</p>
    <p>Starting rates, prices and investment returns are editable illustrations. They are not current lender offers or forecasts. Currency conversion uses a manually entered rate or a bundled, dated reference snapshot rather than a live exchange-rate feed.</p>
    <h2>Calculation methods and sources</h2>
    <p>Our <SiteLink href="/methodology.html">calculation methodology</SiteLink> describes model checks, data versions, rounding and known limitations. Individual pages link to relevant sources, including IRS, TreasuryDirect, SSA, HUD, VA and BLS where applicable. Mathematical checks and worked examples help make the assumptions inspectable; they do not establish coverage of every financial product, tax exception or personal circumstance.</p>
    <p>You can also inspect the <SiteLink href="https://github.com/joshua880604-web/calculatorfree/tree/static-preview-20261021">public implementation and tests</SiteLink>. When comparing a result, record the calculator, mode and inputs, then check its assumptions against your statement, contract or official guidance.</p>
    <section aria-labelledby="contact"><h2 id="contact">Contact &amp; corrections</h2>
    <p>Questions, broken tools or a result that looks wrong? Email <ContactEmail/>. You do not need a GitHub account to contact us.</p>
    <p>Include the page URL, calculator mode, non-sensitive example inputs, the result you received and the result you expected. For a rule or formula correction, include the supporting source; for a display problem, include your browser and device. See our <SiteLink href="/methodology#corrections">correction process</SiteLink>.</p>
    <p>Please do not send account numbers, Social Security numbers, tax returns or other sensitive financial records. The email link opens your email application; nothing is sent automatically. This channel is for website feedback, not personal financial advice.</p></section>
    <h2>Your inputs and sharing choices</h2>
    <p>No account is required. Interactive calculations run in your browser, and the application does not provide persistent storage of your calculation inputs. Tool links exclude inputs by default. If you choose to include them, recipients can read those values in the shared link; exported summaries and images also contain result amounts. Share only information you intend others to see.</p>
    <p>The site uses Google AdSense advertising, which may involve cookies and third-party data processing. Read the <SiteLink href="/privacy.html">privacy notice</SiteLink> for advertising and sharing details.</p>
    <h2>Use estimates as a starting point</h2>
    <p>Results are educational estimates, not personalized financial, investment, legal or tax advice. Actual lender charges, insurance quotes, tax treatment and account rules may differ. Review the tool-specific disclaimer and confirm material decisions with the relevant provider, official source or qualified professional.</p>
  </article>;
}
