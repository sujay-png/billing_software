import { parseEstimateLines, parseInvoiceLines } from "@/models/lines";
import { asNumber, round2, toDateInput } from "@/models/money";
import type { BankDetails, BusinessProfile, CatalogItem, Customer, SavedDocument } from "@/models/types";

function text(value: unknown) {
  return value == null ? "" : String(value).trim();
}

export function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: Number(row.id),
    name: text(row.customer_name),
    phone: text(row.customer_phone),
    email: text(row.customer_email),
    gst: text(row.customer_GST),
    businessName: text(row.customer_businessname),
    billingAddress: text(row.customer_billingaddress),
    shippingAddress: text(row.customer_shippingaddress),
    gstState: text(row.customer_gststate),
    gstStateCode: text(row.customer_gststatecode),
    archived: Boolean(row.isArchive),
  };
}

export function mapItem(row: Record<string, unknown>): CatalogItem {
  return {
    id: Number(row.id),
    name: text(row.item_name),
    code: text(row.item_code),
    hsn: text(row.item_HSNcode),
    cost: asNumber(row.item_cost),
    unit: text(row.item_costNarration),
    description: text(row.item_description),
    category: text(row.category),
    archived: Boolean(row.isArchive),
  };
}

export function mapBusiness(row: Record<string, unknown>): BusinessProfile {
  const bank = (row.business_bank ?? {}) as BankDetails;
  let phone = text(row.buiness_phone);
  if (phone === "2410136" || phone === "0824-2410136" || phone === "0824 -2410136" || phone === "0824 - 2410136") {
    phone = "Ph .No.0824 -2410136";
  }
  return {
    id: Number(row.id),
    name: text(row.business_name),
    phone,
    email: text(row.business_email),
    gst: text(row.business_GST),
    state: text(row.business_State),
    stateCode: text(row.business_StateCode),
    mobile: text(row.business_mobile),
    address: text(row.business_address),
    owner: text(row.business_owner),
    upi: text(row.business_upi),
    logo: text(row.business_logo),
    bank: {
      branch: text(bank.branch),
      bankname: text(bank.bankname),
      ifsccode: text(bank.ifsccode),
      accountno: bank.accountno ?? "",
      accountname: text(bank.accountname),
    },
  };
}

export function mapInvoice(row: Record<string, unknown>): SavedDocument {
  const lines = parseInvoiceLines(row.invoices_items);
  return {
    id: Number(row.id),
    number: text(row.invoices_no),
    customerId: row.customer_ref == null ? null : Number(row.customer_ref),
    customerName: "",
    billing: text(row.customer_custombilling),
    delivery: text(row.customer_customDelivery),
    date: toDateInput(text(row.invoices_date)),
    validDate: toDateInput(text(row.invoices_validDate)),
    paymentTerms: text(row.invoices_paymentTerms),
    notes: text(row.invoices_notes),
    discount: asNumber(row.invoices_discount),
    lines,
    orderType: text(row.order_type),
    tableNo: text(row.table),
    referenceNumber: "",
    draft: Boolean(row.isDraft),
    archived: false,
    subtotal: asNumber(row.invoices_subtotal),
    tax: asNumber(row.invoices_tax),
    grandTotal: asNumber(row.invoices_grantTotal),
    roundOff: asNumber(row.invoice_grandtotalroundoff),
  };
}

export function mapEstimate(row: Record<string, unknown>): SavedDocument {
  const subtotal = asNumber(row.estimate_subtotal);
  const discount = asNumber(row.estimate_discount);
  const total = round2(subtotal - discount);
  return {
    id: Number(row.id),
    number: text(row.estimate_no),
    customerId: row.customer_ref == null ? null : Number(row.customer_ref),
    customerName: "",
    billing: text(row.customer_custombilling),
    delivery: text(row.customer_customDelivery),
    date: toDateInput(text(row.estimate_date)),
    validDate: toDateInput(text(row.estimate_validDate)),
    paymentTerms: text(row.estimate_paymentTerms),
    notes: text(row.estimate_notes),
    discount,
    lines: parseEstimateLines(row.estimate_items).map((line) => ({ ...line, taxRate: 0 })),
    orderType: "",
    tableNo: "",
    referenceNumber: text(row.refnumber),
    draft: row.isDraft == null ? true : Boolean(row.isDraft),
    archived: Boolean(row.isArchive),
    subtotal,
    tax: 0,
    grandTotal: total,
    roundOff: Math.round(total),
  };
}

export function mapQuotation(row: Record<string, unknown>): SavedDocument {
  const subtotal = asNumber(row.quotation_subtotal ?? row.estimate_subtotal);
  const discount = asNumber(row.quotation_discount ?? row.estimate_discount);
  const total = round2(subtotal - discount);
  const rawItems = row.quotation_items ?? row.estimate_items;
  return {
    id: Number(row.id),
    number: text(row.quotation_no ?? row.estimate_no),
    customerId: row.customer_ref == null ? null : Number(row.customer_ref),
    customerName: "",
    billing: text(row.customer_custombilling),
    delivery: text(row.customer_customDelivery),
    date: toDateInput(text(row.quotation_date ?? row.estimate_date)),
    validDate: toDateInput(text(row.quotation_validDate ?? row.estimate_validDate)),
    paymentTerms: text(row.quotation_paymentTerms ?? row.estimate_paymentTerms),
    notes: text(row.quotation_notes ?? row.estimate_notes),
    discount,
    lines: parseEstimateLines(rawItems).map((line) => ({ ...line, taxRate: 0 })),
    orderType: "",
    tableNo: "",
    referenceNumber: text(row.refnumber),
    draft: row.isDraft == null ? true : Boolean(row.isDraft),
    archived: Boolean(row.isArchive),
    subtotal,
    tax: 0,
    grandTotal: total,
    roundOff: Math.round(total),
  };
}
