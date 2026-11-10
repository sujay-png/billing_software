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

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-b border-neutral-200 bg-neutral-50/60">
              <TableHead className="w-[42%] pl-4 py-3.5">Item</TableHead>
              <TableHead className="w-[16%] px-3 py-3.5">HSN</TableHead>
              <TableHead className="w-[12%] px-3 py-3.5">Unit</TableHead>
              <TableHead className="w-[18%] px-3 py-3.5 text-right">Rate</TableHead>
              <TableHead className="w-[12%] min-w-[72px] px-2 py-3.5 text-center">Actions</TableHead>
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
                  <TableCell className="py-3.5 pl-4 truncate">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/items/${item.id}`}
                        className="font-medium text-neutral-900 hover:underline truncate"
                        title={item.name}
                      >
                        {item.name || "Untitled"}
                      </Link>
                      {item.archived ? (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          Archived
                        </Badge>
                      ) : null}
                    </div>
                    {item.category ? (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate" title={item.category}>
                        {item.category}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-neutral-600 font-mono text-xs truncate">
                    {item.hsn || "—"}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-neutral-600 text-xs truncate">
                    {item.unit || "—"}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right tabular-nums font-semibold text-neutral-900">
                    {inr(item.cost)}
                  </TableCell>
                  <TableCell className="py-3.5 px-2 text-center">
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
