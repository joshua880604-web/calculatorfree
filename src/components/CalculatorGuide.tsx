import DiscountReference from './DiscountReference';
import InterestRateReference from './InterestRateReference';
import PmiRateReference from './PmiRateReference';
import SourceReferences from './SourceReferences';
import RemainingFinanceReference from './RemainingFinanceReference';
import LoanCostReference,{loanCostComparisonTitle} from './LoanCostReference';
import HouseIncomeReference from './HouseIncomeReference';
import ContentReviewNotice from './ContentReviewNotice';
import BlogSnippetLink from './BlogSnippetLink';
import {hasBlogSnippetKit} from '@/lib/blog-snippet-access';
import {motherPageCopy} from '@/lib/mother-page-ui';
import RmdReference from './RmdReference';
import { calculatorPresetHref } from '@/lib/preset-links';

import SiteLink from "@/components/SiteLink";
import guideInsights from "@/lib/guide-insights.json";
import type { Calculator } from "@/lib/types";
import { routeFor } from "@/lib/calculators";
import { guides, notesCheckedOn } from "@/lib/guides";
import GlossaryLinks from './GlossaryLinks';
import RoiReference from './RoiReference';
import { longTailHref } from '@/lib/long-tail-content';
import GuideDisclosure from './GuideDisclosure';
import {compactReadingIds,compactReadingLeadExamples,compactReadingSections} from '@/lib/compact-reading';
import './compact-reading.css';
export default function CalculatorGuide({
  calculator,
}: {
  calculator: Calculator;
}) {
  const guide = guides[calculator.id];
  const insight = guideInsights[calculator.id as keyof typeof guideInsights];
  const checkedOn = guide?.checkedOn ?? notesCheckedOn;
  const compact=compactReadingIds.includes(calculator.id);
  const sections=compactReadingSections[calculator.id]??{};
  const selective=Object.values(sections).some(Boolean);
  const foldExamples=compact||sections.examples;
  const foldQuestions=compact||sections.questions;
  const leadIndex=compactReadingLeadExamples[calculator.id]??0;
  const examples=foldExamples&&leadIndex>0&&guide?.examples[leadIndex]
    ? [guide.examples[leadIndex],...guide.examples.filter((_,index)=>index!==leadIndex)] : guide?.examples;
  const workedExamples=examples?.map((example)=><section className="worked-example" key={example.title}>
    <h3>{example.title}</h3><p>{example.inputs}</p>
    <ol>{example.steps.map(step=><li key={step}>{step}</li>)}</ol>
    <p><strong>{example.answer}</strong></p>
    <SiteLink href={calculatorPresetHref(routeFor(calculator.id),example.mode,example.values)}>Try these inputs</SiteLink>
  </section>);
  return (
    <section className={"calculator-guide"+(motherPageCopy[calculator.id]?" mother-page-guide":"")+(compact||selective?" compact-reading":"")} data-reading-layout={compact?'compact':selective?'selective':undefined} aria-label="Calculation guide">
      {guide && (
        <>
          <nav className="guide-nav" aria-label="Calculation guide sections">
            {insight && <SiteLink href="#reading-results">Reading results</SiteLink>}
            {insight && <SiteLink href="#compare-scenarios">Compare scenarios</SiteLink>}
            {calculator.id === "roi" && <SiteLink href="#roi-formulas">ROI formulas</SiteLink>}
            <SiteLink href="#worked-examples">Examples</SiteLink><SiteLink href="#common-questions">Questions</SiteLink>
            <SiteLink href="#scope-assumptions">Assumptions</SiteLink><SiteLink href="#sources">Sources</SiteLink>
            {hasBlogSnippetKit(calculator.id)&&<BlogSnippetLink>For writers &amp; bloggers</BlogSnippetLink>}
          </nav>
          <ContentReviewNotice/>
          <h2>Understanding this calculation</h2>
          <p>{insight?.answer ?? guide.summary}</p>
          <GlossaryLinks id={calculator.id}/>
          {insight && <>
            <h2 id="reading-results">Reading your result</h2>
            {compact?<GuideDisclosure title="View result definitions"><dl className="result-definitions">{insight.results.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.meaning}</dd></div>)}</dl></GuideDisclosure>:<dl className="result-definitions">{insight.results.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.meaning}</dd></div>)}</dl>}
            <h2 id="compare-scenarios">Compare two scenarios</h2>
            {compact?<GuideDisclosure title="View comparison steps and checks"><ol>{insight.compare.map(step=><li key={step}>{step}</li>)}</ol><h3>Check before comparing</h3><ul>{insight.checks.map(check=><li key={check}>{check}</li>)}</ul></GuideDisclosure>:<><ol>{insight.compare.map(step=><li key={step}>{step}</li>)}</ol><h3>Check before comparing</h3><ul>{insight.checks.map(check=><li key={check}>{check}</li>)}</ul></>}
            <p className="content-date">Result explanations checked <time dateTime={insight.checkedOn}>{insight.checkedOn}</time> against this calculator’s local model. Model scope and sources appear below.</p>
          </>}
          {calculator.id === "roi" && <RoiReference />}
          {calculator.id === "interest-rate" && <InterestRateReference/>}
          {calculator.id === "discount" && <DiscountReference/>}
          {['barista-fire','coast-fire'].includes(calculator.id) && <p>Compare the income and withdrawal assumptions in our <SiteLink href="/guides/barista-fire-vs-coast-fire/">Barista FIRE vs. Coast FIRE guide</SiteLink>.</p>}
          {calculator.id === "house-affordability" && <HouseIncomeReference/>}
          {["personal-loan","student-loan","business-loan","break-even","annuity","annuity-payout","pension","social-security","home-equity-loan","debt-consolidation","auto-loan","boat-loan","auto-lease","cash-back-or-low-interest","fha-loan","va-mortgage","savings","simple-interest","budget","rent","future-value","present-value"].includes(calculator.id) && (compact||sections.comparisons?<GuideDisclosure title={loanCostComparisonTitle(calculator.id)}><LoanCostReference id={calculator.id}/></GuideDisclosure>:<LoanCostReference id={calculator.id}/>)}
          {calculator.id==='pmi' && <PmiRateReference/>}<RemainingFinanceReference id={calculator.id}/><h2 id="worked-examples">Worked examples</h2>
          {foldExamples?<>{workedExamples?.[0]}{workedExamples&&workedExamples.length>1&&<GuideDisclosure title={'More worked examples ('+(workedExamples.length-1)+')'}>{workedExamples.slice(1)}</GuideDisclosure>}</>:workedExamples}
          {calculator.id === "rmd" && <RmdReference/>}
          <h2 id="common-questions">Common questions</h2>
          {guide.questions.map((item) => foldQuestions ? <details className="guide-disclosure guide-question" key={item.question}>
              <summary><h3>{item.question}</h3></summary>
              <div className="guide-disclosure-body" id={item.anchor}><p>{item.answer}</p>
              {item.steps&&<ol>{item.steps.map(step=><li key={step}>{step}</li>)}</ol>}
              {item.links&&<p>{item.links.map((link,index)=><span key={link.id+link.mode}>{index>0?' · ':''}<SiteLink href={longTailHref(link)}>{link.label}</SiteLink></span>)}</p>}</div>
            </details> : <section key={item.question} id={item.anchor}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
              {item.steps && <ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol>}
              {item.links && <p>{item.links.map((link,index)=><span key={link.id+link.mode}>{index>0?' · ':''}<SiteLink href={longTailHref(link)}>{link.label}</SiteLink></span>)}</p>}
            </section>
          )}
          <h2 id="scope-assumptions">Scope and assumptions</h2>
          <p>{guide.scope}</p>
          <h2 id="sources">Sources</h2>
          <SourceReferences context={'calculator:'+calculator.id} sources={guide.sources} compact={compact||sections.sources}/>
          <p className="content-date">
            Calculation notes checked{" "}
            <time dateTime={checkedOn}>{new Date(checkedOn + "T12:00:00Z").toLocaleDateString("en-US", {year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</time>. Examples
            are mathematical checks under the stated assumptions.
          </p>
        </>
      )}
      <details className="model-reference" id="calculation-methods">
        <summary>Calculation methods and formulas</summary>
        {calculator.modes.map((mode) => (
          <section key={mode.id}>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
            <p className="formula">{mode.formula}</p>
          </section>
        ))}
      </details>
      <p>
        See our{" "}
        <SiteLink href="/methodology.html">
          calculation methodology and review status
        </SiteLink>{" "}
        for data versions, rounding and validation limitations.
        {" "}<SiteLink href="/methodology.html#default-assumptions">How default assumptions are chosen</SiteLink>.
      </p>
    </section>
  );
}
