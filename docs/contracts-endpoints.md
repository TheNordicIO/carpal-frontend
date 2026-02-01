# Contracts API — Endpoint Requirements Spec

This document describes the endpoints used by the Contracts UI. Do not change routes or payload schemas without backend alignment.

**Vedhæftede (Files) step**: For full backend design (data model, storage, security, auto-attach, Bilbasen doc, locking), see [contracts-vedhaefte-design.md](contracts-vedhaefte-design.md).

---

## 1. POST v1/contracts/api/deal/lookup

### When called

User clicks "Åbn" on Forside with a value in the open-deal input (Deal-ID or Deal Number).

### Request

| Item | Value |
|------|--------|
| Method | POST |
| Headers | `Content-Type: application/json` |
| Body | JSON object |

**Body fields**

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| value | string | Yes | Deal ID (e.g. 15+ alphanumeric) or Deal Number. Client validates non-empty before calling. |
| contract_type | string | Yes | `"purchase_agreement"` or `"sales_agreement"`. |

### Response

**Success (200)**

| Field | Type | Meaning |
|-------|------|---------|
| deal_id | string | Resolved Deal record ID. Client uses this to set URL `?record_id={deal_id}&contract_type={contract_type}`. |

**Error**

- 4xx/5xx, or 200 with body `{ "error": string }`.
- Client shows backend `error` or fallback "Kunne ikke finde Deal ud fra input." (Alert or Toast).

### UI dependencies

- **Step**: ForsideStep.
- **On success**: Client calls `router.replace('/contracts?record_id={deal_id}&contract_type={contract_type})`; page reloads/effect runs and GET deal is called.
- **On error**: Show error message; do not change URL.

### Validation and errors

- Client: empty value → show "Angiv Deal-ID eller Deal Number." without calling API.
- Backend may return 400 or 200+error for invalid/empty value or deal not found.

### Example

**Request**

```json
{
  "value": "123456789012345",
  "contract_type": "purchase_agreement"
}
```

**Response (success)**

```json
{
  "deal_id": "123456789012345"
}
```

**Response (error)**

```json
{
  "error": "Kunne ikke finde Deal ud fra input."
}
```

---

## 2. GET v1/contracts/api/deal/:recordId?contract_type=...

### When called

Page load or client navigation when `record_id` and `contract_type` are present in the URL (e.g. after lookup redirect or user changed contract type).

### Request

| Item | Value |
|------|--------|
| Method | GET |
| Path param | recordId — Deal record ID. |
| Query param | contract_type — `purchase_agreement` or `sales_agreement`. |

No body.

### Response

**Success (200)**

Top-level fields:

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| deal | object | Yes | Deal record. Must include all fields used in UI and in send payload (see below). |
| car | object | Yes | Car record linked from Deal. Can be empty object if no car. |
| contact1 | object | Yes | Primary contact (Seller for purchase, Buyer for sales). |
| contact2 | object | No | Second contact (Seller_2 / Buyer_2). Null if not present. |
| externalProducts | array | Yes | Products with Category=External (for Extras dropdown). |
| dealInvoice | array | Yes | Deal Invoice subform rows (for extras seed). |
| error | string | No | If present, treat as failure; do not use deal/car/contacts. |

**deal** (non-exhaustive; include all fields used in UI/send):

- id, Deal_Name, Sales_Price, Deliverytime, Car (id), Seller, Seller_2, Buyer, Buyer_2
- Under_finance, Outstanding_finance, Finance_Bank, CarPal_sales_fee
- Has_Financing, Financing_Down_Payment_Amount, Financing_Amount
- Has_Trade_In, Trade_in_Price, Trade_in_Finance_Remaining, Trade_in_Usage_Type
- Purchase_Agreement_Handover_Text / Sales_Agreement_Handover_Text
- Purchase_Agreement_Extra_Files / Sales_Agreement_Extra_Files
- Purchase_Agreement_Payment_Date / Sales_Agreement_Payment_Date
- Purchase_Agreement_Payment_Text / Sales_Agreement_Payment_Text
- Purchase_Agreement_Extra_Contract_Message / Sales_Agreement_Extra_Contract_Message
- (Optional) Purchase_Agreement_Private_Message / Sales_Agreement_Private_Message for prefill

**car**: Make, Model, Variant, FuelType/Fuel, Model_Year, First_registration, Color (object with name or string), VIN, Registration/Licenseplate, Mileage.

