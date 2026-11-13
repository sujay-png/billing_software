"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { invoiceFromEstimate } from "@/controllers/documents";
import { formatDate, inr, lineAmounts } from "@/models/money";
import type { BusinessProfile, Customer, DocumentKind, SavedDocument } from "@/models/types";
import { PrintActions } from "@/views/documents/print-button";
import { Button } from "@/components/ui/button";
import { DocumentStatusDropdown } from "@/views/documents/document-status-dropdown";
import { DeleteDocumentButton } from "@/views/documents/delete-document-button";
import AmountInWords from "@/components/AmountInWords";

function formatBusinessPhone(phone?: string | null) {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (!trimmed) return "";
  if (/^ph\b/i.test(trimmed)) return trimmed;
  if (trimmed === "2410136" || /^0824\s*-?\s*2410136$/.test(trimmed)) {
    return "Ph .No.0824 -2410136";
  }
  return `Ph .No. ${trimmed}`;
}

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
  const [hideBankDetails, setHideBankDetails] = React.useState(false);
  const [letterheadMode, setLetterheadMode] = React.useState(false);
  const defaultSpacing = kind === "estimate" ? 50 : kind === "quotation" ? 70 : 50;
  const [letterheadSpacing, setLetterheadSpacing] = React.useState<number>(defaultSpacing);
  const isEstimate = kind === "estimate" || kind === "quotation";
  const noun = kind === "invoice" ? "Invoice" : kind === "quotation" ? "Quotation" : "Estimate";
  const base = kind === "invoice" ? "/invoices" : kind === "quotation" ? "/quotations" : "/estimates";

  const distinctTaxRates = isEstimate
    ? []
    : Array.from(
        new Set(document.lines.map((l) => Number(l.taxRate || 0)).filter((r) => r > 0)),
      );
  const commonTaxRate = distinctTaxRates.length === 1 ? distinctTaxRates[0] : null;
  const taxHeader = commonTaxRate ? `Tax (${commonTaxRate}%)` : distinctTaxRates.length > 1 ? "Tax" : "Tax (18%)";
  const taxSummaryLabel = commonTaxRate ? `Tax (${commonTaxRate}%)` : "Tax";
  const totalAmount = isEstimate
    ? Math.round(document.subtotal - (document.discount || 0))
    : (document.roundOff || document.grandTotal);

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">{noun}</p>
          <h1 className="text-2xl font-semibold">{document.number || noun}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrintActions
            documentNumber={document.number}
            noun={noun}
            hideBankDetails={hideBankDetails}
            onToggleBankDetails={() => setHideBankDetails((prev) => !prev)}
            hasBankDetails={Boolean(business?.bank?.bankname)}
            letterheadMode={letterheadMode}
            onToggleLetterheadMode={() => setLetterheadMode((prev) => !prev)}
            letterheadSpacing={letterheadSpacing}
            onSelectLetterheadSpacing={setLetterheadSpacing}
          />
          <DocumentStatusDropdown kind={kind} id={document.id} initialDraft={document.draft} />
          <Button variant="outline" render={<Link href={`${base}/${document.id}/edit`} />} className="gap-1.5">
            <Pencil className="size-4" />
            Edit
          </Button>
          {kind === "estimate" || kind === "quotation" ? (
            <form action={invoiceFromEstimate.bind(null, document.id, kind)}>
              <Button type="submit" variant="outline">
                Make invoice
              </Button>
            </form>
          ) : null}
          <DeleteDocumentButton
            kind={kind}
            id={document.id}
            documentNumber={document.number}
            redirectTo={base}
          />
        </div>
      </div>

      {letterheadMode && (
        <div className="no-print rounded-lg border border-amber-200 bg-amber-50/90 px-3.5 py-2 text-xs text-amber-900 flex items-center justify-between">
          <span>
            <strong>Letterhead space is active ({letterheadSpacing}mm blank space at top):</strong> Header is hidden so your bill prints directly onto your pre-printed stationery.
          </span>
          <button
            type="button"
            onClick={() => setLetterheadMode(false)}
            className="font-medium underline hover:text-amber-950 ml-2 cursor-pointer"
          >
            Switch to plain paper
          </button>
        </div>
      )}

      <article className="print-sheet rounded-xl border border-neutral-200 bg-white p-6 md:p-10">
        {letterheadMode ? (
          /* When printing on letterhead: No header at all, pure blank space */
          <div
            style={{
              height: `${letterheadSpacing}mm`,
              minHeight: `${letterheadSpacing}mm`,
            }}
            className="letterhead-spacer w-full block transition-all"
            aria-hidden="true"
          >
            <div className="h-full w-full flex items-center justify-center border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-400 no-print select-none">
              Pre-printed Letterhead Space ({letterheadSpacing}mm) — Blank on print &amp; PDF
            </div>
          </div>
        ) : (
          /* Normal Plain Paper: Full Business Header */
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">{business?.name || "James Enterprises"}</h2>
              <p className="mt-1.5 max-w-sm text-sm whitespace-pre-line text-neutral-600">{business?.address}</p>
              <p className="mt-1.5 text-sm text-neutral-600">
                {[business?.gst ? `GSTIN ${business.gst}` : "", business?.state, business?.stateCode ? `Code ${business.stateCode}` : ""]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-sm text-neutral-600">{[formatBusinessPhone(business?.phone), business?.email].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">
                {document.draft ? `Draft ${noun}` : kind === "invoice" ? "Tax invoice" : noun}
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
        )}

        {/* Bill to & Document Details */}
        <div className="flex flex-wrap items-start justify-between gap-6 py-6 border-b border-neutral-100">
          <div>
            <p className="text-xs tracking-wide text-neutral-500 uppercase">Bill to</p>
            <p className="mt-1 font-semibold text-neutral-950 text-base">{customer?.name || document.customerName || "Customer"}</p>
            {document.delivery || customer?.shippingAddress ? (
              <p className="text-sm text-neutral-600 whitespace-pre-line mt-0.5">
                <span className="font-medium text-neutral-500">Site : </span>
                {document.delivery || customer?.shippingAddress}
              </p>
            ) : document.billing || customer?.billingAddress ? (
              <p className="text-sm text-neutral-600 whitespace-pre-line mt-0.5">{document.billing || customer?.billingAddress}</p>
            ) : null}
            {customer?.phone ? <p className="text-sm text-neutral-600 mt-0.5">{customer.phone}</p> : null}
            {customer?.gst ? <p className="text-sm text-neutral-600 mt-0.5">GSTIN {customer.gst}</p> : null}
          </div>

          <dl className="space-y-1.5 text-sm text-right">
            {letterheadMode && (
              <div>
                <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">{noun}</p>
                <p className="text-xl font-bold text-neutral-950">{document.number}</p>
              </div>
            )}
            <div className="flex justify-between gap-6 md:justify-end pt-1">
              <dt className="text-neutral-500">Date</dt>
              <dd className="font-medium text-neutral-900">{formatDate(document.date)}</dd>
            </div>
            {document.referenceNumber ? (
              <div className="flex justify-between gap-6 md:justify-end">
                <dt className="text-neutral-500">Reference</dt>
                <dd className="font-medium text-neutral-900">{document.referenceNumber}</dd>
              </div>
            ) : null}
            {letterheadMode && (
              <div className="no-print pt-1">
                <DocumentStatusDropdown kind={kind} id={document.id} initialDraft={document.draft} size="sm" />
              </div>
            )}
          </dl>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-y border-neutral-200 text-left text-xs tracking-wide text-neutral-500 uppercase">
              <th className="py-2.5 font-medium">Item</th>
             
              <th className="py-2.5 text-right font-medium">Qty</th>
              <th className="py-2.5 text-right font-medium">Rate</th>
              {!isEstimate && <th className="py-2.5 text-right font-medium">{taxHeader}</th>}
              <th className="py-2.5 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {document.lines.map((line, index) => {
              const effectiveLine = isEstimate ? { ...line, taxRate: 0 } : line;
              const amount = lineAmounts(effectiveLine);
              return (
                <tr key={`${line.name}-${index}`} className="border-b border-neutral-100">
                  <td className="py-3.5 pr-3">
                    <p className="font-medium text-neutral-900">{line.name}</p>
                    {line.note ? <p className="text-xs text-neutral-500 mt-0.5">{line.note}</p> : null}
                  </td>
                 
                  <td className="py-3.5 text-right tabular-nums text-neutral-800">
                    {line.qty} {line.unit}
                  </td>
                  <td className="py-3.5 text-right tabular-nums text-neutral-800">{inr(line.rate)}</td>
                  {!isEstimate && (
                    <td className="py-3.5 text-right tabular-nums text-neutral-800">
                      {inr(amount.tax)}
                    </td>
                  )}
                  <td className="py-3.5 text-right font-medium tabular-nums text-neutral-950">{inr(amount.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 flex flex-col items-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <Row label="Subtotal" value={inr(document.subtotal)} />
            {!isEstimate && <Row label={taxSummaryLabel} value={inr(document.tax)} />}
            {document.discount ? <Row label="Discount" value={inr(document.discount)} /> : null}
            <div className="flex justify-between border-y border-neutral-900 py-3 text-base font-semibold">
              <dt>{isEstimate ? `Total ${noun.toLowerCase()}` : "Amount due"}</dt>
              <dd className="tabular-nums">{inr(totalAmount)}</dd>
            </div>
          </dl>
          <div className="text-right">
            <AmountInWords amount={totalAmount} />
          </div>
        </div>

        {document.notes ? <p className="mt-12 text-sm whitespace-pre-line text-neutral-600">{document.notes}</p> : null}

        {!hideBankDetails && business?.bank.bankname ? (
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
