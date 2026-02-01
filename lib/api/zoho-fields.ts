/**
 * Zoho Fields API client
 *
 * TODO: Wire this to your backend. Replace baseUrl with your actual backend endpoint.
 * The backend endpoints are:
 *   - List Modules: GET /v1/zoho/modules
 *   - Export Fields: GET /v1/zoho/modules/:module/fields
 *
 * Backend endpoints:
 *   - List Modules: GET /v1/zoho/modules
 *     Response: JSON array of module objects
 *   - Export Fields: GET /v1/zoho/modules/:module/fields
 *     Response: text/plain with Content-Disposition header
 */

import type { ZohoModule } from "@/types/zoho-fields"

const getBaseUrl = () => {
  // TODO: point to your backend API URL (e.g. env or config)
  // Example: http://localhost:8000/v1/ or https://api.example.com/v1/
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
  }
  return process.env.BILINFO_API_URL ?? process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
}

/**
 * Fetch all available Zoho CRM modules.
 * TODO: Implement – call your backend GET /v1/zoho/modules
 */
export async function fetchModules(): Promise<ZohoModule[]> {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error("Backend API URL not configured")
  }

  // TODO: replace with your real backend call
  // The endpoint should be: GET /v1/zoho/modules
  const url = `${baseUrl}zoho/modules`

  const res = await fetch(url, { cache: "no-store" })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }

  const data = (await res.json()) as ZohoModule[]
  return data
}

/**
 * Download fields for a specific module as a text file.
 * TODO: Implement – call your backend GET /v1/zoho/modules/:module/fields
 */
export async function downloadModuleFields(moduleApiName: string): Promise<Blob> {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    throw new Error("Backend API URL not configured")
  }

  if (!moduleApiName || moduleApiName.trim() === "") {
    throw new Error("Module API name mangler.")
  }

  // TODO: replace with your real backend call
  // The endpoint should be: GET /v1/zoho/modules/:module/fields
  const url = `${baseUrl}zoho/modules/${encodeURIComponent(moduleApiName.trim())}/fields`

  const res = await fetch(url, { cache: "no-store" })
  
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }

  const blob = await res.blob()
  return blob
}
