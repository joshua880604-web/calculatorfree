import { addYearlySchedule } from "./schedules";
import { freq } from "./calculators/helpers";
import type { Calculator, Values, Result } from "./types";
import { mortgagePmiFieldVisible } from "./mortgage-pmi";
import { mortgageInputVisible } from "./mortgage-inputs";
import { coastFieldVisible } from './coast-household';
import { expansionFieldVisible } from './expansion-field-visibility';
export function calculateMode(calc: Calculator, modeId: string, v: Values): Result {
  const id = calc.id;
  const mode = calc.modes.find((m) => m.id === modeId);
  if (!mode) throw new Error("Unknown calculator mode.");
  for (const f of mode.fields) {
    if (!expansionFieldVisible(id,v,f.key)) continue;
    if(id==='fix-and-flip' && v.financing==='Cash' && ['loan','rate','points'].includes(f.key))continue;
    if (id === 'coast-fire' && !coastFieldVisible(v, f.key)) continue;
    if (id === "mortgage" && (!mortgageInputVisible(modeId, v, f.key) || !mortgagePmiFieldVisible(modeId, v, f.key))) continue;
    if (id === "va-mortgage" && ["pmi", "pmi_unit", "pmi_years", "pmi_policy"].includes(f.key)) continue;
    if (id === "fha-loan" && (["pmi", "pmi_unit", "pmi_years", "pmi_policy"].includes(f.key) ||
        (v.mip_method !== "Manual" && ["upfront", "annual_mip", "mip_years"].includes(f.key)))) continue;
    const raw = v[f.key];
    if (f.optional && (raw === undefined || raw === "")) continue;
    if (f.type === "textarea") {
      if (!raw && f.value !== "") throw new Error(`Enter ${f.label}.`);
      continue;
    }
    if (f.type === "select") {
      if (!f.options?.includes(raw)) throw new Error(`Choose ${f.label}.`);
      continue;
    }
    if (f.type === "date") {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(raw) ||
        !Number.isFinite(Date.parse(raw)) ||
        new Date(raw + "T00:00:00Z").toISOString().slice(0, 10) !== raw
      )
        throw new Error(`Enter a valid ${f.label}.`);
      continue;
    }
    if (raw === undefined || raw.trim() === "" || !Number.isFinite(Number(raw)))
      throw new Error(`Enter a valid ${f.label}.`);
    const x = Number(raw);
    if (f.min !== undefined && x < f.min)
      throw new Error(`${f.label} must be at least ${f.min}.`);
    if (f.max !== undefined && x > f.max)
      throw new Error(`${f.label} must not exceed ${f.max}.`);
    if (
      (f.unit === "people" ||
        /^(Current age|Retirement age|Your retirement age|Spouse age|Birth year|Distribution year)/i.test(
          f.label,
        )) &&
      !Number.isInteger(x)
    )
      throw new Error(`${f.label} must be a whole number.`);
    if (
      f.unit?.startsWith("%") &&
      /^(tax|state_rate|local_rate|pmi|down|margin|vacancy|management|requirement|coverage|survivor|origination|selling|upfront|annual_mip|match_limit|tax_rate|front|back|expense|discount|replacement|ltv)$/.test(
        f.key,
      ) &&
      x > 100
    )
      throw new Error(`${f.label} must not exceed 100%.`);
    if (Math.abs(x) > 1e15)
      throw new Error(`${f.label} exceeds the supported numeric range.`);
  }
  const result = mode.calculate(v);
  for (const m of result.metrics)
    if (!Number.isFinite(m.value))
      throw new Error(
        "These inputs do not produce a finite result. Check rates and duration.",
      );
  if (
    [...(result.rows ?? []), ...(result.additionalTables ?? []).flatMap(table => table.rows)].some((row) =>
      row.some((x) => typeof x === "number" && !Number.isFinite(x)),
    )
  )
    throw new Error("The schedule exceeds numeric limits.");
  return addYearlySchedule(
    result,
    ["loan", "repayment", "business-loan"].includes(id) && v.pay
      ? freq(v.pay)
      : modeId.includes("biweekly")
        ? 26
        : 12,
  );
}
