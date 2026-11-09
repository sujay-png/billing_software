import { notFound } from "next/navigation";
import { getCustomer } from "@/controllers/customers";
import { CustomerForm } from "@/views/customers/customer-form";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(Number(id));
  if (!customer) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{customer.name}</h1>
      <CustomerForm customer={customer} />
    </div>
  );
}
