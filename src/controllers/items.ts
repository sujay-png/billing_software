"use server";

import { redirect } from "next/navigation";
import { requireContext } from "@/controllers/context";
import { mapItem } from "@/models/mappers";
import { asNumber, searchTerm } from "@/models/money";
import type { CatalogItem } from "@/models/types";
import type { FormState } from "@/controllers/customers";

export async function listItems(query = "", includeArchived = false) {
  const { supabase, businessId } = await requireContext();
  let request = supabase
    .from("Items")
    .select("*")
    .eq("business_ref", businessId)
    .order("item_name", { ascending: true })
    .limit(400);

  if (!includeArchived) request = request.eq("isArchive", false);
  const term = searchTerm(query);
  if (term) {
    request = request.or(
      `item_name.ilike.%${term}%,item_code.ilike.%${term}%,item_HSNcode.ilike.%${term}%,category.ilike.%${term}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapItem(row as Record<string, unknown>));
}

export async function getItem(id: number) {
  const { supabase, businessId } = await requireContext();
  const { data } = await supabase.from("Items").select("*").eq("id", id).eq("business_ref", businessId).maybeSingle();
  return data ? mapItem(data as Record<string, unknown>) : null;
}

export async function saveItem(id: number | null, _state: FormState, formData: FormData): Promise<FormState> {
  const { supabase, businessId } = await requireContext();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Item name is required." };

  const payload = {
    item_name: name,
    item_code: String(formData.get("code") || "").trim() || null,
    item_HSNcode: String(formData.get("hsn") || "").trim() || null,
    item_cost: asNumber(formData.get("cost")),
    item_costNarration: String(formData.get("unit") || "").trim() || null,
    item_description: String(formData.get("description") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    business_ref: businessId,
  };

  const query = id
    ? supabase.from("Items").update(payload).eq("id", id).eq("business_ref", businessId)
    : supabase.from("Items").insert(payload);
  const { error } = await query;
  if (error) return { error: error.message };
  redirect("/items");
}

export async function archiveItem(id: number, archived: boolean) {
  const { supabase, businessId } = await requireContext();
  await supabase.from("Items").update({ isArchive: archived }).eq("id", id).eq("business_ref", businessId);
  redirect(`/items/${id}`);
}

export async function quickCreateItem(input: {
  name: string;
  rate?: number;
  unit?: string;
  hsn?: string;
}): Promise<{ item?: CatalogItem; error?: string }> {
  const { supabase, businessId } = await requireContext();
  const name = input.name.trim();
  if (!name) return { error: "Enter an item name." };
  const { data, error } = await supabase
    .from("Items")
    .insert({
      item_name: name,
      item_cost: input.rate ?? 0,
      item_costNarration: input.unit?.trim() || null,
      item_HSNcode: input.hsn?.trim() || null,
      business_ref: businessId,
      isArchive: false,
    })
    .select("*")
    .single();
  if (error || !data) return { error: error?.message || "Could not add the item." };
  return { item: mapItem(data as Record<string, unknown>) };
}
