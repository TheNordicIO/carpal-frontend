/**
 * Contracts API client
 * Base: /contracts/api
 * Endpoints: deal/lookup, deal/:recordId, attachments/upload, send
 */

import type {
  ContractAttachment,
  ContractType,
  DealLookupRequest,
  DealLookupResponse,
  GetDealResponse,
  UploadAttachmentResponse,
  SendContractPayload,
  SendContractResponse,
} from "@/types/contracts"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

const BASE_ENDPOINT = "contracts/api"

const API_BASE = `${BASE_URL}${BASE_ENDPOINT}`

/** Build full URL for an attachment returned as relative path (e.g. "836029000014040155-0.pdf") */
export function getAttachmentViewUrl(url: string): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  const base = BASE_URL.replace(/\/$/, "")
  return `${base}/${url.replace(/^\//, "")}`
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

/**
 * POST /contracts/api/deal/lookup
 * Body: { value, contract_type }; returns { deal_id } or { error }
 */
export async function dealLookup(
  body: DealLookupRequest
): Promise<DealLookupResponse> {
  const res = await fetch(`${API_BASE}/deal/lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json() as DealLookupResponse & { error?: string }
  if (data.error || (!data.deal_id && res.ok)) {
    throw new Error(data.error ?? "Kunne ikke finde Deal ud fra input.")
  }

  return data
}

/**
 * GET /contracts/api/deal/:recordId?contract_type=...
 * Returns { deal, car, contact1, contact2, externalProducts, dealInvoice } or { error }
 */
export async function getDeal(
  recordId: string,
  contractType: ContractType
): Promise<GetDealResponse> {
  const res = await fetch(
    `${API_BASE}/deal/${encodeURIComponent(recordId)}?contract_type=${encodeURIComponent(contractType)}`,
    { cache: "no-store" }
  )
  const data = await res.json() as GetDealResponse
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}

/**
 * POST /contracts/api/attachments/upload
 * FormData: file, record_id, contract_type
 * Returns { success, attachment } or { error }
 */
export async function uploadAttachment(
  formData: FormData
): Promise<UploadAttachmentResponse> {
  // Do not set Content-Type: fetch will set multipart/form-data with the correct boundary
  const res = await fetch(`${API_BASE}/attachments/upload`, {
    method: "POST",
    body: formData,
  })
  const data = (await res.json()) as UploadAttachmentResponse & { error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }
  if (!data.success) {
    throw new Error(data.error ?? "Upload fejlede.")
  }
  // New shape: { success, url, filename, file_name, mime_type, index } – use url from response for fetch, not filename
  if (data.url != null) {
    const attachment: ContractAttachment = {
      url: data.url,
      file_name: data.file_name ?? data.filename ?? data.url,
      mime_type: data.mime_type,
      view_url: data.url, // use backend url as-is for iframe fetch
      file_id: data.url,
      id: data.url,
    }
    return { success: true, attachment }
  }
  // Legacy shape: { success, attachment }
  if (!data.attachment) {
    throw new Error(data.error ?? "Upload fejlede.")
  }
  return data
}

/**
 * GET /contracts/api/screenshot/:dealId
 * Poll every 5s. If Content-Type: application/json → parse body; status === 'pending' keep polling; status === 'failed' stop.
 * If Content-Type: application/pdf → treat as success; use same URL as iframe src to display PDF.
 */
export function getScreenshotUrl(dealId: string): string {
  return `${API_BASE}/screenshot/${encodeURIComponent(dealId)}`
}

/** URL for screenshot/file at index (e.g. record_id-0.pdf style) */
export function getScreenshotUrlByIndex(dealId: string, index: number): string {
  return `${API_BASE}/screenshot/${encodeURIComponent(dealId)}-${index}`
}

export type ScreenshotPollResult =
  | { type: "json"; status: string }
  | { type: "pdf" }
  | { type: "error"; message: string }

export async function getScreenshotStatus(dealId: string): Promise<ScreenshotPollResult> {
  const url = getScreenshotUrl(dealId)
  const res = await fetch(url, { cache: "no-store" })
  const ct = res.headers.get("content-type") ?? ""

  if (ct.includes("application/json")) {
    const data = (await res.json()) as { status?: string }
    return { type: "json", status: data.status ?? "pending" }
  }
  if (ct.includes("application/pdf") || ct.includes("application/octet-stream")) {
    return { type: "pdf" }
  }
  if (!res.ok) {
    return { type: "error", message: res.status === 404 ? "not_found" : res.statusText || `HTTP ${res.status}` }
  }
  return { type: "error", message: "Uventet svar fra server" }
}

/** Check if screenshot/file exists at index; used to discover indices 0..10. */
export async function getScreenshotStatusByIndex(
  dealId: string,
  index: number
): Promise<ScreenshotPollResult> {
  const url = getScreenshotUrlByIndex(dealId, index)
  const res = await fetch(url, { cache: "no-store" })
  const ct = res.headers.get("content-type") ?? ""

  if (res.status === 404) {
    return { type: "error", message: "not_found" }
  }
  if (ct.includes("application/json")) {
    const data = (await res.json()) as { status?: string }
    return { type: "json", status: data.status ?? "pending" }
  }
  if (ct.includes("application/pdf") || ct.includes("application/octet-stream")) {
    return { type: "pdf" }
  }
  if (!res.ok) {
    return { type: "error", message: res.statusText || `HTTP ${res.status}` }
  }
  return { type: "error", message: "not_found" }
}

/**
 * DELETE upload/file – remove an uploaded file by url (e.g. record_id-index.pdf).
 */
export async function deleteUploadedFile(url: string): Promise<void> {
  const res = await fetch(`${API_BASE}/attachments/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })
  const data = res.ok ? null : ((await res.json()) as { error?: string })
  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`)
  }
}

/**
 * POST /contracts/api/send
 * JSON: record_id, contract_type, private_message, email_message, attachments, edited_fields, extras_invoice
 * Returns { success } or { job_id } or { error }
 */
export async function sendContract(
  payload: SendContractPayload
): Promise<SendContractResponse> {
  const res = await fetch(`${API_BASE}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data = await res.json() as SendContractResponse & { error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }
  if (!data.success && !data.job_id) {
    throw new Error(data.error ?? "Ukendt fejl")
  }
  return data
}
