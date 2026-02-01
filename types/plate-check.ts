/**
 * TypeScript types for Plate Check API responses
 */

export interface VehicleDetails {
  vehicleIdentificationNumber?: string
  firstRegistrationDate?: string
  make?: string
  model?: string
  [key: string]: unknown
}

export interface PlateCheckResponse {
  vehicleDetails?: VehicleDetails
  [key: string]: unknown
}

export interface PlateCheckErrorResponse {
  error?: string
  message?: string
}
