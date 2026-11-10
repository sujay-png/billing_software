"use client";

import * as React from "react";
import { Download, Printer } from "lucide-react";
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

export function PrintActions({
  documentNumber,
  noun = "Invoice",
}: {
  documentNumber?: string;
  noun?: string;
}) {
  const fileTitle = `${noun}-${documentNumber || "draft"}`.replace(/[\s/\\:]+/g, "-");

  const handleDownload = () => {
    triggerPrintWithTitle(fileTitle);
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
        className="gap-2 shadow-xs"
        title={`Download ${noun.toLowerCase()} as PDF`}
      >
        <Download className="size-4" />
        <span>Download {noun.toLowerCase()}</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handlePrint}
        className="gap-2"
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
  return (
    <Button
      type="button"
      variant="default"
      onClick={() => triggerPrintWithTitle(title)}
      className="gap-2 shadow-xs"
    >
      <Download className="size-4" />
      <span>{label}</span>
    </Button>
  );
}
