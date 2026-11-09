import { notFound } from "next/navigation";
import { getItem } from "@/controllers/items";
import { ItemForm } from "@/views/items/item-form";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(Number(id));
  if (!item) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{item.name}</h1>
      <ItemForm item={item} />
    </div>
  );
}
