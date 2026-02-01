"use client"

import { useState, useCallback } from "react"
import { Loader2, Search, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchTicketPreview, enqueueTicket } from "@/lib/api/zoho-desk"
import type { TicketPreviewResponse } from "@/types/zoho-desk"
import { cn } from "@/lib/utils"

type PreviewData = TicketPreviewResponse | null
type StatusMessage = { kind: "success" | "destructive" | "info"; msg: string } | null

export default function ZohoDeskTicketPage() {
  const [ticketId, setTicketId] = useState("")
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData>(null)
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null)

  const clearStatus = useCallback(() => {
    setStatusMessage(null)
  }, [])

  const showStatus = useCallback((kind: "success" | "destructive" | "info", msg: string) => {
    setStatusMessage({ kind, msg })
    if (kind !== "info") {
      setTimeout(() => setStatusMessage(null), 6000)
    }
  }, [])

  const handlePreview = useCallback(async () => {
    const id = ticketId.trim()
    if (!id) {
      showStatus("destructive", "Indtast venligst et Ticket ID")
      return
    }

    setLoading(true)
    setPreviewData(null)
    clearStatus()

    try {
      const data = await fetchTicketPreview(id)
      setPreviewData(data)
      showStatus("success", "Preview hentet succesfuldt")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Ukendt fejl"
      showStatus("destructive", `Fejl: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [ticketId, showStatus, clearStatus])

  const handleEnqueue = useCallback(async () => {
    const id = ticketId.trim()
    if (!id) {
      showStatus("destructive", "Indtast venligst et Ticket ID")
      return
    }

    if (!confirm(`Er du sikker på, at du vil lægge ticket ${id} i kø?`)) {
      return
    }

    setLoading(true)
    clearStatus()

    try {
      const data = await enqueueTicket(id)
      if (data.status === "success") {
        showStatus("success", data.message)
        setPreviewData(null) // Clear preview when enqueued
      } else {
        showStatus("destructive", data.message || "Ukendt fejl")
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Ukendt fejl"
      showStatus("destructive", `Fejl: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [ticketId, showStatus, clearStatus])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !loading) {
        handlePreview()
      }
    },
    [handlePreview, loading]
  )

  return (
    <div className="container mx-auto flex min-h-screen flex-col bg-muted/30 px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Zoho Desk Opslag (AI Preview)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indtast et Ticket ID for at se preview eller lægge ticket i kø
        </p>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Indtast Ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handlePreview} disabled={loading || !ticketId.trim()}>
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Search className="mr-2 size-4" />
                )}
                Vis Preview
              </Button>
              <Button
                onClick={handleEnqueue}
                disabled={loading || !ticketId.trim()}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Play className="mr-2 size-4" />
                )}
                Læg i Kø
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {statusMessage && (
        <Alert
          variant={
            statusMessage.kind === "destructive"
              ? "destructive"
              : statusMessage.kind === "success"
                ? "success"
                : "default"
          }
          className="mb-4"
        >
          <AlertDescription>{statusMessage.msg}</AlertDescription>
        </Alert>
      )}

      {previewData && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <JsonCard title="AI → Extracted (råt AI svar)" data={previewData.ai_final_response} />
          <JsonCard title="AI → Validated (efter PHP)" data={previewData.final_lead_payload} />
          <JsonCard title="Deal Match" data={previewData.deal_match} />
          <JsonCard title="Deal Match Log" data={previewData.deal_match_log} />
          <JsonCard title="Lead Payload (Zoho)" data={previewData.final_lead_payload} />
          <JsonCard title="Email Payload" data={previewData.final_email_payload} />
          <JsonCard
            title="Zoho Ticket (kort)"
            data={{
              subject: previewData.zoho_ticket_data?.subject,
              from_name: previewData.zoho_ticket_data?.from_name,
              from_email: previewData.zoho_ticket_data?.from_email,
              received_at: previewData.zoho_ticket_data?.received_at,
              plain_preview:
                previewData.zoho_ticket_data?.plain?.slice(0, 1000) + "..." || "",
            }}
            className="lg:col-span-2"
          />
        </div>
      )}

      {!previewData && !loading && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Indtast et Ticket ID og klik på &quot;Vis Preview&quot; for at starte.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function JsonCard({
  title,
  data,
  className,
}: {
  title: string
  data: unknown
  className?: string
}) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <pre className="whitespace-pre-wrap break-words rounded-md bg-slate-950 p-4 text-xs text-slate-50">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}
