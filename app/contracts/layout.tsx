export const metadata = {
  title: "Kontrakt (CarPal)",
}

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {children}
    </div>
  )
}
