import { listDocuments } from "@/controllers/documents";
import { DocumentList } from "@/views/documents/document-list";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const rows = await listDocuments("invoice", q);
  return <DocumentList kind="invoice" rows={rows} query={q} />;
}