**contact1 / contact2**: Full_Name or First_Name + Last_Name, Email, Phone/Mobile, Mailing_Street, Mailing_Zip, Mailing_City.

**externalProducts** (each): id, Product_Name, Unit_Price, Category.

**dealInvoice** (each): Product_Name (object with name, display_value, id) or string, Price/price/Amount, id/ID.

### UI dependencies

- **Steps**: ContractFlow load effect; KundeStep (contact1, contact2); BilStep (deal, car); FinansStep (deal, extras); ExtrasStep (externalProducts, extras from dealInvoice); VedhaeftedeStep (deal files); SignStep (prefill from deal).
- **If error or missing deal**: Show error state; do not set deal/car/contacts; do not switch to Kunde step.

### Validation and errors

- Missing or invalid recordId/contract_type: backend may return 4xx or 200 with `error`.
- Client does not overwrite state with partial data on error.

### Example

**Request**

```
GET /contracts/api/deal/123456789012345?contract_type=sales_agreement
```

**Response (success, minimal)**

```json
{
  "deal": {
    "id": "123456789012345",
    "Sales_Price": 150000,
    "Deliverytime": "2025-03-01T00:00:00+01:00",
    "Has_Trade_In": false,
    "Has_Financing": true,
    "Financing_Down_Payment_Amount": 30000,
    "Financing_Amount": 120000,
    "Sales_Agreement_Handover_Text": "",
    "Sales_Agreement_Payment_Date": null,
    "Sales_Agreement_Payment_Text": "",
    "Sales_Agreement_Extra_Contract_Message": "",
    "Sales_Agreement_Extra_Files": []
  },
  "car": {
    "id": "car1",
    "Make": "VW",
    "Model": "Golf",
    "VIN": "WVWZZZ...",
    "Mileage": 50000
  },
  "contact1": {
    "id": "c1",
    "Full_Name": "Jane Doe",
    "Email": "jane@example.com",
    "Mailing_Street": "Street 1",
    "Mailing_Zip": "1000",
    "Mailing_City": "København"
  },
  "contact2": null,
  "externalProducts": [
    { "id": "p1", "Product_Name": "Garanti", "Unit_Price": 5000, "Category": "External" }
  ],
  "dealInvoice": [
    { "id": "inv1", "Product_Name": { "name": "Success Fee", "id": "pf1" }, "Price": 5000 }
  ]
}
```

---

## 2b. GET v1/contracts/api/deal/:recordId/attachments

### When called

When user opens the Vedhæftede step (or on load of contract flow with `record_id`). Used to list all attachments for the contract (deal + contract_type), including auto-attached terms, Bilbasen doc, and manual uploads.

### Request

| Item | Value |
|------|--------|
| Method | GET |
| Path param | recordId — Deal record ID. |
| Query param | contract_type — `purchase_agreement` or `sales_agreement`. |

### Response

**Success (200)**

| Field | Type | Meaning |
|-------|------|---------|
| attachments | array | List of attachment metadata. Each: id, file_id?, file_name, mime_type, file_type?, view_url?. |

After "Send til signering", backend may return the immutable snapshot; add/delete are disabled (403).

**Error**

- 4xx/5xx or body `{ "error": string }`.

See [contracts-vedhaefte-design.md](contracts-vedhaefte-design.md) for locking rules and edge cases.

---

## 3. POST v1/contracts/api/attachments/upload

### When called

User selects one or more files in VedhaeftedeStep ("Tilføj fil"). Client may call once per file or batch per backend contract.

### Request

| Item | Value |
|------|--------|
| Method | POST |
| Body | FormData (multipart/form-data). Browser sets Content-Type with boundary. |

**FormData fields**

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| file | File | Yes | The uploaded file. |
| record_id | string | Yes | Deal record ID. |
| contract_type | string | Yes | `purchase_agreement` or `sales_agreement`. |

### Response

**Success (200)**

| Field | Type | Meaning |
|-------|------|---------|
| success | boolean | true. |
| attachment | object | Metadata for the uploaded file. Client appends to uploadedAttachments and re-renders list. |

**attachment** (at least): id, file_id (optional), file_name, mime_type. May include view_url/preview_url for display.

**Error**

- 4xx/5xx or body `{ "error": string }`.
- Client shows backend `error` or "Upload fejlede" (Toast or Alert). Accept: .pdf, .jpg, .jpeg, .png, .doc, .docx; multiple selection allowed.

