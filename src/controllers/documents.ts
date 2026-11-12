"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContext } from "@/controllers/context";
import { serializeEstimateLines, serializeInvoiceLines } from "@/models/lines";
import { mapCustomer, mapEstimate, mapInvoice, mapQuotation } from "@/models/mappers";
import { documentTotals, searchTerm } from "@/models/money";
import type { Customer, DocumentDraft, DocumentKind, DocumentListRow, SavedDocument } from "@/models/types";

function documentBasePath(kind: DocumentKind) {
  if (kind === "invoice") return "/invoices";
  if (kind === "quotation") return "/quotations";
  return "/estimates";
}

function documentTable(kind: DocumentKind) {
  if (kind === "invoice") return "Invoices";
  if (kind === "quotation") return "Quotations";
  return "Estimates";
}

function documentNumberColumn(kind: DocumentKind) {
  if (kind === "invoice") return "invoices_no";
  if (kind === "quotation") return "quotation_no";
  return "estimate_no";
}

function activeLines(draft: DocumentDraft) {
  return draft.lines.filter((line) => line.name.trim() && line.qty !== 0);
}

async function resolveCustomer(draft: DocumentDraft, businessId: number, supabase: Awaited<ReturnType<typeof requireContext>>["supabase"]) {
  if (draft.customerId) return draft.customerId;
  const name = draft.customerName.trim();
  if (!name) return null;
  const { data, error } = await supabase
    .from("Customers")
    .insert({
      customer_name: name,
      customer_billingaddress: draft.billing.trim() || null,
      customer_shippingaddress: draft.delivery.trim() || null,
      business_ref: businessId,
      isArchive: false,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not create the customer");
  return data.id as number;
}

export async function saveDocument(
  kind: DocumentKind,
  draft: DocumentDraft,
  isDraft: boolean,
): Promise<{ id?: number; error?: string }> {
  try {
    const { supabase, businessId } = await requireContext();
    const lines = activeLines(draft);
    if (!draft.customerName.trim() && !draft.customerId) return { error: "Enter a customer name." };
    if (lines.length === 0) return { error: "Add at least one item." };

    const customerId = await resolveCustomer(draft, businessId, supabase);
    const effectiveLines = (kind === "estimate" || kind === "quotation") ? lines.map((l) => ({ ...l, taxRate: 0 })) : lines;
    const totals = documentTotals(effectiveLines, draft.discount);
    const date = draft.date ? `${draft.date}T00:00:00.000Z` : new Date().toISOString();
    const valid = draft.validDate ? `${draft.validDate}T00:00:00.000Z` : null;

    if (kind === "invoice") {
      const payload = {
        invoices_no: draft.number.trim() || null,
        customer_ref: customerId,
        customer_custombilling: draft.billing.trim() || null,
        customer_customDelivery: draft.delivery.trim() || null,
        invoices_date: date,
        invoices_validDate: valid,
        invoices_paymentTerms: draft.paymentTerms.trim() || null,
        invoices_items: serializeInvoiceLines(effectiveLines, totals.lines),
        invoices_discount: draft.discount || 0,
        invoices_subtotal: totals.subtotal,
        invoices_tax: totals.tax,
        invoices_grantTotal: totals.grandTotal,
        invoice_grandtotalroundoff: totals.roundOff,
        invoices_notes: draft.notes.trim() || null,
        isDraft,
        business_ref: businessId,
        order_type: draft.orderType.trim() || null,
        table: draft.tableNo.trim() || null,
      };
      const query = draft.id
        ? supabase.from("Invoices").update(payload).eq("id", draft.id).eq("business_ref", businessId).select("id").single()
        : supabase.from("Invoices").insert(payload).select("id").single();
      const { data, error } = await query;
      if (error || !data) return { error: error?.message || "Could not save the invoice." };
      revalidatePath("/invoices");
      revalidatePath(`/invoices/${data.id}`);
      revalidatePath("/dashboard");
      return { id: data.id as number };
    }

    if (kind === "quotation") {
      const payload = {
        quotation_no: draft.number.trim() || null,
        customer_ref: customerId,
        customer_custombilling: draft.billing.trim() || null,
        customer_customDelivery: draft.delivery.trim() || null,
        quotation_date: date,
        quotation_validDate: valid,
        quotation_paymentTerms: draft.paymentTerms.trim() || null,
        quotation_items: serializeEstimateLines(effectiveLines, totals.lines),
        quotation_discount: draft.discount || 0,
        quotation_subtotal: totals.subtotal,
        quotation_tax: 0,
        quotation_grantTotal: totals.grandTotal,
        quotation_grandtotalroundoff: totals.roundOff,
        quotation_notes: draft.notes.trim() || null,
        isDraft,
        business_ref: businessId,
        refnumber: draft.referenceNumber.trim() || null,
        isArchive: false,
      };
      const query = draft.id
        ? supabase.from("Quotations").update(payload).eq("id", draft.id).eq("business_ref", businessId).select("id").single()
        : supabase.from("Quotations").insert(payload).select("id").single();
      const { data, error } = await query;
      if (error || !data) return { error: error?.message || "Could not save the quotation." };
      const basePath = documentBasePath(kind);
      revalidatePath(basePath);
      revalidatePath(`${basePath}/${data.id}`);
      revalidatePath("/dashboard");
      return { id: data.id as number };
    }

    const payload = {
      estimate_no: draft.number.trim() || null,
      customer_ref: customerId,
      customer_custombilling: draft.billing.trim() || null,
      customer_customDelivery: draft.delivery.trim() || null,
      estimate_date: date,
      estimate_validDate: valid,
      estimate_paymentTerms: draft.paymentTerms.trim() || null,
      estimate_items: serializeEstimateLines(effectiveLines, totals.lines),
      estimate_discount: draft.discount || 0,
      estimate_subtotal: totals.subtotal,
      estimate_tax: 0,
      estimate_grantTotal: totals.grandTotal,
      estimate_grandtotalroundoff: totals.roundOff,
      estimate_notes: draft.notes.trim() || null,
      isDraft,
      business_ref: businessId,
      refnumber: draft.referenceNumber.trim() || null,
      isArchive: false,
    };
    const query = draft.id
      ? supabase.from("Estimates").update(payload).eq("id", draft.id).eq("business_ref", businessId).select("id").single()
      : supabase.from("Estimates").insert(payload).select("id").single();
    const { data, error } = await query;
    if (error || !data) return { error: error?.message || `Could not save the ${kind}.` };
    const basePath = documentBasePath(kind);
    revalidatePath(basePath);
    revalidatePath(`${basePath}/${data.id}`);
    revalidatePath("/dashboard");
    return { id: data.id as number };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save." };
  }
}

async function nextNumber(kind: DocumentKind) {
  const { supabase, businessId } = await requireContext();
  const table = documentTable(kind);
  const column = documentNumberColumn(kind);
  const { data } = await supabase.from(table).select(column).eq("business_ref", businessId).limit(1000);
  let max = 0;
  for (const row of data ?? []) {
    const raw = String((row as Record<string, unknown>)[column] ?? "");
    const digits = raw.match(/\d+/g)?.join("") ?? "";
    const value = Number(digits);
    if (Number.isFinite(value) && value > max) max = value;
  }
  return String(max + 1).padStart(3, "0");
}

export async function nextDocumentNumber(kind: DocumentKind) {
  return nextNumber(kind);
}

export async function listDocuments(kind: DocumentKind, query = ""): Promise<DocumentListRow[]> {
  const { supabase, businessId } = await requireContext();
  const term = searchTerm(query).toLowerCase();

  if (kind === "invoice") {
    const { data, error } = await supabase
      .from("Invoices")
      .select("id, invoices_no, invoices_date, invoice_grandtotalroundoff, invoices_grantTotal, isDraft, customer:Customers(customer_name)")
      .eq("business_ref", businessId)
      .order("invoices_date", { ascending: false, nullsFirst: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => {
        const customer = row.customer as { customer_name?: string } | null;
        return {
          id: row.id as number,
          number: String(row.invoices_no ?? ""),
          customerName: String(customer?.customer_name ?? "Walk-in").trim() || "Walk-in",
          date: String(row.invoices_date ?? ""),
          total: Number(row.invoice_grandtotalroundoff ?? row.invoices_grantTotal ?? 0),
          draft: Boolean(row.isDraft),
          archived: false,
        };
      })
      .filter((row) => !term || `${row.number} ${row.customerName}`.toLowerCase().includes(term));
  }

  if (kind === "quotation") {
    const { data, error } = await supabase
      .from("Quotations")
      .select("id, quotation_no, quotation_date, quotation_grandtotalroundoff, quotation_grantTotal, isDraft, isArchive, customer:Customers(customer_name)")
      .eq("business_ref", businessId)
      .order("quotation_date", { ascending: false, nullsFirst: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => {
        const customer = row.customer as { customer_name?: string } | null;
        return {
          id: row.id as number,
          number: String(row.quotation_no ?? ""),
          customerName: String(customer?.customer_name ?? "").trim() || "Customer",
          date: String(row.quotation_date ?? ""),
          total: Number(row.quotation_grandtotalroundoff ?? row.quotation_grantTotal ?? 0),
          draft: Boolean(row.isDraft),
          archived: Boolean(row.isArchive),
        };
      })
      .filter((row) => !row.archived)
      .filter((row) => !term || `${row.number} ${row.customerName}`.toLowerCase().includes(term));
  }

  const { data, error } = await supabase
    .from("Estimates")
    .select("id, estimate_no, estimate_date, estimate_grandtotalroundoff, estimate_grantTotal, isDraft, isArchive, customer:Customers(customer_name)")
    .eq("business_ref", businessId)
    .order("estimate_date", { ascending: false, nullsFirst: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => {
      const customer = row.customer as { customer_name?: string } | null;
      return {
        id: row.id as number,
        number: String(row.estimate_no ?? ""),
        customerName: String(customer?.customer_name ?? "").trim() || "Customer",
        date: String(row.estimate_date ?? ""),
        total: Number(row.estimate_grandtotalroundoff ?? row.estimate_grantTotal ?? 0),
        draft: Boolean(row.isDraft),
        archived: Boolean(row.isArchive),
      };
    })
    .filter((row) => !row.archived)
    .filter((row) => !term || `${row.number} ${row.customerName}`.toLowerCase().includes(term));
}

export async function getDocument(kind: DocumentKind, id: number): Promise<{ document: SavedDocument; customer: Customer | null } | null> {
  const { supabase, businessId } = await requireContext();
  const table = documentTable(kind);
  const { data } = await supabase.from(table).select("*").eq("id", id).eq("business_ref", businessId).maybeSingle();
  if (!data) return null;
  const document = kind === "invoice" ? mapInvoice(data) : kind === "quotation" ? mapQuotation(data) : mapEstimate(data);
  let customer: Customer | null = null;
  if (document.customerId) {
    const { data: customerRow } = await supabase
      .from("Customers")
      .select("*")
      .eq("id", document.customerId)
      .maybeSingle();
    if (customerRow) {
      customer = mapCustomer(customerRow);
      document.customerName = customer.name;
      if (!document.billing) document.billing = customer.billingAddress;
      if (!document.delivery) document.delivery = customer.shippingAddress;
    }
  }
  return { document, customer };
}

export async function deleteDocument(kind: DocumentKind, id: number) {
  const { supabase, businessId } = await requireContext();
  const table = documentTable(kind);
  const basePath = documentBasePath(kind);
  await supabase.from(table).delete().eq("id", id).eq("business_ref", businessId);
  revalidatePath(basePath);
  revalidatePath("/dashboard");
  redirect(basePath);
}

export async function deleteDocumentAction(kind: DocumentKind, id: number) {
  try {
    const { supabase, businessId } = await requireContext();
    const table = documentTable(kind);
    const basePath = documentBasePath(kind);
    const { error } = await supabase.from(table).delete().eq("id", id).eq("business_ref", businessId);
    if (error) return { error: error.message };
    revalidatePath(basePath);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete" };
  }
}

export async function setDocumentStatus(kind: DocumentKind, id: number, isDraft: boolean) {
  const { supabase, businessId } = await requireContext();
  const table = documentTable(kind);
  const column = "isDraft";
  const basePath = documentBasePath(kind);
  await supabase.from(table).update({ [column]: isDraft }).eq("id", id).eq("business_ref", businessId);
  revalidatePath(basePath);
  revalidatePath(`${basePath}/${id}`);
  revalidatePath("/dashboard");
  redirect(`${basePath}/${id}`);
}

export async function updateDocumentStatus(kind: DocumentKind, id: number, isDraft: boolean) {
  try {
    const { supabase, businessId } = await requireContext();
    const table = documentTable(kind);
    const basePath = documentBasePath(kind);
    const { error } = await supabase.from(table).update({ isDraft }).eq("id", id).eq("business_ref", businessId);
    if (error) return { error: error.message };
    revalidatePath(basePath);
    revalidatePath(`${basePath}/${id}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update status" };
  }
}

export async function invoiceFromEstimate(sourceId: number, kind: "estimate" | "quotation" = "estimate") {
  const loaded = await getDocument(kind, sourceId);
  const basePath = documentBasePath(kind);
  if (!loaded) redirect(basePath);
  const number = await nextNumber("invoice");
  const lines = loaded.document.lines.map((l) => ({
    ...l,
    taxRate: l.taxRate || 18,
  }));
  const result = await saveDocument(
    "invoice",
    {
      ...loaded.document,
      id: undefined,
      number,
      lines,
    },
    true,
  );
  if (!result.id) redirect(`${basePath}/${sourceId}`);
  redirect(`/invoices/${result.id}/edit`);
}
