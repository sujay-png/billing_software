"use client";

import { useMemo, useState } from "react";
import { documentTotals, lineAmounts as moneyLineAmounts } from "@/models/money";
import type { CatalogItem, Customer, DocumentDraft, LineInput } from "@/models/types";

export type DraftLine = LineInput & { key: string };

function withKeys(lines: LineInput[], taxRate: number): DraftLine[] {
  const source = lines.length > 0 ? lines : [blankLine(taxRate)];
  return source.map((line) => ({ ...line, key: crypto.randomUUID() }));
}

function blankLine(taxRate: number): LineInput {
  return {
    itemId: null,
    name: "",
    note: "",
    hsn: "",
    unit: "",
    qty: 1,
    rate: 0,
    taxRate,
    lineDiscount: 0,
  };
}

export function useDocumentEditor(initial: DocumentDraft, defaultTax: number, isEstimate = false) {
  const effectiveDefaultTax = isEstimate ? 0 : defaultTax;
  const [customerId, setCustomerId] = useState<number | null>(initial.customerId);
  const [customerName, setCustomerName] = useState(initial.customerName);
  const [billing, setBilling] = useState(initial.billing);
  const [delivery, setDelivery] = useState(initial.delivery);
  const [number, setNumber] = useState(initial.number);
  const [date, setDate] = useState(initial.date);
  const [validDate, setValidDate] = useState(initial.validDate);
  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms);
  const [notes, setNotes] = useState(initial.notes);
  const [discount, setDiscount] = useState(initial.discount);
  const [orderType, setOrderType] = useState(initial.orderType);
  const [tableNo, setTableNo] = useState(initial.tableNo);
  const [referenceNumber, setReferenceNumber] = useState(initial.referenceNumber);
  const [lines, setLines] = useState<DraftLine[]>(() =>
    withKeys(
      isEstimate ? initial.lines.map((l) => ({ ...l, taxRate: 0 })) : initial.lines,
      effectiveDefaultTax,
    ),
  );
  const [focusKey, setFocusKey] = useState<string | null>(null);

  const totals = useMemo(() => {
    const active = lines
      .filter((line) => line.name.trim())
      .map((line) => (isEstimate ? { ...line, taxRate: 0 } : line));
    return documentTotals(active, discount);
  }, [lines, discount, isEstimate]);

  function lineAmounts(line: LineInput) {
    return moneyLineAmounts(isEstimate ? { ...line, taxRate: 0 } : line);
  }

  function updateLine(key: string, patch: Partial<LineInput>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function chooseCustomer(customer: Customer | null, typedName = "") {
    if (!customer) {
      setCustomerId(null);
      setCustomerName(typedName);
      return;
    }
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    if (customer.billingAddress) setBilling(customer.billingAddress);
    if (customer.shippingAddress) setDelivery(customer.shippingAddress);
  }

  function chooseItem(key: string, item: CatalogItem | null, typedName = "") {
    setLines((current) =>
      current.map((line) => {
        if (line.key !== key) return line;
        if (!item) return { ...line, itemId: null, name: typedName };
        return {
          ...line,
          itemId: item.id,
          name: item.name,
          hsn: item.hsn,
          unit: item.unit,
          rate: item.cost,
          note: line.note || item.description,
        };
      }),
    );
  }

  function addLine() {
    const key = crypto.randomUUID();
    setLines((current) => [...current, { ...blankLine(effectiveDefaultTax), key }]);
    setFocusKey(key);
  }

  function duplicateLine(key: string) {
    const index = lines.findIndex((line) => line.key === key);
    if (index < 0) return;
    const copyKey = crypto.randomUUID();
    const source = lines[index];
    const copy: DraftLine = { ...source, key: copyKey, note: "", taxRate: isEstimate ? 0 : source.taxRate };
    setLines((current) => [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]);
    setFocusKey(copyKey);
  }

  function removeLine(key: string) {
    setLines((current) => {
      const next = current.filter((line) => line.key !== key);
      return next.length > 0 ? next : [{ ...blankLine(effectiveDefaultTax), key: crypto.randomUUID() }];
    });
  }

  function draft(): DocumentDraft {
    return {
      id: initial.id,
      number,
      customerId,
      customerName,
      billing,
      delivery,
      date,
      validDate,
      paymentTerms,
      notes,
      discount,
      lines: lines.map((line) => ({
        itemId: line.itemId,
        name: line.name,
        note: line.note,
        hsn: line.hsn,
        unit: line.unit,
        qty: line.qty,
        rate: line.rate,
        taxRate: isEstimate ? 0 : line.taxRate,
        lineDiscount: line.lineDiscount,
      })),
      orderType,
      tableNo,
      referenceNumber,
    };
  }

  return {
    customerId,
    customerName,
    billing,
    delivery,
    number,
    date,
    validDate,
    paymentTerms,
    notes,
    discount,
    orderType,
    tableNo,
    referenceNumber,
    lines,
    focusKey,
    totals,
    lineAmounts,
    setBilling,
    setDelivery,
    setNumber,
    setDate,
    setValidDate,
    setPaymentTerms,
    setNotes,
    setDiscount,
    setOrderType,
    setTableNo,
    setReferenceNumber,
    updateLine,
    chooseCustomer,
    chooseItem,
    addLine,
    duplicateLine,
    removeLine,
    draft,
    rememberCustomer(customer: Customer) {
      chooseCustomer(customer);
    },
    rememberItem(item: CatalogItem, key: string) {
      chooseItem(key, item);
    },
  };
}
