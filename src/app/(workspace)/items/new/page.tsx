import { ItemForm } from "@/views/items/item-form";

export default function NewItemPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New item</h1>
      <ItemForm />
    </div>
  );
}
