/**
 * Zoho Deal API client
 *
 * TODO: Wire this to your backend. Replace baseUrl with your actual backend endpoint.
 * The backend endpoint is: GET /v1/zoho/deals?dealId={dealId} or GET /v1/zoho/deals/{dealId}
 *
 * Backend endpoint:
 *   - Get Deal: GET /v1/zoho/deals?dealId=XXX or GET /v1/zoho/deals/XXX
 *
 * Response structure:
 *   {
 *     id: "...",
 *     Deal_Name: "...",
 *     Stage: "...",
 *     Car: { id: "..." },
 *     Car_Details: { ... },
 *     Car_Choices: [ ... ],
 *     // ... all other deal fields
 *   }
 *
 * Error responses:
 *   - 400: { statusCode: 400, message: "Deal ID mangler." }
 *   - 500: { statusCode: 500, error: "ErrorClassName", message: "..." }
 */

import type { ZohoDealResponse, ZohoDealErrorResponse } from "@/types/zoho-deal"

const getBaseUrl = () => {
  // TODO: point to your backend API URL (e.g. env or config)
  // Example: http://localhost:8000/v1/ or https://api.example.com/v1/
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
  }
  return process.env.BILINFO_API_URL ?? process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
}

/**
 * Fetch deal data from Zoho CRM by Deal ID.
 * TODO: Implement – call your backend GET /v1/zoho/deals?dealId=XXX or GET /v1/zoho/deals/XXX
 */
export async function fetchDeal(dealId: string): Promise<ZohoDealResponse> {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error("Backend API URL not configured")
  }

  if (!dealId || dealId.trim() === "") {
    throw new Error("Deal ID mangler.")
  }

  // TODO: replace with your real backend call
  // The endpoint should be: GET /v1/zoho/deals?dealId={dealId} or GET /v1/zoho/deals/{dealId}
  // Using query parameter approach
  const url = `${baseUrl}zoho/deals?dealId=${encodeURIComponent(dealId.trim())}`

  const res = await fetch(url, { cache: "no-store" })
  const data = (await res.json()) as ZohoDealResponse | ZohoDealErrorResponse

  if (!res.ok) {
    const errorData = data as ZohoDealErrorResponse
    const errorMessage = errorData.message || `HTTP ${res.status}`
    throw new Error(errorMessage)
  }

  return data as ZohoDealResponse
}
