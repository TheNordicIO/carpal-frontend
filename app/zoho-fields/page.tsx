"use client"

import { useState, useCallback, useEffect } from "react"
import { Loader2, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ZohoModule } from "@/types/zoho-fields"
import { fetchModules, downloadModuleFields } from "@/lib/api/zoho-fields"

// Modules to exclude from the list (same as PHP)
const EXCLUDED_MODULES = ["Analytics", "Portal_Users", "Attachments"]

export default function ZohoFieldsPage() {
  const [modules, setModules] = useState<ZohoModule[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<Record<string, boolean>>({})
  const [statusMessage, setStatusMessage] = useState<{
    kind: "success" | "destructive" | "info"
    msg: string
  } | null>(null)

  const showStatus = useCallback(
    (kind: "success" | "destructive" | "info", msg: string) => {
      setStatusMessage({ kind, msg })
      if (kind !== "info") {
        setTimeout(() => setStatusMessage(null), 6000)
      }
    },
    []
  )

  const loadModules = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchModules()
      // Filter and sort modules
      const filtered = data
        .filter(
          (module: ZohoModule) =>
            module.api_name &&
            !EXCLUDED_MODULES.includes(module.api_name)
        )
        .sort((a: ZohoModule, b: ZohoModule) =>
          (a.api_name || "").localeCompare(b.api_name || "")
        )
      setModules(filtered)
      if (filtered.length === 0) {
        showStatus("info", "Ingen moduler fundet i Zoho CRM.")
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Ukendt fejl"
      showStatus("destructive", `Fejl ved indlæsning af moduler: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [showStatus])

  useEffect(() => {
    loadModules()
  }, [loadModules])

  const clearStatus = useCallback(() => {
    setStatusMessage(null)
  }, [])

  const handleDownload = useCallback(
    async (moduleApiName: string) => {
      if (!moduleApiName) return

      setDownloading((prev) => ({ ...prev, [moduleApiName]: true }))
      clearStatus()

      try {
        const blob = await downloadModuleFields(moduleApiName)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `${moduleApiName}_fields.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        showStatus("success", `Download færdig: ${moduleApiName}_fields.txt`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Ukendt fejl"
        showStatus("destructive", `Fejl ved download: ${errorMsg}`)
      } finally {
        setDownloading((prev) => ({ ...prev, [moduleApiName]: false }))
      }
    },
    [showStatus, clearStatus]
  )

  return (
    <div className="container mx-auto flex min-h-screen flex-col bg-muted/30 px-4 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Zoho CRM Felt-eksport</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vælg et modul for at downloade en liste over dets felter (API-navne, type, m.m.).
        </p>
      </div>

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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Tilgængelige Moduler</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="mr-2 size-5 animate-spin" />
              <span className="text-muted-foreground">Henter moduler...</span>
            </div>
          ) : modules.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <AlertCircle className="mx-auto mb-2 size-8" />
              <p>Ingen moduler fundet.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {modules.map((module) => {
                const apiName = module.api_name || ""
                const pluralLabel = module.plural_label || "Ukendt Modul"
                const isDownloading = downloading[apiName] || false

                return (
                  <li
                    key={apiName}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{pluralLabel}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {apiName}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(apiName)}
                      disabled={isDownloading}
                      size="sm"
                      variant="outline"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Forbereder...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 size-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
