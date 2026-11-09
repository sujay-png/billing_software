import { requireContext } from "@/controllers/context";
import { asNumber } from "@/models/money";
import type { DocumentListRow } from "@/models/types";

export async function dashboardData() {
  const { supabase, businessId } = await requireContext();

  const [invoices, estimates, customers, items] = await Promise.all([
    supabase
      .from("Invoices")
      .select("id, invoices_no, invoices_date, invoices_grantTotal, invoice_grandtotalroundoff, isDraft, customer:Customers(customer_name)")
      .eq("business_ref", businessId)
      .order("invoices_date", { ascending: false, nullsFirst: false })
      .limit(400),
    supabase
      .from("Estimates")
      .select("id, estimate_no, estimate_date, estimate_grantTotal, estimate_grandtotalroundoff, isDraft, isArchive, customer:Customers(customer_name)")
      .eq("business_ref", businessId)
      .eq("isArchive", false)
      .order("estimate_date", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase.from("Customers").select("id", { count: "exact", head: true }).eq("business_ref", businessId).eq("isArchive", false),
    supabase.from("Items").select("id", { count: "exact", head: true }).eq("business_ref", businessId).eq("isArchive", false),
  ]);

  if (invoices.error) throw new Error(invoices.error.message);

  const invoiceRows = invoices.data ?? [];
  const drafts = invoiceRows.filter((row) => row.isDraft).length;
  const billed = invoiceRows.reduce(
    (sum, row) => sum + asNumber(row.invoice_grandtotalroundoff || row.invoices_grantTotal),
    0,
  );

  const recentInvoices: DocumentListRow[] = invoiceRows.slice(0, 6).map((row) => {
    const customer = row.customer as { customer_name?: string } | null;
    return {
      id: row.id,
      number: String(row.invoices_no ?? ""),
      customerName: String(customer?.customer_name ?? "Walk-in").trim() || "Walk-in",
      date: String(row.invoices_date ?? ""),
      total: asNumber(row.invoice_grandtotalroundoff || row.invoices_grantTotal),
      draft: Boolean(row.isDraft),
      archived: false,
    };
  });

  const recentEstimates: DocumentListRow[] = (estimates.data ?? []).slice(0, 5).map((row) => {
    const customer = row.customer as { customer_name?: string } | null;
    return {
      id: row.id,
      number: String(row.estimate_no ?? ""),
      customerName: String(customer?.customer_name ?? "").trim() || "Customer",
      date: String(row.estimate_date ?? ""),
      total: asNumber(row.estimate_grandtotalroundoff || row.estimate_grantTotal),
      draft: Boolean(row.isDraft),
      archived: Boolean(row.isArchive),
    };
  });

  return {
    billed,
    invoiceCount: invoiceRows.length,
    draftCount: drafts,
    estimateCount: estimates.data?.length ?? 0,
    customerCount: customers.count ?? 0,
    itemCount: items.count ?? 0,
    recentInvoices,
    recentEstimates,
  };
}