### UI dependencies

- **Step**: VedhaeftedeStep.
- **On success**: Append attachment to uploadedAttachments; re-render file list.
- **On error**: Show message per file; do not add to list.

### Example

**Request**

FormData: file=<File>, record_id=123456789012345, contract_type=purchase_agreement

**Response (success)**

```json
{
  "success": true,
  "attachment": {
    "id": "att1",
    "file_id": "f1",
    "file_name": "doc.pdf",
    "mime_type": "application/pdf"
  }
}
```

---

## 3b. POST v1/contracts/api/attachments/auto-attach-defaults

### When called

When user opens Vedhæftede step or before "Send til signering". Idempotent: attaches TERMS and BUSINESS_TERMS if not already present (by file_type + version).

### Request

| Item | Value |
|------|--------|
| Method | POST |
| Headers | `Content-Type: application/json` |
| Body | JSON: `record_id`, `contract_type`. |

### Response

**Success (200)** — `{ "success": true, "added": [ids], "message": "..." }`. If already attached, `added` is empty.

**Error** — 403 if contract already sent to signing. See [contracts-vedhaefte-design.md](contracts-vedhaefte-design.md).

---

## 3c. POST v1/contracts/api/attachments/generate-bilbasen

### When called

When user clicks "Generer Bilbasen-dokument" or when opening Vedhæftede (optional). Generates PDF from deal’s `Bilbasen_Link` (or `Bilbasen_Link` in Zoho) and attaches as BILBASEN_DOC. Idempotent: if already present, returns existing attachment.

### Request

| Item | Value |
|------|--------|
| Method | POST |
| Headers | `Content-Type: application/json` |
| Body | JSON: `record_id`, `contract_type`. |

### Response

**Success (200)** — `{ "success": true, "attachment": { id, file_name, mime_type, view_url } }`.

**Error** — 422 if deal has no valid Bilbasen URL (`code: MISSING_BILBASEN_URL`); 502 if PDF generation fails; 403 if contract already sent.

---

## 3d. DELETE v1/contracts/api/attachments/:id

### When called

User removes an attachment from the list. Only allowed **before** "Send til signering".

### Request

| Item | Value |
|------|--------|
| Method | DELETE |
| Path param | id — Attachment ID. |

### Response

**Success (200)** — `{ "success": true }`.

**Error** — 403 if contract already sent to signing ("Vedhæftninger er låst efter send til signering.").

---

## 4. POST v1/contracts/api/send

### When called

User clicks "Send til signering" (header or SignStep). Client builds payload from current state (edited_fields from dealForm, extras_invoice from extras, attachments from deal files + uploadedAttachments).

### Request

| Item | Value |
|------|--------|
| Method | POST |
| Headers | `Content-Type: application/json` |
| Body | JSON object. Schema must not be changed without backend agreement. |

**Body fields**

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| record_id | string | Yes | Deal record ID. |
| contract_type | string | Yes | `purchase_agreement` or `sales_agreement`. |
| private_message | string | Yes | Private email message (can be empty). |
| email_message | string | Yes | Email message to recipient(s) (can be empty). |
| attachments | array | Yes | Array of attachment metadata (deal files + uploaded). Each: file_id?, id?, file_name?, mime_type?. |
| edited_fields | object | Yes | Keys: deal, car. Values: objects whose keys are Zoho field names (e.g. Sales_Price, Purchase_Agreement_Payment_Date). |
| extras_invoice | array | Yes | Invoice lines for Deal Invoice. Each: Product_Name (string), Price (number), product_id? (optional), id? (optional for existing rows). |

**edited_fields.deal** must include all data-module="deal" fields the user can edit, using **Zoho field names** (e.g. Purchase_Agreement_Payment_Date, Purchase_Agreement_Payment_Text, Purchase_Agreement_Extra_Contract_Message for purchase; Sales_Agreement_* for sales). Checkbox → boolean; date → string or null; decimal → number.

### Response

**Success (200)**

| Field | Type | Meaning |
|-------|------|---------|
| success | boolean | true. |
| job_id | string | Optional; queue job ID if backend uses job queue. |

**Error**

- 4xx/5xx or body `{ "error": string }`.
- Client shows backend `error` or "Ukendt fejl" in status area or Toast.

### UI dependencies

