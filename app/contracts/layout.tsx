import { ContractsThemeProvider } from "./ContractsThemeProvider"

export const metadata = {
  title: "Contracts | {{APP_NAME}}",
  description: "{{PLACEHOLDER_CONTRACTS_DESCRIPTION}}",
  openGraph: {
    title: "Contracts | {{APP_NAME}}",
    description: "{{PLACEHOLDER_CONTRACTS_DESCRIPTION}}",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contracts | {{APP_NAME}}",
    description: "{{PLACEHOLDER_CONTRACTS_DESCRIPTION}}",
  },
}

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ContractsThemeProvider>{children}</ContractsThemeProvider>
}
