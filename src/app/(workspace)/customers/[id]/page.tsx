import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCustomer } from "@/controllers/customers";
import { CustomerForm } from "@/views/customers/customer-form";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(Number(id));
  if (!customer) notFound();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/customers"
          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          Back to customers
        </Link>
      </div>
      <div>
        <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Directory</p>
        <h1 className="text-2xl font-semibold">Edit {customer.name || "Customer"}</h1>
      </div>
      <CustomerForm customer={customer} />
    </div>
  );
}
