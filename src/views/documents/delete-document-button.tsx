"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteDocumentAction } from "@/controllers/documents";
import type { DocumentKind } from "@/models/types";

export function DeleteDocumentButton({
  kind,
  id,
  documentNumber,
  redirectTo,
  variant = "button",
  size,
  className,
  children,
}: {
  kind: DocumentKind;
  id: number;
  documentNumber?: string;
  redirectTo?: string;
  variant?: "icon" | "button";
  size?: "default" | "sm" | "xs" | "icon" | "icon-sm" | "icon-xs";
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const noun = kind === "invoice" ? "invoice" : kind === "quotation" ? "quotation" : "estimate";
  const label = documentNumber ? `${noun} ${documentNumber}` : noun;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteDocumentAction(kind, id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${noun.charAt(0).toUpperCase() + noun.slice(1)} deleted successfully`);
      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to delete ${noun}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size={size || "icon-sm"}
          onClick={() => setOpen(true)}
          className={
            className ||
            "size-7.5 rounded-md border border-neutral-200/70 bg-white text-neutral-600 shadow-2xs hover:border-red-200 hover:bg-red-50 hover:text-destructive transition-colors cursor-pointer"
          }
          title={`Delete ${noun}`}
        >
          <Trash className="size-3.5" />
          <span className="sr-only">Delete {noun}</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size={size || "default"}
          onClick={() => setOpen(true)}
          className={
            className ||
            "text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer gap-1.5"
          }
          title={`Delete ${noun}`}
        >
          {children || (
            <>
              <Trash className="size-4" />
              <span>Delete</span>
            </>
          )}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {noun}</DialogTitle>
            <DialogDescription className="text-neutral-600 text-sm mt-1">
              Are you sure you want to delete <span className="font-semibold text-neutral-900">{label}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2 cursor-pointer"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash className="size-4" />}
              <span>{isDeleting ? "Deleting..." : `Delete ${noun}`}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
