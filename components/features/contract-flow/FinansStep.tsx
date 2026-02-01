"use client"

import { Fragment } from "react"
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
import type { ContractType, DealData, ExtraItem } from "@/types/contracts"

const TRADE_IN_USAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "Reduce_Car_Price", label: "Reducér bilens pris" },
  { value: "Reduce_Down_Payment", label: "Reducér udbetaling" },
  { value: "Add_To_Price", label: "Læg til pris" },
  { value: "Pay_Separate", label: "Betales separat" },
  { value: "Not_Applicable", label: "Ikke relevant" },
]

function extrasSumForPurchase(extras: ExtraItem[]): number {
  const sf = extras.find(
    (e) =>
      (e.name || "").toLowerCase() === "sales fee" ||
      (e.name || "").toLowerCase() === "success fee"
  )
  return sf ? Number(sf.price) || 0 : 0
}

/** PHP: Sales adds ALL extras to effective price (no category filter). */
function extrasSumForSales(extras: ExtraItem[]): number {
  return extras.reduce((a, b) => a + (Number(b.price) || 0), 0)
}

interface FinansStepProps {
  deal: DealData | null
  contractType: ContractType
  dealForm: Record<string, unknown>
  onDealFormChange: (field: string, value: unknown) => void
  extras: ExtraItem[]
}

