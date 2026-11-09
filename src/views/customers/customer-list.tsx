import Link from "next/link";
import type { Customer } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CustomerList({
  customers,
  query,
  archived,
}: {
  customers: Customer[];
  query: string;
  archived: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Directory</p>
          <h1 className="text-2xl font-semibold">Customers</h1>
        </div>
        <Button render={<Link href="/customers/new" />}>New customer</Button>
      </div>
      <form className="flex max-w-xl gap-2">
        <Input name="q" defaultValue={query} placeholder="Search name, phone, GST" className="h-10 bg-white" />
        {archived ? <input type="hidden" name="archived" value="1" /> : null}
        <Button type="submit" variant="outline">
          Search
        </Button>
        <Button variant="ghost" render={<Link href={archived ? "/customers" : "/customers?archived=1"} />}>
          {archived ? "Hide archived" : "Archived"}
        </Button>
      </form>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Place</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-neutral-500">
                  No customers match.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                      {customer.name || "Untitled"}
                    </Link>
                    {customer.archived ? (
                      <Badge variant="outline" className="ml-2">
                        Archived
                      </Badge>
                    ) : null}
                    {customer.businessName ? <p className="text-xs text-neutral-500">{customer.businessName}</p> : null}
                  </TableCell>
                  <TableCell>{customer.phone || "—"}</TableCell>
                  <TableCell>{customer.gst || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{customer.billingAddress || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
