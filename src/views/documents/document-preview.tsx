import Link from "next/link";
import { deleteDocument, invoiceFromEstimate, setDocumentStatus } from "@/controllers/documents";
import { formatDate, inr, lineAmounts } from "@/models/money";
import type { BusinessProfile, Customer, DocumentKind, SavedDocument } from "@/models/types";
import { PrintButton } from "@/views/documents/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">{noun}</p>
          <h1 className="text-2xl font-semibold">{document.number || noun}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintButton />
          <Button variant="outline" render={<Link href={`${base}/${document.id}/edit`} />}>
            Edit
          </Button>
          {document.draft ? (
            <form action={setDocumentStatus.bind(null, kind, document.id, false)}>
              <Button type="submit">{kind === "invoice" ? "Issue" : "Mark final"}</Button>
            </form>
          ) : (
            <form action={setDocumentStatus.bind(null, kind, document.id, true)}>
              <Button type="submit" variant="outline">
                Mark draft
              </Button>
            </form>
          )}
          {kind === "estimate" ? (
            <form action={invoiceFromEstimate.bind(null, document.id)}>
              <Button type="submit" variant="outline">
                Make invoice
              </Button>
            </form>
          ) : null}
          <form action={deleteDocument.bind(null, kind, document.id)}>
            <Button type="submit" variant="ghost">
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
            <Badge variant={document.draft ? "outline" : "default"} className="mt-2">
              {document.draft ? "Draft" : "Issued"}
            </Badge>
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
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">HSN</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Rate</th>
              <th className="py-2 text-right font-medium">Tax</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {document.lines.map((line, index) => {
              const amount = lineAmounts(line);
              return (
                <tr key={`${line.name}-${index}`} className="border-b border-neutral-100">
                  <td className="py-3 pr-3">
                    <p className="font-medium">{line.name}</p>
                    {line.note ? <p className="text-xs text-neutral-500">{line.note}</p> : null}
                  </td>
                  <td className="py-3">{line.hsn || "—"}</td>
                  <td className="py-3 text-right tabular-nums">
                    {line.qty} {line.unit}
                  </td>
                  <td className="py-3 text-right tabular-nums">{inr(line.rate)}</td>
                  <td className="py-3 text-right tabular-nums">
                    {line.taxRate}%
                    <span className="block text-xs text-neutral-500">{inr(amount.tax)}</span>
                  </td>
                  <td className="py-3 text-right font-medium tabular-nums">{inr(amount.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-1 text-sm">
            <Row label="Subtotal" value={inr(document.subtotal)} />
            <Row label="Tax" value={inr(document.tax)} />
            <Row label="Discount" value={inr(document.discount)} />
            <div className="flex justify-between border-t border-neutral-900 pt-2 text-base font-semibold">
              <dt>Amount due</dt>
              <dd className="tabular-nums">{inr(document.roundOff || document.grandTotal)}</dd>
            </div>
          </dl>
        </div>

        {document.notes ? <p className="mt-8 text-sm whitespace-pre-line text-neutral-600">{document.notes}</p> : null}

        {business?.bank.bankname ? (
          <div className="mt-8 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
            <p className="font-medium text-neutral-950">Bank details</p>
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
