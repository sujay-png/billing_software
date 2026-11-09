import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("Useraccount")
    .select("business_ref, user_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!account?.business_ref) redirect("/login");

  return {
    supabase,
    user,
    businessId: account.business_ref as number,
  };
}
