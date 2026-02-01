"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { fullName } from "@/lib/utils"
import type { ContactData, ContractType } from "@/types/contracts"

interface KundeStepProps {
  contact1: ContactData | null
  contact2: ContactData | null
  contractType: ContractType
}

export function KundeStep({ contact1, contact2, contractType }: KundeStepProps) {
  const title = contractType === "sales_agreement" ? "Køber(e)" : "Sælger(e)"
  const c1 = contact1
  const c2 = contact2

  return (
    <section className="p-[18px]" aria-labelledby="kunde-heading">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12">
          <Card>
            <CardContent className="py-3.5">
              <strong>{title}</strong>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-6">
          <label htmlFor="kunde-navn" className="mb-1 block text-xs text-muted-foreground">
            Navn
          </label>
          <Input id="kunde-navn" value={fullName(c1)} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="kunde-tel" className="mb-1 block text-xs text-muted-foreground">
            Telefon
          </label>
          <Input id="kunde-tel" value={(c1?.Phone ?? c1?.Mobile) ?? ""} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="kunde-email" className="mb-1 block text-xs text-muted-foreground">
            Email
          </label>
          <Input id="kunde-email" value={c1?.Email ?? ""} disabled readOnly />
        </div>
        <div className="col-span-6">
          <label htmlFor="kunde-adresse" className="mb-1 block text-xs text-muted-foreground">
            Adresse
          </label>
          <Input id="kunde-adresse" value={(c1?.Mailing_Street ?? c1?.Address ?? "") as string} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="kunde-zip" className="mb-1 block text-xs text-muted-foreground">
            Postnr.
          </label>
          <Input id="kunde-zip" value={(c1?.Mailing_Zip ?? c1?.Zip_Code ?? "") as string} disabled readOnly />
        </div>
        <div className="col-span-3">
          <label htmlFor="kunde-by" className="mb-1 block text-xs text-muted-foreground">
            By
          </label>
          <Input id="kunde-by" value={(c1?.Mailing_City ?? c1?.City ?? "") as string} disabled readOnly />
        </div>
        {c2 && (
          <>
            <div className="col-span-12">
              <Separator />
            </div>
            <div className="col-span-6">
              <label htmlFor="kunde-navn2" className="mb-1 block text-xs text-muted-foreground">
                Navn (2)
              </label>
              <Input id="kunde-navn2" value={fullName(c2)} disabled readOnly />
            </div>
            <div className="col-span-3">
              <label htmlFor="kunde-tel2" className="mb-1 block text-xs text-muted-foreground">
                Telefon (2)
              </label>
              <Input id="kunde-tel2" value={(c2.Phone ?? c2.Mobile) ?? ""} disabled readOnly />
            </div>
            <div className="col-span-3">
              <label htmlFor="kunde-email2" className="mb-1 block text-xs text-muted-foreground">
                Email (2)
              </label>
              <Input id="kunde-email2" value={c2.Email ?? ""} disabled readOnly />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
