"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireContext } from "@/controllers/context";
import { mapBusiness } from "@/models/mappers";
import type { FormState } from "@/controllers/customers";

export const getBusiness = cache(async () => {
  const { supabase, businessId } = await requireContext();
  const { data, error } = await supabase.from("business").select("*").eq("id", businessId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapBusiness(data as Record<string, unknown>) : null;
});

export async function saveBusiness(_state: FormState, formData: FormData): Promise<FormState> {
  const { supabase, businessId } = await requireContext();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Business name is required." };

  const { error } = await supabase
    .from("business")
    .update({
      business_name: name,
      buiness_phone: String(formData.get("phone") || "").trim() || null,
      business_email: String(formData.get("email") || "").trim() || null,
      business_GST: String(formData.get("gst") || "").trim() || null,
      business_State: String(formData.get("state") || "").trim() || null,
      business_StateCode: String(formData.get("stateCode") || "").trim() || null,
      business_mobile: String(formData.get("mobile") || "").trim() || null,
      business_address: String(formData.get("address") || "").trim() || null,
      business_owner: String(formData.get("owner") || "").trim() || null,
      business_upi: String(formData.get("upi") || "").trim() || null,
      business_bank: {
        bankname: String(formData.get("bankname") || "").trim(),
        branch: String(formData.get("branch") || "").trim(),
        ifsccode: String(formData.get("ifsccode") || "").trim(),
        accountno: String(formData.get("accountno") || "").trim(),
        accountname: String(formData.get("accountname") || "").trim(),
      },
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/invoices");
  revalidatePath("/estimates");
  revalidatePath("/dashboard");
  redirect("/settings?saved=1");
}
