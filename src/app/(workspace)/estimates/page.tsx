import { listDocuments } from "@/controllers/documents";
import { DocumentList } from "@/views/documents/document-list";

export default async function EstimatesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const rows = await listDocuments("estimate", q);
  return <DocumentList kind="estimate" rows={rows} query={q} />;
}
