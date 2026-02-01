/**
 * TypeScript types for Zoho Fields API responses
 */

export interface ZohoModule {
  api_name?: string
  plural_label?: string
  singular_label?: string
  [key: string]: unknown
}

export interface ZohoField {
  api_name?: string
  field_label?: string
  data_type?: string
  custom_field_label?: string
  [key: string]: unknown
}
