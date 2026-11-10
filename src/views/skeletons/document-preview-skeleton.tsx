import { Skeleton } from "@/components/ui/skeleton";

export function DocumentPreviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      <article className="rounded-xl border border-neutral-200 bg-white p-6 md:p-10 shadow-2xs space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-3 w-20 ml-auto" />
            <Skeleton className="h-7 w-28 ml-auto" />
            <Skeleton className="h-5 w-16 ml-auto rounded-md" />
          </div>
        </header>

        <div className="grid gap-6 py-4 md:grid-cols-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2 md:text-right">
            <Skeleton className="h-3 w-28 ml-auto" />
            <Skeleton className="h-3 w-28 ml-auto" />
          </div>
        </div>

        <div className="space-y-2 py-4">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <div className="w-full max-w-xs space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-3 w-60" />
        </div>
      </article>
    </div>
  );
}

