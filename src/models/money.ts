export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function asNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function lineAmounts(line: {
  qty: number;
  rate: number;
  taxRate: number;
  lineDiscount: number;
}) {
  const before = round2(line.qty * line.rate - (line.lineDiscount || 0));
  const tax = round2((before * (line.taxRate || 0)) / 100);
  return { before, tax, total: round2(before + tax) };
}

export function documentTotals(
  lines: {
    qty: number;
    rate: number;
    taxRate: number;
    lineDiscount: number;
  }[],
  discount: number,
) {
  const computed = lines.map(lineAmounts);
  const subtotal = round2(computed.reduce((sum, line) => sum + line.before, 0));
  const tax = round2(computed.reduce((sum, line) => sum + line.tax, 0));
  const grandTotal = round2(subtotal + tax - (discount || 0));
  const roundOff = Math.round(grandTotal);
  return { subtotal, tax, grandTotal, roundOff, lines: computed };
}

export function inr(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(asNumber(value));
}

export function toDateInput(value?: string | null) {
  if (!value) return "";
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? "";
}

export function formatDate(value?: string | null) {
  const input = toDateInput(value);
  if (!input) return "—";
  const [year, month, day] = input.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function todayInput() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(year, month - 1, day);
  next.setDate(next.getDate() + days);
  const m = String(next.getMonth() + 1).padStart(2, "0");
  const d = String(next.getDate()).padStart(2, "0");
  return `${next.getFullYear()}-${m}-${d}`;
}

export function searchTerm(value: string) {
  return value.replace(/[^a-zA-Z0-9@.+ \-]/g, " ").replace(/\s+/g, " ").trim();
}
