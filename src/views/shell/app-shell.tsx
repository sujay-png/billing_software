"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import { signOut } from "@/controllers/auth";
import type { Workspace } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "cn";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/estimates", label: "Estimates", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/items", label: "Items", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
              active ? "bg-white text-neutral-950" : "text-neutral-300 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ workspace, children }: { workspace: Workspace; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f3f3f3] text-neutral-950">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-60 flex-col bg-neutral-950 px-3 py-5 text-white md:flex">
        <div className="px-3 pb-6">
          <p className="text-[11px] tracking-[0.18em] text-neutral-400 uppercase">Accounting</p>
          <p className="mt-1 truncate text-base font-semibold">{workspace.businessName}</p>
          <p className="truncate text-xs text-neutral-400">{workspace.userName}</p>
        </div>
        <NavLinks pathname={pathname} />
        <form action={signOut} className="mt-auto px-1">
          <Button type="submit" variant="ghost" className="w-full justify-start text-neutral-300 hover:bg-white/10 hover:text-white">
            <LogOut />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="md:pl-60">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <div>
            <p className="text-sm font-semibold">{workspace.businessName}</p>
            <p className="text-xs text-neutral-500">Accounting software</p>
          </div>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" />}>
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="bg-neutral-950 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">{workspace.businessName}</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <NavLinks pathname={pathname} />
                <form action={signOut} className="mt-6">
                  <Button type="submit" variant="outline" className="w-full bg-transparent text-white">
                    Sign out
                  </Button>
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
