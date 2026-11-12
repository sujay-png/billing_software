import { notFound } from "next/navigation";
import { listCustomers } from "@/controllers/customers";
import { getDocument } from "@/controllers/documents";
import { listItems } from "@/controllers/items";
import { draftFromDocument } from "@/models/drafts";
import { DocumentEditor } from "@/views/documents/document-editor";

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [loaded, customers, items] = await Promise.all([
    getDocument("quotation", Number(id)),
    listCustomers("", true),
    listItems("", true),
  ]);
  if (!loaded) notFound();
  return (
    <DocumentEditor
      kind="quotation"
      initial={draftFromDocument(loaded.document)}
      customers={customers}
      items={items}
    />
  );
}
