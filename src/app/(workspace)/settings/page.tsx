import { notFound } from "next/navigation";
import { getBusiness } from "@/controllers/business";
import { SettingsForm } from "@/views/settings/settings-form";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, business] = await Promise.all([searchParams, getBusiness()]);
  if (!business) notFound();
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Workspace</p>
        <h1 className="text-2xl font-semibold">Business settings</h1>
      </div>
      <SettingsForm business={business} saved={saved === "1"} />
    </div>
  );
}
