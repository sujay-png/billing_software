import { requireWorkspace } from "@/controllers/session";
import { AppShell } from "@/views/shell/app-shell";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const workspace = await requireWorkspace();
  return <AppShell workspace={workspace}>{children}</AppShell>;
}
