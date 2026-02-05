"use client"

import { Box, CircularProgress, Typography } from "@mui/material"
import { Suspense } from "react"
import { ContractFlow } from "@/components/features/contract-flow/ContractFlow"

function ContractsPageContent() {
  return <ContractFlow />
}

function ContractsPageFallback() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: 400,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Henter...
      </Typography>
    </Box>
  )
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<ContractsPageFallback />}>
      <ContractsPageContent />
    </Suspense>
  )
}
