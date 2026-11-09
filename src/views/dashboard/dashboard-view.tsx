import Link from "next/link";
import { formatDate, inr } from "@/models/money";
import type { DocumentListRow } from "@/models/types";
import { Badge } from "@/components/ui/badge";
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
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function Recent({ title, rows, href }: { title: string; rows: DocumentListRow[]; href: string }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Link href={href} className="text-xs underline">
          View all
        </Link>
      </div>
      <ul>
        {rows.length === 0 ? <li className="px-4 py-8 text-sm text-neutral-500">Nothing here yet.</li> : null}
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-sm">
            <div>
              <Link href={`${href}/${row.id}`} className="font-medium hover:underline">
                {row.number || "—"} · {row.customerName}
              </Link>
              <p className="text-xs text-neutral-500">{formatDate(row.date)}</p>
            </div>
            <div className="text-right">
              <p className="tabular-nums">{inr(row.total)}</p>
              <Badge variant={row.draft ? "outline" : "default"}>{row.draft ? "Draft" : "Issued"}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
