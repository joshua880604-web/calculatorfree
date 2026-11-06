"use client";
import SiteLink from "@/components/SiteLink";
import {compactReadingIds} from "@/lib/compact-reading";
import CreditCardFields from "./CreditCardFields";
import FavoriteButton from "./FavoriteButton";
import { calculatorPresetHref } from "@/lib/preset-links";

import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import dynamic from "next/dynamic";
import {progressiveInputGroups} from '@/lib/progressive-inputs';
const ProgressiveFields=dynamic(()=>import('./ProgressiveFields'));
import InputReviewSummary from './InputReviewSummary';
import {inputReviewGroups,inputReviewLabel,inputReviewPreview,inputReviewValue} from '@/lib/input-review';
import {coastAssumptionLabel} from '@/lib/coast-assumption-ui';
import {coastFieldVisible} from '@/lib/coast-household';
import {expansionFieldVisible} from '@/lib/expansion-field-visibility';
const FhaLoanFields=dynamic(()=>import('./FhaLoanFields'));
const FhaMonthlyBreakdown=dynamic(()=>import('./FhaLoanFields').then(m=>m.FhaMonthlyBreakdown));
const CoastFields=dynamic(()=>import('./CoastPlan'));
const CoastAssumptionBadges=dynamic(()=>import('./CoastPlan').then(m=>m.CoastAssumptionBadges));
const CoastScenarioLibrary=dynamic(()=>import('./CoastPlan').then(m=>m.CoastScenarioLibrary));
const CoastComparisonTools=dynamic(()=>import('./CoastPlan').then(m=>m.CoastComparisonTools));
const CoastResults=dynamic(()=>import('./CoastPlan').then(m=>m.CoastResults));
const RothLadderFields=dynamic(()=>import('./RothLadderFields'));
const DripFields=dynamic(()=>import('./DripFields'));
const CoveredCallFields=dynamic(()=>import('./CoveredCallFields'));
const HouseHackFields=dynamic(()=>import('./HouseHackPlan'));
const HouseRentalFields=dynamic(()=>import('./HouseHackPlan').then(m=>m.HouseRentalFields));
const MortgageInvestFields=dynamic(()=>import('./MortgageInvestFields'));
const StockFields=dynamic(()=>import('./StockFields'));
const StockLotsFields=dynamic(()=>import('./StockLotsFields'));
const PropertyDealFields=dynamic(()=>import('./PropertyDealFields'));
const CapRateFields=dynamic(()=>import('./CapRateFields'));
const CashReturnFields=dynamic(()=>import('./CashReturnFields'));
const BrrrrFields=dynamic(()=>import('./BrrrrFields'));
const BaristaFields=dynamic(()=>import('./BaristaFields'));
const FireBudgetFields=dynamic(()=>import('./FireBudgetPlan'));
const FireBudgetReport=dynamic(()=>import('./FireBudgetPlan').then(m=>m.FireBudgetReport));
const DebtStrategyReport=dynamic(()=>import('./DebtStrategyReport'));
import ResultShare from "./ResultShare";
import {motherPageCopy} from "@/lib/mother-page-ui";
import {hasShareTools,shareOpenEvent,shareTabFor,shareTabFromHash,type ShareTab} from "@/lib/share-tools";
const ShareToolsDialog=dynamic(()=>import("./ShareToolsDialog"),{ssr:false});
import RecastComparison from "./RecastComparison";
import {inputHint,resultContext} from "@/lib/result-context";
import { formatMetric, sharedInputs } from "@/lib/sharing";
import TaskModePicker from "./TaskModePicker";
import { modeDraftScope, switchModeInputs, taskModeGroups } from "@/lib/mode-navigation";
import { defaults } from "@/lib/types";
import { routeFor } from "@/lib/catalog";
import { runClientCalculation } from "@/lib/calculate-client";
import { workspaceLayout, workspaceMetrics } from "@/lib/workspace-layout";
import { calculatorScope } from "@/lib/calculator-scope";
import { fhaMipTerms } from "@/lib/fha-mip";
import { mortgagePmiFieldVisible } from "@/lib/mortgage-pmi";
import { mortgageInputVisible, mortgagePmiDraft, switchMortgageBasis } from "@/lib/mortgage-inputs";
import MortgageFields from "./MortgageFields";
import type { Calculator, Field, Result, Values } from "@/lib/types";
import type { RetirementPlan, RetirementScenario } from "@/lib/retirement-story";
const ScientificKeypad = dynamic(() => import("./ScientificKeypad"));
const MarriageFields = dynamic(() => import("./MarriageFields"));
const RetirementStory = dynamic(() => import("./RetirementStory"));
const ResultTrend = dynamic(() => import("./ResultTrend"));
function CalculationDetails({ compact, hasRows, children }: { compact: boolean; hasRows: boolean; children: ReactNode }) {
  return compact ? <details className="workspace-details"><summary>{hasRows ? "Calculation details & assumptions" : "Calculation notes"}</summary>{children}</details> : <>{children}</>;
}
const amount = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
const colors = [
  "#336699",
  "#83a94b",
  "#d49b43",
  "#7d85ab",
  "#b26969",
  "#64a7a0",
];
function ResultTables({tables,onDownload,label="Download table CSV"}:{tables:NonNullable<Result['additionalTables']>;onDownload:(table:NonNullable<Result['additionalTables']>[number])=>void;label?:string}) {
 return <>{tables.map(table=><section key={table.title}>
  <h3>{table.title}</h3>{table.note&&<p className="result-note">{table.note}</p>}
  <div className="result-actions"><button onClick={()=>onDownload(table)}>{label}</button></div>
  <div className="table-scroll" role="region" aria-label={table.title+" table"} tabIndex={0}>
   <table><thead><tr>{table.columns.map(column=><th scope="col" key={column}>{column}</th>)}</tr></thead>
    <tbody>{table.rows.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j}>{typeof value==="number"?amount(value,Number.isInteger(value)?0:2):value}</td>)}</tr>)}</tbody>
   </table>
  </div>
 </section>)}</>;
}
export default function CalculatorClient({ calc, initialResult, shortcuts = [] }: { calc: Calculator; initialResult: Result | null; shortcuts?: {keyword: string; mode: string}[] }) {
  const id = calc.id;
  const enhancedSharing=hasShareTools(id);
  const motherCopy=motherPageCopy[id];
  const [shareTab,setShareTab]=useState<ShareTab|null>(null);
  const [showResultShare,setShowResultShare]=useState(false);
  useEffect(()=>{
    if(!enhancedSharing)return;
    const open=(event:Event)=>{const detail=(event as CustomEvent<{id:string;tab?:string}>).detail;if(detail?.id===id)setShareTab(shareTabFor(id,detail.tab));};
    const followAction=()=>{const tab=shareTabFromHash(id,location.hash);if(tab)setShareTab(tab);};
    window.addEventListener(shareOpenEvent,open);
    window.addEventListener('hashchange',followAction);
    followAction();
    return()=>{window.removeEventListener(shareOpenEvent,open);window.removeEventListener('hashchange',followAction);};
  },[id,enhancedSharing]);
  function closeShare(){
    setShareTab(null);
    if(shareTabFromHash(id,location.hash))history.replaceState(history.state,'',location.pathname+location.search);
  }
  const runCalculation = (_id: string, mode: string, values: Values) => runClientCalculation(calc.id, calc.category, mode, values);
  const [sharedReviewValues,setSharedReviewValues]=useState<Values|null>(null);
  const [coastSharedRates,setCoastSharedRates]=useState<Values|null>(null);
  const [modeId, setModeId] = useState(calc.modes[0].id);
  const mode = calc.modes.find((m) => m.id === modeId)!;
  const [values, setValues] = useState<Values>(() => defaults(mode)),
    [result, setResult] = useState<Result | null>(initialResult),
    [error, setError] = useState(""),
    [showAll, setShowAll] = useState(false),
    [notice, setNotice] = useState("");
  const [yearly, setYearly] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [scenarioBaseline, setScenarioBaseline] = useState<RetirementPlan | null>(null);
  const [activeScenario, setActiveScenario] = useState<RetirementScenario | null>(null);
  const hasRetirementStory = id === "401k" && mode.id === "projection";
  const workspace = workspaceLayout(id, mode.id);
  const hasWorkspace = Boolean(workspace);
  const wideReports = hasWorkspace;
  const prominentTables = ["roth-conversion-ladder","drip","cd","apr","credit-card","self-employment-tax","barista-fire","brrrr","cash-on-cash-return","mortgage-vs-invest","house-hacking","covered-call"].includes(id);
  const summary = result && hasWorkspace ? workspaceMetrics(id, mode.id, result) : null;
  const tableRows =
    yearly && result?.annualRows ? result.annualRows : result?.rows;
  const tableColumns =
    yearly && result?.annualColumns ? result.annualColumns : result?.columns;
  const context = result ? resultContext(id,mode.id,values,result) : null;
  const scope = calculatorScope(id, mode.id, values);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null),
    request = useRef(0);
  const modeDrafts = useRef<Record<string, Values>>({});
  const mortgageBasisDrafts = useRef<Record<string, Values>>({});
  const compactModes = calc.modes.length >= 4 || id === "savings";
  const payoff = id === "mortgage-payoff";
  const taskModes = Boolean(taskModeGroups[id]) || id === "savings";
  function loadCoastExample(next:Values,title:string){setSharedReviewValues(null);setCoastSharedRates(null);request.current++;clearScenarios();setCalculating(false);setValues({...next});setResult(null);setError('');setNotice('Example loaded: '+title+'. Review inputs, then Calculate.');setShowResultShare(false);setShowAll(false);setYearly(false);}
  function clearScenarios() { setScenarioBaseline(null); setActiveScenario(null); }
  useEffect(() => {
    if (!hasWorkspace) return;
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened.push(...Array.from(workspaceRef.current?.querySelectorAll<HTMLDetailsElement>(".workspace-breakdown:not([open]),.workspace-details:not([open]),.workspace-chart:not([open])") ?? []));
      opened.forEach(details => { details.open = true; });
    };
    const after = () => { opened.forEach(details => { details.open = false; }); opened = []; };
    window.addEventListener("beforeprint", before); window.addEventListener("afterprint", after);
    return () => { window.removeEventListener("beforeprint", before); window.removeEventListener("afterprint", after); };
  }, [hasWorkspace]);
  useEffect(() => {
    let lastSource:string|null=null;
    function hydrate(force = false) {
      setShowResultShare(false);
      const source=window.location.hash.startsWith('#calc=')?window.location.hash:window.location.search;
      if(source===lastSource && !force)return;
      const previousSource = lastSource;
      lastSource=source;
      try {
        const shared=sharedInputs(calc,window.location.search,window.location.hash);
        if(!shared){
          // Back to the original document restores its initial form. Ordinary
          // guide anchors keep edits and results, including legacy query inputs.
          if(previousSource?.startsWith('#calc=') && !window.location.hash && !window.location.search){
            request.current++;clearScenarios();modeDrafts.current={};mortgageBasisDrafts.current={};
            setCalculating(false);setModeId(calc.modes[0].id);setValues(defaults(calc.modes[0]));if(id==='coast-fire')setCoastSharedRates(null);setSharedReviewValues(null);
            setResult(initialResult);setError('');setNotice('');setShowAll(false);setYearly(false);
          }
          return;
        }
        const token=++request.current;
        setCalculating(true);
        const {mode:initial,values:v}=shared;
        setSharedReviewValues({...v});
        if(id==='coast-fire')setCoastSharedRates({...v});
        clearScenarios();
        modeDrafts.current = {};
        mortgageBasisDrafts.current = {};
        setModeId(initial.id);setValues(v);setResult(null);setError("");setNotice("");setShowAll(false);setYearly(false);
        if(source.startsWith('#calc='))requestAnimationFrame(()=>{
          if(token!==request.current)return;
          const panel=document.getElementById('calculator-panel');
          panel?.focus({preventScroll:true});panel?.scrollIntoView({block:'start',behavior:'instant'});
        });
        runCalculation(id,initial.id,v).then(next=>{
          if(token===request.current)setResult(next);
        }).catch(error=>{
          if(token===request.current){setResult(null);setError("Shared inputs could not be calculated: "+(error instanceof Error?error.message:"Check the entered values."));}
        }).finally(()=>{if(token===request.current)setCalculating(false);});
      }catch(error){request.current++;clearScenarios();setCalculating(false);setResult(null);setError(error instanceof Error?error.message:"Invalid calculation link.");}
    }
    const navigate = () => hydrate();
    const reapply = () => hydrate(true);
    function repeatPreset(event: MouseEvent) {
      if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
      const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
      if(!link || link.hasAttribute('download') || (link.target && link.target!=='_self'))return;
      const url=new URL(link.href);
      // A second click on the same fragment does not emit hashchange. Reapply
      // that explicit preset after edits without reloading the document.
      if(url.origin===window.location.origin && url.pathname===window.location.pathname && url.search===window.location.search && url.hash.startsWith('#calc=') && url.hash===window.location.hash){
        event.preventDefault();hydrate(true);
      }
    }
    hydrate();
    window.addEventListener("hashchange",navigate);window.addEventListener("popstate",navigate);window.addEventListener('calculator-preset',reapply);document.addEventListener('click',repeatPreset);
    return ()=>{request.current++;window.removeEventListener("hashchange",navigate);window.removeEventListener("popstate",navigate);window.removeEventListener('calculator-preset',reapply);document.removeEventListener('click',repeatPreset);};
  }, [calc,id,initialResult]);
  const update = (key: string, value: string) => {
    request.current++;
    clearScenarios();
    setCalculating(false);
    setValues((v) => {
      const next = {...v, [key]: value};
      if (id === "mortgage" && key === "loan_basis") {
        mortgageBasisDrafts.current[v.loan_basis ?? "Home price & down payment"] = mortgagePmiDraft(v);
        return switchMortgageBasis(v, value, mortgageBasisDrafts.current[value]);
      }
      if (id === "fha-loan" && key === "mip_method") {
        const price = Number(v.price), down = v.down_unit === "Dollars" ? Number(v.down) : price * Number(v.down) / 100;
        try {
          const value = v.appraised_value?.trim() ? Math.min(price, Number(v.appraised_value)) : price;
          const terms = fhaMipTerms(price - down, value, Number(v.years) * 12 + Number(v.months));
          return {...next, upfront: String(terms.upfrontPercent), annual_mip: String(terms.annualPercent), mip_years: String(terms.durationMonths / 12)};
        } catch { /* Keep the user's inputs for normal validation on Calculate. */ }
      }
      return next;
    });
    setShowResultShare(false);
    setResult(null);
    setError("");
    setNotice("Inputs changed. Select Calculate to update the result.");
  };
  function switchMode(next: string) {
    if (next === modeId) return;
    request.current++;
    clearScenarios();
    setCalculating(false);
    const m = calc.modes.find((x) => x.id === next)!;
    const nextInputs = switchModeInputs(id, mode, m, values, modeDrafts.current);
    modeDrafts.current = nextInputs.drafts;
    setModeId(next);
    setValues(nextInputs.values);
    setShowResultShare(false);
    setResult(null);
    setError("");
    setNotice("");
    setShowAll(false);
    setYearly(false);
  }
  async function calculate(e: FormEvent) {
    e.preventDefault();
    clearScenarios();
    setError("");
    setNotice("");
    setShowResultShare(false);
    setResult(null);
    let v = { ...values };
    const token = ++request.current;
    setCalculating(true);
    try {
      const next = await runCalculation(id, mode.id, v);
      if (token !== request.current) return;
      setResult(next);
      setShowResultShare(true);
      setShowAll(false);
      setYearly(false);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            block: "start",
          }),
        0,
      );
    } catch (e) {
      if (token === request.current) {
        setError(e instanceof Error ? e.message : "Unable to calculate.");
        workspaceRef.current?.querySelectorAll<HTMLDetailsElement>('[data-input-review]').forEach(d=>{d.open=true;});
        if (progressiveInputGroups(id,mode.id)) {
          workspaceRef.current?.querySelectorAll<HTMLDetailsElement>('#calculator-panel .input-disclosure').forEach(details=>{details.open=true;});
        }
        if (id === "coast-fire") {
          const assumptions = workspaceRef.current?.querySelector<HTMLDetailsElement>('#calculator-panel details.coast-assumptions');
          if (assumptions) assumptions.open = true;
        }
        if (id === "mortgage" && e instanceof Error && /original home value/i.test(e.message)) {
          const details = workspaceRef.current?.querySelector<HTMLDetailsElement>('[data-mortgage-group="pmi"]');
          if (details) details.open = true;
        }
      }
    } finally {
      if (token === request.current) setCalculating(false);
    }
  }
  async function applyScenario(scenario: RetirementScenario) {
    if (!hasRetirementStory || !result || scenario.disabledReason || activeScenario?.id === scenario.id) return;
    const original = scenarioBaseline ?? { values: { ...values }, result };
    const token = ++request.current;
    setScenarioBaseline(original); setActiveScenario(scenario);
    setValues({ ...scenario.values }); setResult(null); setCalculating(true); setError(""); setNotice("");
    setShowAll(false); setYearly(false);
    try {
      const next = await runCalculation(id, mode.id, scenario.values);
      if (token !== request.current) return;
      setResult(next);
    } catch (e) {
      if (token === request.current) setError("This scenario could not be calculated: " + (e instanceof Error ? e.message : "Check the entered values."));
    } finally {
      if (token === request.current) setCalculating(false);
    }
  }
  function restoreScenario() {
    if (!scenarioBaseline) return;
    request.current++;
    setValues({ ...scenarioBaseline.values }); setResult(scenarioBaseline.result);
    clearScenarios(); setCalculating(false); setError(""); setNotice("Original plan restored.");
    setShowAll(false); setYearly(false);
    requestAnimationFrame(() => resultRef.current?.focus({preventScroll:true}));
  }
  function reset() {
    setSharedReviewValues(null);
    if(id==='coast-fire')setCoastSharedRates(null);
    request.current++;
    mortgageBasisDrafts.current = {};
    clearScenarios();
    setCalculating(false);
    const scope = modeDraftScope(id, modeId);
    if (scope) delete modeDrafts.current[scope];
    setValues(
      (id === "vat" || (id === "commission" && mode.id === "any-two"))
        ? Object.fromEntries(mode.fields.map((f) => [f.key, ""]))
        : defaults(mode),
    );
    setShowResultShare(false);
    setResult(null);
    setError("");
    setNotice(
      (id === "vat" || (id === "commission" && mode.id === "any-two"))
        ? "Inputs cleared. Enter any two values."
        : "Inputs reset to defaults.",
    );
    setShowAll(false);
    setYearly(false);
  }
  function editInputReview(key:string){
    const details=Array.from(workspaceRef.current?.querySelectorAll<HTMLDetailsElement>('[data-input-review]')??[]).find(d=>d.dataset.inputReview===key);
    if(!details)return;details.open=true;
    requestAnimationFrame(()=>{details.querySelector<HTMLElement>('summary')?.focus({preventScroll:true});details.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  }
  function editCoastAssumptions(){
    const details=workspaceRef.current?.querySelector<HTMLDetailsElement>('#calculator-panel details.coast-assumptions');
    if(!details)return;details.open=true;
    requestAnimationFrame(()=>{details.querySelector<HTMLElement>('summary')?.focus({preventScroll:true});details.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  }
  function download(extra?: { rows: (number | string)[][]; columns: string[] }) {
    const rows = extra?.rows ?? tableRows, columns = extra?.columns ?? tableColumns;
    if (!rows || !columns) return;
    const escape = (x: string | number) =>
      '"' +
      (typeof x === "string" && /^[=+@-]/.test(x)
        ? "'" + x
        : String(x)
      ).replaceAll('"', '""') +
      '"';
    const csv = [columns, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const a = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
      );
    a.href = url;
    a.download = id + (extra ? id === "mortgage-recast" ? "-comparison" : prominentTables ? "-table" : "-retirement" : "") + "-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  function input(field: Field, person?: string) {
    if (field.key === "verified_rate") return null;
    if(id==='stock-average'&&field.key==='lots')return <StockLotsFields key={field.key} value={values.lots??""} onChange={value=>update("lots",value)}/>;
    if(id==='stock-profit'&&['buy_fee','sell_fee'].includes(field.key))field={...field,unit:values[field.key+'_unit']==='Percent'?'%':'$',max:values[field.key+'_unit']==='Percent'?100:1e9};
    if(id === "house-hacking" && field.key === "rentals") return <HouseRentalFields key={field.key} value={values.rentals??"[]"} onChange={value=>update("rentals",value)}/>;
    if (["credit-cards-payoff","debt-snowball","debt-avalanche"].includes(id) && field.key === "debts") return <CreditCardFields kind={id === "credit-cards-payoff" ? "card" : "debt"} key={field.key} value={values.debts ?? ""} onChange={value=>update("debts",value)} />;
    const inputId = id + "-" + mode.id + "-" + field.key;
    const hint = field.hint ?? motherCopy?.hints?.[field.key] ?? inputHint(id,mode.id,field.key) ?? (id === "401k" && mode.id === "projection" ? ({
      match: "The percentage your employer adds for each eligible dollar you contribute. 50% means $0.50 per $1.",
      match_limit: "The portion of salary eligible for matching. At 6%, contributions above 6% of salary receive no additional match.",
      balance: "Your existing account total. Included once before future contributions and growth.",
    } as Record<string, string>)[field.key] : undefined);
    const describedBy = [field.unit ? inputId + "-unit" : "", hint ? inputId + "-hint" : ""].filter(Boolean).join(" ") || undefined;
    return (
      <div
        className={
          "field-row " + (field.type === "textarea" ? "field-wide" : "")
        }
        key={field.key}
      >
        <label htmlFor={inputId}>{person ?? field.label}</label>
        <div className="field-control">
          <div className={"field-entry"+(field.type === "textarea" ? " entry-textarea" : "")+(field.unit && field.unit.length > 12 ? " unit-long" : "")}>
          {field.type === "select" ? (
            <select
              id={inputId}
              aria-label={person ? field.label : undefined}
              aria-describedby={describedBy}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            >
              {field.options
                ?.filter(
                  (x) =>
                    !(
                      id === "currency" &&
                      ["from", "to"].includes(field.key) &&
                      values.popular === "Yes"
                    ) ||
                    [
                      "USD",
                      "EUR",
                      "GBP",
                      "JPY",
                      "AUD",
                      "CAD",
                      "CHF",
                      "CNY",
                      "HKD",
                      "SGD",
                      "INR",
                      "NZD",
                      "KRW",
                      "MXN",
                      "BRL",
                      "ZAR",
                      "SEK",
                      "NOK",
                      "DKK",
                      values[field.key],
                    ].includes(x),
                )
                .map((x) => (
                  <option key={x} value={x}>{["mortgage","fha-loan"].includes(id) && field.key === "down_unit" ? x === "Percent" ? "%" : "$" : id==='fha-loan'&&['tax_unit','insurance_unit'].includes(field.key)?x==='Dollars'?'$/year':'% of value':x}</option>
                ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={inputId}
              aria-label={person ? field.label : undefined}
              aria-describedby={describedBy}
              value={values[field.key] ?? ""}
              rows={4}
              onChange={(e) => update(field.key, e.target.value)}
            />
          ) : (
            <input
              id={inputId}
              aria-label={person ? field.label : undefined}
              aria-describedby={describedBy}
              type={field.type === "date" ? "date" : "number"}
              inputMode={field.type === "date" ? undefined : "decimal"}
              step={field.step ?? "any"}
              min={field.min}
              max={field.max}
              required={!field.optional}
              value={values[field.key] ?? ""}
              onChange={(e) => update(field.key, e.target.value)}
            />
          )}{" "}
          {field.unit && <span id={inputId + "-unit"} className="unit">{field.unit}</span>}
          </div>
          {hint && <small id={inputId + "-hint"}>{hint}</small>}
        </div>
      </div>
    );
  }
  const calculationDetails = result && (
          <CalculationDetails compact={hasWorkspace} hasRows={Boolean(result.rows)} key={mode.id + "-details"}>
          {hasWorkspace && !result.notes?.length && !result.rows?.length && <p className="result-note">{mode.formula}</p>}
          {id === "marriage-tax" && <p className="result-note">Compared with your combined unmarried federal income tax. Savings means the married-joint estimate is lower; additional tax means it is higher. This does not compare married filing separately or include state/local tax.</p>}
          {result.notes?.map((note, i) => (
            <p className="result-note" key={i}>
              {note}
            </p>
          ))}
          {result.rows && result.columns && (
            <>
              <h3>Calculation details</h3>
              {id === "401k" && mode.id === "projection" && <p className="result-note">Each row represents one projection year. Age is your age at year end; salary and contributions apply to that year. Balance is the account total after annual growth and year-end contributions. Amounts are in USD.</p>}
              <p className="table-help">Scroll horizontally or vertically to see more. Download CSV for the complete schedule.</p>
              {result.annualRows && (
                <div className="result-actions" aria-label="Schedule period">
                  <button
                    aria-pressed={!yearly}
                    onClick={() => {
                      setYearly(false);
                      setShowAll(false);
                    }}
                  >
                    {result.schedulePeriod ?? "Per payment"}
                  </button>
                  <button
                    aria-pressed={yearly}
                    onClick={() => {
                      setYearly(true);
                      setShowAll(false);
                    }}
                  >
                    Yearly
                  </button>
                </div>
              )}
              {wideReports && <div className="result-actions"><button onClick={() => download()}>Download CSV</button></div>}
              <div
                className="table-scroll"
                tabIndex={0}
                role="region"
                aria-label="Calculation detail table"
              >
                <table>
                  <thead>
                    <tr>
                      {tableColumns!.map((c, i) => (
                        <th scope="col" key={i}>{id === "401k" && mode.id === "projection" ? ({Age: "Year-end age", Employee: "Employee contribution", Employer: "Employer contribution", Balance: "Year-end balance"} as Record<string,string>)[c] ?? c : c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows!
                      .slice(0, showAll ? undefined : 36)
                      .map((row, i) => (
                        <tr key={i}>
                          {row.map((x, j) => (
                            <td key={j}>
                              {typeof x === "number"
                                ? amount(x, Number.isInteger(x) ? 0 : 2)
                                : x}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {tableRows!.length > 36 && (
                <button
                  className="show-rows"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll
                    ? "Show first 36 rows"
                    : `Show all ${tableRows!.length} rows`}
                </button>
              )}
            </>
          )}
          {!prominentTables && <ResultTables tables={result.additionalTables?.filter((_, index) => !['coast-fire','lean-fire','fat-fire','debt-snowball','debt-avalanche'].includes(id) && (id !== "mortgage-recast" || index !== 0))??[]} onDownload={download} label={id==='coast-fire'?'Download comparison CSV':id==='balance-transfer'?'Download repayment CSV':['inventory-turnover','sba-loan','cd-ladder','npv','lease-vs-buy-car','mortgage-comparison','1031-exchange','home-maintenance-cost','vacancy-rate','credit-utilization','dca','rule-of-72','capital-gains-tax'].includes(id)?'Download comparison CSV':'Download retirement CSV'}/>}

          </CalculationDetails>
  );
  const progressive = progressiveInputGroups(id,mode.id)!==null;
  const simple = ['lease-vs-buy-car','mortgage-comparison','retirement-withdrawal','balance-transfer','dscr','fsa','closing-cost'].includes(id) || mode.fields.length <= 14,
    visible = mode.fields.filter((f) => f.key !== "verified_rate" && expansionFieldVisible(id,values,f.key) &&
      !(id==='fix-and-flip' && values.financing==='Cash' && ['loan','rate','points'].includes(f.key)) &&
      !(id === 'coast-fire' && !coastFieldVisible(values,f.key)) &&
      !(["mfs_lived_apart", "mfs_spouse_itemizes"].includes(f.key) && (values.filing ?? values.file_status) !== "Married filing separately") &&
      !(["qbi_active", "p2_qbi_active"].includes(f.key) && ((id === "marriage-tax" ? values.qbi !== "Yes" && values.p2_qbi !== "Yes" : values.qbi !== "Yes") || values.year === "2025")) &&
      !(f.key === "spouse_qbi_active" && (values.qbi !== "Yes" || values.year === "2025" || values.filing !== "Married filing jointly")) &&
      !(id === "va-mortgage" && ["pmi", "pmi_unit", "pmi_years", "pmi_policy"].includes(f.key)) &&
      !(id === "mortgage" && (!mortgageInputVisible(mode.id, values, f.key) || !mortgagePmiFieldVisible(mode.id, values, f.key))) &&
      !(id === "fha-loan" && (["pmi", "pmi_unit", "pmi_years", "pmi_policy"].includes(f.key) || (values.mip_method !== "Manual" && ["upfront", "annual_mip", "mip_years"].includes(f.key))))),
    optionalPlanning = ["interest", "savings", "investment", "compound-interest"].includes(id) && mode.id !== "conversion" ? new Set(["annual", "timing", "tax", "inflation", "annual_increase", "monthly_increase"]) : null,
    main = optionalPlanning ? visible.filter(f => !optionalPlanning.has(f.key)) : simple ? visible : visible.slice(0, 8),
    advanced = progressive ? [] : ['stock-profit','stock-average','seller-financing','fix-and-flip','roth-conversion-ladder','drip','covered-call','house-hacking','brrrr','barista-fire','lean-fire','fat-fire'].includes(id) ? [] : optionalPlanning ? visible.filter(f => optionalPlanning.has(f.key)) : simple ? [] : visible.slice(8);
  const reviewGroups=inputReviewGroups(id,mode.id,visible,advanced);
  return (
    <>
      <div className={"calculator-intro-row"+(motherCopy?" mother-page-intro":"")}><p className="intro">{motherCopy?.intro??calc.intro}</p>{enhancedSharing?<div className="calculator-utility-actions enhanced-sharing-actions"><FavoriteButton id={id}/><button type="button" className="calculator-share-launch" aria-haspopup="dialog" onClick={()=>setShareTab('Share')}>Share / Export</button></div>:<FavoriteButton id={id}/>}</div>
      {shareTab&&enhancedSharing&&<ShareToolsDialog key={shareTab} initialTab={shareTab} id={id} title={calc.title} path={routeFor(id)} mode={mode} values={values} result={result} fields={visible} onClose={closeShare}/>}
      {id !== "mortgage" && !motherCopy && shortcuts.length > 0 && <nav className="task-shortcuts" aria-label="Calculation shortcuts">{shortcuts.map(task=><button type="button" key={task.keyword} onClick={()=>switchMode(task.mode)}>{task.keyword}</button>)}</nav>}
      {calc.modes.length > 1 && (
        <div className={"mode-tabs" + (compactModes ? " compact-mode-tabs" : "") + (id === "mortgage" ? " mortgage-mode-tabs" : "")} role="tablist" aria-label="Calculation mode">
          {calc.modes.map((m) => (
            <button
              role="tab"
              tabIndex={modeId === m.id ? 0 : -1}
              onKeyDown={(e) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                e.preventDefault();
                const current = calc.modes.findIndex(x => x.id === modeId);
                const index = e.key === "Home" ? 0 : e.key === "End" ? calc.modes.length - 1 : (current + (e.key === "ArrowRight" ? 1 : -1) + calc.modes.length) % calc.modes.length;
                switchMode(calc.modes[index].id);
                document.getElementById("tab-" + calc.modes[index].id)?.focus();
              }}
              aria-selected={modeId === m.id}
              aria-controls="calculator-panel"
              id={"tab-" + m.id}
              key={m.id}
              onClick={() => switchMode(m.id)}
              className={modeId === m.id ? "active" : ""}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}
      {compactModes && (
        <div className="mobile-mode-picker">
          {taskModes ? <TaskModePicker id={id} modeId={modeId} onChange={switchMode} /> : payoff ? <>
            <fieldset className="payoff-basis">
              <legend>Loan details</legend>
              <div className="payoff-basis-options">
                {[["remaining", "Current balance"], ["known", "Original loan"]].map(([basis, label]) => (
                  <label key={basis}>
                    <input type="radio" name="payoff-basis" value={basis}
                      checked={modeId.startsWith(basis + "-")}
                      onChange={() => switchMode(basis + "-" + modeId.split("-")[1])} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mobile-mode-label" htmlFor="payoff-strategy">Payoff strategy</label>
            <select id="payoff-strategy" value={modeId.split("-")[1]}
              onChange={e => switchMode(modeId.split("-")[0] + "-" + e.target.value)}>
              <option value="extra">Extra payments</option>
              <option value="normal">Normal repayment</option>
              <option value="biweekly">Biweekly</option>
              <option value="all">Pay off now</option>
            </select>
          </> : <>
            <label className="mobile-mode-label" htmlFor="calculation-mode">Calculation mode</label>
            <select id="calculation-mode" value={modeId} onChange={e => switchMode(e.target.value)}>
              {calc.modes.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </>}
        </div>
      )}
      <div ref={workspaceRef} className={hasWorkspace ? "calculator-workspace" + (workspace === "stacked" ? " workspace-stacked" : "") : undefined}>
      <div
        id="calculator-panel"
        role="tabpanel"
        tabIndex={-1}
        aria-label={compactModes ? mode.title : undefined}
        aria-labelledby={!compactModes && calc.modes.length > 1 ? "tab-" + modeId : undefined}
      >
        {((motherCopy?.scope??scope)||(id !== "mortgage" && !(motherCopy?.suppressSingleModeDescription&&calc.modes.length===1)))&&<details className="calculator-help" key={mode.id}>
          <summary>Assumptions &amp; limits</summary>
          <div className="calculator-help-content">
            {(motherCopy?.scope??scope)&&<p className={"result-note calculator-scope"+(motherCopy?" mother-page-scope":"")+(id==="mortgage"?" mortgage-scope":"")}>{motherCopy?.scope??scope}</p>}
            {id !== "mortgage" && !(motherCopy?.suppressSingleModeDescription&&calc.modes.length===1)&&<p className="mode-description">{mode.description}</p>}
            {id === "credit-card" && <p className="result-note">One card: compare fixed payments, a payoff deadline or a minimum-payment rule below. For several cards sharing one monthly budget, use the <SiteLink href={routeFor("credit-cards-payoff")}>Multiple Credit Cards Payoff Calculator</SiteLink>.</p>}
            {id === "irr" && <p className="result-note dated-cash-flow-link">For cash flows on specific calendar dates, use the <SiteLink href={calculatorPresetHref(routeFor("average-return"), "cashflows")}>Average Return Calculator’s Dated Cash Flows mode</SiteLink>.</p>}
          </div>
        </details>}
        <form aria-busy={calculating} onKeyDown={e=>{if(id === "scientific" && (e.target as HTMLElement).tagName === "TEXTAREA" && e.key === "Enter" && !e.shiftKey){e.preventDefault();e.currentTarget.requestSubmit();}}} onSubmit={calculate} className="calculator-form" onInvalidCapture={(e) => {
          const field = e.target as HTMLInputElement;
          const details = field.closest("details");
          if (details) details.open = true;
          setShowResultShare(false);
    setResult(null);
        }}>
          {id==='fha-loan'?<FhaLoanFields fields={visible} values={values} renderField={input} sharedValues={sharedReviewValues}/> : progressive ? <ProgressiveFields id={id} mode={mode.id} fields={visible} values={values} renderField={input} sharedValues={sharedReviewValues}/> : ['stock-profit','stock-average'].includes(id) ? <StockFields id={id} fields={visible} renderField={input}/> : ['seller-financing','fix-and-flip'].includes(id) ? <PropertyDealFields id={id} fields={visible} renderField={input}/> : ['debt-snowball','debt-avalanche'].includes(id) ? <>{visible.filter(f=>f.key==='debts').map(f=>input(f))}<fieldset className="planning-fields"><legend>Monthly budget and rollover</legend>{visible.filter(f=>['budget','rollover'].includes(f.key)).map(f=>input(f))}</fieldset><fieldset className="planning-fields"><legend>Optional one-time extra</legend>{visible.filter(f=>['once','once_month'].includes(f.key)).map(f=>input(f))}</fieldset></> : id==='cap-rate' && mode.id==='rental' ? <CapRateFields fields={visible} renderField={input}/> : id==='roth-conversion-ladder' ? <RothLadderFields fields={visible} renderField={input}/> : id==='drip' ? <DripFields fields={visible} renderField={input}/> : id==='covered-call' ? <CoveredCallFields fields={visible} renderField={input}/> : id==='house-hacking' ? <HouseHackFields fields={visible} renderField={input}/> : id==='mortgage-vs-invest' ? <MortgageInvestFields fields={visible} renderField={input}/> : id==='cash-on-cash-return' && mode.id==='property' ? <CashReturnFields fields={visible} renderField={input}/> : id==='brrrr' ? <BrrrrFields fields={visible} renderField={input}/> : id==='barista-fire' ? <BaristaFields fields={visible} renderField={input}/> : ['lean-fire','fat-fire'].includes(id) ? <FireBudgetFields id={id} fields={visible} renderField={input}/> : id === 'coast-fire' ? <CoastFields fields={visible} values={values} renderField={input} sharedAssumptions={coastSharedRates}/> : id === "mortgage" ? <MortgageFields fields={visible} values={values} mode={mode.id} update={update} renderField={input} sharedValues={sharedReviewValues} /> : id === "marriage-tax" ? <MarriageFields fields={visible} values={values} renderField={input} sharedValues={sharedReviewValues} /> : ["cap-rate","credit-card-minimum-payment"].includes(id) ? <div className="focused-tool-fields">{main.map(f => input(f))}</div> : main.map(f => input(f))}
          {id !== "mortgage" && id !== "marriage-tax" && advanced.length > 0 && (
            <details className="advanced input-review" data-input-review="advanced" key={mode.id}>
              <summary><InputReviewSummary title={reviewGroups[0]?.title??'Additional calculation settings'} fields={advanced} values={values} shared={sharedReviewValues}/></summary>
              {advanced.map(f => input(f))}
            </details>
          )}
          {id === "scientific" && <ScientificKeypad values={values} update={update} />}
          <div className="form-actions">
            <button type="submit" className="calculate" disabled={calculating}>
              {calculating ? "Calculating…" : "Calculate"}
            </button>
            <button type="button" className="clear" onClick={reset}>
              {id === "vat" || (id === "commission" && mode.id === "any-two") ? "Clear" : "Reset"}
            </button>
          </div>
          {["Investment","Retirement"].includes(calc.category)&&mode.fields.some(field=>["return","rate","inflation","nominal"].includes(field.key))&&<p className="assumption-help">Planning rates are editable assumptions. <SiteLink href="/methodology.html#default-assumptions">About default values and their sources</SiteLink>.</p>}
        </form>
      </div>
      <div className={hasWorkspace ? "workspace-output" : undefined}>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {!result && scenarioBaseline && activeScenario && <section className="scenario-recovery" aria-label="Scenario calculation">
        <p role="status">{calculating ? "Updating your scenario…" : "Your original plan is still available."}</p>
        <button type="button" onClick={restoreScenario}>Restore original plan</button>
      </section>}
      {hasWorkspace && !result && <div className="workspace-empty"><h2>Your result</h2><p>{calculating ? "Calculating your updated result…" : "Enter your values and select Calculate to see the result here."}</p></div>}
      {result && (
        <div ref={resultRef} className="result" aria-live="polite" tabIndex={-1}>
          {enhancedSharing?<div className="result-heading-row"><h2>Result</h2>{showResultShare&&<button type="button" className="calculator-share-launch result-share-prompt" aria-haspopup="dialog" onClick={()=>setShareTab('Share')}>Share your results</button>}</div>:<h2>Result</h2>}
          {id === "irr" && result.metrics.length > 1 && <p className="notice" role="status">Multiple IRRs detected. There is no single unambiguous rate for these cash flows; the first result is not a recommended return.</p>}
          <div className="result-main">
            <div className="metrics">
              {(id === "marriage-tax" ? [...result.metrics.slice(-1), ...result.metrics.slice(0, -1)] : summary ? [summary.primary] : result.metrics).map((m, i) => (
                <Fragment key={m.label}>
                {hasRetirementStory && i === 1 && <h3 className="story-all-figures">Calculated figures</h3>}
                <div
                  className={i === 0 ? "metric primary" : "metric"}
                >
                  <span>{id === "marriage-tax" && i === 0 ? (m.value < -0.005 ? "Estimated annual tax savings after marriage" : m.value > 0.005 ? "Estimated annual additional tax after marriage" : "Estimated annual tax difference after marriage") : m.label}</span>
                  <strong>
                    {m.displayValue ?? (m.format === "money"
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: m.currency ?? "USD",
                        }).format(id === "marriage-tax" && i === 0 ? Math.abs(m.value) : m.value)
                      : amount(
                          m.value,
                          m.digits ??
                            (m.format === "percent"
                              ? 4
                              : Number.isInteger(m.value)
                                ? 0
                                : 4),
                        ))}
                    {m.format === "percent" ? "%" : ""}
                  </strong>
                </div>
                {hasRetirementStory && i === 0 && <RetirementStory values={values} result={result} baseline={scenarioBaseline} active={activeScenario} onScenario={applyScenario} onRestore={restoreScenario} />}
                </Fragment>
              ))}
            </div>
            {id==='fha-loan'&&mode.id==='monthly'&&<FhaMonthlyBreakdown values={values} result={result}/>}
            {id==='fha-loan'&&mode.id==='biweekly'&&<p className="result-note fha-biweekly-scope">Biweekly repayment compares principal and interest only. Financed upfront MIP is included in the loan balance; recurring MIP, property tax, home insurance and other ownership costs are excluded from this payment.</p>}
            {id==='coast-fire'&&<div className="coast-result-assumptions"><div className="coast-result-assumptions-heading"><p>Assumptions used for this result</p><button type="button" onClick={editCoastAssumptions}>Edit assumptions</button></div><p className="coast-assumption-source">{coastAssumptionLabel(mode.fields,values,coastSharedRates)}</p><CoastAssumptionBadges values={values}/></div>}
            {reviewGroups.length>0&&<details className="input-review-result"><summary>Settings used for this result ({reviewGroups.length} {reviewGroups.length===1?'section':'sections'})</summary>{reviewGroups.map(group=><section key={group.key}><div className="input-review-result-heading"><strong>{group.title}</strong><button type="button" aria-label={'Edit '+group.title} onClick={()=>editInputReview(group.key)}>Edit settings</button></div><p className="input-review-source">{inputReviewLabel(group.fields,values,sharedReviewValues)}</p><p className="input-review-result-values">{inputReviewPreview(group.fields,values).map(f=>f.label+': '+inputReviewValue(f,values)).join(' · ')}{group.fields.length>3?' · Additional settings available in the input section.':''}</p></section>)}</details>}

            {(!hasWorkspace || id === "mutual-fund") && result.chart && result.chart.some((x) => x.value > 0) && (
              <div className="chart">
                <div
                  role="img"
                  aria-label={result.chart
                    .map((x) => `${x.label}: ${amount(x.value)}`)
                    .join("; ")}
                  className="donut"
                  style={{
                    background: (() => {
                      const total = result.chart!.reduce(
                        (s, x) => s + Math.max(0, x.value),
                        0,
                      );
                      let start = 0;
                      return (
                        "conic-gradient(" + // taste-skill-ignore: real data segments, sized from result.chart values.
                        result
                          .chart!.map((x, i) => {
                            const end =
                              start + (Math.max(0, x.value) / total) * 100;
                            const segment = `${colors[i % colors.length]} ${start}% ${end}%`;
                            start = end;
                            return segment;
                          })
                          .join(",") +
                        ")"
                      );
                    })(),
                  }}
                >
                  <div />
                </div>
                <ul>
                  {result.chart.map((x, i) => (
                    <li key={x.label}>
                      <span style={{ background: colors[i % colors.length] }} />
                      {x.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {context && id !== "mortgage" && <p className="result-context">{context}</p>}
          {summary && summary.highlights.length > 0 && <dl className="workspace-key-figures" aria-label="Key calculated figures">{summary.highlights.map(m => <div className="metric" key={m.label}><dt><span>{m.label}</span></dt><dd><strong>{formatMetric(m)}</strong></dd></div>)}</dl>}
          {context && id === "mortgage" && <p className="result-context">{context}</p>}
          {summary && summary.details.length > 0 && <details className="workspace-breakdown" key={mode.id + "-breakdown"}>
            <summary>Result breakdown ({summary.details.length})</summary>
            {summary.details.map(m => <div className="metric" key={m.label}><span>{m.label}</span><strong>{formatMetric(m)}</strong></div>)}
          </details>}
          <div className="result-actions">
            {enhancedSharing?(!showResultShare&&<button type="button" onClick={()=>setShareTab('Share')}>Share / Export</button>):<button onClick={() => window.print()}>Print</button>}
            {result.rows && !wideReports && !enhancedSharing && <button onClick={() => download()}>Download CSV</button>}
          </div>
          {!wideReports && calculationDetails}
          {!enhancedSharing&&(hasWorkspace ? <details className="workspace-sharing" key={mode.id + "-sharing"}><summary>Save or share result</summary><ResultShare id={id} title={calc.title} path={routeFor(id)} mode={mode} values={values} result={result} fields={visible}/></details> : <ResultShare key={mode.id} id={id} title={calc.title} path={routeFor(id)} mode={mode} values={values} result={result} fields={visible}/>)}
        </div>
      )}
      </div>
      {id==='coast-fire'&&<CoastScenarioLibrary onLoad={loadCoastExample}/>}
      {id==='coast-fire'&&<CoastComparisonTools values={values} mode={mode} sharedAssumptions={coastSharedRates}/>}
      {wideReports && result && <>
        {id === 'coast-fire' && <CoastResults values={values} result={result} onDownload={download}/>}
        {['lean-fire','fat-fire'].includes(id) && <FireBudgetReport result={result} onDownload={download}/>}
        {['debt-snowball','debt-avalanche'].includes(id) && <DebtStrategyReport id={id} values={values} result={result} onDownload={download}/>}
        {id === "mortgage-recast" && result.additionalTables?.[0] && <RecastComparison table={result.additionalTables[0]} onDownload={() => download(result.additionalTables![0])}/>}
        <ResultTrend key={mode.id + "-chart"} id={id} mode={mode.id} values={values} result={result} wide report/>
        {prominentTables&&Boolean(result.additionalTables?.length)&&<section className="workspace-report" aria-label="Comparison and reconciliation tables"><ResultTables tables={result.additionalTables!} onDownload={download}/></section>}
        <section className="workspace-report workspace-report-details" aria-label="Calculation details">
          {calculationDetails}
        </section>
      </>}
      </div>
      {id === "mortgage" && <nav className="mortgage-related-tools" aria-label="Related mortgage calculators">
        <strong>Other mortgage tools</strong>
        {[["pmi", "PMI"], ["biweekly-mortgage", "Biweekly payments"], ["discount-points", "Discount points"], ["mortgage-recast", "Recast"], ["fha-loan", "FHA loan"], ["va-mortgage", "VA mortgage"], ["refinance", "Refinance"], ["mortgage-payoff", "Mortgage payoff"], ["heloc", "HELOC"], ["rental-property", "Rental property"]].map(([tool, label]) => <SiteLink key={tool} href={routeFor(tool)}>{label}</SiteLink>)}
      </nav>}
      {id === "mortgage" && shortcuts.length > 0 && <nav className="task-shortcuts" aria-label="Calculation shortcuts">{shortcuts.map(task=><button type="button" key={task.keyword} onClick={()=>switchMode(task.mode)}>{task.keyword}</button>)}</nav>}
      <section className="explanation">
        <h2>How to use this calculator</h2>
        <p>
          {mode.description} Enter amounts in the units shown, select the
          applicable options, and click Calculate.{" "}
          {id === "vat" || (id === "commission" && mode.id === "any-two")
            ? "Use Clear to empty the fields."
            : "Use Reset to restore the starting values."}
        </p>
        <h3>Calculation formula</h3>
        <p className="formula">{mode.formula}</p>
        {!compactReadingIds.includes(id)&&<><h3>Assumptions and accuracy</h3>
        <p>
          {calc.category === "Everyday Tools" ? "Check the selected mode, units, date endpoints and result notes. Currency selection controls display and rounding, not exchange rates. Calendar calculations do not include holidays or local time-of-day." : "Review timing, rates, fees and result notes when comparing scenarios. Future returns and rates are assumptions rather than guaranteed outcomes. Monetary display follows the currency’s precision; intermediate calculations retain additional digits."}
        </p></>}
        {[
          "income-tax",
          "marriage-tax",
          "take-home-paycheck",
          "rmd",
          "401k",
          "ira",
          "roth-ira",
        ].includes(id) && (
          <p>
            Year-specific parameters are documented in the calculation notes.
            Rule eligibility and individual circumstances can change the result.
          </p>
        )}
      </section>
    </>
  );
}
