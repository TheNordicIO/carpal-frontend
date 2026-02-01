"use client"

import { useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchListings, runCheck, syncOne, syncAll } from "@/lib/api/bilinfo"
import type {
  BilinfoListingRow,
  BilinfoCheckResult,
  BilinfoCheckChecks,
} from "@/types/bilinfo"
import { cn } from "@/lib/utils"

const DEALER_ID = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_BILINFO_DEALER_ID ?? "—") : "—"

type SortKey = "Internal" | "EdbNumber" | "Title" | "Vin" | "Price" | "Mileage"
type SortDir = "asc" | "desc"

function formatNumber(n: number): string {
  return n ? new Intl.NumberFormat("da-DK").format(n) : ""
}

function CheckPill({
  label,
  ok,
}: {
  label: string
  ok: boolean | null
}) {
  // const variant = ok === true ? "success" : ok === false ? "destructive" : "secondary"
  const suffix = ok === true ? " ✓" : ok === false ? " ✗" : ""
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        ok === true && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        ok === false && "border-destructive/30 bg-destructive/10 text-destructive",
        ok === null && "border-border bg-muted text-muted-foreground"
      )}
    >
      {label}
      {suffix}
    </span>
  )
}

function ChecksCell({
  row,
  result,
  loading,
}: {
  row: BilinfoListingRow
  result: BilinfoCheckResult | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <CheckPill label="Tjekker" ok={null} />
      </div>
    )
  }
  if (!result) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <CheckPill label="…" ok={null} />
      </div>
    )
  }
  if (!result.found) {
    return <CheckPill label="Ingen Zoho deal" ok={false} />
  }
  const defaultChecks: BilinfoCheckChecks = {
    stageNotSoldOk: false,
    internalOk: false,
    bilinfoStatusOk: false,
    priceOk: false,
    mileageOk: false,
    variantOk: false,
    equipmentOk: false,
  }
  const c: BilinfoCheckChecks = result.checks ?? defaultChecks
  const items: { label: string; ok: boolean }[] = []
  if (row.Internal) {
    items.push({ label: "Intern ↔ Temp. Inactive", ok: c.internalOk })
  } else {
    items.push({ label: "Ikke solgt/wholesale/inactive", ok: c.stageNotSoldOk })
  }
  items.push({ label: "Bilinfo_Status", ok: c.bilinfoStatusOk })
  items.push({ label: "Price", ok: c.priceOk })
  items.push({ label: "Mileage", ok: c.mileageOk })
  items.push({ label: "Variant", ok: c.variantOk })
  items.push({ label: "Equipment", ok: c.equipmentOk })

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <CheckPill key={item.label} label={item.label} ok={item.ok} />
      ))}
    </div>
  )
}

