"use client";

import { useActionState } from "react";
import { archiveCustomer, saveCustomer, type FormState } from "@/controllers/customers";
import type { Customer } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: FormState = { error: "" };

export function CustomerForm({ customer }: { customer?: Customer }) {
  const action = saveCustomer.bind(null, customer?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="grid max-w-3xl gap-4 rounded-xl border border-neutral-200 bg-white p-5 md:grid-cols-2">
      <Field label="Name" name="name" defaultValue={customer?.name} required className="md:col-span-2" />
      <Field label="Phone" name="phone" defaultValue={customer?.phone} />
      <Field label="Email" name="email" type="email" defaultValue={customer?.email} />
      <Field label="Business name" name="businessName" defaultValue={customer?.businessName} />
      <Field label="GSTIN" name="gst" defaultValue={customer?.gst} />
      <Area label="Billing address" name="billing" defaultValue={customer?.billingAddress} />
      <Area label="Shipping address" name="shipping" defaultValue={customer?.shippingAddress} />
      <Field label="GST state" name="gstState" defaultValue={customer?.gstState} />
      <Field label="GST state code" name="gstStateCode" defaultValue={customer?.gstStateCode} />
      {state.error ? <p className="text-sm md:col-span-2">{state.error}</p> : null}
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving" : "Save customer"}
        </Button>
        {customer ? (
          <Button
            type="submit"
            variant="outline"
            formAction={archiveCustomer.bind(null, customer.id, !customer.archived)}
          >
            {customer.archived ? "Restore" : "Archive"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.ComponentProps<"input">) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} className="h-9" {...props} />
    </div>
  );
}

function Area({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}
