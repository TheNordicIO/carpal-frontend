"use client"

import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

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
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="forside-heading">
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <TextField
            id="open_deal_value"
            type="text"
            placeholder="Deal-ID eller Deal Number"
            value={openDealValue}
            onChange={(e) => onOpenDealValueChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onOpenDeal()}
            size="small"
            sx={{ maxWidth: 240 }}
            inputProps={{ "aria-label": "Deal-ID eller Deal Number" }}
          />
          <Button type="button" variant="outlined" onClick={onOpenDeal}>
            Åbn
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Indtast Zoho Deal-ID (eller Deal Number). Når dealen er åbnet, skjules denne forside.
        </Typography>
        {openDealError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {openDealError}
          </Alert>
        )}
      </Paper>
    </Box>
  )
}
