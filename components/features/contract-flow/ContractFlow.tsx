"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  dealLookup,
  deleteUploadedFile,
  getDeal,
  getScreenshotStatusByIndex,
  uploadAttachment,
  sendContract,
} from "@/lib/api/contracts"
import type {
  CarData,
  ContactData,
  ContractAttachment,
  ContractStep,
  ContractType,
  DealData,
  DealInvoiceRow,
  ExtraItem,
  ProductData,
} from "@/types/contracts"
import { BilStep } from "./BilStep"
import { ExtrasStep } from "./ExtrasStep"
import { FinansStep } from "./FinansStep"
import { ForsideStep } from "./ForsideStep"
import { KundeStep } from "./KundeStep"
import { SignStep } from "./SignStep"
import { StepNav } from "./StepNav"
import { SuccessStep } from "./SuccessStep"
import { VedhaeftedeStep } from "./VedhaeftedeStep"

/** PHP canonical name for the fee row (readonly in purchase). */
const SUCCESS_FEE_NAME = "Success Fee"

/** Contracts route with base path (e.g. /ui/contracts when NEXT_PUBLIC_BASE_PATH=/ui). */
function contractsPath(): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "")
  return base ? `${base}/contracts` : "/contracts"
}

function buildExtrasFromInvoice(
  dealInvoice: DealInvoiceRow[],
  externalProducts: ProductData[],
  contractType: ContractType,
  deal: DealData | null
): ExtraItem[] {
  const extras: ExtraItem[] = []
  if (!Array.isArray(dealInvoice)) return extras
  for (const row of dealInvoice) {
    const name =
      (typeof row.Product_Name === "object" && row.Product_Name && "name" in row.Product_Name
        ? (row.Product_Name as { name?: string }).name
        : typeof row.Product_Name === "object" && row.Product_Name && "display_value" in row.Product_Name
          ? (row.Product_Name as { display_value?: string }).display_value
          : (row.Product_Name as string) ?? row.product_name) ?? ""
    if (!name) continue
    const price = Number(row.Price ?? row.price ?? row.Amount ?? 0) || 0
    const productId =
      typeof row.Product_Name === "object" && row.Product_Name && "id" in row.Product_Name
        ? (row.Product_Name as { id?: string }).id ?? ""
        : ""
    let category =
      typeof row.Product_Name === "object" && row.Product_Name && "Category" in row.Product_Name
        ? (row.Product_Name as { Category?: string }).Category ?? ""
        : (row.Category as string) ?? ""
    if (!category && productId) {
      const p = externalProducts.find((x) => (x.id ?? "") === productId)
      if (p) category = p.Category ?? ""
    }
    extras.push({
      type: "subform",
      name: String(name),
      price,
      category,
      product_id: productId || undefined,
      id: row.id ?? row.ID,
    })
  }
  if (contractType === "purchase_agreement" && deal) {
    const hasSalesFee = extras.some(
      (e) =>
        (e.name || "").toLowerCase() === "sales fee" ||
        (e.name || "").toLowerCase() === "success fee"
    )
    if (!hasSalesFee) {
      const fee = Number(deal.CarPal_sales_fee ?? 0) || 0
      if (fee > 0) {
        extras.push({ type: "success_fee", name: SUCCESS_FEE_NAME, price: fee })
      }
    }
  }
  return extras
}

/** Zoho field names for Sign step (PHP sends these in edited_fields.deal). */
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

function buildDealForm(
  deal: DealData | null,
  contractType: ContractType
): Record<string, unknown> {
  if (!deal) return {}
  const handoverField =
    contractType === "purchase_agreement"
      ? "Purchase_Agreement_Handover_Text"
      : "Sales_Agreement_Handover_Text"
  const deliveryDate = deal.Deliverytime
    ? new Date(deal.Deliverytime).toISOString().split("T")[0]
    : ""
  const signIds = getSignStepFieldIds(contractType)
  const payDateVal = deal[signIds.payDate]
  const payDateStr =
    payDateVal == null
      ? ""
      : typeof payDateVal === "string"
        ? payDateVal
        : typeof (payDateVal as Date).toISOString === "function"
          ? (payDateVal as Date).toISOString().split("T")[0]
          : String(payDateVal)
  return {
    Sales_Price: deal.Sales_Price ?? 0,
    Deliverytime: deliveryDate,
    [handoverField]: deal[handoverField] ?? "",
    Under_finance: Boolean(deal.Under_finance),
    Outstanding_finance: Number(deal.Outstanding_finance ?? 0),
    Finance_Bank: deal.Finance_Bank ?? "",
    CarPal_sales_fee: Number(deal.CarPal_sales_fee ?? 0),
    Has_Trade_In: Boolean(deal.Has_Trade_In),
    Trade_in_Price: Number(deal.Trade_in_Price ?? 0),
    Trade_in_Finance_Remaining: Number(deal.Trade_in_Finance_Remaining ?? 0),
    Trade_in_Usage_Type: deal.Trade_in_Usage_Type ?? "Not_Applicable",
    Has_Financing: Boolean(deal.Has_Financing),
    Financing_Down_Payment_Amount: Number(deal.Financing_Down_Payment_Amount ?? 0),
    Financing_Amount: Number(deal.Financing_Amount ?? 0),
    [signIds.payDate]: payDateStr,
    [signIds.payText]: (deal[signIds.payText] as string) ?? "",
    [signIds.extraMsg]: (deal[signIds.extraMsg] as string) ?? "",
  }
}

