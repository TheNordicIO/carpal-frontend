"use client"

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"
import { Box } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"

const contractsTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00AF12",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f6f7f9",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
})

export function ContractsThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppRouterCacheProvider options={{ key: "contracts-mui" }}>
      <ThemeProvider theme={contractsTheme}>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          {children}
        </Box>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
