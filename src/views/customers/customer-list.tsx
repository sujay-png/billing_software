"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Search, X } from "lucide-react";
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
  const router = useRouter();
  const [prevQuery, setPrevQuery] = useState(query);
  const [search, setSearch] = useState(query);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  if (prevQuery !== query) {
    setPrevQuery(query);
    setSearch(query);
  }

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => {
      const name = (customer.name || "").toLowerCase();
      const phone = (customer.phone || "").toLowerCase();
      const businessName = (customer.businessName || "").toLowerCase();
      const gst = (customer.gst || "").toLowerCase();
      const address = (customer.billingAddress || "").toLowerCase();
      const email = (customer.email || "").toLowerCase();
      return (
        name.includes(term) ||
        phone.includes(term) ||
        businessName.includes(term) ||
        gst.includes(term) ||
        address.includes(term) ||
        email.includes(term)
      );
    });
  }, [customers, search]);

  const updateSearchQuery = (val: string) => {
    setSearch(val);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        if (val.trim()) {
          params.set("q", val.trim());
        } else {
          params.delete("q");
        }
        const queryString = params.toString();
        router.replace(`/customers${queryString ? `?${queryString}` : ""}`);
      });
    }, 250);
  };

  const clearSearch = () => {
    updateSearchQuery("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Directory</p>
          <h1 className="text-2xl font-semibold">Customers</h1>
        </div>
        <Button render={<Link href="/customers/new" />}>New customer</Button>
      </div>

      <div className="flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => updateSearchQuery(e.target.value)}
            placeholder="Search name, phone, GST, place..."
            className="h-10 bg-white pl-9 pr-8"
          />
          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Button variant="ghost" render={<Link href={archived ? "/customers" : "/customers?archived=1"} />}>
          {archived ? "Hide archived" : "Archived"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-b border-neutral-200 bg-neutral-50/60">
              <TableHead className="w-[32%] pl-4 py-3.5">Name</TableHead>
              <TableHead className="w-[18%] px-3 py-3.5">Phone</TableHead>
              <TableHead className="w-[18%] px-3 py-3.5">GSTIN</TableHead>
              <TableHead className="w-[22%] px-3 py-3.5">Place</TableHead>
              <TableHead className="w-[10%] min-w-[72px] px-2 py-3.5 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                  {search ? `No customers match "${search}".` : "No customers found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-neutral-50/70 transition-colors">
                  <TableCell className="py-3.5 pl-4 truncate">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-medium text-neutral-900 hover:underline truncate"
                        title={customer.name}
                      >
                        {customer.name || "Untitled"}
                      </Link>
                      {customer.archived ? (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          Archived
                        </Badge>
                      ) : null}
                    </div>
                    {customer.businessName ? (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate" title={customer.businessName}>
                        {customer.businessName}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-neutral-600 font-mono text-xs truncate">
                    {customer.phone || "—"}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-neutral-600 font-mono text-xs truncate">
                    {customer.gst || "—"}
                  </TableCell>
                  <TableCell
                    className="py-3.5 px-3 text-neutral-600 text-xs truncate"
                    title={customer.billingAddress || undefined}
                  >
                    {customer.billingAddress || "—"}
                  </TableCell>
                  <TableCell className="py-3.5 px-2 text-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7.5 rounded-md border border-neutral-200/70 bg-white text-neutral-600 shadow-2xs hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                      title="Edit customer"
                      render={<Link href={`/customers/${customer.id}`} />}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit customer</span>
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
