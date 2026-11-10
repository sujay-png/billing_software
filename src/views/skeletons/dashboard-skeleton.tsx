import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <Skeleton className="h-3 w-16 mb-3" />
            <Skeleton className="h-7 w-28 mb-2" />
            <Skeleton className="h-3 w-36 opacity-70" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <section key={i} className="rounded-xl border border-neutral-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-14" />
            </div>
            <ul>
              {Array.from({ length: 5 }).map((_, j) => (
                <li key={j} className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
                  <div className="space-y-1.5 flex-1 pr-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 opacity-60" />
                  </div>
                  <Skeleton className="h-4 w-20 shrink-0" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

