"use client";

import * as React from "react";
import { Download, Eye, EyeOff, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

function triggerPrintWithTitle(title?: string) {
  if (title && typeof window !== "undefined") {
    const prev = document.title;
    document.title = title;
    window.print();
    setTimeout(() => {
      document.title = prev;
    }, 1500);
  } else if (typeof window !== "undefined") {
    window.print();
  }
}

async function exportElementToPdf(targetSelector: string, fileName: string) {
  if (typeof window === "undefined") return;

  const element = document.querySelector(targetSelector) as HTMLElement | null;
  if (!element) {
    throw new Error(`Target element "${targetSelector}" not found`);
  }

  const { toPng } = await import("html-to-image");
  const { jsPDF } = await import("jspdf");

  const dataUrl = await toPng(element, {
    quality: 0.98,
    pixelRatio: 2.5,
    backgroundColor: "#ffffff",
    style: {
      margin: "0px",
      borderRadius: "0px",
      boxShadow: "none",
    },
    filter: (node) => {
      if (node instanceof HTMLElement && node.classList.contains("no-print")) {
        return false;
      }
      return true;
    },
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgProps = pdf.getImageProperties(dataUrl);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (pdfHeight <= pageHeight) {
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
  } else {
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(`${fileName}.pdf`);
}

export function PrintActions({
  documentNumber,
  noun = "Invoice",
  hideBankDetails,
  onToggleBankDetails,
  hasBankDetails = true,
  letterheadMode,
  onToggleLetterheadMode,
  letterheadSpacing = 50,
  onSelectLetterheadSpacing,
}: {
  documentNumber?: string;
  noun?: string;
  hideBankDetails?: boolean;
  onToggleBankDetails?: () => void;
  hasBankDetails?: boolean;
  letterheadMode?: boolean;
  onToggleLetterheadMode?: () => void;
  letterheadSpacing?: number;
  onSelectLetterheadSpacing?: (spacing: number) => void;
}) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const fileTitle = `${noun}-${documentNumber || "draft"}`.replace(/[\s/\\:]+/g, "-");

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await exportElementToPdf(".print-sheet", fileTitle);
      toast.success(`${noun} downloaded successfully`);
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Could not generate direct PDF. Opening print dialog instead.");
      triggerPrintWithTitle(fileTitle);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    triggerPrintWithTitle(fileTitle);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="default"
        onClick={handleDownload}
        disabled={isDownloading}
        className="gap-2 shadow-xs cursor-pointer"
        title={`Download ${noun.toLowerCase()} as PDF file`}
      >
        {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        <span>{isDownloading ? "Downloading..." : `Download ${noun.toLowerCase()}`}</span>
      </Button>

      {onToggleLetterheadMode ? (
        <button
          type="button"
          role="switch"
          aria-checked={letterheadMode}
          onClick={onToggleLetterheadMode}
          className={cn(
            "group inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm font-medium transition-colors select-none cursor-pointer",
            letterheadMode
              ? "border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200/70 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              : "border-border bg-background text-foreground hover:bg-muted"
          )}
          title={
            letterheadMode
              ? "Letterhead mode is ON (company header hidden, top space reserved). Click for normal paper."
              : "Letterhead mode is OFF. Click to hide company header and print on pre-printed letterhead."
          }
        >
          <FileText className="size-4 text-neutral-500" />
          <span>{letterheadMode ? "Letterhead mode ON" : "Print on letterhead"}</span>
          <span
            className={cn(
              "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors",
              letterheadMode ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-600"
            )}
          >
            <span
              className={cn(
                "inline-block size-3 rounded-full bg-white transition-transform shadow-xs",
                letterheadMode ? "translate-x-3.5" : "translate-x-0.5"
              )}
            />
          </span>
        </button>
      ) : null}

      {letterheadMode && onSelectLetterheadSpacing ? (
        <div className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 text-xs font-medium">
          <span className="px-2 text-neutral-500">Space:</span>
          <button
            type="button"
            onClick={() => onSelectLetterheadSpacing(50)}
            className={cn(
              "rounded-md px-2.5 py-1 transition-all cursor-pointer",
              letterheadSpacing === 50
                ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            title="50mm top space (Estimate letterhead)"
          >
            50mm
          </button>
          <button
            type="button"
            onClick={() => onSelectLetterheadSpacing(70)}
            className={cn(
              "rounded-md px-2.5 py-1 transition-all cursor-pointer",
              letterheadSpacing === 70
                ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-neutral-900"
            )}
            title="70mm top space (Quotation letterhead)"
          >
            70mm
          </button>
        </div>
      ) : null}

      {onToggleBankDetails ? (
        <button
          type="button"
          role="switch"
          aria-checked={hideBankDetails}
          onClick={onToggleBankDetails}
          disabled={!hasBankDetails}
          className={cn(
            "group inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm font-medium transition-colors select-none",
            !hasBankDetails
              ? "opacity-50 cursor-not-allowed border-border bg-background text-muted-foreground"
              : hideBankDetails
                ? "border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200/70 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 cursor-pointer"
                : "border-border bg-background text-foreground hover:bg-muted cursor-pointer"
          )}
          title={
            !hasBankDetails
              ? "No bank details configured in business profile"
              : hideBankDetails
                ? "Bank details are hidden on document. Click to show."
                : "Bank details are visible on document. Click to hide."
          }
        >
          {hideBankDetails ? (
            <EyeOff className="size-4 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <Eye className="size-4 text-neutral-500" />
          )}
          <span>{hideBankDetails ? "Bank details hidden" : "Hide bank details"}</span>
          <span
            className={cn(
              "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors",
              hideBankDetails ? "bg-primary" : "bg-neutral-300 dark:bg-neutral-600"
            )}
          >
            <span
              className={cn(
                "inline-block size-3 rounded-full bg-white transition-transform shadow-xs",
                hideBankDetails ? "translate-x-3.5" : "translate-x-0.5"
              )}
            />
          </span>
        </button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        onClick={handlePrint}
        className="gap-2 cursor-pointer"
        title={`Print ${noun.toLowerCase()}`}
      >
        <Printer className="size-4" />
        <span>Print</span>
      </Button>
    </div>
  );
}

export function PrintButton({
  title,
  label = "Print",
}: {
  title?: string;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => triggerPrintWithTitle(title)}
      className="gap-2"
    >
      <Printer className="size-4" />
      <span>{label}</span>
    </Button>
  );
}

export function DownloadButton({
  title,
  label = "Download PDF",
}: {
  title?: string;
  label?: string;
}) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await exportElementToPdf(".print-sheet", title || "document");
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.error("PDF download failed:", error);
      triggerPrintWithTitle(title);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="default"
      onClick={handleDownload}
      disabled={isDownloading}
      className="gap-2 shadow-xs cursor-pointer"
    >
      {isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      <span>{isDownloading ? "Downloading..." : label}</span>
    </Button>
  );
}
