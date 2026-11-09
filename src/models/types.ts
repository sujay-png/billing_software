export type BankDetails = {
  branch?: string;
  bankname?: string;
  ifsccode?: string;
  accountno?: string | number;
  accountname?: string;
};

export type Workspace = {
  userId: string;
  email: string;
  userName: string;
  businessId: number;
  businessName: string;
  roleName: string | null;
};

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  gst: string;
  businessName: string;
  billingAddress: string;
  shippingAddress: string;
  gstState: string;
  gstStateCode: string;
  archived: boolean;
};

export type CatalogItem = {
  id: number;
  name: string;
  code: string;
  hsn: string;
  cost: number;
  unit: string;
  description: string;
  category: string;
  archived: boolean;
};

export type BusinessProfile = {
  id: number;
  name: string;
  phone: string;
  email: string;
  gst: string;
  state: string;
  stateCode: string;
  mobile: string;
  address: string;
  owner: string;
  upi: string;
  logo: string;
  bank: BankDetails;
};

export type LineInput = {
  itemId: number | null;
  name: string;
  note: string;
  hsn: string;
  unit: string;
  qty: number;
  rate: number;
  taxRate: number;
  lineDiscount: number;
};

export type DocumentKind = "invoice" | "estimate";

export type DocumentDraft = {
  id?: number;
  number: string;
  customerId: number | null;
  customerName: string;
  billing: string;
  delivery: string;
  date: string;
  validDate: string;
  paymentTerms: string;
  notes: string;
  discount: number;
  lines: LineInput[];
  orderType: string;
  tableNo: string;
  referenceNumber: string;
};

export type SavedDocument = DocumentDraft & {
  id: number;
  draft: boolean;
  archived: boolean;
  subtotal: number;
  tax: number;
  grandTotal: number;
  roundOff: number;
};

export type DocumentListRow = {
  id: number;
  number: string;
  customerName: string;
  date: string;
  total: number;
  draft: boolean;
  archived: boolean;
};
