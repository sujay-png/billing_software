import Link from "next/link";
import { Pencil } from "lucide-react";
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

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="border-b border-neutral-200 bg-neutral-50/60">
              <TableHead className="min-w-[280px] pl-4 py-3.5">Item</TableHead>
              <TableHead className="w-32 px-4 py-3.5">HSN</TableHead>
              <TableHead className="w-24 px-4 py-3.5">Unit</TableHead>
              <TableHead className="w-36 px-4 py-3.5 text-right">Rate</TableHead>
              <TableHead className="w-28 px-4 py-3.5 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                  No items match.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                  <TableCell className="py-3.5 pl-4 max-w-sm">
                    <Link href={`/items/${item.id}`} className="font-medium text-neutral-900 hover:underline">
                      {item.name || "Untitled"}
                    </Link>
                    {item.archived ? (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Archived
                      </Badge>
                    ) : null}
                    {item.category ? (
                      <p className="text-xs text-neutral-500 mt-0.5">{item.category}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-neutral-600 font-mono text-xs">
                    {item.hsn || "—"}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-neutral-600">
                    {item.unit || "—"}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-right tabular-nums font-semibold text-neutral-900">
                    {inr(item.cost)}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7.5 rounded-md border border-neutral-200/70 bg-white text-neutral-600 shadow-2xs hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                      title="Edit item"
                      render={<Link href={`/items/${item.id}`} />}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit item</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
