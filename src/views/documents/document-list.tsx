import Link from "next/link";
import { Pencil, Printer } from "lucide-react";
import { formatDate, inr } from "@/models/money";
import type { DocumentKind, DocumentListRow } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DocumentStatusDropdown } from "@/views/documents/document-status-dropdown";

export function DocumentList({
  kind,
  rows,
  query,
}: {
  kind: DocumentKind;
  rows: DocumentListRow[];
  query: string;
}) {
  const noun = kind === "invoice" ? "Invoices" : "Estimates";
  const base = kind === "invoice" ? "/invoices" : "/estimates";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Sales</p>
          <h1 className="text-2xl font-semibold">{noun}</h1>
        </div>
        <Button render={<Link href={`${base}/new`} />}>New {kind}</Button>
      </div>
      <form className="max-w-md">
        <Input name="q" defaultValue={query} placeholder={`Search ${noun.toLowerCase()}`} className="h-10 bg-white" />
      </form>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-b border-neutral-200 bg-neutral-50/60">
              <TableHead className="w-[14%] pl-4 py-3.5">Number</TableHead>
              <TableHead className="w-[28%] px-3 py-3.5">Customer</TableHead>
              <TableHead className="w-[16%] px-3 py-3.5">Date</TableHead>
              <TableHead className="w-[15%] min-w-[90px] px-3 py-3.5">Status</TableHead>
              <TableHead className="w-[15%] px-3 py-3.5 text-right">Amount</TableHead>
              <TableHead className="w-[12%] min-w-[80px] px-2 py-3.5 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-neutral-500">
                  No {noun.toLowerCase()} yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-neutral-50/70 transition-colors">
                  <TableCell className="py-3.5 pl-4 truncate font-medium text-neutral-900">
                    <Link href={`${base}/${row.id}`} className="hover:underline">
                      {row.number || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3.5 px-3 truncate text-neutral-900" title={row.customerName}>
                    {row.customerName}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-neutral-600 text-xs whitespace-nowrap">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3">
                    <DocumentStatusDropdown kind={kind} id={row.id} initialDraft={row.draft} />
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right tabular-nums font-semibold text-neutral-900">
                    {inr(row.total)}
                  </TableCell>
                  <TableCell className="py-3.5 px-2 text-center">
                    <div className="inline-flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7.5 rounded-md border border-neutral-200/70 bg-white text-neutral-600 shadow-2xs hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        title={`Edit ${kind}`}
                        render={<Link href={`${base}/${row.id}/edit`} />}
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit {kind}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="size-7.5 rounded-md border border-neutral-200/70 bg-white text-neutral-600 shadow-2xs hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                        title={`View / Print ${kind}`}
                        render={<Link href={`${base}/${row.id}`} />}
                      >
                        <Printer className="size-3.5" />
                        <span className="sr-only">Print {kind}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
