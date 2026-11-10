import Link from "next/link";
import { formatDate, inr } from "@/models/money";
import type { DocumentListRow } from "@/models/types";
import { Button } from "@/components/ui/button";

export function DashboardView({
  businessName,
  billed,
  invoiceCount,
  draftCount,
  estimateCount,
  customerCount,
  itemCount,
  recentInvoices,
  recentEstimates,
}: {
  businessName: string;
  billed: number;
  invoiceCount: number;
  draftCount: number;
  estimateCount: number;
  customerCount: number;
  itemCount: number;
  recentInvoices: DocumentListRow[];
  recentEstimates: DocumentListRow[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Overview</p>
          <h1 className="text-2xl font-semibold">{businessName}</h1>
        </div>
        <Button render={<Link href="/invoices/new" />}>New invoice</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Billing" value={inr(billed)} hint={`${invoiceCount - draftCount} issued · ${draftCount} drafts`} />
        <Metric label="Invoices" value={`${invoiceCount}`} hint={`${draftCount} still drafts`} />
        <Metric label="Estimates" value={`${estimateCount}`} />
        <Metric label="Customers / items" value={`${customerCount} / ${itemCount}`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Recent title="Recent invoices" rows={recentInvoices} href="/invoices" />
        <Recent title="Recent estimates" rows={recentEstimates} href="/estimates" />
      </div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
      <p className="text-xs tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function Recent({
  title,
  rows,
  href,
}: {
  title: string;
  rows: DocumentListRow[];
  href: string;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white shadow-2xs">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        <Link href={href} className="text-xs text-neutral-600 hover:text-neutral-950 underline underline-offset-4">
          View all
        </Link>
      </div>
      <ul>
        {rows.length === 0 ? <li className="px-4 py-8 text-sm text-neutral-500 text-center">Nothing here yet.</li> : null}
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-sm hover:bg-neutral-50/60 transition-colors"
          >
            <div className="min-w-0 flex-1 pr-3">
              <Link href={`${href}/${row.id}`} className="font-medium text-neutral-900 hover:underline truncate block">
                {row.number || "—"} · {row.customerName}
              </Link>
              <p className="text-xs text-neutral-500 mt-0.5">{formatDate(row.date)}</p>
            </div>
            <p className="tabular-nums font-semibold text-neutral-900 text-sm text-right shrink-0">
              {inr(row.total)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
