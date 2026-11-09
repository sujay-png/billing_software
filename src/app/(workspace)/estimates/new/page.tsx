import { listCustomers } from "@/controllers/customers";
import { nextDocumentNumber } from "@/controllers/documents";
import { listItems } from "@/controllers/items";
import { blankDraft } from "@/models/drafts";
import { DocumentEditor } from "@/views/documents/document-editor";

export default async function NewEstimatePage() {
  const [customers, items, number] = await Promise.all([
    listCustomers(),
    listItems(),
    nextDocumentNumber("estimate"),
  ]);
  return <DocumentEditor kind="estimate" initial={blankDraft("estimate", number)} customers={customers} items={items} />;
}
