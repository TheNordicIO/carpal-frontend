"use client"

import { useEffect, useRef, useState } from "react"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import {
  getAttachmentUrl,
  getAttachmentViewUrl,
  getScreenshotStatus,
  getScreenshotUrl,
  getScreenshotUrlByIndex,
  getTermsUrl,
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
  const termsUrl = getTermsUrl()

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
    <Box component="section" sx={{ p: 2.5 }} aria-labelledby="vedh-heading">
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, minHeight: 500 }}>
        {termsUrl && (
          <>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Vilkår og betingelser
            </Typography>
            <iframe
              src={termsUrl}
              title="Vilkår og betingelser"
              style={{
                width: "100%",
                minHeight: 400,
                height: "50vh",
                border: "1px solid",
                borderColor: "var(--mui-palette-divider)",
                borderRadius: 8,
                marginBottom: 16,
              }}
            />
            <Divider sx={{ my: 2 }} />
          </>
        )}

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
          Screenshot / forhåndsvisning
        </Typography>
        {!recordId ? (
          <Typography variant="body2" color="text.secondary">
            Åbn en deal for at hente screenshot.
          </Typography>
        ) : screenshotState === "pending" ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" role="status">
              Venter på screenshot… (opdateres hvert 5. sekund)
            </Typography>
          </Box>
        ) : screenshotState === "failed" ? (
          <Alert severity="error" role="alert">
            {screenshotError}
          </Alert>
        ) : screenshotState === "ready" && screenshotUrl ? (
          <iframe
            src={screenshotUrl}
            title="Kontrakt screenshot"
            style={{
              width: "100%",
              minHeight: 400,
              height: "50vh",
              border: "1px solid",
              borderColor: "var(--mui-palette-divider)",
              borderRadius: 8,
              marginBottom: 16,
            }}
          />
        ) : null}

        {indexedScreenshotIndices.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {indexedScreenshotIndices.map((index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fil {index + 1}
                  </Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onDeleteAttachment?.(getScreenshotUrlByIndex(recordId, index))}
                    aria-label={`Slet screenshot index ${index}`}
                  >
                    Slet
                  </Button>
                </Box>
                <iframe
                  src={getScreenshotUrlByIndex(recordId, index)}
                  title={`Screenshot index ${index}`}
                  style={{
                    width: "100%",
                    minHeight: 400,
                    height: "50vh",
                    border: "1px solid",
                    borderColor: "var(--mui-palette-divider)",
                    borderRadius: 8,
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {uploadedAttachments.filter((a) => isIndexedUploadUrl(a.url ?? a.view_url, recordId)).length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              Uploadede filer (forhåndsvisning)
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {uploadedAttachments
                .filter((a) => isIndexedUploadUrl(a.url ?? a.view_url, recordId))
                .map((a, i) => {
                  const embedUrl = a.view_url || (a.url ? getAttachmentViewUrl(a.url) : "")
                  const name = fileName(a)
                  const fileUrl = a.url ?? a.view_url ?? ""
                  if (!embedUrl) return null
                  return (
                    <Box key={i}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {name}
                        </Typography>
                        {onDeleteAttachment && fileUrl && (
                          <Button
                            type="button"
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => onDeleteAttachment(fileUrl)}
                            aria-label={`Slet ${name}`}
                          >
                            Slet
                          </Button>
                        )}
                      </Box>
                      <iframe
                        src={getAttachmentUrl(embedUrl)}
                        title={name}
                        style={{
                          width: "100%",
                          minHeight: 400,
                          height: "50vh",
                          border: "1px solid",
                          borderColor: "var(--mui-palette-divider)",
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  )
                })}
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
          Filer fra dealen
        </Typography>
        {allFiles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Ingen vedhæftede fundet.
          </Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {allFiles.map((f, i) => {
              const name = fileName(f)
              const url = f.view_url ?? f.preview_url ?? ""
              return (
                <Box component="li" key={i}>
                  {url ? (
                    <Typography
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      color="primary"
                      sx={{ textDecoration: "underline", "&:hover": { textDecoration: "none" } }}
                    >
                      • {name}
                    </Typography>
                  ) : (
                    <Typography variant="body2">• {name}</Typography>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_TYPES}
            multiple
            hidden
            onChange={handleFileChange}
            disabled={!recordId || isUploading}
            aria-label="Tilføj fil"
          />
          <Button
            type="button"
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            disabled={!recordId || isUploading}
            startIcon={isUploading ? <CircularProgress size={16} /> : undefined}
          >
            {isUploading ? "Uploader…" : "Tilføj fil"}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
