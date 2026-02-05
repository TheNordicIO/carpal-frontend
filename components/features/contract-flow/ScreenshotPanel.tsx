"use client"

import { useEffect, useRef, useState } from "react"
import Alert from "@mui/material/Alert"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { getScreenshotStatus, getScreenshotUrl } from "@/lib/api/contracts"

const POLL_INTERVAL_MS = 5000

type ScreenshotState = "idle" | "pending" | "ready" | "failed"

interface ScreenshotPanelProps {
  dealId: string
}

export function ScreenshotPanel({ dealId }: ScreenshotPanelProps) {
  const [state, setState] = useState<ScreenshotState>("pending")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const iframeUrl = state === "ready" ? getScreenshotUrl(dealId) : null
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!dealId) return

    const tid = setTimeout(() => {
      setState("pending")
      setErrorMessage("")
    }, 0)

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const poll = async () => {
      try {
        const result = await getScreenshotStatus(dealId)
        if (result.type === "json") {
          if (result.status === "pending") {
            setState("pending")
            return
          }
          if (result.status === "failed") {
            stopPolling()
            setState("failed")
            setErrorMessage("Screenshot mislykkedes.")
            return
          }
          stopPolling()
          setState("ready")
          return
        }
        if (result.type === "pdf") {
          stopPolling()
          setState("ready")
          return
        }
        stopPolling()
        setState("failed")
        setErrorMessage(result.message)
      } catch (e) {
        stopPolling()
        setState("failed")
        setErrorMessage(e instanceof Error ? e.message : "Fejl ved hentning")
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      clearTimeout(tid)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [dealId])

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Screenshot / forhåndsvisning
      </Typography>
      {state === "pending" && (
        <Typography variant="body2" color="text.secondary" role="status">
          Venter på screenshot… (opdateres hvert 5. sekund)
        </Typography>
      )}
      {state === "failed" && (
        <Alert severity="error" role="alert">
          {errorMessage}
        </Alert>
      )}
      {state === "ready" && iframeUrl && (
        <iframe
          src={iframeUrl}
          title="Kontrakt screenshot"
          style={{
            height: 600,
            width: "100%",
            minHeight: 400,
            border: "1px solid",
            borderColor: "var(--mui-palette-divider)",
            borderRadius: 8,
          }}
        />
      )}
    </Paper>
  )
}
