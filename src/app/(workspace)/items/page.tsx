import { listItems } from "@/controllers/items";
import { ItemList } from "@/views/items/item-list";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>;
}) {
  const { q = "", archived } = await searchParams;
  const items = await listItems(q, archived === "1");
  return <ItemList items={items} query={q} archived={archived === "1"} />;
}
