"use client"

import { useState, useCallback } from "react"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { checkPlate } from "@/lib/api/plate-check"
import type { PlateCheckResponse } from "@/types/plate-check"

type PlateData = PlateCheckResponse | null
type StatusMessage = { kind: "success" | "destructive" | "info"; msg: string } | null

export default function PlateCheckPage() {
  const [plate, setPlate] = useState("")
  const [loading, setLoading] = useState(false)
  const [plateData, setPlateData] = useState<PlateData>(null)
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

  const handleLookup = useCallback(async () => {
    const plateValue = plate.trim()
    if (!plateValue) {
      showStatus("destructive", "Indtast venligst en nummerplade")
      return
    }

    setLoading(true)
    setPlateData(null)
    clearStatus()

    try {
      const data = await checkPlate(plateValue)
      setPlateData(data)
      showStatus("success", "Nummerplade data hentet succesfuldt")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Ukendt fejl"
      showStatus("destructive", `Fejl: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [plate, showStatus, clearStatus])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !loading) {
        handleLookup()
      }
    },
    [handleLookup, loading]
  )

  return (
    <div className="container mx-auto flex min-h-screen flex-col bg-muted/30 px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bilinfo Nummerplade Opslag</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indtast en nummerplade for at hente bil data fra Bilinfo
        </p>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Indtast nummerplade (f.eks. AB12345)"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleLookup} disabled={loading || !plate.trim()}>
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Search className="mr-2 size-4" />
              )}
              Slå op
            </Button>
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

      {plateData && (
        <div className="grid grid-cols-1 gap-4">
          <JsonCard
            title="Bil Data (komplet)"
            data={plateData}
          />
          {plateData.vehicleDetails && (
            <JsonCard
              title="Vehicle Details"
              data={plateData.vehicleDetails}
            />
          )}
        </div>
      )}

      {!plateData && !loading && (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Indtast en nummerplade og klik på &quot;Slå op&quot; for at starte.</p>
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
    <Card className={`shadow-sm ${className || ""}`}>
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
