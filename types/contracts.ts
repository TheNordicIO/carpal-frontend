/**
 * TypeScript types for Contracts flow (deal, car, contacts, extras, API)
 */

export interface DealData {
  id: string
  Deal_Name?: string
  Sales_Price?: number
  Deliverytime?: string
  Car?: { id: string }
  Seller?: { id: string }
  Seller_2?: { id: string }
  Buyer?: { id: string }
  Buyer_2?: { id: string }
  Under_finance?: boolean
  Outstanding_finance?: number
  Finance_Bank?: string
  CarPal_sales_fee?: number
  Has_Financing?: boolean
  Financing_Down_Payment_Amount?: number
  Financing_Amount?: number
  Has_Trade_In?: boolean
  Trade_in_Price?: number
  Trade_in_Finance_Remaining?: number
  Trade_in_Usage_Type?: string
  Purchase_Agreement_Handover_Text?: string
  Sales_Agreement_Handover_Text?: string
  Purchase_Agreement_Extra_Files?: ContractAttachment[]
  Sales_Agreement_Extra_Files?: ContractAttachment[]
  Purchase_Agreement_Status?: string
  Sales_Agreement_Status?: string
  [key: string]: unknown
}

export interface CarData {
  id: string
  Make?: string
  Model?: string
  Variant?: string
  Model_Year?: number
  Registration?: string
  Licenseplate?: string
  VIN?: string
  Mileage?: number
  Color?: { id: string; name?: string } | string
  FuelType?: string
  Fuel?: string
  First_registration?: string
  [key: string]: unknown
}

export interface ContactData {
  id: string
  First_Name?: string
  Last_Name?: string
  Full_Name?: string
  Email?: string
  Phone?: string
  Mobile?: string
  Mailing_Street?: string
  Mailing_City?: string
  Mailing_Zip?: string
  [key: string]: unknown
}

export interface ProductData {
  id: string
  Product_Name?: string
  Unit_Price?: number
  Category?: string
  [key: string]: unknown
}

export type ExtraItemType = "subform" | "external" | "custom" | "success_fee"

export interface ExtraItem {
  type: ExtraItemType
  product_id?: string
  name: string
  price: number
  category?: string
  id?: string
}

export interface ContractAttachment {
  id?: string
  file_id?: string
  file_name?: string
  File_Name__s?: string
  name?: string
  mime_type?: string
  mimeType?: string
  view_url?: string
  preview_url?: string
  /** Relative or absolute URL from upload response; used to embed PDF */
  url?: string
  [key: string]: unknown
}

export type ContractType = "purchase_agreement" | "sales_agreement"

export type ContractStep =
  | "forside"
  | "kunde"
  | "bil"
  | "finans"
  | "extras"
  | "vedh"
  | "sign"
  | "success"

// API: deal lookup
export interface DealLookupRequest {
  value: string
  contract_type: ContractType
}

export interface DealLookupResponse {
  deal_id?: string
  error?: string
}

// API: get deal
export interface GetDealResponse {
  deal?: DealData
  car?: CarData
  contact1?: ContactData
  contact2?: ContactData
  externalProducts?: ProductData[]
  dealInvoice?: DealInvoiceRow[]
  error?: string
}

export interface DealInvoiceRow {
  id?: string
  ID?: string
  Product_Name?: { id?: string; name?: string; display_value?: string; Category?: string } | string
  product_name?: string
  Price?: number
  price?: number
  Amount?: number
  Category?: string
  [key: string]: unknown
}

// API: upload attachment
export interface UploadAttachmentResponse {
  success?: boolean
  attachment?: ContractAttachment
  /** New shape: url, filename, file_name, mime_type, index */
  url?: string
  filename?: string
  file_name?: string
  mime_type?: string
  index?: number
  error?: string
}

// API: send
export interface SendContractPayload {
  record_id: string
  contract_type: ContractType
  private_message: string
  email_message: string
  attachments: { file_id?: string; id?: string; file_name?: string; mime_type?: string }[]
  edited_fields: { deal: Record<string, unknown>; car: Record<string, unknown> }
  extras_invoice: { Product_Name?: string; Price: number; product_id?: string; id?: string }[]
}

export interface SendContractResponse {
  success?: boolean
  job_id?: string
  error?: string
}