- **Steps**: SignStep, ContractFlow (header Send button).
- **Before send**: Collect edited_fields from dealForm (and car if any); build extras_invoice from extras (Purchase: only Success Fee row; Sales: all); build attachments from deal files + uploadedAttachments.
- **On success**: Show "Kontrakt lagt i kø ✅".
- **On error**: Show error string. Client disables Send when !recordId; shows loader while sending.

### Validation and errors

- Backend may require record_id and contract_type; invalid JSON or missing required fields may return 400 with message.
- Client validates recordId present and shows loader/status.

### Example

**Request (minimal)**

```json
{
  "record_id": "123456789012345",
  "contract_type": "purchase_agreement",
  "private_message": "",
  "email_message": "",
  "attachments": [],
  "edited_fields": {
    "deal": {
      "Sales_Price": 100000,
      "Deliverytime": "2025-03-01",
      "Purchase_Agreement_Handover_Text": "",
      "Under_finance": false,
      "Outstanding_finance": 0,
      "Finance_Bank": "",
      "CarPal_sales_fee": 5000,
      "Purchase_Agreement_Payment_Date": null,
      "Purchase_Agreement_Payment_Text": "",
      "Purchase_Agreement_Extra_Contract_Message": ""
    },
    "car": {}
  },
  "extras_invoice": [
    { "Product_Name": "Success Fee", "Price": 5000 }
  ]
}
```

**Response (success)**

```json
{
  "success": true,
  "job_id": "job-abc-123"
}
```

---

## Error handling summary

| Endpoint | Client validation | Backend error | UI |
|----------|-------------------|---------------|-----|
| deal/lookup | Empty value → "Angiv Deal-ID eller Deal Number." | error or throw | Alert or Toast |
| deal/:id | — | error or missing deal | Error state; no state overwrite |
| deal/:id/attachments | — | error | Error state or Toast |
| attachments/upload | recordId required | error; 403 if locked | Toast or Alert per file |
| attachments/auto-attach-defaults | — | 403 if locked | Toast |
| attachments/generate-bilbasen | — | 422 missing URL; 502 generation fail; 403 locked | Toast; hide button if no URL |
| attachments/:id (DELETE) | — | 403 if locked | Toast |
| send | recordId required; disable button | error | Status area or Toast |

---

## Deliverables

### A) Folder tree (Contracts)

Per [docs/conventions.md](conventions.md) (feature-based structure, kebab-case folders, PascalCase components, `@/*` paths; this repo uses root `app/`, no `src/`):

```
app/
  contracts/
    layout.tsx
    page.tsx
components/
  features/
    contract-flow/
      BilStep.tsx
      ContractFlow.tsx
      ExtrasStep.tsx
      ExtrasTable.tsx
      FinansStep.tsx
      ForsideStep.tsx
      KundeStep.tsx
      SignStep.tsx
      StepNav.tsx
      VedhaeftedeStep.tsx
lib/
  api/
    contracts.ts
types/
  contracts.ts
```

### B) shadcn commands run

```bash
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add sonner
```

(Toaster from `sonner` is used in `app/layout.tsx` for global toasts.)

### F) Regression checklist

- **URL params**: `record_id` and `contract_type` in URL; open deal sets both; type switch reloads with same `record_id` and new `contract_type`.
- **Open deal**: Forside "Åbn" calls lookup; on success, URL updated; Forside hidden; Kunde step active.
- **Type switch**: Header dropdown changes contract type; URL updated; deal reloaded.
- **Purchase summary**: price − rest − fee (Success Fee only); lines: Salgspris; (if under && rest) "- Indfrielse af restgæld"; "- CarPal Salær (Success Fee)"; KØBESUM.
- **Sales summary**: effectivePrice = salesPrice + all extras; trade/financing lines; "+ Extras (Ekstra salg)" when extras present.
- **Extras**: Success Fee readonly for purchase; add external (Select) / custom; delete except Success Fee; invoice lines: purchase → Success Fee only, sales → all.
- **Attachments**: Deal files + uploaded list; "Tilføj fil" uploads; accept .pdf,.jpg,.jpeg,.png,.doc,.docx.
- **Send payload**: `record_id`, `contract_type`, `private_message`, `email_message`, `attachments`, `edited_fields` (Zoho field names in deal, e.g. `Purchase_Agreement_Payment_Date`), `extras_invoice`.
- **Danish copy**: Preserved from PHP / existing Next.js.
- **a11y**: Labels, `aria-current="step"` on active step, `role="status"` / Alert for errors, focusable controls.
