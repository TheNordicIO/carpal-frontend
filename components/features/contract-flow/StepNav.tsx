"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
    <Card>
      <CardContent className="p-2 pt-3">
        <nav aria-label="Kontrakt trin">
          <h3 className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kontrakt
          </h3>
          <div className="flex flex-col gap-0.5">
            {STEPS.map(({ step, label, subtitle }) => {
              const isSuccessStep = step === "success"
              const isDisabled = isSuccessStep
              return (
                <button
                  key={step}
                  type="button"
                  disabled={isDisabled}
                  aria-disabled={isDisabled}
                  aria-current={activeStep === step ? "step" : undefined}
                  onClick={() => !isDisabled && onStepChange(step)}
                  className={cn(
                    "flex w-full flex-col rounded-lg border px-3.5 py-3 text-left transition-colors",
                    activeStep === step
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-muted/50",
                    isDisabled && "cursor-not-allowed opacity-90"
                  )}
                >
                  <span className="font-semibold">{label}</span>
                  <small className="text-muted-foreground">{subtitle}</small>
                </button>
              )
            })}
          </div>
        </nav>
      </CardContent>
    </Card>
  )
}
