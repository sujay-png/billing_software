import Link from "next/link";
import { formatDate, inr } from "@/models/money";
import type { DocumentKind, DocumentListRow } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-neutral-500">
                  No {noun.toLowerCase()} yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link href={`${base}/${row.id}`} className="font-medium underline-offset-4 hover:underline">
                      {row.number || "—"}
                    </Link>
                  </TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>
                    <Badge variant={row.draft ? "outline" : "default"}>{row.draft ? "Draft" : "Issued"}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{inr(row.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
