export const DAY_MS = 86_400_000;

export function calendarDay(raw: string, label: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw ?? '')) throw Error(`${label}: use YYYY-MM-DD.`);
  const day = Date.parse(raw + 'T00:00:00Z');
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== raw || raw < '1900-01-01' || raw > '2100-12-31') {
    throw Error(`${label}: enter a valid date from 1900 through 2100.`);
  }
  return day / DAY_MS;
}

export const dayLabel = (day: number) => new Date(day * DAY_MS).toISOString().slice(0, 10);

export function numericCell(raw: string, label: string, min = 0, max = 1e10): number {
  const text = raw?.trim();
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text ?? '')) throw Error(`${label}: enter a numeric amount without currency signs or thousands separators.`);
  const n = Number(text);
  if (!Number.isFinite(n) || n < min || n > max) throw Error(`${label}: enter a number from ${min} to ${max}.`);
  return n;
}

export function inputRows(raw: string, columns: number, minRows: number, maxRows: number): string[][] {
  const rows = (raw ?? '').split(/\r?\n/).map(r => r.trim()).filter(Boolean);
  if (rows.length < minRows || rows.length > maxRows) throw Error(`Enter ${minRows} to ${maxRows} nonempty rows.`);
  return rows.map((r, i) => {
    const cells = r.split(/[\t,|]/).map(s => s.trim());
    if (cells.length !== columns || cells.some(s => !s)) throw Error(`Row ${i + 1}: enter exactly ${columns} nonempty columns, separated by commas, tabs or |. Do not put separators inside labels or numbers.`);
    return cells;
  });
}

export function monthlyPayment(principal: number, annualPercent: number, months: number): number {
  if (principal === 0) return 0;
  const rate = annualPercent / 1200;
  return rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
}
