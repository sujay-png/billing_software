import { dashboardData } from "@/controllers/dashboard";
import { requireWorkspace } from "@/controllers/session";
import { DashboardView } from "@/views/dashboard/dashboard-view";

export default async function DashboardPage() {
  const [workspace, data] = await Promise.all([requireWorkspace(), dashboardData()]);
  return <DashboardView businessName={workspace.businessName} {...data} />;
}
