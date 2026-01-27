/**
 * TypeScript types for Zoho Deal API responses
 */

export interface ZohoCar {
  id?: string
  [key: string]: unknown
}

export interface ZohoCarDetails {
  id?: string
  Make?: string
  Model?: string
  VIN?: string
  [key: string]: unknown
}

export interface ZohoCarChoice {
  id?: string
  Name?: string
  [key: string]: unknown
}

export interface ZohoDealResponse {
  id?: string
  Deal_Name?: string
  Stage?: string
  Car?: ZohoCar
  Car_Details?: ZohoCarDetails
  Car_Choices?: ZohoCarChoice[]
  [key: string]: unknown
}

export interface ZohoDealErrorResponse {
  statusCode: number
  message?: string
  error?: string
}
