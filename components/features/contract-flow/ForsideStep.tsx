"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ForsideStepProps {
  openDealValue: string
  onOpenDealValueChange: (value: string) => void
  onOpenDeal: () => void
  openDealError: string | null
}

export function ForsideStep({
  openDealValue,
  onOpenDealValueChange,
  onOpenDeal,
  openDealError,
}: ForsideStepProps) {
  return (
    <section className="p-[18px]" aria-labelledby="forside-heading">
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="open_deal_value"
              type="text"
              placeholder="Deal-ID eller Deal Number"
              value={openDealValue}
              onChange={(e) => onOpenDealValueChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onOpenDeal()}
              className="max-w-[240px]"
              aria-label="Deal-ID eller Deal Number"
            />
            <Button type="button" variant="outline" onClick={onOpenDeal}>
              Åbn
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Indtast Zoho Deal-ID (eller Deal Number). Når dealen er åbnet,
            skjules denne forside.
          </p>
          {openDealError && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{openDealError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
