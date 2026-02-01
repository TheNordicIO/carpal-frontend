"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { parseMoney, toMoney } from "@/lib/utils"
import type { ContractType, ExtraItem } from "@/types/contracts"

function isSalesFee(name: string): boolean {
  const n = (name || "").toLowerCase()
  return n === "sales fee" || n === "success fee"
}

interface ExtrasTableProps {
  extras: ExtraItem[]
  contractType: ContractType
  onUpdatePrice: (index: number, price: number) => void
  onRemove: (index: number) => void
}

export function ExtrasTable({
  extras,
  contractType,
  onUpdatePrice,
  onRemove,
}: ExtrasTableProps) {
  const total = extras.reduce((sum, e) => sum + (Number(e.price) || 0), 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produktnavn</TableHead>
          <TableHead className="w-[160px]">Pris (kr.)</TableHead>
          <TableHead className="w-[80px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {extras.map((line, idx) => {
          const readonly =
            contractType === "purchase_agreement" && isSalesFee(line.name)
          return (
            <TableRow key={idx}>
              <TableCell>{line.name}</TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={toMoney(line.price)}
                  disabled={readonly}
                  onChange={(e) => {
                    if (readonly) return
                    onUpdatePrice(idx, parseMoney(e.target.value))
                  }}
                  className="h-9 w-full"
                  aria-label={`Pris for ${line.name}`}
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={readonly}
                  onClick={() => onRemove(idx)}
                  aria-label={`Slet ${line.name}`}
                >
                  Slet
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      <tfoot>
        <TableRow>
          <TableCell className="text-right font-bold">I alt:</TableCell>
          <TableCell className="font-bold">{toMoney(total)}</TableCell>
          <TableCell />
        </TableRow>
      </tfoot>
    </Table>
  )
}
