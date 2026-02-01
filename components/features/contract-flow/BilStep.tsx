"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CarData, ContractType, DealData } from "@/types/contracts"

interface BilStepProps {
  deal: DealData | null
  car: CarData | null
  contractType: ContractType
  dealForm: Record<string, unknown>
  onDealFormChange: (field: string, value: unknown) => void
}

export function BilStep({
  deal,
  car,
  contractType,
  dealForm,
  onDealFormChange,
}: BilStepProps) {
  if (!car || !deal) return null

  const colorName =
    typeof car.Color === "object" && car.Color && "name" in car.Color
      ? (car.Color as { name?: string }).name ?? ""
      : (car.Color as string) ?? ""
  const handoverField =
    contractType === "purchase_agreement"
      ? "Purchase_Agreement_Handover_Text"
      : "Sales_Agreement_Handover_Text"
  const deliveryDate = deal.Deliverytime
    ? new Date(deal.Deliverytime).toISOString().split("T")[0]
    : ""
  const salesPrice = (dealForm.Sales_Price as number | string) ?? deal.Sales_Price ?? 0
  const deliveryTime = (dealForm.Deliverytime as string) ?? deliveryDate
  const handoverText = (dealForm[handoverField] as string) ?? deal[handoverField] ?? ""

  return (
    <section className="p-[18px]" aria-labelledby="bil-heading">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <label htmlFor="bil-maerke" className="mb-1 block text-xs text-muted-foreground">
            Mærke
          </label>
          <Input id="bil-maerke" value={car.Make ?? ""} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="bil-model" className="mb-1 block text-xs text-muted-foreground">
            Model
          </label>
          <Input id="bil-model" value={car.Model ?? ""} disabled readOnly />
        </div>
        <div className="col-span-6">
          <label htmlFor="bil-variant" className="mb-1 block text-xs text-muted-foreground">
            Variant
          </label>
          <Input id="bil-variant" value={car.Variant ?? ""} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="bil-drivmiddel" className="mb-1 block text-xs text-muted-foreground">
            Drivmiddel
          </label>
          <Input id="bil-drivmiddel" value={car.FuelType ?? car.Fuel ?? ""} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="bil-modelaar" className="mb-1 block text-xs text-muted-foreground">
            Modelår
          </label>
          <Input id="bil-modelaar" value={String(car.Model_Year ?? car.ModelYear ??"")} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="bil-1reg" className="mb-1 block text-xs text-muted-foreground">
            1. reg.
          </label>
          <Input id="bil-1reg" value={car.First_registration ?? ""} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="bil-farve" className="mb-1 block text-xs text-muted-foreground">
            Farve
          </label>
          <Input id="bil-farve" value={colorName} disabled readOnly />
        </div>
        <div className="col-span-4">
          <label htmlFor="bil-vin" className="mb-1 block text-xs text-muted-foreground">
            Stelnr. (VIN)
          </label>
          <Input id="bil-vin" value={car.VIN ?? ""} disabled readOnly />
        </div>
        <div className="col-span-4">
          <label htmlFor="bil-regnr" className="mb-1 block text-xs text-muted-foreground">
            Reg.nr.
          </label>
          <Input id="bil-regnr" value={car.Registration ?? car.Licenseplate ?? ""} disabled readOnly />
        </div>
        <div className="col-span-4">
          <label htmlFor="bil-km" className="mb-1 block text-xs text-muted-foreground">
            Kilometer
          </label>
          <Input id="bil-km" value={String(car.Mileage ?? "")} disabled readOnly />
        </div>
        <div className="col-span-12 h-px bg-border" aria-hidden />
        <div className="col-span-4">
          <label htmlFor="Sales_Price" className="mb-1 block text-xs text-muted-foreground">
            Bilens pris (Sales_Price)
          </label>
          <Input
            id="Sales_Price"
            name="Sales_Price"
            inputMode="decimal"
            value={String(salesPrice)}
            onChange={(e) => onDealFormChange("Sales_Price", e.target.value)}
            data-module="deal"
            aria-label="Bilens pris"
          />
        </div>
        <div className="col-span-4">
          <label htmlFor="Deliverytime" className="mb-1 block text-xs text-muted-foreground">
            Leveringsdato (Deliverytime)
          </label>
          <Input
            id="Deliverytime"
            name="Deliverytime"
            type="date"
            value={deliveryTime}
            onChange={(e) => onDealFormChange("Deliverytime", e.target.value)}
            data-module="deal"
            aria-label="Leveringsdato"
          />
        </div>
        <div className="col-span-4">
          <label htmlFor={handoverField} className="mb-1 block text-xs text-muted-foreground">
            Overleveringstekst
          </label>
          <Textarea
            id={handoverField}
            name={handoverField}
            data-module="deal"
            rows={3}
            value={handoverText}
            onChange={(e) => onDealFormChange(handoverField, e.target.value)}
            aria-label="Overleveringstekst"
          />
        </div>
      </div>
    </section>
  )
}
