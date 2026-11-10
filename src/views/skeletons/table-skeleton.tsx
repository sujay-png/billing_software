import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TableSkeleton({
  title = "Records",
}: {
  title?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Skeleton className="h-3.5 w-16 mb-2" />
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="max-w-md">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead><Skeleton className="h-4 w-28" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              <TableHead className="text-right pr-4"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
              <TableHead className="w-28 text-center pr-2"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20 opacity-60" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell>
                  <Skeleton className="h-5.5 w-16 rounded-md" />
                </TableCell>
                <TableCell className="text-right pr-4">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell className="text-center pr-2">
                  <div className="inline-flex items-center justify-center gap-2">
                    <Skeleton className="size-7.5 rounded-md" />
                    <Skeleton className="size-7.5 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