export function FinansStep({
  deal,
  contractType,
  dealForm,
  onDealFormChange,
  extras,
}: FinansStepProps) {
  if (!deal) return null

  if (contractType === "purchase_agreement") {
    const underFinance = Boolean(dealForm.Under_finance ?? deal.Under_finance)
    const rest = parseMoney(
      String(dealForm.Outstanding_finance ?? deal.Outstanding_finance ?? 0)
    )
    const bank = String(dealForm.Finance_Bank ?? deal.Finance_Bank ?? "")
    const salFee = parseMoney(
      String(dealForm.CarPal_sales_fee ?? deal.CarPal_sales_fee ?? 0)
    )
    const price = parseMoney(String(dealForm.Sales_Price ?? deal.Sales_Price ?? 0))
    const feeFromExtras = extrasSumForPurchase(extras)
    const fee = feeFromExtras > 0 ? feeFromExtras : salFee
    const total = price - (underFinance ? rest : 0) - fee
    const restLine: [string, string][] =
      underFinance && rest > 0
        ? [["- Indfrielse af restgæld", "-" + toMoney(rest)]]
        : []
    const lines: [string, string][] = [
      ["Salgspris", toMoney(price)],
      ...restLine,
      ["- CarPal Salær (Success Fee)", "-" + toMoney(fee)],
    ]

    return (
      <section className="p-[18px]" aria-labelledby="finans-heading">
        <div className="grid grid-cols-12 gap-3">
          <Card className="col-span-12">
            <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="Under_finance"
                name="Under_finance"
                checked={underFinance}
                onChange={(e) => onDealFormChange("Under_finance", e.target.checked)}
                data-module="deal"
                className="h-4 w-4 rounded border-input"
                aria-label="Bilen er finansieret (restgæld)"
              />
              <label htmlFor="Under_finance" className="text-sm">
                Bilen er finansieret (restgæld)
              </label>
            </div>
            {underFinance && (
              <div className="mt-3 grid grid-cols-12 gap-3">
                <div className="col-span-4">
                  <label htmlFor="Outstanding_finance" className="mb-1 block text-xs text-muted-foreground">
                    Restgæld (kr)
                  </label>
                  <Input
                    id="Outstanding_finance"
                    name="Outstanding_finance"
                    inputMode="decimal"
                    value={String(rest)}
                    onChange={(e) => onDealFormChange("Outstanding_finance", e.target.value)}
                    data-module="deal"
                  />
                </div>
                <div className="col-span-4">
                  <label htmlFor="Finance_Bank" className="mb-1 block text-xs text-muted-foreground">
                    Kreditor
                  </label>
                  <Input
                    id="Finance_Bank"
                    name="Finance_Bank"
                    value={bank}
                    onChange={(e) => onDealFormChange("Finance_Bank", e.target.value)}
                    data-module="deal"
                  />
                </div>
              </div>
            )}
            </CardContent>
          </Card>
          <Card className="col-span-12">
            <CardContent className="pt-4">
            <h4 className="mb-3 font-semibold">Purchase-beregning</h4>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <label htmlFor="CarPal_sales_fee" className="mb-1 block text-xs text-muted-foreground">
                  CarPal Salær (Success Fee)
                </label>
                <Input
                  id="CarPal_sales_fee"
                  name="CarPal_sales_fee"
                  inputMode="decimal"
                  value={toMoney(fee)}
                  onChange={(e) => onDealFormChange("CarPal_sales_fee", parseMoney(e.target.value))}
                  data-module="deal"
                />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              {lines.map(([k, v]) => (
                <Fragment key={k}>
                  <div className="border-b border-dashed border-border px-3 py-2.5">
                    {k}
                  </div>
                  <div className="border-b border-dashed border-border px-3 py-2.5">
                    {v}
                  </div>
                </Fragment>
              ))}
              <div className="border-b border-dashed border-border px-3 py-2.5 font-bold">
                KØBESUM (CarPal)
              </div>
              <div className="border-b border-dashed border-border px-3 py-2.5 font-bold">
                {toMoney(total)}
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // Sales agreement
  const hasTrade = Boolean(dealForm.Has_Trade_In ?? deal.Has_Trade_In)
  const tiPrice = parseMoney(String(dealForm.Trade_in_Price ?? deal.Trade_in_Price ?? 0))
  const tiDebt = parseMoney(
    String(dealForm.Trade_in_Finance_Remaining ?? deal.Trade_in_Finance_Remaining ?? 0)
  )
  const tiUsage = String(
    dealForm.Trade_in_Usage_Type ?? deal.Trade_in_Usage_Type ?? "Not_Applicable"
  )
  const hasFin = Boolean(dealForm.Has_Financing ?? deal.Has_Financing)
  const dpAmount = parseMoney(
    String(dealForm.Financing_Down_Payment_Amount ?? deal.Financing_Down_Payment_Amount ?? 0)
  )
  const salesPrice = parseMoney(String(dealForm.Sales_Price ?? deal.Sales_Price ?? 0))
  const tradeValue = tiPrice - tiDebt
  let effectivePrice = salesPrice
  let extraNegativeTrade = 0
  if (hasTrade) {
    if (tradeValue > 0 && tiUsage === "Reduce_Car_Price") {
      effectivePrice = salesPrice - tradeValue
    } else if (tradeValue < 0 && tiUsage === "Add_To_Price") {
      effectivePrice = salesPrice + Math.abs(tradeValue)
    } else if (tradeValue < 0 && tiUsage === "Pay_Separate") {
      extraNegativeTrade = Math.abs(tradeValue)
    }
  }
  const extraSum = extrasSumForSales(extras)
  effectivePrice = Math.max(0, effectivePrice + extraSum)
  let loan = 0
  let cashNow = 0
  if (hasFin) {
    const dp = Math.max(0, Math.min(dpAmount, effectivePrice))
    loan = Math.max(0, effectivePrice - dp)
    let remainingCashDown = dp
    if (hasTrade && tradeValue > 0 && tiUsage === "Reduce_Down_Payment") {
      remainingCashDown = Math.max(0, dp - tradeValue)
      if (tradeValue > dp) loan = Math.max(0, loan - (tradeValue - dp))
    }
    cashNow = remainingCashDown + extraNegativeTrade
  } else {
    cashNow = effectivePrice + extraNegativeTrade
  }

  return (
    <section className="p-[18px]" aria-labelledby="finans-heading">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 rounded-xl border border-border bg-card p-3.5">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="Has_Trade_In"
                  name="Has_Trade_In"
                  checked={hasTrade}
                  onChange={(e) => onDealFormChange("Has_Trade_In", e.target.checked)}
                  data-module="deal"
                  className="h-4 w-4 rounded border-input"
                  aria-label="Tilføj byttebil"
                />
                <label htmlFor="Has_Trade_In" className="text-sm">
                  Tilføj byttebil
                </label>
              </div>
              {hasTrade && (
                <div className="mt-2 space-y-2">
                  <label htmlFor="Trade_in_Price" className="block text-xs text-muted-foreground">
                    Byttebilspris
                  </label>
                  <Input
                    id="Trade_in_Price"
                    name="Trade_in_Price"
                    inputMode="decimal"
                    value={String(tiPrice)}
                    onChange={(e) => onDealFormChange("Trade_in_Price", e.target.value)}
                    data-module="deal"
                  />
                  <label htmlFor="Trade_in_Finance_Remaining" className="block text-xs text-muted-foreground">
                    Pant i byttebil
                  </label>
                  <Input
                    id="Trade_in_Finance_Remaining"
                    name="Trade_in_Finance_Remaining"
                    inputMode="decimal"
                    value={String(tiDebt)}
                    onChange={(e) => onDealFormChange("Trade_in_Finance_Remaining", e.target.value)}
                    data-module="deal"
                  />
                  <label htmlFor="Trade_in_Usage_Type" className="block text-xs text-muted-foreground">
                    Anvendelse
                  </label>
                  <Select
                    value={tiUsage}
                    onValueChange={(v) => onDealFormChange("Trade_in_Usage_Type", v)}
                  >
                    <SelectTrigger id="Trade_in_Usage_Type" className="w-full font-normal" data-module="deal">
                      <SelectValue placeholder="Vælg anvendelse" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADE_IN_USAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="col-span-8">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="Has_Financing"
                  name="Has_Financing"
                  checked={hasFin}
                  onChange={(e) => onDealFormChange("Has_Financing", e.target.checked)}
                  data-module="deal"
                  className="h-4 w-4 rounded border-input"
                  aria-label="Tilføj finansiering"
                />
                <label htmlFor="Has_Financing" className="text-sm">
                  Tilføj finansiering
                </label>
              </div>
              {hasFin && (
                <div className="mt-2 grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <label htmlFor="Financing_Down_Payment_Amount" className="mb-1 block text-xs text-muted-foreground">
                      Udbetaling (kr.)
                    </label>
                    <Input
                      id="Financing_Down_Payment_Amount"
                      name="Financing_Down_Payment_Amount"
                      inputMode="decimal"
                      value={String(dpAmount)}
                      onChange={(e) => onDealFormChange("Financing_Down_Payment_Amount", e.target.value)}
                      data-module="deal"
                    />
                  </div>
                  <div className="col-span-6">
                    <label htmlFor="Financing_Amount" className="mb-1 block text-xs text-muted-foreground">
                      Lånebeløb (auto)
                    </label>
                    <Input
                      id="Financing_Amount"
                      value={toMoney(loan)}
                      disabled
                      readOnly
                      data-module="deal"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <div className="border-b border-dashed border-border px-3 py-2.5">Salgspris</div>
            <div className="border-b border-dashed border-border px-3 py-2.5">{toMoney(salesPrice)}</div>
            {extraSum > 0 && (
              <>
                <div className="border-b border-dashed border-border px-3 py-2.5">
                  + Extras (Ekstra salg)
                </div>
                <div className="border-b border-dashed border-border px-3 py-2.5">{toMoney(extraSum)}</div>
              </>
            )}
            {hasTrade && (
              <>
                <div className="border-b border-dashed border-border px-3 py-2.5">Byttebilspris</div>
                <div className="border-b border-dashed border-border px-3 py-2.5">{toMoney(tiPrice)}</div>
                <div className="border-b border-dashed border-border px-3 py-2.5">Pant i byttebil</div>
                <div className="border-b border-dashed border-border px-3 py-2.5">-{toMoney(tiDebt)}</div>
                <div className="border-b border-dashed border-border px-3 py-2.5">Byttebil netto</div>
                <div className="border-b border-dashed border-border px-3 py-2.5">{toMoney(tradeValue)}</div>
              </>
            )}
            <div className="border-b border-dashed border-border px-3 py-2.5">—</div>
            <div className="border-b border-dashed border-border px-3 py-2.5" />
            <div className="px-3 py-2.5 font-bold">Kontant betaling nu</div>
            <div className="px-3 py-2.5 font-bold">{toMoney(cashNow)}</div>
            {loan > 0 && (
              <>
                <div className="px-3 py-2.5 font-bold">Lånebeløb</div>
                <div className="px-3 py-2.5 font-bold">{toMoney(loan)}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
