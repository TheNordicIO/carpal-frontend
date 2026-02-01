"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { ContractType } from "@/types/contracts"

function getSignStepFieldIds(contractType: ContractType) {
  return {
    payDate:
      contractType === "purchase_agreement"
        ? "Purchase_Agreement_Payment_Date"
        : "Sales_Agreement_Payment_Date",
    payText:
      contractType === "purchase_agreement"
        ? "Purchase_Agreement_Payment_Text"
        : "Sales_Agreement_Payment_Text",
    extraMsg:
      contractType === "purchase_agreement"
        ? "Purchase_Agreement_Extra_Contract_Message"
        : "Sales_Agreement_Extra_Contract_Message",
  }
}

interface SignStepProps {
  contractType: ContractType
  dealForm: Record<string, unknown>
  onDealFormChange: (field: string, value: unknown) => void
  emailMessage: string
  onEmailMessageChange: (v: string) => void
  privateMessage: string
  onPrivateMessageChange: (v: string) => void
  onSend: () => void
  sendLoader: boolean
  sendStatus: string
}

export function SignStep({
  contractType,
  dealForm,
  onDealFormChange,
  emailMessage,
  onEmailMessageChange,
  privateMessage,
  onPrivateMessageChange,
  onSend,
  sendLoader,
  sendStatus,
}: SignStepProps) {
  const ids = getSignStepFieldIds(contractType)
  const paymentDate = String(dealForm[ids.payDate] ?? "")
  const paymentText = String(dealForm[ids.payText] ?? "")
  const extraMsg = String(dealForm[ids.extraMsg] ?? "")

  return (
    <section className="p-[18px]" aria-labelledby="sign-heading">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6">
          <Card>
            <CardContent className="pt-4">
              <label htmlFor="email_message" className="mb-1 block text-xs text-muted-foreground">
                Email-besked til modtager(e)
              </label>
              <Textarea
                id="email_message"
                name="email_message"
                rows={4}
                placeholder="Besked der sendes sammen med signeringsanmodningen"
                value={emailMessage}
                onChange={(e) => onEmailMessageChange(e.target.value)}
                aria-label="Email-besked til modtager"
              />
              <Separator className="my-3" />
              <label htmlFor="private_message" className="mb-1 block text-xs text-muted-foreground">
                Email-besked (privat)
              </label>
              <Textarea
                id="private_message"
                name="private_message"
                rows={4}
                value={privateMessage}
                onChange={(e) => onPrivateMessageChange(e.target.value)}
                aria-label="Email-besked privat"
              />
              <Separator className="my-3" />
              <label htmlFor={ids.payDate} className="mb-1 block text-xs text-muted-foreground">
                Betalingsdato
              </label>
              <Input
                id={ids.payDate}
                name={ids.payDate}
                type="date"
                value={paymentDate}
                onChange={(e) => onDealFormChange(ids.payDate, e.target.value)}
                data-module="deal"
                aria-label="Betalingsdato"
              />
              <label htmlFor={ids.payText} className="mb-1 mt-2 block text-xs text-muted-foreground">
                Betalingsinfo
              </label>
              <Textarea
                id={ids.payText}
                name={ids.payText}
                data-module="deal"
                rows={3}
                value={paymentText}
                onChange={(e) => onDealFormChange(ids.payText, e.target.value)}
                aria-label="Betalingsinfo"
              />
              <Separator className="my-3" />
              <label htmlFor={ids.extraMsg} className="mb-1 block text-xs text-muted-foreground">
                Særlige vilkår
              </label>
              <Textarea
                id={ids.extraMsg}
                name={ids.extraMsg}
                data-module="deal"
                rows={3}
                value={extraMsg}
                onChange={(e) => onDealFormChange(ids.extraMsg, e.target.value)}
                aria-label="Særlige vilkår"
              />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-6">
          <Card>
            <CardContent className="pt-4">
              <h4 className="mb-2 font-semibold">Handlinger</h4>
              <p className="mb-3 text-xs text-muted-foreground">
                Systemet gemmer ændringer (edited fields), opdaterer Deal/Car,
                opdaterer Deal Invoice (extras) og sender via Zoho Sign.
              </p>
              <Button
                type="button"
                onClick={onSend}
                disabled={sendLoader}
                aria-busy={sendLoader}
              >
                {sendLoader ? "Sender…" : "✅ Send til signering"}
              </Button>
              {sendLoader && (
                <p className="mt-2 text-sm text-muted-foreground" role="status">
                  Sender…
                </p>
              )}
              {sendStatus && sendStatus.startsWith("Fejl") && (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {sendStatus}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
