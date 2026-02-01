/**
 * Plate Check API client
 *
 * TODO: Wire this to your backend. Replace baseUrl with your actual backend endpoint.
 * The backend endpoint is: GET /v1/nummerpladetjek/:plate
 *
 * Backend endpoint:
 *   - Check Plate: GET /v1/nummerpladetjek/:plate
 *     Example: GET /v1/nummerpladetjek/AB12345
 *
 * Response structure (success):
 *   {
 *     vehicleDetails: {
 *       vehicleIdentificationNumber: "...",
 *       firstRegistrationDate: "...",
 *       make: "...",
 *       model: "...",
 *       // ... full Bilinfo vehicle data
 *     },
 *     // ... other Bilinfo response fields
 *   }
 *
 * Error responses:
 *   - 404: { error: "Not Found", message: "..." }
 *   - 500: { error: "ErrorException", message: "..." }
 */

import type { PlateCheckResponse, PlateCheckErrorResponse } from "@/types/plate-check"

const getBaseUrl = () => {
  // TODO: point to your backend API URL (e.g. env or config)
  // Example: http://localhost:8000/v1/ or https://api.example.com/v1/
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
  }
  return process.env.BILINFO_API_URL ?? process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
}

/**
 * Check license plate and fetch vehicle data from Bilinfo.
 * TODO: Implement – call your backend GET /v1/nummerpladetjek/:plate
 */
export async function checkPlate(plate: string): Promise<PlateCheckResponse> {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error("Backend API URL not configured")
  }

  if (!plate || plate.trim() === "") {
    throw new Error("Nummerplade mangler.")
  }

  // Normalize plate: uppercase and trim
  const normalizedPlate = plate.trim().toUpperCase()

  // TODO: replace with your real backend call
  // The endpoint should be: GET /v1/nummerpladetjek/:plate
  const url = `${baseUrl}nummerpladetjek/${encodeURIComponent(normalizedPlate)}`

  const res = await fetch(url, { cache: "no-store" })
  const data = (await res.json()) as PlateCheckResponse | PlateCheckErrorResponse

  if (!res.ok) {
    const errorData = data as PlateCheckErrorResponse
    const errorMessage = errorData.message || `HTTP ${res.status}`
    throw new Error(errorMessage)
  }

  return data as PlateCheckResponse
}
