import Link from "next/link";
import { inr } from "@/models/money";
import type { CatalogItem } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ItemList({
  items,
  query,
  archived,
}: {
  items: CatalogItem[];
  query: string;
  archived: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Catalog</p>
          <h1 className="text-2xl font-semibold">Items</h1>
        </div>
        <Button render={<Link href="/items/new" />}>New item</Button>
      </div>
      <form className="flex max-w-xl gap-2">
        <Input name="q" defaultValue={query} placeholder="Search name, code, HSN" className="h-10 bg-white" />
        {archived ? <input type="hidden" name="archived" value="1" /> : null}
        <Button type="submit" variant="outline">
          Search
        </Button>
        <Button variant="ghost" render={<Link href={archived ? "/items" : "/items?archived=1"} />}>
          {archived ? "Hide archived" : "Archived"}
        </Button>
      </form>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>HSN</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-neutral-500">
                  No items match.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link href={`/items/${item.id}`} className="font-medium hover:underline">
                      {item.name || "Untitled"}
                    </Link>
                    {item.archived ? (
                      <Badge variant="outline" className="ml-2">
                        Archived
                      </Badge>
                    ) : null}
                    {item.category ? <p className="text-xs text-neutral-500">{item.category}</p> : null}
                  </TableCell>
                  <TableCell>{item.hsn || "—"}</TableCell>
                  <TableCell>{item.unit || "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{inr(item.cost)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
