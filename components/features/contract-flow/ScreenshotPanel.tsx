"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
          // other statuses (e.g. 'ready') – treat as ready and show iframe
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
    <Card>
      <CardContent className="pt-4">
        <h4 className="mb-2 font-semibold">Screenshot / forhåndsvisning</h4>
        {state === "pending" && (
          <p className="text-sm text-muted-foreground" role="status">
            Venter på screenshot… (opdateres hvert 5. sekund)
          </p>
        )}
        {state === "failed" && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}
        {state === "ready" && iframeUrl && (
          <iframe
            src={iframeUrl}
            title="Kontrakt screenshot"
            className="h-[600px] w-full min-h-[400px] rounded border border-border bg-muted"
          />
        )}
      </CardContent>
    </Card>
  )
}
