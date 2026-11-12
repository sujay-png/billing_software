import { listCustomers } from "@/controllers/customers";
import { nextDocumentNumber } from "@/controllers/documents";
import { listItems } from "@/controllers/items";
import { blankDraft } from "@/models/drafts";
import { DocumentEditor } from "@/views/documents/document-editor";

export default async function NewQuotationPage() {
  const [customers, items, number] = await Promise.all([
    listCustomers(),
    listItems(),
    nextDocumentNumber("quotation"),
  ]);
  return <DocumentEditor kind="quotation" initial={blankDraft("quotation", number)} customers={customers} items={items} />;
}
