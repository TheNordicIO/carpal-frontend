"use client"

import { Fragment } from "react"
import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
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
      <Box component="section" sx={{ p: 2.5 }} aria-labelledby="finans-heading">
        <Grid container spacing={2}>
          <Grid size={12}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="Under_finance"
                    name="Under_finance"
                    checked={underFinance}
                    onChange={(e) => onDealFormChange("Under_finance", e.target.checked)}
                    inputProps={{ "aria-label": "Bilen er finansieret (restgæld)" }}
                  />
                }
                label="Bilen er finansieret (restgæld)"
              />
              {underFinance && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      id="Outstanding_finance"
                      name="Outstanding_finance"
                      label="Restgæld (kr)"
                      inputMode="decimal"
                      value={String(rest)}
                      onChange={(e) => onDealFormChange("Outstanding_finance", e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ "data-module": "deal" }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      id="Finance_Bank"
                      name="Finance_Bank"
                      label="Kreditor"
                      value={bank}
                      onChange={(e) => onDealFormChange("Finance_Bank", e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ "data-module": "deal" }}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
          <Grid size={12}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Purchase-beregning
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="CarPal_sales_fee"
                    name="CarPal_sales_fee"
                    label="CarPal Salær (Success Fee)"
                    inputMode="decimal"
                    value={toMoney(fee)}
                    onChange={(e) => onDealFormChange("CarPal_sales_fee", parseMoney(e.target.value))}
                    fullWidth
                    size="small"
                    inputProps={{ "data-module": "deal" }}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 1,
                }}
              >
                {lines.map(([k, v]) => (
                  <Fragment key={k}>
                    <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                      {k}
                    </Box>
                    <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                      {v}
                    </Box>
                  </Fragment>
                ))}
                <Box sx={{ px: 1.5, py: 1.25, fontWeight: 700 }}>KØBESUM (CarPal)</Box>
                <Box sx={{ px: 1.5, py: 1.25, fontWeight: 700 }}>{toMoney(total)}</Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
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
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="finans-heading">
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                  <Checkbox
                    id="Has_Trade_In"
                    name="Has_Trade_In"
                    checked={hasTrade}
                    onChange={(e) => onDealFormChange("Has_Trade_In", e.target.checked)}
                    inputProps={{ "aria-label": "Tilføj byttebil" }}
                  />
              }
              label="Tilføj byttebil"
            />
            {hasTrade && (
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  id="Trade_in_Price"
                  name="Trade_in_Price"
                  label="Byttebilspris"
                  inputMode="decimal"
                  value={String(tiPrice)}
                  onChange={(e) => onDealFormChange("Trade_in_Price", e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ "data-module": "deal" }}
                />
                <TextField
                  id="Trade_in_Finance_Remaining"
                  name="Trade_in_Finance_Remaining"
                  label="Pant i byttebil"
                  inputMode="decimal"
                  value={String(tiDebt)}
                  onChange={(e) => onDealFormChange("Trade_in_Finance_Remaining", e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ "data-module": "deal" }}
                />
                <FormControl fullWidth size="small">
                  <InputLabel id="Trade_in_Usage_Type-label">Anvendelse</InputLabel>
                  <Select
                    labelId="Trade_in_Usage_Type-label"
                    id="Trade_in_Usage_Type"
                    name="Trade_in_Usage_Type"
                    value={tiUsage}
                    label="Anvendelse"
                    onChange={(e) => onDealFormChange("Trade_in_Usage_Type", e.target.value)}
                    inputProps={{ "data-module": "deal" }}
                  >
                    {TRADE_IN_USAGE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <FormControlLabel
              control={
                <Checkbox
                  id="Has_Financing"
                  name="Has_Financing"
                  checked={hasFin}
                  onChange={(e) => onDealFormChange("Has_Financing", e.target.checked)}
                  inputProps={{ "aria-label": "Tilføj finansiering" }}
                />
              }
              label="Tilføj finansiering"
            />
            {hasFin && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="Financing_Down_Payment_Amount"
                    name="Financing_Down_Payment_Amount"
                    label="Udbetaling (kr.)"
                    inputMode="decimal"
                    value={String(dpAmount)}
                    onChange={(e) => onDealFormChange("Financing_Down_Payment_Amount", e.target.value)}
                    fullWidth
                    size="small"
                    inputProps={{ "data-module": "deal" }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="Financing_Amount"
                    label="Lånebeløb (auto)"
                    value={toMoney(loan)}
                    fullWidth
                    size="small"
                    inputProps={{ "data-module": "deal" }}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 1,
          }}
        >
          <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
            Salgspris
          </Box>
          <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
            {toMoney(salesPrice)}
          </Box>
          {extraSum > 0 && (
            <>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                + Extras (Ekstra salg)
              </Box>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                {toMoney(extraSum)}
              </Box>
            </>
          )}
          {hasTrade && (
            <>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                Byttebilspris
              </Box>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                {toMoney(tiPrice)}
              </Box>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                Pant i byttebil
              </Box>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                -{toMoney(tiDebt)}
              </Box>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                Byttebil netto
              </Box>
              <Box sx={{ borderBottom: "1px dashed", borderColor: "divider", px: 1.5, py: 1.25 }}>
                {toMoney(tradeValue)}
              </Box>
            </>
          )}
          <Box sx={{ px: 1.5, py: 1.25 }}>—</Box>
          <Box sx={{ px: 1.5, py: 1.25 }} />
          <Box sx={{ px: 1.5, py: 1.25, fontWeight: 700 }}>Kontant betaling nu</Box>
          <Box sx={{ px: 1.5, py: 1.25, fontWeight: 700 }}>{toMoney(cashNow)}</Box>
          {loan > 0 && (
            <>
              <Box sx={{ px: 1.5, py: 1.25, fontWeight: 700 }}>Lånebeløb</Box>
              <Box sx={{ px: 1.5, py: 1.25, fontWeight: 700 }}>{toMoney(loan)}</Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
