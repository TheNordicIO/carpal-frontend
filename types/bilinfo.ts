/**
 * Bilinfo Dashboard – types matching the backend API (list, check, sync_one, sync_all).
 */

export interface BilinfoListingRow {
  EdbNumber: string
  Title: string
  Vin: string
  Internal: boolean
  Price: number
  Mileage: number
  CreatedDate: string
  ModifiedDate: string
  VariantID: string
  VehicleId: string
  VehicleSourceId: string
}

export interface BilinfoListResponse {
  status: "ok" | "error"
  count?: number
  rows?: BilinfoListingRow[]
  message?: string
}

export interface BilinfoCheckChecks {
  stageNotSoldOk: boolean
  internalOk: boolean
  bilinfoStatusOk: boolean
  priceOk: boolean
  mileageOk: boolean
  variantOk: boolean
  equipmentOk: boolean
}

export interface BilinfoCheckResult {
  found: boolean
  dealId?: string
  message?: string
  checks?: BilinfoCheckChecks
  debug?: {
    zoho?: Record<string, unknown>
    listing?: Record<string, unknown>
    note?: string
  }
}

export interface BilinfoCheckResponse {
  status: "ok" | "error"
  result?: BilinfoCheckResult
  message?: string
}

export interface BilinfoSyncOneResponse {
  status: "ok" | "error"
  message?: string
}

export interface BilinfoSyncAllResponse {
  status: "ok" | "error"
  ok?: number
  errors?: number
  messages?: string[]
  message?: string
}
