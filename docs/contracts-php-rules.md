# Contracts Flow — PHP Canonical Rules

Source of truth: `reference/contracts/contract_flow.php`, `process_purchase_agreement_job.php`, `process_sales_agreement_job.php`. All business logic must remain identical to PHP.

## 1. Step flow and visibility

- **Steps (order)**: Forside, Kunde, Bil, Finansiering, Ekstra salg, Vedhæftede, Handlinger.
- **Forside**: Shown only when `record_id` is empty; after "Åbn deal" redirect sets `record_id` + `contract_type`.
- **All other steps**: Shown only when `record_id` is set (PHP hides with `display:none` when no `record_id`).
- **Default active**: No record → Forside active; with record → Kunde active.
- **Nav**: Click changes active step and shows only that step’s section (no query param for step; client-side only).

## 2. Contract type and URL

- Allowed: `purchase_agreement` | `sales_agreement`. Invalid → treat as `purchase_agreement`.
- Changing type: full reload with same `record_id` and new `contract_type` in query (PHP `location.href`).
- Open deal: POST with `open_deal_value` + `open_contract_type`; redirect to same page with `record_id` + `contract_type`.

## 3. Calculations (PHP as source of truth)

### Purchase

- `price` = parseMoney(Sales_Price input or rawDeal.Sales_Price).
- `under` = Under_finance checkbox; `rest` = Outstanding_finance (if under).
- **Success Fee**: Only fee named **"Success Fee"** counts. Value from CarPal_sales_fee input (synced to extras row if present).
- **Purchase total** = price − rest − fee.
- Summary lines: Salgspris; (if under && rest) "- Indfrielse af restgæld"; "- CarPal Salær (Success Fee)"; KØBESUM (CarPal).
- parseMoney: strip dots, comma → dot; toMoney: da-DK 2 decimals.

### Sales

- `effectivePrice` starts at salesPrice; trade-in: Reduce_Car_Price → subtract trade net; Add_To_Price → add |trade net|; Pay_Separate → extraNegativeTrade.
- **Extras**: `effectivePrice += extraSum` when sales (i.e. **add** all extras to effective price). No category filter in PHP.
- Financing: dp = min(downPayment, effectivePrice); loan = effectivePrice − dp; Reduce_Down_Payment reduces remainingCashDown by trade value; cashNow = remainingCashDown + extraNegativeTrade.
- Summary lines: Salgspris; (if sales && extraSum) "+ Extras (Ekstra salg)"; byttebil lines if hasTrade; "—"; "Kontant betaling nu"; "Lånebeløb" if loan > 0.

## 4. Extras rules (PHP)

- **Seed**: From Deal Invoice subform (`deal['Deal_Invoice']`). Each row: name from Product_Name (name/display_value), price from Price/price/Amount.
- **Purchase**: Ensure one row named **"Success Fee"** (SUCCESS_FEE_NAME). If missing, push with price = CarPal_sales_fee from deal. That row is readonly (no edit/delete). Only Success Fee counts in purchase calculation.
- **Sales**: All extras count in extrasSum(); no category filter in PHP.
- **Add external**: From dropdown (Products Category=External); add with product_id, name, price.
- **Add custom**: Name + price.
- **Send invoice lines**: Purchase → only lines where name === 'Success Fee'. Sales → all lines. Each: `{ Product_Name: line.name, Price: Number(line.price) }`.

## 5. Attachments (PHP)

- **Display**: From deal: Purchase_Agreement_Extra_Files or Sales_Agreement_Extra_Files. PHP does not implement upload in the flow (attachments_json: `[]` in start_job). Next.js may add upload; keep endpoint if backend supports it.

## 6. Payload construction (PHP start_job)

- **edited_fields**: Built from all elements with `[data-module]`. For each: `editedFields[module][f.id] = value`. Checkbox → boolean; date → value or null; inputmode=decimal → parseMoney(value).
- **Deal field IDs in PHP Sign step**: Payment/extra messages use **Zoho field names**:  
  `Purchase_Agreement_Payment_Date` / `Sales_Agreement_Payment_Date`,  
  `Purchase_Agreement_Payment_Text` / `Sales_Agreement_Payment_Text`,  
  `Purchase_Agreement_Extra_Contract_Message` / `Sales_Agreement_Extra_Contract_Message`.  
  Private message textarea is `id="private_message"` (no data-module); value sent as top-level `private_message`.
- **Success Fee sync**: If purchase, set `editedFields.deal['CarPal_sales_fee'] = Number(sf.price)` from Success Fee extra row.
- **invoiceLines**: Purchase → only Success Fee; Sales → all. Each: `{ Product_Name: line.name, Price: Number(line.price) }`.

## 7. Validation and defaults (PHP)

- Open deal: empty value → "Angiv Deal-ID eller Deal Number."; no deal found → "Kunne ikke finde Deal ud fra input."
- Add custom extra: empty name → "Skriv et produktnavn."
- Date fields: empty string or null for unset; YYYY-MM-DD for date inputs.
