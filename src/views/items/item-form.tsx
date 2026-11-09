"use client";

import { useActionState } from "react";
import { archiveItem, saveItem } from "@/controllers/items";
import type { FormState } from "@/controllers/customers";
import type { CatalogItem } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: FormState = { error: "" };

export function ItemForm({ item }: { item?: CatalogItem }) {
  const action = saveItem.bind(null, item?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="grid max-w-3xl gap-4 rounded-xl border border-neutral-200 bg-white p-5 md:grid-cols-2">
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={item?.name} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" defaultValue={item?.code} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hsn">HSN</Label>
        <Input id="hsn" name="hsn" defaultValue={item?.hsn} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cost">Rate</Label>
        <Input id="cost" name="cost" type="number" step="0.01" defaultValue={item?.cost ?? 0} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="unit">Unit</Label>
        <Input id="unit" name="unit" defaultValue={item?.unit} placeholder="kg, sqft, nos" className="h-9" />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={item?.category} className="h-9" />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={item?.description} />
      </div>
      {state.error ? <p className="text-sm md:col-span-2">{state.error}</p> : null}
      <div className="flex gap-3 md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving" : "Save item"}
        </Button>
        {item ? (
          <Button type="submit" variant="outline" formAction={archiveItem.bind(null, item.id, !item.archived)}>
            {item.archived ? "Restore" : "Archive"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