export default function BilinfoDashboardPage() {
  const [rows, setRows] = useState<BilinfoListingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [checkState, setCheckState] = useState<Record<string, { result: BilinfoCheckResult | null; loading: boolean }>>({})
  const [alerts, setAlerts] = useState<{ id: number; kind: "success" | "destructive"; msg: string }[]>([])
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "Title", dir: "asc" })

  const addAlert = useCallback((kind: "success" | "destructive", msg: string) => {
    const id = Date.now()
    setAlerts((a) => [{ id, kind, msg }, ...a])
    setTimeout(() => {
      setAlerts((a) => a.filter((x) => x.id !== id))
    }, 6000)
  }, [])

  const loadListings = useCallback(async () => {
    setLoading(true)
    setRows([])
    setCheckState({})
    try {
      const data = await fetchListings()
      if (data.status !== "ok" || !data.rows) {
        throw new Error(data.message ?? "Fejl")
      }
      setRows(data.rows)
      // Queue checks in batches
      const BATCH = 5
      for (let i = 0; i < data.rows.length; i += BATCH) {
        const slice = data.rows.slice(i, i + BATCH)
        for (const r of slice) {
          setCheckState((s) => ({ ...s, [r.Vin]: { result: null, loading: true } }))
        }
        await Promise.all(
          slice.map(async (r) => {
            const result = await runCheck(r)
            setCheckState((s) => ({ ...s, [r.Vin]: { result, loading: false } }))
          })
        )
        if (i + BATCH < data.rows.length) {
          await new Promise((r) => setTimeout(r, 250))
        }
      }
    } catch (e) {
      addAlert("destructive", `Fejl: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }, [addAlert])

  const handleSyncOne = useCallback(
    async (vin: string) => {
      try {
        const data = await syncOne(vin)
        if (data.status !== "ok") throw new Error(data.message ?? "Sync-fejl")
        addAlert("success", `Sync OK for VIN ${vin}`)
      } catch (e) {
        addAlert("destructive", `Sync FEJL: ${e instanceof Error ? e.message : String(e)}`)
      }
    },
    [addAlert]
  )

  const handleSyncAll = useCallback(async () => {
    const vins = rows.map((r) => r.Vin).filter(Boolean)
    if (!vins.length) return
    if (!confirm("Køre Sync på ALLE viste biler?")) return
    try {
      const data = await syncAll(vins)
      if (data.status !== "ok") throw new Error(data.message ?? "Bulk-fejl")
      addAlert("success", `Sync alle færdig – OK: ${data.ok ?? 0}, Fejl: ${data.errors ?? 0}`)
    } catch (e) {
      addAlert("destructive", `Bulk FEJL: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [rows, addAlert])

  const handleSort = useCallback((key: SortKey) => {
    setSort((prev) => {
      const dir = prev.key === key && prev.dir === "asc" ? "desc" : "asc"
      return { key, dir }
    })
  }, [])

  const sortedRows = [...rows].sort((a, b) => {
    const k = sort.key
    const dir = sort.dir === "asc" ? 1 : -1
    const A: unknown = a[k as keyof BilinfoListingRow]
    const B: unknown = b[k as keyof BilinfoListingRow]
    if (k === "Title" || k === "Vin" || k === "EdbNumber") {
      return dir * String(A ?? "").localeCompare(String(B ?? ""), "da")
    }
    if (k === "Internal") {
      return dir * (A === B ? 0 : (A as boolean) ? 1 : -1)
    }
    if (k === "Price" || k === "Mileage") {
      return dir * ((A as number) - (B as number))
    }
    return dir * String(A ?? "").localeCompare(String(B ?? ""), "da")
  })

  return (
    <div className="container-fluid flex min-h-screen flex-col bg-muted/30 px-4 py-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          Bilinfo Dashboard{" "}
          <span className="ml-2 rounded bg-muted px-2 py-0.5 text-sm font-normal text-muted-foreground">
            {rows.length}
          </span>
        </h1>
        <small className="text-muted-foreground">
          Dealer: <code className="rounded bg-muted px-1.5 py-0.5 text-red-500">{DEALER_ID}</code>
        </small>
      </div>

      <Card className="mb-4 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          <Button size="sm" onClick={loadListings} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : null}
            Hent Annoncer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncAll}
            disabled={rows.length === 0 || loading}
          >
            Sync alle (Zoho → Bilinfo)
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-col gap-2">
        {alerts.map((a) => (
          <Alert
            key={a.id}
            variant={a.kind === "destructive" ? "destructive" : "success"}
            className="max-w-2xl"
          >
            <AlertDescription>{a.msg}</AlertDescription>
          </Alert>
        ))}
      </div>

      <Card className="shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="cursor-pointer select-none font-medium hover:bg-muted/50"
                  onClick={() => handleSort("Internal")}
                >
                  Status{" "}
                  {sort.key === "Internal" && (sort.dir === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium hover:bg-muted/50"
                  onClick={() => handleSort("EdbNumber")}
                >
                  EdbNumber{" "}
                  {sort.key === "EdbNumber" && (sort.dir === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium hover:bg-muted/50"
                  onClick={() => handleSort("Title")}
                >
                  Titel{" "}
                  {sort.key === "Title" && (sort.dir === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium hover:bg-muted/50"
                  onClick={() => handleSort("Vin")}
                >
                  VIN{" "}
                  {sort.key === "Vin" && (sort.dir === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Price")}
                >
                  Pris{" "}
                  {sort.key === "Price" && (sort.dir === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none font-medium hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Mileage")}
                >
                  Kilometer{" "}
                  {sort.key === "Mileage" && (sort.dir === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="font-medium">Checks (Zoho ⇄ Listing)</TableHead>
                <TableHead className="w-28 font-medium">Handling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Tryk &quot;Hent Annoncer&quot; for at starte.
                  </TableCell>
                </TableRow>
              )}
              {loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Henter…
                  </TableCell>
                </TableRow>
              )}
              {sortedRows.map((r) => (
                <TableRow key={r.Vin} data-vin={r.Vin}>
                  <TableCell className="align-middle">
                    {r.Internal ? (
                      <Badge variant="destructive">Intern</Badge>
                    ) : (
                      <Badge variant="success">Ekstern</Badge>
                    )}
                  </TableCell>
                  <TableCell className="align-middle font-mono text-sm">
                    {r.EdbNumber || "—"}
                  </TableCell>
                  <TableCell className="align-middle text-sm">{r.Title || "—"}</TableCell>
                  <TableCell className="align-middle font-mono text-sm">{r.Vin || "—"}</TableCell>
                  <TableCell className="text-right align-middle text-sm">
                    {formatNumber(r.Price)}
                    {r.Price ? " kr." : ""}
                  </TableCell>
                  <TableCell className="text-right align-middle text-sm">
                    {formatNumber(r.Mileage)}
                  </TableCell>
                  <TableCell className="align-middle min-w-[200px]">
                    <ChecksCell
                      row={r}
                      result={checkState[r.Vin]?.result ?? null}
                      loading={checkState[r.Vin]?.loading ?? true}
                    />
                  </TableCell>
                  <TableCell className="align-middle">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!r.Vin}
                      onClick={() => handleSyncOne(r.Vin)}
                    >
                      Sync
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
