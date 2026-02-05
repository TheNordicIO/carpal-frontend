"use client"

import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
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
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="bil-heading">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="bil-maerke"
            label="Mærke"
            value={car.Make ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="bil-model"
            label="Model"
            value={car.Model ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            id="bil-variant"
            label="Variant"
            value={car.Variant ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="bil-drivmiddel"
            label="Drivmiddel"
            value={car.FuelType ?? car.Fuel ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="bil-modelaar"
            label="Modelår"
            value={String(car.Model_Year ?? car.ModelYear ?? "")}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="bil-1reg"
            label="1. reg."
            value={car.First_registration ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="bil-farve"
            label="Farve"
            value={colorName}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id="bil-vin"
            label="Stelnr. (VIN)"
            value={car.VIN ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id="bil-regnr"
            label="Reg.nr."
            value={car.Registration ?? car.Licenseplate ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id="bil-km"
            label="Kilometer"
            value={String(car.Mileage ?? "")}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={12}>
          <Box sx={{ height: 1, bgcolor: "divider", my: 0 }} aria-hidden />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id="Sales_Price"
            name="Sales_Price"
            label="Bilens pris (Sales_Price)"
            inputMode="decimal"
            value={String(salesPrice)}
            onChange={(e) => onDealFormChange("Sales_Price", e.target.value)}
            fullWidth
            size="small"
            inputProps={{ "data-module": "deal", "aria-label": "Bilens pris" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id="Deliverytime"
            name="Deliverytime"
            label="Leveringsdato (Deliverytime)"
            type="date"
            value={deliveryTime}
            onChange={(e) => onDealFormChange("Deliverytime", e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            inputProps={{ "data-module": "deal", "aria-label": "Leveringsdato" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            id={handoverField}
            name={handoverField}
            label="Overleveringstekst"
            value={handoverText}
            onChange={(e) => onDealFormChange(handoverField, e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={3}
            inputProps={{ "data-module": "deal", "aria-label": "Overleveringstekst" }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
