import { notFound } from "next/navigation";
import { getBusiness } from "@/controllers/business";
import { getDocument } from "@/controllers/documents";
import { DocumentPreview } from "@/views/documents/document-preview";

export default async function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [loaded, business] = await Promise.all([getDocument("quotation", Number(id)), getBusiness()]);
  if (!loaded) notFound();
  return (
    <DocumentPreview kind="quotation" document={loaded.document} customer={loaded.customer} business={business} />
  );
}