export function ContractFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const recordIdParam = searchParams.get("record_id") ?? ""
  const contractTypeParam = (searchParams.get("contract_type") ?? "purchase_agreement") as ContractType
  const validType: ContractType =
    contractTypeParam === "sales_agreement" ? "sales_agreement" : "purchase_agreement"

  const [recordId, setRecordId] = useState("")
  const [contractType, setContractType] = useState<ContractType>(validType)
  const [deal, setDeal] = useState<DealData | null>(null)
  const [car, setCar] = useState<CarData | null>(null)
  const [contact1, setContact1] = useState<ContactData | null>(null)
  const [contact2, setContact2] = useState<ContactData | null>(null)
  const [externalProducts, setExternalProducts] = useState<ProductData[]>([])
  const [extras, setExtras] = useState<ExtraItem[]>([])
  const [uploadedAttachments, setUploadedAttachments] = useState<ContractAttachment[]>([])
  const [activeStep, setActiveStep] = useState<ContractStep>("forside")
  const [openDealError, setOpenDealError] = useState<string | null>(null)
  const [openDealValue, setOpenDealValue] = useState("")
  const [sendLoader, setSendLoader] = useState(false)
  const [sendStatus, setSendStatus] = useState("")
  const [dealForm, setDealForm] = useState<Record<string, unknown>>({})
  const [emailMessage, setEmailMessage] = useState("")
  const [privateMessage, setPrivateMessage] = useState("")
  const [customProdName, setCustomProdName] = useState("")
  const [customProdPrice, setCustomProdPrice] = useState("")
  const [selectedExternalId, setSelectedExternalId] = useState("")
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [indexedScreenshotIndices, setIndexedScreenshotIndices] = useState<number[]>([])

  const updateDealForm = useCallback((field: string, value: unknown) => {
    setDealForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    setRecordId(recordIdParam)
    setContractType(validType)
  }, [recordIdParam, validType])

  useEffect(() => {
    if (!recordIdParam) {
      setActiveStep("forside")
      setDeal(null)
      setCar(null)
      setContact1(null)
      setContact2(null)
      setExtras([])
      setDealForm({})
      setIndexedScreenshotIndices([])
      return
    }
    let cancelled = false

    getDeal(recordIdParam, validType)
      .then((data) => {
        if (cancelled) return
        if (data.error) return
        setDeal(data.deal ?? null)
        setCar(data.car ?? null)
        console.log(data.contact1)
        console.log(data.contact2)
        setContact1(data.contact1 ?? null)
        setContact2(data.contact2 ?? null)
        setExternalProducts(data.externalProducts ?? [])
        const invoice = data.dealInvoice ?? []
        const built = buildExtrasFromInvoice(
          invoice,
          data.externalProducts ?? [],
          validType,
          data.deal ?? null
        )
        setExtras(built)
        setDealForm(buildDealForm(data.deal ?? null, validType))
        setActiveStep("kunde")
      })
      .catch(() => {
        if (!cancelled) setDeal(null)
      })
    return () => {
      cancelled = true
    }
  }, [recordIdParam, validType])

  // After deal load: discover screenshot indices 0..10; stop at first not found
  useEffect(() => {
    if (!recordIdParam) {
      setIndexedScreenshotIndices([])
      return
    }
    let cancelled = false
    const indices: number[] = []
    const run = async () => {
      for (let i = 0; i <= 10; i++) {
        if (cancelled) return
        try {
          const result = await getScreenshotStatusByIndex(recordIdParam, i)
          if (result.type === "error" && result.message === "not_found") break
          if (
            result.type === "pdf" ||
            (result.type === "json" &&
              result.status !== "pending" &&
              result.status !== "failed")
          ) {
            indices.push(i)
          } else {
            break
          }
        } catch {
          break
        }
      }
      if (!cancelled) setIndexedScreenshotIndices([...indices])
    }
    run()
    return () => {
      cancelled = true
    }
  }, [recordIdParam])

  const handleOpenDeal = useCallback(async () => {
    const value = openDealValue.trim()
    if (!value) {
      setOpenDealError("Angiv Deal-ID eller Deal Number.")
      return
    }

    setOpenDealError(null)
    try {
      const res = await dealLookup({ value, contract_type: contractType })
      const id = res.deal_id
      if (!id) {
        setOpenDealError("Kunne ikke finde Deal ud fra input.")
        return
      }
      const params = new URLSearchParams(searchParams.toString())
      params.set("record_id", id)
      params.set("contract_type", contractType)
      router.replace(`${contractsPath()}?${params.toString()}`)
    } catch (e) {
      setOpenDealError(e instanceof Error ? e.message : "Ukendt fejl")
    }
  }, [openDealValue, contractType, searchParams, router])

  const handleContractTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as ContractType
      if (next !== "purchase_agreement" && next !== "sales_agreement") return
      setContractType(next)
      const params = new URLSearchParams(searchParams.toString())
      if (recordId) params.set("record_id", recordId)
      params.set("contract_type", next)
      router.replace(`${contractsPath()}?${params.toString()}`)
    },
    [recordId, searchParams, router]
  )

  const handleContractTypeSelect = useCallback(
    (value: string) => {
      const next = value as ContractType
      if (next !== "purchase_agreement" && next !== "sales_agreement") return
      setContractType(next)
      const params = new URLSearchParams(searchParams.toString())
      if (recordId) params.set("record_id", recordId)
      params.set("contract_type", next)
      router.replace(`${contractsPath()}?${params.toString()}`)
    },
    [recordId, searchParams, router]
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!recordId) return
      setAttachmentUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("record_id", recordId)
        formData.append("contract_type", contractType)

        const res = await uploadAttachment(formData)
        if (res.attachment) {
          setUploadedAttachments((prev) => [...prev, res.attachment!])
          toast.success("Fil uploadet.")
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Upload fejlede."
        toast.error(message)
      } finally {
        setAttachmentUploading(false)
      }
    },
    [recordId, contractType]
  )

  const handleDeleteAttachment = useCallback(
    async (url: string) => {
      try {
        // Parse index from url: either record_id-index.pdf or .../screenshot/recordId-index
        const pdfMatch = url.match(/-(\d+)\.pdf$/i)
        const screenshotMatch = url.match(/-(\d+)$/)
        const index = pdfMatch
          ? parseInt(pdfMatch[1], 10)
          : screenshotMatch
            ? parseInt(screenshotMatch[1], 10)
            : null

        const fileUrlForApi =
          pdfMatch != null ? url : index != null ? `${recordId}-${index}.pdf` : url
        await deleteUploadedFile(fileUrlForApi)

        if (pdfMatch != null) {
          setUploadedAttachments((prev) =>
            prev.filter((a) => (a.url ?? a.view_url) !== url)
          )
        }
        if (index != null) {
          setIndexedScreenshotIndices((prev) => prev.filter((i) => i !== index))
        }
        toast.success("Fil slettet.")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Kunne ikke slette fil.")
      }
    },
    [recordId]
  )

  const handleSend = useCallback(async () => {
    if (!recordId) return
    setSendLoader(true)
    setSendStatus("Gemmer og afsender...")
    try {
      const editedFields: { deal: Record<string, unknown>; car: Record<string, unknown> } = {
        deal: { ...dealForm },
        car: {},
      }
      if (contractType === "purchase_agreement") {
        const sf = extras.find(
          (x) =>
            (x.name || "").toLowerCase() === "success fee" ||
            (x.name || "").toLowerCase() === "sales fee"
        )
        if (sf) editedFields.deal["CarPal_sales_fee"] = Number(sf.price) || 0
      }
      const invoiceLines = extras
        .filter((line) => {
          if (contractType === "purchase_agreement") {
            const n = (line.name || "").toLowerCase()
            return n === "success fee" || n === "sales fee"
          }
          return true
        })
        .map((line) => ({
          Product_Name: line.name,
          Price: Number(line.price) || 0,
          product_id: line.product_id,
          id: line.id,
        }))
      const dealFiles =
        contractType === "purchase_agreement"
          ? (deal?.Purchase_Agreement_Extra_Files ?? [])
          : (deal?.Sales_Agreement_Extra_Files ?? [])
      const allAttachments = [...dealFiles, ...uploadedAttachments]
      const attachmentsPayload = allAttachments.map((a) => ({
        file_id: a.file_id ?? a.id,
        id: a.id,
        file_name: a.file_name ?? a.File_Name__s ?? (a as { name?: string }).name,
        mime_type: a.mime_type ?? (a as { mimeType?: string }).mimeType,
      }))
      await sendContract({
        record_id: recordId,
        contract_type: contractType,
        private_message: privateMessage,
        email_message: emailMessage,
        attachments: attachmentsPayload,
        edited_fields: editedFields,
        extras_invoice: invoiceLines,
      })
      setSendStatus("Kontrakt lagt i kø ✅")
      setActiveStep("success")
    } catch (e) {
      setSendStatus("Fejl: " + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSendLoader(false)
    }
  }, [
    recordId,
    contractType,
    dealForm,
    extras,
    deal,
    uploadedAttachments,
    privateMessage,
    emailMessage,
  ])

  const dealFiles: ContractAttachment[] =
    contractType === "purchase_agreement"
      ? (deal?.Purchase_Agreement_Extra_Files ?? [])
      : (deal?.Sales_Agreement_Extra_Files ?? [])

  const contractTypeDisplay =
    contractType === "purchase_agreement" ? "PURCHASE AGREEMENT" : "SALES AGREEMENT"

  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-[260px_1fr] gap-5 px-4 py-6">
      <StepNav activeStep={activeStep} onStepChange={setActiveStep} />
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-4">
            <div>
              <h1 className="text-lg font-semibold">Kontraktflow</h1>
              <small className="text-muted-foreground">
                Bilinfo-inspireret opstilling • {contractTypeDisplay}
              </small>
              {recordId && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-[#eef2ff] text-[#1d4ed8]">
                    Deal klar
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={contractType}
                onValueChange={handleContractTypeSelect}
                aria-label="Kontrakttype"
              >
                <SelectTrigger id="contractTypeSelect" className="w-[200px] font-semibold">
                  <SelectValue placeholder="Vælg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase_agreement">Purchase Agreement</SelectItem>
                  <SelectItem value="sales_agreement">Sales Agreement</SelectItem>
                </SelectContent>
              </Select>
              <Button
              type="button"
              onClick={handleSend}
              disabled={!recordId || sendLoader}
              aria-busy={sendLoader}
            >
              Send til signering
            </Button>
            </div>
          </div>

          {activeStep === "forside" && (
          <ForsideStep
            openDealValue={openDealValue}
            onOpenDealValueChange={setOpenDealValue}
            onOpenDeal={handleOpenDeal}
            openDealError={openDealError}
          />
        )}
        {activeStep === "kunde" && (
          <KundeStep
            contact1={contact1}
            contact2={contact2}
            contractType={contractType}
          />
        )}
        {activeStep === "bil" && (
          <BilStep
            deal={deal}
            car={car}
            contractType={contractType}
            dealForm={dealForm}
            onDealFormChange={updateDealForm}
          />
        )}
        {activeStep === "finans" && (
          <FinansStep
            deal={deal}
            contractType={contractType}
            dealForm={dealForm}
            onDealFormChange={updateDealForm}
            extras={extras}
          />
        )}
        {activeStep === "extras" && (
          <ExtrasStep
            contractType={contractType}
            externalProducts={externalProducts}
            extras={extras}
            onExtrasChange={setExtras}
            customProdName={customProdName}
            customProdPrice={customProdPrice}
            onCustomProdNameChange={setCustomProdName}
            onCustomProdPriceChange={setCustomProdPrice}
            selectedExternalId={selectedExternalId}
            onSelectedExternalIdChange={setSelectedExternalId}
          />
        )}
        {activeStep === "vedh" && (
          <VedhaeftedeStep
            dealFiles={dealFiles}
            uploadedAttachments={uploadedAttachments}
            recordId={recordId}
            contractType={contractType}
            indexedScreenshotIndices={indexedScreenshotIndices}
            onUpload={handleFileUpload}
            onDeleteAttachment={handleDeleteAttachment}
            isUploading={attachmentUploading}
          />
        )}
        {activeStep === "sign" && (
          <SignStep
            contractType={contractType}
            dealForm={dealForm}
            onDealFormChange={updateDealForm}
            emailMessage={emailMessage}
            onEmailMessageChange={setEmailMessage}
            privateMessage={privateMessage}
            onPrivateMessageChange={setPrivateMessage}
            onSend={handleSend}
            sendLoader={sendLoader}
            sendStatus={sendStatus}
          />
        )}
        {activeStep === "success" && <SuccessStep />}
        </CardContent>
      </Card>
    </div>
  )
}
