/**
 * Bilinfo Dashboard API client
 *
 * TODO: Wire this to your backend. Replace baseUrl with your actual Bilinfo
 * inspector endpoint (e.g. the PHP script URL). All four functions call that
 * backend; add auth (e.g. secret query param or header) as your backend expects.
 *
 * Backend actions (from your PHP):
 *   - list:  GET  ?action=list&secret=…  → { status, count, rows }
 *   - check: GET  ?action=check&secret=…&vin=…&internal=…&price=…&mileage=…&variant=…  → { status, result }
 *   - sync_one: POST action=sync_one&secret=…&vin=…  → { status, message }
 *   - sync_all: POST action=sync_all&secret=…&vins[]=…  → { status, ok, errors, messages }
 */

import type {
  BilinfoListingRow,
  BilinfoListResponse,
  BilinfoCheckResult,
  BilinfoCheckResponse,
  BilinfoSyncOneResponse,
  BilinfoSyncAllResponse,
} from "@/types/bilinfo"

const getBaseUrl = () => {
  // TODO: point to your Bilinfo inspector backend (e.g. env or config)
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
  }
  return process.env.BILINFO_API_URL ?? process.env.NEXT_PUBLIC_BILINFO_API_URL ?? ""
}

const getSecret = () => {
  // TODO: supply secret from env or auth (never expose in client bundle if sensitive)
  return process.env.NEXT_PUBLIC_BILINFO_SECRET ?? ""
}

/**
 * Fetch all listings from Bilinfo (ListingAPI export).
 * TODO: Implement – call your backend ?action=list&secret=…
 */
export async function fetchListings(): Promise<BilinfoListResponse> {
  const baseUrl = getBaseUrl()
  const secret = getSecret()
  if (!baseUrl || !secret) {
    return { status: "error", message: "Bilinfo API URL or secret not configured" }
  }

  // TODO: replace with your real backend call
  const url = `${baseUrl}bilinfo/dashboard?action=list&secret=${encodeURIComponent(secret)}`

  const res = await fetch(url, { cache: "no-store" })
  const raw = (await res.json()) as BilinfoListResponse | Record<string, unknown>[]

  if (!res.ok) {
    const msg =
      typeof raw === "object" && raw !== null && !Array.isArray(raw) && "message" in raw
        ? (raw as BilinfoListResponse).message
        : undefined
    return { status: "error", message: msg ?? `HTTP ${res.status}` }
  }

  // Backend returns a plain array of listings (PascalCase; Price/Mileage can be strings).
  // Example item: { EdbNumber, Title, Vin, Internal, Price: "375000", Mileage: "90000", CreatedDate, ModifiedDate, VariantID, VehicleId, VehicleSourceId }
  if (Array.isArray(raw)) {
    const rows = raw.map((item) => normalizeListingRow(item as Record<string, unknown>))
    return { status: "ok", count: rows.length, rows }
  }
  return raw as BilinfoListResponse
}

/** Normalize API listing item to BilinfoListingRow. Handles PascalCase, camelCase, and string numbers (e.g. Price: "375000", Mileage: "90000"). */
function normalizeListingRow(item: Record<string, unknown>): BilinfoListingRow {
  const get = (pascal: string, camel: string) => item[pascal] ?? item[camel]
  const str = (pascal: string, camel: string) => String(get(pascal, camel) ?? "").trim()
  const num = (pascal: string, camel: string) => {
    const v = get(pascal, camel)
    if (v === undefined || v === null) return 0
    if (typeof v === "number" && !Number.isNaN(v)) return v
    const n = typeof v === "string" ? parseInt(v.replace(/\s/g, ""), 10) : Number(v)
    return Number.isNaN(n) ? 0 : n
  }
  const bool = (pascal: string, camel: string) => {
    const v = get(pascal, camel)
    return v === true || v === "true" || v === "True"
  }
  return {
    EdbNumber: str("EdbNumber", "edbNumber"),
    Title: str("Title", "title"),
    Vin: str("Vin", "vin").toUpperCase(),
    Internal: bool("Internal", "internal"),
    Price: num("Price", "price"),
    Mileage: num("Mileage", "mileage") || num("Odometer", "odometer"),
    CreatedDate: str("CreatedDate", "createdDate"),
    ModifiedDate: str("ModifiedDate", "modifiedDate"),
    VariantID: str("VariantID", "variantID") || str("VariantId", "variantId") || str("SpecificationId", "specificationId"),
    VehicleId: str("VehicleId", "vehicleId"),
    VehicleSourceId: str("VehicleSourceId", "vehicleSourceId"),
  }
}

/**
 * Run Zoho ⇄ Listing checks for one VIN.
 * TODO: Implement – call your backend ?action=check&secret=…&vin=…&internal=…&price=…&mileage=…&variant=…
 */
export async function runCheck(row: BilinfoListingRow): Promise<BilinfoCheckResult | null> {
  const baseUrl = getBaseUrl()
  const secret = getSecret()
  if (!baseUrl || !secret || !row.Vin) {
    return null
  }
  const params = new URLSearchParams({
    action: "check",
    secret,
    vin: row.Vin,
    internal: String(!!row.Internal),
    price: String(row.Price ?? 0),
    mileage: String(row.Mileage ?? 0),
    variant: row.VariantID ?? "",
  })

  // TODO: replace with your real backend call
  const url = `${baseUrl}bilinfo/dashboard?${params.toString()}`
  const res = await fetch(url)
  const data = (await res.json()) as BilinfoCheckResponse
  if (!res.ok || data.status !== "ok" || !data.result) {
    return null
  }
  return data.result
}

/**
 * Sync one vehicle (Zoho → Bilinfo) by VIN.
 * TODO: Implement – POST to your backend action=sync_one&secret=…&vin=…
 */
export async function syncOne(vin: string): Promise<BilinfoSyncOneResponse> {
  const baseUrl = getBaseUrl()
  const secret = getSecret()
  if (!baseUrl || !secret) {
    return { status: "error", message: "Bilinfo API URL or secret not configured" }
  }
  const body = new FormData()
  body.append("action", "sync_one")
  body.append("vin", vin)
  body.append("secret", secret)
  // TODO: replace with your real backend call
  const res = await fetch(baseUrl, { method: "POST", body })
  const data = (await res.json()) as BilinfoSyncOneResponse
  if (!res.ok) {
    return { status: "error", message: data.message ?? `HTTP ${res.status}` }
  }
  return data
}

/**
 * Sync all given VINs (Zoho → Bilinfo).
 * TODO: Implement – POST to your backend action=sync_all&secret=…&vins[]=…
 */
export async function syncAll(vins: string[]): Promise<BilinfoSyncAllResponse> {
  const baseUrl = getBaseUrl()
  const secret = getSecret()
  if (!baseUrl || !secret) {
    return { status: "error", message: "Bilinfo API URL or secret not configured" }
  }
  const body = new FormData()
  body.append("action", "sync_all")
  body.append("secret", secret)
  vins.forEach((v) => body.append("vins[]", v))
  // TODO: replace with your real backend call
  const res = await fetch(baseUrl, { method: "POST", body })
  const data = (await res.json()) as BilinfoSyncAllResponse
  if (!res.ok) {
    return { status: "error", message: data.message ?? `HTTP ${res.status}` }
  }
  return data
}
