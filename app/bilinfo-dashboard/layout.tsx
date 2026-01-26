import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bilinfo Dashboard – Checks & Sync",
  description: "Bilinfo Dashboard for listing checks and Zoho → Bilinfo sync",
}

export default function BilinfoDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
