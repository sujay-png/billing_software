import Link from "next/link";
import { Pencil } from "lucide-react";
import { deleteDocument, invoiceFromEstimate } from "@/controllers/documents";
import { formatDate, inr, lineAmounts } from "@/models/money";
import type { BusinessProfile, Customer, DocumentKind, SavedDocument } from "@/models/types";
import { PrintActions } from "@/views/documents/print-button";
import { Button } from "@/components/ui/button";
import { DocumentStatusDropdown } from "@/views/documents/document-status-dropdown";

export function DocumentPreview({
  kind,
  document,
  customer,
  business,
}: {
  kind: DocumentKind;
  document: SavedDocument;
  customer: Customer | null;
  business: BusinessProfile | null;
}) {
  const noun = kind === "invoice" ? "Invoice" : "Estimate";
  const base = kind === "invoice" ? "/invoices" : "/estimates";

  const distinctTaxRates = Array.from(
    new Set(document.lines.map((l) => Number(l.taxRate || 0)).filter((r) => r > 0)),
  );
  const commonTaxRate = distinctTaxRates.length === 1 ? distinctTaxRates[0] : null;
  const taxHeader = commonTaxRate ? `Tax (${commonTaxRate}%)` : distinctTaxRates.length > 1 ? "Tax" : "Tax (18%)";
  const taxSummaryLabel = commonTaxRate ? `Tax (${commonTaxRate}%)` : "Tax";

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">{noun}</p>
          <h1 className="text-2xl font-semibold">{document.number || noun}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrintActions documentNumber={document.number} noun={noun} />
          <DocumentStatusDropdown kind={kind} id={document.id} initialDraft={document.draft} />
          <Button variant="outline" render={<Link href={`${base}/${document.id}/edit`} />} className="gap-1.5">
            <Pencil className="size-4" />
            Edit
          </Button>
          {kind === "estimate" ? (
            <form action={invoiceFromEstimate.bind(null, document.id)}>
              <Button type="submit" variant="outline">
                Make invoice
              </Button>
            </form>
          ) : null}
          <form action={deleteDocument.bind(null, kind, document.id)}>
            <Button type="submit" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <article className="print-sheet rounded-xl border border-neutral-200 bg-white p-6 md:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <h2 className="text-xl font-semibold">{business?.name || "Business"}</h2>
            <p className="mt-2 max-w-sm text-sm whitespace-pre-line text-neutral-600">{business?.address}</p>
            <p className="mt-2 text-sm text-neutral-600">
              {[business?.gst ? `GSTIN ${business.gst}` : "", business?.state, business?.stateCode ? `Code ${business.stateCode}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-sm text-neutral-600">{[business?.phone, business?.email].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">
              {document.draft ? `Draft ${noun}` : kind === "invoice" ? "Tax invoice" : "Estimate"}
            </p>
            <p className="mt-1 text-2xl font-semibold">{document.number}</p>
            <div className="mt-2 flex justify-end no-print">
              <DocumentStatusDropdown kind={kind} id={document.id} initialDraft={document.draft} size="sm" />
            </div>
            <div className="hidden print:block mt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                {document.draft ? "Draft" : kind === "invoice" ? "Issued" : "Final"}
              </span>
            </div>
          </div>
        </header>

        <div className="grid gap-6 py-6 md:grid-cols-3">
          <div>
            <p className="text-xs tracking-wide text-neutral-500 uppercase">Bill to</p>
            <p className="mt-1 font-medium">{customer?.name || document.customerName || "Customer"}</p>
            <p className="text-sm whitespace-pre-line text-neutral-600">{document.billing || customer?.billingAddress}</p>
            <p className="text-sm text-neutral-600">{[customer?.phone, customer?.email].filter(Boolean).join(" · ")}</p>
            {customer?.gst ? <p className="text-sm text-neutral-600">GSTIN {customer.gst}</p> : null}
          </div>
          <div>
            <p className="text-xs tracking-wide text-neutral-500 uppercase">Deliver to</p>
            <p className="mt-1 text-sm whitespace-pre-line text-neutral-700">{document.delivery || customer?.shippingAddress || "—"}</p>
          </div>
          <dl className="space-y-1 text-sm md:text-right">
            <div className="flex justify-between gap-6 md:justify-end">
              <dt className="text-neutral-500">Date</dt>
              <dd>{formatDate(document.date)}</dd>
            </div>
            <div className="flex justify-between gap-6 md:justify-end">
              <dt className="text-neutral-500">{kind === "invoice" ? "Due" : "Valid"}</dt>
              <dd>{formatDate(document.validDate)}</dd>
            </div>
            {document.paymentTerms ? (
              <div className="flex justify-between gap-6 md:justify-end">
                <dt className="text-neutral-500">Terms</dt>
                <dd>{document.paymentTerms}</dd>
              </div>
            ) : null}
            {document.referenceNumber ? (
              <div className="flex justify-between gap-6 md:justify-end">
                <dt className="text-neutral-500">Reference</dt>
                <dd>{document.referenceNumber}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-neutral-200 text-left text-xs tracking-wide text-neutral-500 uppercase">
              <th className="py-2.5 font-medium">Item</th>
              <th className="py-2.5 font-medium">HSN</th>
              <th className="py-2.5 text-right font-medium">Qty</th>
              <th className="py-2.5 text-right font-medium">Rate</th>
              <th className="py-2.5 text-right font-medium">{taxHeader}</th>
              <th className="py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {document.lines.map((line, index) => {
              const amount = lineAmounts(line);
              return (
                <tr key={`${line.name}-${index}`} className="border-b border-neutral-100">
                  <td className="py-3.5 pr-3">
                    <p className="font-medium text-neutral-900">{line.name}</p>
                    {line.note ? <p className="text-xs text-neutral-500 mt-0.5">{line.note}</p> : null}
                  </td>
                  <td className="py-3.5 text-neutral-600 font-mono text-xs">{line.hsn || "—"}</td>
                  <td className="py-3.5 text-right tabular-nums text-neutral-800">
                    {line.qty} {line.unit}
                  </td>
                  <td className="py-3.5 text-right tabular-nums text-neutral-800">{inr(line.rate)}</td>
                  <td className="py-3.5 text-right tabular-nums text-neutral-800">
                    {inr(amount.tax)}
                  </td>
                  <td className="py-3.5 text-right font-medium tabular-nums text-neutral-950">{inr(amount.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <Row label="Subtotal" value={inr(document.subtotal)} />
            <Row label={taxSummaryLabel} value={inr(document.tax)} />
            {document.discount ? <Row label="Discount" value={inr(document.discount)} /> : null}
            <div className="flex justify-between border-t border-neutral-900 pt-3 text-base font-semibold">
              <dt>Amount due</dt>
              <dd className="tabular-nums">{inr(document.roundOff || document.grandTotal)}</dd>
            </div>
          </dl>
        </div>

        {document.notes ? <p className="mt-12 text-sm whitespace-pre-line text-neutral-600">{document.notes}</p> : null}

        {business?.bank.bankname ? (
          <div className="mt-14 border-t border-neutral-200/90 pt-7 text-sm text-neutral-600 space-y-1.5">
            <p className="font-semibold text-neutral-950">Bank details</p>
            <p>
              {business.bank.accountname || business.name} · {business.bank.bankname}
              {business.bank.branch ? `, ${business.bank.branch}` : ""}
            </p>
            <p>
              A/c {business.bank.accountno || "—"} · IFSC {business.bank.ifsccode || "—"}
              {business.upi ? ` · UPI ${business.upi}` : ""}
            </p>
          </div>
        ) : null}
      </article>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
