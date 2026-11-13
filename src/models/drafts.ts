import { addDays, todayInput } from "@/models/money";
import type { DocumentDraft, DocumentKind, SavedDocument } from "@/models/types";

export function blankDraft(kind: DocumentKind, number: string): DocumentDraft {
  const date = todayInput();
  return {
    number,
    customerId: null,
    customerName: "",
    billing: "",
    delivery: "",
    date,
    validDate: addDays(date, kind === "invoice" ? 7 : 15),
    paymentTerms: "",
    notes: "",
    discount: 0,
    lines: [],
    orderType: "",
    tableNo: "",
    referenceNumber: "",
  };
}

export function draftFromDocument(document: SavedDocument): DocumentDraft {
  return {
    id: document.id,
    number: document.number,
    customerId: document.customerId,
    customerName: document.customerName,
    billing: document.billing,
    delivery: document.delivery,
    date: document.date,
    validDate: document.validDate,
    paymentTerms: document.paymentTerms,
    notes: document.notes,
    discount: document.discount,
    lines: document.lines,
    orderType: document.orderType,
    tableNo: document.tableNo,
    referenceNumber: document.referenceNumber,
  };
}
