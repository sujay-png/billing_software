"use server";

import { redirect } from "next/navigation";
import { ensureWorkspace } from "@/controllers/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string };

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  await ensureWorkspace();
  redirect("/dashboard");
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const business = String(formData.get("business") || "").trim();

  if (!email || password.length < 6) {
    return { error: "Use a valid email and a password of at least 6 characters." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, business_name: business },
  });
  if (error) return { error: error.message };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: signInError.message };

  await ensureWorkspace(business || undefined);
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
