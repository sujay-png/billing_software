"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, Trash2 } from "lucide-react";
import { quickCreateCustomer } from "@/controllers/customers";
import { saveDocument } from "@/controllers/documents";
import { quickCreateItem } from "@/controllers/items";
import { inr } from "@/models/money";
import type { CatalogItem, Customer, DocumentDraft, DocumentKind } from "@/models/types";
import { useDocumentEditor } from "@/viewmodels/use-document-editor";
import { SearchSelect } from "@/views/shared/search-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const terms = ["Due on receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"];
const orderTypes = ["Dine In", "Take Away", "Delivery", "Counter"];

export function DocumentEditor({
  kind,
  initial,
  customers,
  items,
}: {
  kind: DocumentKind;
  initial: DocumentDraft;
  customers: Customer[];
  items: CatalogItem[];
}) {
  const router = useRouter();
  const defaultTax = kind === "invoice" ? 18 : 0;
  const editor = useDocumentEditor(initial, defaultTax);
  const [customerOptions, setCustomerOptions] = useState(customers);
  const [itemOptions, setItemOptions] = useState(items);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"draft" | "final" | null>(null);
  const [customerDialog, setCustomerDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState<string | null>(null);
  const noteRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!editor.focusKey) return;
    noteRefs.current[editor.focusKey]?.focus();
  }, [editor.focusKey, editor.lines.length]);

  async function save(isDraft: boolean) {
    setPending(isDraft ? "draft" : "final");
    setError("");
    const result = await saveDocument(kind, editor.draft(), isDraft);
    setPending(null);
    if (result.error || !result.id) {
      setError(result.error || "Could not save.");
      return;
    }
    router.push(kind === "invoice" ? `/invoices/${result.id}` : `/estimates/${result.id}`);
    router.refresh();
  }

  const noun = kind === "invoice" ? "Invoice" : "Estimate";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">{noun}</p>
          <h1 className="text-2xl font-semibold">{initial.id ? `Edit ${editor.number || noun}` : `New ${noun.toLowerCase()}`}</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={pending !== null} onClick={() => save(true)}>
            {pending === "draft" ? "Saving" : "Save draft"}
          </Button>
          <Button type="button" disabled={pending !== null} onClick={() => save(false)}>
            {pending === "final" ? "Saving" : kind === "invoice" ? "Save & issue" : "Save estimate"}
          </Button>
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-[minmax(0,1.4fr)_220px_220px]">
        <div className="space-y-2">
          <Label>Customer</Label>
          <SearchSelect
            value={editor.customerName}
            placeholder="Customer name"
            allowCustom
            customLabel="Bill"
            options={customerOptions.map((customer) => ({
              value: String(customer.id),
              label: customer.name,
              description: [customer.phone, customer.gst].filter(Boolean).join(" · "),
            }))}
            onSelect={(option, query) => {
              if (!option) {
                editor.chooseCustomer(null, query);
                return;
              }
              const customer = customerOptions.find((item) => String(item.id) === option.value);
              if (customer) editor.chooseCustomer(customer);
            }}
          />
          <button type="button" className="text-xs underline" onClick={() => setCustomerDialog(true)}>
            Add a new customer
          </button>
        </div>
        <Field label={`${noun} no.`} value={editor.number} onChange={editor.setNumber} />
        <Field label="Date" type="date" value={editor.date} onChange={editor.setDate} />
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Items</h2>
            <p className="text-xs text-neutral-500">Duplicate a line when the same item is billed in another size.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={editor.addLine}>
            <Plus />
            Add item
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-neutral-50 text-left text-xs tracking-wide text-neutral-500 uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Size / note</th>
                <th className="w-24 px-3 py-2 font-medium">HSN</th>
                <th className="w-20 px-3 py-2 font-medium">Qty</th>
                <th className="w-20 px-3 py-2 font-medium">Unit</th>
                <th className="w-28 px-3 py-2 font-medium">Rate</th>
                <th className="w-20 px-3 py-2 font-medium">Tax %</th>
                <th className="w-24 px-3 py-2 font-medium">Disc.</th>
                <th className="w-28 px-3 py-2 text-right font-medium">Amount</th>
                <th className="w-20 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {editor.lines.map((line) => {
                const amount = editor.lineAmounts(line);
                return (
                  <tr key={line.key} className="border-t border-neutral-100 align-top">
                    <td className="px-3 py-2">
                      <SearchSelect
                        value={line.name}
                        placeholder="Search items"
                        allowCustom
                        customLabel="Use"
                        options={itemOptions.map((item) => ({
                          value: String(item.id),
                          label: item.name,
                          description: [item.unit, item.hsn, inr(item.cost)].filter(Boolean).join(" · "),
                        }))}
                        onSelect={(option, query) => {
                          if (!option) {
                            editor.chooseItem(line.key, null, query);
                            return;
                          }
                          const item = itemOptions.find((entry) => String(entry.id) === option.value);
                          if (item) editor.chooseItem(line.key, item);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        ref={(node) => {
                          noteRefs.current[line.key] = node;
                        }}
                        value={line.note}
                        placeholder="Size, room, or note"
                        onChange={(event) => editor.updateLine(line.key, { note: event.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={line.hsn} onChange={(event) => editor.updateLine(line.key, { hsn: event.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.qty}
                        onChange={(event) => editor.updateLine(line.key, { qty: Number(event.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={line.unit} onChange={(event) => editor.updateLine(line.key, { unit: event.target.value })} />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.rate}
                        onChange={(event) => editor.updateLine(line.key, { rate: Number(event.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.taxRate}
                        onChange={(event) => editor.updateLine(line.key, { taxRate: Number(event.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.lineDiscount}
                        onChange={(event) => editor.updateLine(line.key, { lineDiscount: Number(event.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{inr(amount.total)}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="icon-sm" variant="ghost" title="Duplicate for another size" onClick={() => editor.duplicateLine(line.key)}>
                          <Copy />
                        </Button>
                        <Button type="button" size="icon-sm" variant="ghost" onClick={() => editor.removeLine(line.key)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-neutral-200 px-4 py-3">
          <button type="button" className="text-xs underline" onClick={() => setItemDialog(editor.lines.at(-1)?.key ?? null)}>
            Save a new item to the catalog
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <details className="rounded-xl border border-neutral-200 bg-white p-4" open={Boolean(editor.billing || editor.notes || editor.paymentTerms)}>
          <summary className="cursor-pointer text-sm font-medium">Billing details</summary>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Payment terms</Label>
              <SearchSelect
                value={editor.paymentTerms}
                placeholder="Payment terms"
                allowCustom
                options={terms.map((term) => ({ value: term, label: term }))}
                onSelect={(option, query) => editor.setPaymentTerms(option?.label || query)}
              />
            </div>
            <Field label={kind === "invoice" ? "Due date" : "Valid until"} type="date" value={editor.validDate} onChange={editor.setValidDate} />
            {kind === "estimate" ? (
              <Field label="Reference" value={editor.referenceNumber} onChange={editor.setReferenceNumber} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Order</Label>
                  <SearchSelect
                    value={editor.orderType}
                    placeholder="Order type"
                    allowCustom
                    options={orderTypes.map((type) => ({ value: type, label: type }))}
                    onSelect={(option, query) => editor.setOrderType(option?.label || query)}
                  />
                </div>
                <Field label="Table" value={editor.tableNo} onChange={editor.setTableNo} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Billing address</Label>
              <Textarea value={editor.billing} onChange={(event) => editor.setBilling(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery address</Label>
              <Textarea value={editor.delivery} onChange={(event) => editor.setDelivery(event.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={editor.notes} onChange={(event) => editor.setNotes(event.target.value)} />
            </div>
          </div>
        </details>

        <aside className="h-fit space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <Total label="Subtotal" value={inr(editor.totals.subtotal)} />
          <Total label="Tax" value={inr(editor.totals.tax)} />
          <div className="flex items-center justify-between gap-3 text-sm">
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step="0.01"
              className="w-32 text-right"
              value={editor.discount}
              onChange={(event) => editor.setDiscount(Number(event.target.value))}
            />
          </div>
          <Total label="Exact total" value={inr(editor.totals.grandTotal)} />
          <div className="flex items-end justify-between border-t border-neutral-200 pt-3">
            <span className="text-sm text-neutral-500">Amount due</span>
            <span className="text-2xl font-semibold tabular-nums">{inr(editor.totals.roundOff)}</span>
          </div>
          {error ? <p className="text-sm">{error}</p> : null}
        </aside>
      </section>

      <CustomerDialog
        key={editor.customerName}
        open={customerDialog}
        onOpenChange={setCustomerDialog}
        initialName={editor.customerName}
        onCreated={(customer) => {
          setCustomerOptions((current) => [customer, ...current.filter((item) => item.id !== customer.id)]);
          editor.rememberCustomer(customer);
        }}
      />
      <ItemDialog
        open={itemDialog !== null}
        onOpenChange={(open) => {
          if (!open) setItemDialog(null);
        }}
        onCreated={(item) => {
          setItemOptions((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
          if (itemDialog) editor.rememberItem(item, itemDialog);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} className="h-9" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function CustomerDialog({
  open,
  onOpenChange,
  initialName,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onCreated: (customer: Customer) => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [billing, setBilling] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    const result = await quickCreateCustomer({ name, phone, billing });
    setPending(false);
    if (result.error || !result.customer) {
      setError(result.error || "Could not add the customer.");
      return;
    }
    onCreated(result.customer);
    onOpenChange(false);
    setPhone("");
    setBilling("");
    setError("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <div className="space-y-1.5">
            <Label>Billing address</Label>
            <Textarea value={billing} onChange={(event) => setBilling(event.target.value)} />
          </div>
          {error ? <p className="text-sm">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? "Saving" : "Add customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItemDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: CatalogItem) => void;
}) {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("0");
  const [unit, setUnit] = useState("");
  const [hsn, setHsn] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    const result = await quickCreateItem({ name, rate: Number(rate), unit, hsn });
    setPending(false);
    if (result.error || !result.item) {
      setError(result.error || "Could not add the item.");
      return;
    }
    onCreated(result.item);
    onOpenChange(false);
    setName("");
    setRate("0");
    setUnit("");
    setHsn("");
    setError("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New catalog item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Field label="Name" value={name} onChange={setName} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="Rate" value={rate} onChange={setRate} />
            <Field label="Unit" value={unit} onChange={setUnit} />
            <Field label="HSN" value={hsn} onChange={setHsn} />
          </div>
          {error ? <p className="text-sm">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? "Saving" : "Add item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
