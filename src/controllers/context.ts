import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/controllers/session";

export const requireContext = cache(async () => {
  const [workspace, supabase] = await Promise.all([
    requireWorkspace(),
    createClient(),
  ]);

  return {
    supabase,
    user: { id: workspace.userId, email: workspace.email },
    businessId: workspace.businessId,
  };
});
