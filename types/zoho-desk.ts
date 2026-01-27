/**
 * TypeScript types for Zoho Desk Ticket API responses
 */

export interface ZohoTicketData {
  subject?: string
  from_name?: string
  from_email?: string
  received_at?: string
  plain?: string
  [key: string]: unknown
}

export interface AIExtractedLead {
  First_Name?: string
  Last_Name?: string
  Email?: string
  Quick_Comment?: string
  Long_Comment?: string
  Source?: string
  is_interest_email?: boolean
  [key: string]: unknown
}

export interface AISearchParams {
  make?: string
  model?: string
  price_dkk?: number
  car_id?: string | number
  [key: string]: unknown
}

export interface AIFinalResponse {
  lead?: AIExtractedLead
  search?: AISearchParams
  raw_response?: string | null
  [key: string]: unknown
}

export interface DealMatch {
  id?: string
  reason?: string
  [key: string]: unknown
}

export interface DealMatchLog {
  "Prio 0 (CarID/Link) Input"?: {
    "CarID (AI)"?: string | number
    Criteria?: string
    Result?: DealMatch | string
  }
  "Prio 1 (Price/Make/Model) Input"?: {
    "Price (AI)"?: number
    "Make (AI)"?: string
    "Model (AI)"?: string
    Criteria?: string
    Result?: DealMatch | string
  }
  [key: string]: unknown
}

export interface ZohoLeadPayload {
  Buyer_lead?: { id: string | null }
  Interested_in_Car_Model?: { id: string | null }
  [key: string]: unknown
}

export interface ZohoEmailPayload {
  [key: string]: unknown
}

export interface TicketPreviewResponse {
  zoho_ticket_data: ZohoTicketData
  ai_final_response: AIFinalResponse
  deal_match_log: DealMatchLog
  deal_match: DealMatch | null
  final_lead_payload: ZohoLeadPayload
  final_email_payload: ZohoEmailPayload
}

export interface EnqueueResponse {
  status: "success" | "error"
  message: string
  jobFile?: string
}
