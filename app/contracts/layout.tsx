import { ContractsThemeProvider } from "./ContractsThemeProvider"

export const metadata = {
  title: "Carpal | Contracts",
  description: "Contracts flow for Carpal",
  openGraph: {
    title: "Carpal | Contracts",
    description: "Contracts flow for Carpal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carpal | Contracts",
    description: "Contracts flow for Carpal",
  },
}

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ContractsThemeProvider>{children}</ContractsThemeProvider>
}
