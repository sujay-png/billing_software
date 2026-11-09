import { asNumber } from "@/models/money";
import type { LineInput } from "@/models/types";

function text(value: unknown) {
  return value == null ? "" : String(value);
}

export function parseInvoiceLines(items: unknown): LineInput[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    const note = text(item.invoiceItemSize || item.invoiceitemDescription || item.invoiceItemDescription);
    return {
      itemId: item.invoiceItemID == null || item.invoiceItemID === "" ? null : Number(item.invoiceItemID),
      name: text(item.invoiceItem),
      note,
      hsn: text(item.invoiceitemHSN),
      unit: text(item.invoiceItemUnit),
      qty: asNumber(item.invoiceitemQuantity ?? item.invoiceItemQuantity ?? 1),
      rate: asNumber(item.invoiceItemCost),
      taxRate: asNumber(item.invoiceitemTaxRate ?? item.invoiceItemTaxRate),
      lineDiscount: asNumber(item.invoiceLinediscount),
    };
  });
}

export function parseEstimateLines(items: unknown): LineInput[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    return {
      itemId: item.estimateItemID == null || item.estimateItemID === "" ? null : Number(item.estimateItemID),
      name: text(item.estimateItem),
      note: text(item.estimateItemSize || item.estimateitemDescription),
      hsn: text(item.estimateitemHSN),
      unit: text(item.estimateItemUnit),
      qty: asNumber(item.estimateitemQuantity ?? 1),
      rate: asNumber(item.estimateItemCost),
      taxRate: asNumber(item.estimateitemTaxRate),
      lineDiscount: asNumber(item.estimateLinediscount),
    };
  });
}

export function serializeInvoiceLines(
  lines: LineInput[],
  amounts: { before: number; tax: number; total: number }[],
) {
  return lines.map((line, index) => ({
    invoiceItem: line.name,
    invoiceItemID: line.itemId,
    invoiceitemHSN: line.hsn,
    invoiceItemCost: line.rate,
    invoiceItemUnit: line.unit,
    invoiceitemQuantity: line.qty,
    invoiceitemTaxRate: line.taxRate,
    invoiceTaxAmount: amounts[index]?.tax ?? 0,
    invoiceAmountbeforeTax: amounts[index]?.before ?? 0,
    invoiceItemAmount: amounts[index]?.total ?? 0,
    invoiceitemDescription: line.note,
    invoiceItemSize: line.note,
    invoiceLinediscount: line.lineDiscount,
  }));
}

export function serializeEstimateLines(
  lines: LineInput[],
  amounts: { before: number; tax: number; total: number }[],
) {
  return lines.map((line, index) => ({
    estimateItem: line.name,
    estimateItemID: line.itemId,
    estimateitemHSN: line.hsn,
    estimateItemCost: line.rate,
    estimateItemUnit: line.unit,
    estimateitemQuantity: line.qty,
    estimateitemTaxRate: line.taxRate,
    estimateTaxAmount: amounts[index]?.tax ?? 0,
    estimateAmountbeforeTax: amounts[index]?.before ?? 0,
    estimateItemAmount: amounts[index]?.total ?? 0,
    estimateitemDescription: line.note,
    estimateItemSize: line.note,
    estimateLinediscount: line.lineDiscount,
  }));
}
