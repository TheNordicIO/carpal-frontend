"use client"

import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { fullName } from "@/lib/utils"
import type { ContactData, ContractType } from "@/types/contracts"

interface KundeStepProps {
  contact1: ContactData | null
  contact2: ContactData | null
  contractType: ContractType
}

export function KundeStep({ contact1, contact2, contractType }: KundeStepProps) {
  const title = contractType === "sales_agreement" ? "Køber(e)" : "Sælger(e)"
  const c1 = contact1
  const c2 = contact2

  return (
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="kunde-heading">
      <Grid container spacing={2}>
        <Grid size={12}>
          <Paper elevation={0} sx={{ py: 1.5, px: 2, borderRadius: 2 }}>
            <Typography fontWeight={600}>{title}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="kunde-navn"
            label="Navn"
            value={fullName(c1)}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            id="kunde-tel"
            label="Telefon"
            value={(c1?.Phone ?? c1?.Mobile) ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            id="kunde-email"
            label="Email"
            value={c1?.Email ?? ""}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="kunde-adresse"
            label="Adresse"
            value={(c1?.Mailing_Street ?? c1?.Address ?? "") as string}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            id="kunde-zip"
            label="Postnr."
            value={(c1?.Mailing_Zip ?? c1?.Zip_Code ?? "") as string}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            id="kunde-by"
            label="By"
            value={(c1?.Mailing_City ?? c1?.City ?? "") as string}
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        {c2 && (
          <>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="kunde-navn2"
                label="Navn (2)"
                value={fullName(c2)}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                id="kunde-tel2"
                label="Telefon (2)"
                value={(c2.Phone ?? c2.Mobile) ?? ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                id="kunde-email2"
                label="Email (2)"
                value={c2.Email ?? ""}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}
