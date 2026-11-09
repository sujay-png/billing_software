"use server";

import { redirect } from "next/navigation";
import { requireContext } from "@/controllers/context";
import { mapCustomer } from "@/models/mappers";
import { searchTerm } from "@/models/money";
import type { Customer } from "@/models/types";

export async function listCustomers(query = "", includeArchived = false) {
  const { supabase, businessId } = await requireContext();
  let request = supabase
    .from("Customers")
    .select("*")
    .eq("business_ref", businessId)
    .order("customer_name", { ascending: true })
    .limit(300);

  if (!includeArchived) request = request.eq("isArchive", false);
  const term = searchTerm(query);
  if (term) {
    request = request.or(
      `customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%,customer_businessname.ilike.%${term}%,customer_GST.ilike.%${term}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapCustomer(row as Record<string, unknown>));
}

export async function getCustomer(id: number) {
  const { supabase, businessId } = await requireContext();
  const { data } = await supabase
    .from("Customers")
    .select("*")
    .eq("id", id)
    .eq("business_ref", businessId)
    .maybeSingle();
  return data ? mapCustomer(data as Record<string, unknown>) : null;
}

function customerPayload(formData: FormData, businessId: number) {
  return {
    customer_name: String(formData.get("name") || "").trim(),
    customer_phone: String(formData.get("phone") || "").trim() || null,
    customer_email: String(formData.get("email") || "").trim() || null,
    customer_GST: String(formData.get("gst") || "").trim() || null,
    customer_businessname: String(formData.get("businessName") || "").trim() || null,
    customer_billingaddress: String(formData.get("billing") || "").trim() || null,
    customer_shippingaddress: String(formData.get("shipping") || "").trim() || null,
    customer_gststate: String(formData.get("gstState") || "").trim() || null,
    customer_gststatecode: String(formData.get("gstStateCode") || "").trim() || null,
    business_ref: businessId,
  };
}

export type FormState = { error: string };

export async function saveCustomer(id: number | null, _state: FormState, formData: FormData): Promise<FormState> {
  const { supabase, businessId } = await requireContext();
  const payload = customerPayload(formData, businessId);
  if (!payload.customer_name) return { error: "Customer name is required." };

  const query = id
    ? supabase.from("Customers").update(payload).eq("id", id).eq("business_ref", businessId)
    : supabase.from("Customers").insert(payload);
  const { error } = await query;
  if (error) return { error: error.message };
  redirect("/customers");
}

export async function archiveCustomer(id: number, archived: boolean) {
  const { supabase, businessId } = await requireContext();
  await supabase.from("Customers").update({ isArchive: archived }).eq("id", id).eq("business_ref", businessId);
  redirect(`/customers/${id}`);
}

export async function quickCreateCustomer(input: {
  name: string;
  phone?: string;
  billing?: string;
}): Promise<{ customer?: Customer; error?: string }> {
  const { supabase, businessId } = await requireContext();
  const name = input.name.trim();
  if (!name) return { error: "Enter a customer name." };
  const { data, error } = await supabase
    .from("Customers")
    .insert({
      customer_name: name,
      customer_phone: input.phone?.trim() || null,
      customer_billingaddress: input.billing?.trim() || null,
      business_ref: businessId,
      isArchive: false,
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message || "Could not add the customer." };
  return { customer: mapCustomer(data as Record<string, unknown>) };
}
