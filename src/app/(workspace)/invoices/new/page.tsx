import { listCustomers } from "@/controllers/customers";
import { nextDocumentNumber } from "@/controllers/documents";
import { listItems } from "@/controllers/items";
import { blankDraft } from "@/models/drafts";
import { DocumentEditor } from "@/views/documents/document-editor";

export default async function NewInvoicePage() {
  const [customers, items, number] = await Promise.all([
    listCustomers(),
    listItems(),
    nextDocumentNumber("invoice"),
  ]);
  return <DocumentEditor kind="invoice" initial={blankDraft("invoice", number)} customers={customers} items={items} />;
}
