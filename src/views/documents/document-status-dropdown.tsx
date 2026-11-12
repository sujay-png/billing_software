"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateDocumentStatus } from "@/controllers/documents";
import type { DocumentKind } from "@/models/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";

export function DocumentStatusDropdown({
  kind,
  id,
  initialDraft,
  size = "default",
  className,
}: {
  kind: DocumentKind;
  id: number;
  initialDraft: boolean;
  size?: "sm" | "default";
  className?: string;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [draft, setOptimisticDraft] = React.useOptimistic(
    initialDraft,
    (_current, next: boolean) => next
  );

  const finalLabel = kind === "invoice" ? "Issued" : "Final";
  const activeLabel = draft ? "Draft" : finalLabel;

  const handleSelect = (newDraft: boolean) => {
    if (newDraft === draft || isPending) return;

    startTransition(async () => {
      setOptimisticDraft(newDraft);
      const result = await updateDocumentStatus(kind, id, newDraft);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Marked as ${newDraft ? "Draft" : finalLabel}`);
      }
    });
  };

  return (
    <div
      className={cn("inline-flex items-center", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-md border font-medium select-none cursor-pointer outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60",
            size === "sm"
              ? "h-5.5 px-2 text-[11px]"
              : "h-6 px-2.5 text-xs",
            draft
              ? "border-neutral-200 bg-white text-neutral-700 shadow-2xs hover:border-neutral-300 hover:bg-neutral-50/80 hover:text-neutral-950"
              : "border-neutral-900 bg-neutral-950 text-neutral-50 shadow-2xs hover:bg-neutral-800 hover:border-neutral-800"
          )}
        >
          {isPending ? (
            <Loader2 className="size-2.5 animate-spin text-current opacity-70" />
          ) : (
            <span
              className={cn(
                "size-1.5 rounded-full shrink-0",
                draft
                  ? "bg-neutral-400"
                  : "bg-emerald-400"
              )}
            />
          )}
          <span className="tracking-tight">{activeLabel}</span>
          <ChevronDown
            className={cn(
              "size-3 shrink-0 transition-transform duration-150 group-data-popup-open:rotate-180",
              draft ? "text-neutral-400 group-hover:text-neutral-600" : "text-neutral-400 group-hover:text-neutral-200"
            )}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" sideOffset={6} className="w-48 p-1">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              Change status
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-neutral-100" />

            <DropdownMenuItem
              onClick={() => handleSelect(true)}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-neutral-400" />
                <div className="flex flex-col text-left">
                  <span className="font-medium text-neutral-900">Draft</span>
                  <span className="text-[10px] text-neutral-500">Unfinalized</span>
                </div>
              </div>
              {draft ? <Check className="size-3.5 text-neutral-950 shrink-0" /> : null}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handleSelect(false)}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer hover:bg-neutral-100 focus:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <div className="flex flex-col text-left">
                  <span className="font-medium text-neutral-900">{finalLabel}</span>
                  <span className="text-[10px] text-neutral-500">
                    {kind === "invoice" ? "Issued & billable" : kind === "quotation" ? "Final quotation" : "Final estimate"}
                  </span>
                </div>
              </div>
              {!draft ? <Check className="size-3.5 text-neutral-950 shrink-0" /> : null}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
