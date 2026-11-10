"use client";

import * as React from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
}: {
  documentNumber?: string;
  noun?: string;
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
