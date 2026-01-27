/**
 * Zoho Desk Ticket API client
 *
 * TODO: Wire this to your backend. Replace baseUrl with your actual backend endpoint.
 * The backend endpoint is: GET /v1/desk/ticket
 *
 * Backend endpoints:
 *   - Preview: GET /v1/desk/ticket?ticketId=XXX
 *   - Enqueue: GET /v1/desk/ticket?ticketId=XXX&enqueue=true
 *
 * Response structure for preview:
 *   {
 *     zoho_ticket_data: { ... },
 *     ai_final_response: { ... },
 *     deal_match_log: { ... },
 *     deal_match: { ... },
 *     final_lead_payload: { ... },
 *     final_email_payload: { ... }
 *   }
 *
 * Response structure for enqueue:
 *   {
 *     status: "success",
 *     message: "Job for ticket {ticketId} er lagt i kø.",
 *     jobFile: "desk-ticket-{ticketId}"
 *   }
 */

import type { TicketPreviewResponse, EnqueueResponse } from "@/types/zoho-desk"

const getBaseUrl = () => {
  // TODO: point to your backend API URL (e.g. env or config)
  // Example: http://localhost:8000/v1/ or https://api.example.com/v1/
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
  }
  return process.env.BILINFO_API_URL ?? process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
}

/**
 * Fetch preview data for a Zoho Desk ticket.
 * TODO: Implement – call your backend GET /v1/desk/ticket?ticketId=XXX
 */
export async function fetchTicketPreview(ticketId: string): Promise<TicketPreviewResponse> {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error("Backend API URL not configured")
  }

  if (!ticketId || ticketId.trim() === "") {
    throw new Error("Ticket ID må ikke være tomt.")
  }

  // TODO: replace with your real backend call
  // The endpoint should be: GET /v1/desk/ticket?ticketId={ticketId}
  const url = `${baseUrl}desk/ticket?ticketId=${encodeURIComponent(ticketId.trim())}`

  const res = await fetch(url, { cache: "no-store" })
  const data = (await res.json()) as TicketPreviewResponse | { error: string; message: string }

  if (!res.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message: string }).message
        : `HTTP ${res.status}`
    throw new Error(errorMessage)
  }

  return data as TicketPreviewResponse
}

/**
 * Enqueue a Zoho Desk ticket for processing.
 * TODO: Implement – call your backend GET /v1/desk/ticket?ticketId=XXX&enqueue=true
 */
export async function enqueueTicket(ticketId: string): Promise<EnqueueResponse> {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error("Backend API URL not configured")
  }

  if (!ticketId || ticketId.trim() === "") {
    throw new Error("Ticket ID må ikke være tomt.")
  }

  // TODO: replace with your real backend call
  // The endpoint should be: GET /v1/desk/ticket?ticketId={ticketId}&enqueue=true
  const url = `${baseUrl}desk/ticket?ticketId=${encodeURIComponent(ticketId.trim())}&enqueue=true`

  const res = await fetch(url, { cache: "no-store" })
  const data = (await res.json()) as EnqueueResponse | { error: string; message: string }

  if (!res.ok) {
    const errorMessage =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message: string }).message
        : `HTTP ${res.status}`
    throw new Error(errorMessage)
  }

  return data as EnqueueResponse
}
