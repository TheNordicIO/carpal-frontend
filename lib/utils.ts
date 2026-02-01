import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse Danish/numeric string to number (e.g. "1.234,56" → 1234.56) */
export function parseMoney(v: unknown): number {
  if (v == null) return 0
  const s = String(v).replace(/\./g, "").replace(",", ".")
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/** Format number as Danish locale (e.g. 1234.56 → "1.234,56") */
export function toMoney(n: number): string {
  const x = Math.round((Number(n) || 0) * 100) / 100
  return x.toLocaleString("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Full name from contact (for contracts flow) */
export function fullName(contact: { Full_Name?: string; First_Name?: string; Last_Name?: string } | null): string {
  if (!contact) return ""
  return (contact.Full_Name ?? `${contact.First_Name ?? ""} ${contact.Last_Name ?? ""}`.trim()) || "Unknown"
}

/** Full address from contact (for contracts flow) */
export function fullAddress(contact: { Mailing_Street?: string; Mailing_Zip?: string; Mailing_City?: string } | null): string {
  if (!contact) return ""
  return [contact.Mailing_Street, contact.Mailing_Zip, contact.Mailing_City].filter(Boolean).join(", ")
}
