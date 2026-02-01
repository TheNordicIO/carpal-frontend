"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { parseMoney, toMoney } from "@/lib/utils"
import type { ContractType, ExtraItem, ProductData } from "@/types/contracts"
import { ExtrasTable } from "./ExtrasTable"

interface ExtrasStepProps {
  contractType: ContractType
  externalProducts: ProductData[]
  extras: ExtraItem[]
  onExtrasChange: (extras: ExtraItem[]) => void
  customProdName: string
  customProdPrice: string
  onCustomProdNameChange: (v: string) => void
  onCustomProdPriceChange: (v: string) => void
  selectedExternalId: string
  onSelectedExternalIdChange: (v: string) => void
}

export function ExtrasStep({
  contractType,
  externalProducts,
  extras,
  onExtrasChange,
  customProdName,
  customProdPrice,
  onCustomProdNameChange,
  onCustomProdPriceChange,
  selectedExternalId,
  onSelectedExternalIdChange,
}: ExtrasStepProps) {
  const handleAddExternal = () => {
    if (!selectedExternalId) return
    const p = externalProducts.find((x) => (x.id ?? "") === selectedExternalId)
    if (!p) return
    const name = String(p.Product_Name ?? "")
    const price = Number(p.Unit_Price ?? 0) || 0
    onExtrasChange([
      ...extras,
      { type: "external", product_id: selectedExternalId, name, price },
    ])
  }

  const handleAddCustom = () => {
    const n = customProdName.trim()
    if (!n) return
    const p = parseMoney(customProdPrice)
    onExtrasChange([...extras, { type: "custom", name: n, price: p }])
    onCustomProdNameChange("")
    onCustomProdPriceChange("")
  }

  const handleUpdatePrice = (index: number, price: number) => {
    const next = extras.map((e, i) => (i === index ? { ...e, price } : e))
    onExtrasChange(next)
  }

  const handleRemove = (index: number) => {
    const name = (extras[index]?.name ?? "").toLowerCase()
    if (
      contractType === "purchase_agreement" &&
      (name === "sales fee" || name === "success fee")
    ) {
      return
    }
    onExtrasChange(extras.filter((_, i) => i !== index))
  }

  return (
    <section className="p-[18px]" aria-labelledby="extras-heading">
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <label
                htmlFor="external_product_select"
                className="mb-1 block text-xs text-muted-foreground"
              >
                Tilføj garanti/produkt (Products: Category=External)
              </label>
              <Select
                value={selectedExternalId || undefined}
                onValueChange={onSelectedExternalIdChange}
              >
                <SelectTrigger
                  id="external_product_select"
                  aria-label="Vælg produkt"
                  className="w-full"
                >
                  <SelectValue placeholder="Vælg produkt…" />
                </SelectTrigger>
                <SelectContent>
                  {externalProducts.map((p) => {
                    const pid = p.id ?? ""
                    const pn = p.Product_Name ?? ""
                    const pr = Number(p.Unit_Price ?? 0)
                    return (
                      <SelectItem key={pid} value={pid}>
                        {String(pn)} ({toMoney(pr)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <div className="mt-2 flex items-center gap-2">
                <Button type="button" variant="outline" onClick={handleAddExternal}>
                  Tilføj valgt
                </Button>
                <span className="text-xs text-muted-foreground">
                  Tilføjes også i Deal Invoice (subform) ved afsendelse.
                </span>
              </div>
            </div>
            <div className="col-span-6">
              <label className="mb-1 block text-xs text-muted-foreground">
                Tilføj valgfrit produkt
              </label>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                  <Input
                    placeholder="Produktnavn"
                    value={customProdName}
                    onChange={(e) => onCustomProdNameChange(e.target.value)}
                    aria-label="Produktnavn"
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    placeholder="Pris (kr.)"
                    inputMode="decimal"
                    value={customProdPrice}
                    onChange={(e) => onCustomProdPriceChange(e.target.value)}
                    aria-label="Pris"
                  />
                </div>
              </div>
              <div className="mt-2">
                <Button type="button" variant="outline" onClick={handleAddCustom}>
                  Tilføj eget produkt
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-3">
        <CardContent className="pt-4">
          <ExtrasTable
            extras={extras}
            contractType={contractType}
            onUpdatePrice={handleUpdatePrice}
            onRemove={handleRemove}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            • <strong>Purchase Agreement</strong>: <strong>Success Fee</strong>{" "}
            medregnes altid. Øvrige extras medregnes ikke i purchase-beregningen.
            <br />• <strong>Sales Agreement</strong>: Alle extras herfra medregnes
            i salgsberegningen.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
