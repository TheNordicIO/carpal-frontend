"use client"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Select from "@mui/material/Select"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
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
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="extras-heading">
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel id="external_product_select-label">
                Tilføj garanti/produkt (Products: Category=External)
              </InputLabel>
              <Select
                labelId="external_product_select-label"
                id="external_product_select"
                value={selectedExternalId || ""}
                label="Tilføj garanti/produkt (Products: Category=External)"
                onChange={(e) => onSelectedExternalIdChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Vælg produkt…</em>
                </MenuItem>
                {externalProducts.map((p) => {
                  const pid = p.id ?? ""
                  const pn = p.Product_Name ?? ""
                  const pr = Number(p.Unit_Price ?? 0)
                  return (
                    <MenuItem key={pid} value={pid}>
                      {String(pn)} ({toMoney(pr)})
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Button type="button" variant="outlined" onClick={handleAddExternal}>
                Tilføj valgt
              </Button>
              <Typography variant="caption" color="text.secondary">
                Tilføjes også i Deal Invoice (subform) ved afsendelse.
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Tilføj valgfrit produkt
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start" }}>
              <TextField
                placeholder="Produktnavn"
                value={customProdName}
                onChange={(e) => onCustomProdNameChange(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 140 }}
                inputProps={{ "aria-label": "Produktnavn" }}
              />
              <TextField
                placeholder="Pris (kr.)"
                inputMode="decimal"
                value={customProdPrice}
                onChange={(e) => onCustomProdPriceChange(e.target.value)}
                size="small"
                sx={{ width: 120 }}
                inputProps={{ "aria-label": "Pris" }}
              />
            </Box>
            <Button
              type="button"
              variant="outlined"
              onClick={handleAddCustom}
              sx={{ mt: 1.5 }}
            >
              Tilføj eget produkt
            </Button>
          </Box>
        </Box>
      </Paper>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mt: 2 }}>
        <ExtrasTable
          extras={extras}
          contractType={contractType}
          onUpdatePrice={handleUpdatePrice}
          onRemove={handleRemove}
        />
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
          • <strong>Purchase Agreement</strong>: <strong>Success Fee</strong> medregnes altid.
          Øvrige extras medregnes ikke i purchase-beregningen.
          <br />• <strong>Sales Agreement</strong>: Alle extras herfra medregnes i
          salgsberegningen.
        </Typography>
      </Paper>
    </Box>
  )
}
