import { listCustomers } from "@/controllers/customers";
import { CustomerList } from "@/views/customers/customer-list";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>;
}) {
  const { q = "", archived } = await searchParams;
  const customers = await listCustomers(q, archived === "1");
  return <CustomerList customers={customers} query={q} archived={archived === "1"} />;
}
