"use client"

import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

export function SuccessStep() {
  return (
    <Box
      component="section"
      sx={{
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(50vh - 100px)",
      }}
      aria-labelledby="success-heading"
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: "success.light",
          color: "success.dark",
        }}
      >
        <Box sx={{ fontSize: 48, mb: 2 }} aria-hidden>
          ✅
        </Box>
        <Typography id="success-heading" variant="h5" fontWeight={600} sx={{ mb: 1 }}>
          Kontrakt sendt
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 360 }}>
          Du kan lukke denne side. Flow gennemført og lykkedes.
        </Typography>
      </Paper>
    </Box>
  )
}
