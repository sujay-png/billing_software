import { CustomerForm } from "@/views/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New customer</h1>
      <CustomerForm />
    </div>
  );
}
