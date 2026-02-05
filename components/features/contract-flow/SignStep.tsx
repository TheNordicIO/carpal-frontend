"use client"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import type { ContractType } from "@/types/contracts"

function getSignStepFieldIds(contractType: ContractType) {
  return {
    payDate:
      contractType === "purchase_agreement"
        ? "Purchase_Agreement_Payment_Date"
        : "Sales_Agreement_Payment_Date",
    payText:
      contractType === "purchase_agreement"
        ? "Purchase_Agreement_Payment_Text"
        : "Sales_Agreement_Payment_Text",
    extraMsg:
      contractType === "purchase_agreement"
        ? "Purchase_Agreement_Extra_Contract_Message"
        : "Sales_Agreement_Extra_Contract_Message",
  }
}

interface SignStepProps {
  contractType: ContractType
  dealForm: Record<string, unknown>
  onDealFormChange: (field: string, value: unknown) => void
  emailMessage: string
  onEmailMessageChange: (v: string) => void
  privateMessage: string
  onPrivateMessageChange: (v: string) => void
  onSend: () => void
  sendLoader: boolean
  sendStatus: string
}

export function SignStep({
  contractType,
  dealForm,
  onDealFormChange,
  emailMessage,
  onEmailMessageChange,
  privateMessage,
  onPrivateMessageChange,
  onSend,
  sendLoader,
  sendStatus,
}: SignStepProps) {
  const ids = getSignStepFieldIds(contractType)
  const paymentDate = String(dealForm[ids.payDate] ?? "")
  const paymentText = String(dealForm[ids.payText] ?? "")
  const extraMsg = String(dealForm[ids.extraMsg] ?? "")

  return (
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="sign-heading">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <TextField
              id="email_message"
              name="email_message"
              label="Email-besked til modtager(e)"
              placeholder="Besked der sendes sammen med signeringsanmodningen"
              value={emailMessage}
              onChange={(e) => onEmailMessageChange(e.target.value)}
              fullWidth
              multiline
              rows={4}
              size="small"
              sx={{ mb: 2 }}
              inputProps={{ "aria-label": "Email-besked til modtager" }}
            />
            <TextField
              id="private_message"
              name="private_message"
              label="Email-besked (privat)"
              value={privateMessage}
              onChange={(e) => onPrivateMessageChange(e.target.value)}
              fullWidth
              multiline
              rows={4}
              size="small"
              sx={{ mb: 2 }}
              inputProps={{ "aria-label": "Email-besked privat" }}
            />
            <TextField
              id={ids.payDate}
              name={ids.payDate}
              label="Betalingsdato"
              type="date"
              value={paymentDate}
              onChange={(e) => onDealFormChange(ids.payDate, e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              inputProps={{ "data-module": "deal", "aria-label": "Betalingsdato" }}
            />
            <TextField
              id={ids.payText}
              name={ids.payText}
              label="Betalingsinfo"
              value={paymentText}
              onChange={(e) => onDealFormChange(ids.payText, e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
              sx={{ mb: 2 }}
              inputProps={{ "data-module": "deal", "aria-label": "Betalingsinfo" }}
            />
            <TextField
              id={ids.extraMsg}
              name={ids.extraMsg}
              label="Særlige vilkår"
              value={extraMsg}
              onChange={(e) => onDealFormChange(ids.extraMsg, e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
              inputProps={{ "data-module": "deal", "aria-label": "Særlige vilkår" }}
            />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Handlinger
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Systemet gemmer ændringer (edited fields), opdaterer Deal/Car, opdaterer Deal Invoice
              (extras) og sender via Zoho Sign.
            </Typography>
            <Button
              type="button"
              variant="contained"
              onClick={onSend}
              disabled={sendLoader}
              aria-busy={sendLoader}
            >
              {sendLoader ? "Sender…" : "✅ Send til signering"}
            </Button>
            {sendLoader && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} role="status">
                Sender…
              </Typography>
            )}
            {sendStatus && sendStatus.startsWith("Fejl") && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 1.5 }}
                role="alert"
              >
                {sendStatus}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
