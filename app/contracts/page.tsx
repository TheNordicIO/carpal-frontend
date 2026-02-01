"use client"

import { Suspense } from "react"
import { ContractFlow } from "@/components/features/contract-flow/ContractFlow"

function ContractsPageContent() {
  return <ContractFlow />
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center text-muted-foreground">Henter...</div>}>
      <ContractsPageContent />
    </Suspense>
  )
}
