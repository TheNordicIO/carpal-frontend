"use client"

import {
  Box,
  ButtonBase,
  Paper,
  Typography,
} from "@mui/material"
import type { ContractStep } from "@/types/contracts"

const STEPS: { step: ContractStep; label: string; subtitle: string }[] = [
  { step: "forside", label: "Forside", subtitle: "Åbn deal" },
  { step: "kunde", label: "Kunde", subtitle: "Kontakt & adresse" },
  { step: "bil", label: "Bil", subtitle: "Zoho → Cars" },
  { step: "finans", label: "Finansiering", subtitle: "Udbetaling & lån" },
  { step: "extras", label: "Ekstra salg", subtitle: "Produkter & gebyrer" },
  { step: "vedh", label: "Vedhæftede", subtitle: "Filer" },
  { step: "sign", label: "Handlinger", subtitle: "Beskeder & afsend" },
  { step: "success", label: "Færdig", subtitle: "Flow gennemført" },
]

interface StepNavProps {
  activeStep: ContractStep
  onStepChange: (step: ContractStep) => void
}

export function StepNav({ activeStep, onStepChange }: StepNavProps) {
  return (
    <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2 }}>
      <nav aria-label="Kontrakt trin">
        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 1.5,
            mb: 1,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
          }}
        >
          Kontrakt
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {STEPS.map(({ step, label, subtitle }) => {
            const isSuccessStep = step === "success"
            const isDisabled = isSuccessStep
            const isActive = activeStep === step
            return (
              <ButtonBase
                key={step}
                type="button"
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-current={isActive ? "step" : undefined}
                onClick={() => !isDisabled && onStepChange(step)}
                sx={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  px: 1.75,
                  py: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: isActive ? "primary.main" : "transparent",
                  bgcolor: isActive ? "action.selected" : "transparent",
                  "&:hover": isDisabled ? undefined : { bgcolor: "action.hover" },
                  opacity: isDisabled ? 0.9 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              </ButtonBase>
            )
          })}
        </Box>
      </nav>
    </Paper>
  )
}
