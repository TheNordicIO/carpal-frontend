"use client"

import Button from "@mui/material/Button"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableFooter from "@mui/material/TableFooter"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
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
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Produktnavn</TableCell>
          <TableCell sx={{ width: 160 }}>Pris (kr.)</TableCell>
          <TableCell sx={{ width: 80 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {extras.map((line, idx) => {
          const readonly =
            contractType === "purchase_agreement" && isSalesFee(line.name ?? "")
          return (
            <TableRow key={idx}>
              <TableCell>{line.name}</TableCell>
              <TableCell>
                <TextField
                  type="text"
                  value={toMoney(line.price)}
                  disabled={readonly}
                  onChange={(e) => {
                    if (readonly) return
                    onUpdatePrice(idx, parseMoney(e.target.value))
                  }}
                  size="small"
                  fullWidth
                  inputProps={{ "aria-label": `Pris for ${line.name}` }}
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  color="error"
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
      <TableFooter>
        <TableRow>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            I alt:
          </TableCell>
          <TableCell sx={{ fontWeight: 700 }}>{toMoney(total)}</TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
