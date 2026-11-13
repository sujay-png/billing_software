"use client";

import { useActionState } from "react";
import { saveBusiness } from "@/controllers/business";
import type { FormState } from "@/controllers/customers";
import type { BusinessProfile } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: FormState = { error: "" };

export function SettingsForm({ business, saved }: { business: BusinessProfile; saved: boolean }) {
  const [state, formAction, pending] = useActionState(saveBusiness, initial);

  return (
    <form action={formAction} className="grid max-w-3xl gap-4 rounded-xl border border-neutral-200 bg-white p-5 md:grid-cols-2">
      <Field label="Business name" name="name" defaultValue={business.name} required className="md:col-span-2" />
      <Field label="Owner" name="owner" defaultValue={business.owner} />
      <Field label="Email" name="email" defaultValue={business.email} />
      <Field label="Phone" name="phone" defaultValue={business.phone} placeholder="Ph .No.0824 -2410136" />
      <Field label="Mobile" name="mobile" defaultValue={business.mobile} />
      <Field label="GSTIN" name="gst" defaultValue={business.gst} />
      <Field label="State" name="state" defaultValue={business.state} />
      <Field label="State code" name="stateCode" defaultValue={business.stateCode} />
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={business.address} />
      </div>
      <Field label="Bank" name="bankname" defaultValue={String(business.bank.bankname ?? "")} />
      <Field label="Branch" name="branch" defaultValue={String(business.bank.branch ?? "")} />
      <Field label="Account name" name="accountname" defaultValue={String(business.bank.accountname ?? "")} />
      <Field label="Account number" name="accountno" defaultValue={String(business.bank.accountno ?? "")} />
      <Field label="IFSC" name="ifsccode" defaultValue={String(business.bank.ifsccode ?? "")} />
      <Field label="UPI" name="upi" defaultValue={business.upi} />
      {saved ? <p className="text-sm md:col-span-2">Business profile saved.</p> : null}
      {state.error ? <p className="text-sm md:col-span-2">{state.error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving" : "Save settings"}
        </Button>
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
