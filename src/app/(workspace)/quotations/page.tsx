import { listDocuments } from "@/controllers/documents";
import { DocumentList } from "@/views/documents/document-list";

export default async function QuotationsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const rows = await listDocuments("quotation", q);
  return <DocumentList kind="quotation" rows={rows} query={q} />;
}
