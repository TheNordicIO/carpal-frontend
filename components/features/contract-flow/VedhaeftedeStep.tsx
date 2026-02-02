"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  getAttachmentViewUrl,
  getScreenshotStatus,
  getScreenshotUrl,
  getScreenshotUrlByIndex,
} from "@/lib/api/contracts"
import type { ContractAttachment, ContractType } from "@/types/contracts"

const ACCEPT_TYPES = ".pdf,.jpg,.jpeg,.png,.doc,.docx"
const POLL_INTERVAL_MS = 5000

type ScreenshotState = "idle" | "pending" | "ready" | "failed"

/** URL matches record_id-index.pdf so we only show indexed uploads */
function isIndexedUploadUrl(url: string | undefined, recordId: string): boolean {
  if (!url || !recordId) return false
  const re = new RegExp(`^.*${recordId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+\\.pdf$`, "i")
  return re.test(url.replace(/^\//, ""))
}

interface VedhaeftedeStepProps {
  dealFiles: ContractAttachment[]
  uploadedAttachments: ContractAttachment[]
  recordId: string
  contractType: ContractType
  indexedScreenshotIndices: number[]
  onUpload: (file: File) => Promise<void>
  onDeleteAttachment?: (url: string) => Promise<void>
  isUploading?: boolean
}

function fileName(a: ContractAttachment): string {
  return (
    a.file_name ??
    a.File_Name__s ??
    (a as { name?: string }).name ??
    "Ukendt fil"
  )
}

export function VedhaeftedeStep({
  dealFiles,
  uploadedAttachments,
  recordId,
  contractType,
  indexedScreenshotIndices,
  onUpload,
  onDeleteAttachment,
  isUploading = false,
}: VedhaeftedeStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [screenshotState, setScreenshotState] = useState<ScreenshotState>("idle")
  const [screenshotError, setScreenshotError] = useState<string>("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const allFiles = [...dealFiles, ...uploadedAttachments]
  const screenshotUrl = screenshotState === "ready" && recordId ? getScreenshotUrl(recordId) : null
  const termsUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_PUBLIC_BASE_URL}/terms.pdf`
    : ""

  console.log("termsUrl", termsUrl)
  console.log("Process.env.NEXT_PUBLIC_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_PUBLIC_BASE_URL)

  useEffect(() => {
    if (!recordId) {
      const tid = setTimeout(() => {
        setScreenshotState("idle")
        setScreenshotError("")
      }, 0)
      return () => clearTimeout(tid)
    }

    const tid = setTimeout(() => {
      setScreenshotState("pending")
      setScreenshotError("")
    }, 0)

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const poll = async () => {
      try {
        const result = await getScreenshotStatus(recordId)
        if (result.type === "json") {
          if (result.status === "pending") {
            setScreenshotState("pending")
            return
          }
          if (result.status === "failed") {
            stopPolling()
            setScreenshotState("failed")
            setScreenshotError("Screenshot mislykkedes.")
            return
          }
          stopPolling()
          setScreenshotState("ready")
          return
        }
        if (result.type === "pdf") {
          stopPolling()
          setScreenshotState("ready")
          return
        }
        stopPolling()
        setScreenshotState("failed")
        setScreenshotError(result.message)
      } catch (e) {
        stopPolling()
        setScreenshotState("failed")
        setScreenshotError(e instanceof Error ? e.message : "Fejl ved hentning")
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
  }, [recordId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (!files?.length || !recordId) return
    for (let i = 0; i < files.length; i++) {
      await onUpload(files[i]!)
    }
    e.target.value = ""
  }

  return (
    <section className="p-[18px]" aria-labelledby="vedh-heading">
      <Card>
        <CardContent className="pt-4 min-h-[500px]">
          {/* 1. Terms PDF – always shown */}
          {termsUrl && (
            <>
              <h4 className="mb-2 font-semibold">Vilkår og betingelser</h4>
              <iframe
                src={termsUrl}
                title="Vilkår og betingelser"
                className="mb-4 w-full min-h-[400px] h-[50vh] rounded-md border border-border bg-muted"
              />
              <Separator className="my-4" />
            </>
          )}

          {/* 2. Screenshot – loading / error / PDF */}
          <h4 className="mb-2 font-semibold">Screenshot / forhåndsvisning</h4>
          {!recordId ? (
            <p className="text-sm text-muted-foreground">
              Åbn en deal for at hente screenshot.
            </p>
          ) : screenshotState === "pending" ? (
            <p className="text-sm text-muted-foreground" role="status">
              Venter på screenshot… (opdateres hvert 5. sekund)
            </p>
          ) : screenshotState === "failed" ? (
            <p className="text-sm text-destructive" role="alert">
              {screenshotError}
            </p>
          ) : screenshotState === "ready" && screenshotUrl ? (
            <iframe
              src={screenshotUrl}
              title="Kontrakt screenshot"
              className="mb-4 w-full min-h-[400px] h-[50vh] rounded-md border border-border bg-muted"
            />
          ) : null}

          {/* Indexed screenshot/files (0..10) – only show indices that exist */}
          {indexedScreenshotIndices.length > 0 && (
            <div className="space-y-4">
              {indexedScreenshotIndices.map((index) => (
                <div key={index}>

                  <div className="flex justify-between">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Fil {index + 1}
                  </p>

                  <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteAttachment?.(getScreenshotUrlByIndex(recordId, index))}
                      aria-label={`Slet screenshot index ${index}`}
                    >
                      Slet
                    </Button>
                  </div>
                  <div>
                    
                    <iframe
                      src={getScreenshotUrlByIndex(recordId, index)}
                      title={`Screenshot index ${index}`}
                      className="mb-4 w-full min-h-[400px] h-[50vh] rounded-md border border-border bg-muted"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded PDFs – only show url like record_id-index.pdf; embed + delete */}
          {uploadedAttachments.filter((a) => isIndexedUploadUrl(a.url ?? a.view_url, recordId)).length > 0 && (
            <>
              <Separator className="my-4" />
              <h4 className="mb-2 font-semibold">Uploadede filer (forhåndsvisning)</h4>
              <div className="space-y-4">
                {uploadedAttachments
                  .filter((a) => isIndexedUploadUrl(a.url ?? a.view_url, recordId))
                  .map((a, i) => {
                    const embedUrl = a.view_url || (a.url ? getAttachmentViewUrl(a.url) : "")
                    const name = fileName(a)
                    const fileUrl = a.url ?? a.view_url ?? ""
                    if (!embedUrl) return null
                    return (
                      <div key={i} className="relative">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{name}</p>
                          {onDeleteAttachment && fileUrl && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => onDeleteAttachment(fileUrl)}
                              aria-label={`Slet ${name}`}
                            >
                              Slet
                            </Button>
                          )}
                        </div>
                        <iframe
                          src={`${process.env.NEXT_PUBLIC_PUBLIC_BASE_URL}/${embedUrl}`}
                          title={name}
                          className="w-full min-h-[400px] h-[50vh] rounded-md border border-border bg-muted"
                        />
                      </div>
                    )
                  })}
              </div>
            </>
          )}

          <Separator className="my-4" />

          {/* 3. Filer fra dealen + upload */}
          <h4 className="mb-2 font-semibold">Filer fra dealen</h4>
          {allFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen vedhæftede fundet.</p>
          ) : (
            <ul className="space-y-2">
              {allFiles.map((f, i) => {
                const name = fileName(f)
                const url = f.view_url ?? f.preview_url ?? ""
                return (
                  <li key={i}>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        • {name}
                      </a>
                    ) : (
                      <span>• {name}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          <div className="mt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_TYPES}
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={!recordId || isUploading}
              aria-label="Tilføj fil"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!recordId || isUploading}
            >
              {isUploading ? "Uploader…" : "Tilføj fil"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
