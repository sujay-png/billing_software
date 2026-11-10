import { cache } from "react";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Workspace } from "@/models/types";

type AccountRow = {
  id: string;
  business_ref: number | null;
  user_name: string | null;
  user_email: string | null;
  role: number | null;
};

export const ensureWorkspace = cache(async (preferredBusinessName?: string): Promise<Workspace | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: linked } = await admin
    .from("Useraccount")
    .select("id, business_ref, user_name, user_email, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  let account = linked as AccountRow | null;

  if (!account && user.email) {
    const { data: matches } = await admin
      .from("Useraccount")
      .select("id, business_ref, user_name, user_email, role")
      .ilike("user_email", user.email)
      .is("auth_user_id", null)
      .limit(1);
    const match = (matches?.[0] ?? null) as AccountRow | null;
    if (match) {
      await admin.from("Useraccount").update({ auth_user_id: user.id }).eq("id", match.id);
      account = match;
    }
  }

  if (!account) {
    const metadata = user.user_metadata as { full_name?: string; business_name?: string };
    const businessName = preferredBusinessName?.trim() || metadata.business_name?.trim() || "My business";
    const { data: business, error } = await admin
      .from("business")
      .insert({
        business_name: businessName,
        business_email: user.email,
        business_owner: metadata.full_name || user.email,
      })
      .select("id")
      .single();
    if (error || !business) throw new Error(error?.message || "Could not create the business");

    const { data: created, error: accountError } = await admin
      .from("Useraccount")
      .insert({
        id: user.id,
        user_name: metadata.full_name || user.email?.split("@")[0],
        user_email: user.email,
        business_ref: business.id,
        auth_user_id: user.id,
      })
      .select("id, business_ref, user_name, user_email, role")
      .single();
    if (accountError || !created) throw new Error(accountError?.message || "Could not create the user");
    account = created as AccountRow;
  }

  if (!account.business_ref) throw new Error("This login is not linked to a business");

  const { data: business } = await admin
    .from("business")
    .select("business_name")
    .eq("id", account.business_ref)
    .maybeSingle();

  let roleName: string | null = null;
  if (account.role) {
    const { data: role } = await admin.from("Roles").select("role_name").eq("id", account.role).maybeSingle();
    roleName = role?.role_name ?? null;
  }

  return {
    userId: user.id,
    email: user.email ?? account.user_email ?? "",
    userName: account.user_name || user.email || "User",
    businessId: account.business_ref,
    businessName: business?.business_name || "Business",
    roleName,
  };
});

export const requireWorkspace = cache(async () => {
  const workspace = await ensureWorkspace();
  if (!workspace) redirect("/login");
  return workspace;
});
