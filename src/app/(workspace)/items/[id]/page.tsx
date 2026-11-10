import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getItem } from "@/controllers/items";
import { ItemForm } from "@/views/items/item-form";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(Number(id));
  if (!item) notFound();
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/items"
          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          Back to items
        </Link>
      </div>
      <div>
        <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Catalog</p>
        <h1 className="text-2xl font-semibold">Edit {item.name || "Item"}</h1>
      </div>
      <ItemForm item={item} />
    </div>
  );
}
