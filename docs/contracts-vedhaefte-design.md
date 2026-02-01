# Vedhæftede (Files) Step — Design & PHP Backend Spec

This document defines the **Vedhæftede (Files)** step in the Purchase/Sales Agreement flow: business and technical purpose, proposed behaviors, backend data model, storage, security, API design, and PHP (Laravel) implementation details including attachment locking and edge cases.

---

## 1. What This Step Is For

### 1.1 Business terms

The **Vedhæftede** step is where the user assembles all documents that will be sent with the contract for signing:

- **Standard documents** (attached automatically): purchase/sales terms and business terms. These are the same for every contract of that type; attaching them here ensures signers always receive the same legal and commercial terms.
- **Deal-specific documentation**: the Bilbasen listing (ad) as proof of the vehicle listing at the time of the deal. This is generated from the deal’s Bilbasen URL and stored as a PDF.
- **Additional files**: any extra documents the user wants to include (e.g. inspection report, extra photos). These are uploaded manually via “Tilføj fil”.

So in business terms: **Vedhæftede = “attach everything that goes with this contract before sending to signing.”**

### 1.2 Technical terms

Technically, the step:

- **Reads** attachments for the current deal + contract type (from backend API).
- **Triggers** automatic attachment of default terms (and optionally Bilbasen doc) when the step is opened or before send.
- **Accepts** user uploads (multipart) and stores files + metadata.
- **Displays** a single list: “Filer fra dealen” = deal-linked files (terms, Bilbasen, plus any already linked to the deal) and user-uploaded attachments.
- **Feeds** the final attachment list (ids/metadata) into the “Send til signering” payload; after send, attachments are locked and an immutable snapshot is stored.

So in technical terms: **Vedhæftede = “attachment management for a contract (deal + contract_type) until send; then snapshot and lock.”**

---

## 2. Proposed Behaviors (Summary)

| Behavior | When | Idempotent / Notes |
|----------|------|---------------------|
| **Auto-attach default terms** | When user opens Vedhæftede step **or** before “Send til signering” (if not already attached) | Yes. Check by `file_type` + `version`; skip if already present. |
| **Auto-attach business terms** | Same as above. | Yes. Separate `file_type` (e.g. `BUSINESS_TERMS`). |
| **Attach Bilbasen doc** | When user opens Vedhæftede **or** on-demand (e.g. “Generer Bilbasen-dokument”) **or** before send if URL present and doc missing | Prefer idempotent: one Bilbasen doc per deal/contract_type; regenerate only if missing or user requests. |
| **Manual upload** | User clicks “Tilføj fil” and selects file(s). | One attachment per upload; no duplicate detection by content. |
| **Delete attachment** | Only when contract **not** sent to signing. | Block delete after `sent_to_signing_at` (or equivalent). |

---

## 3. Step-by-Step Plan

1. **Backend: Data model** — Define `contracts`, `contract_attachments`, `file_type` enum, versioning, `created_by`, timestamps. Add `sent_to_signing_at` (or status) on contract/deal for locking.
2. **Backend: Storage abstraction** — Interface (e.g. `AttachmentStorageInterface`) with local filesystem implementation and placeholder for Azure Blob. All file access via interface.
3. **Backend: Security** — Auth middleware, permission “can manage attachments for this deal”, malware scan placeholder, allowed MIME types and max size, audit log for attach/delete.
4. **Backend: API routes** — List attachments; upload (multipart); auto-attach default docs (idempotent); generate Bilbasen PDF and attach; delete (only if not sent).
5. **Backend: Locking** — When “Send til signering” is executed, set `sent_to_signing_at` (or contract status); copy attachment metadata (and optionally files) to immutable snapshot; reject any attachment add/delete for that contract after that.
6. **Frontend (optional follow-up)** — Call “list attachments” when entering Vedhæftede; call “auto-attach default docs” once when entering step (or rely on backend doing it before send); show “Generer Bilbasen-dokument” if Bilbasen URL present and no Bilbasen doc yet; disable “Tilføj fil” / delete after send.

---

## 4. Database Schema (SQL)

```sql
-- File type enum (or lookup table in non-PG)
-- TERMS = purchase/sales terms (standard PDF)
-- BUSINESS_TERMS = business terms PDF
-- BILBASEN_DOC = generated Bilbasen listing PDF
-- MANUAL_UPLOAD = user-uploaded file

CREATE TABLE file_types (
    id          VARCHAR(32) PRIMARY KEY,
    name        VARCHAR(64) NOT NULL,
    description VARCHAR(255)
);
INSERT INTO file_types (id, name, description) VALUES
('TERMS', 'Terms (standard)', 'Purchase/sales terms PDF'),
('BUSINESS_TERMS', 'Business terms', 'Business terms PDF'),
('BILBASEN_DOC', 'Bilbasen listing', 'Generated Bilbasen ad PDF'),
('MANUAL_UPLOAD', 'Manual upload', 'User-uploaded file');

-- Contract: one per deal + contract_type until sent (or use deal as contract context)
-- If you already have a "contracts" or "deal_contracts" table, add sent_to_signing_at there.
CREATE TABLE contracts (
    id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    deal_id               VARCHAR(64) NOT NULL COMMENT 'Zoho Deal record ID',
    contract_type         VARCHAR(32) NOT NULL COMMENT 'purchase_agreement | sales_agreement',
    sent_to_signing_at    TIMESTAMP NULL DEFAULT NULL COMMENT 'When sent; after this attachments are locked',
    snapshot_attachments  JSON NULL COMMENT 'Immutable copy of attachment metadata at send time',
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_contract (deal_id, contract_type)
);

-- Attachments: one row per file attached to a contract (before send)
CREATE TABLE contract_attachments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id     BIGINT UNSIGNED NOT NULL,
    file_type       VARCHAR(32) NOT NULL COMMENT 'TERMS | BUSINESS_TERMS | BILBASEN_DOC | MANUAL_UPLOAD',
    version         VARCHAR(32) NULL COMMENT 'Optional version for terms (e.g. 2025-01)',
    file_name       VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(128) NOT NULL,
    storage_key     VARCHAR(512) NOT NULL COMMENT 'Path in storage (e.g. fs path or blob key)',
    file_size       BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_by      VARCHAR(64) NULL COMMENT 'User/system identifier',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (file_type) REFERENCES file_types(id)
);

-- Prevent duplicate auto-attached terms per contract (idempotent)
CREATE UNIQUE KEY uq_contract_file_type_version (contract_id, file_type, COALESCE(version, ''));

-- Audit log for attachment actions (optional but recommended)
CREATE TABLE contract_attachment_audit (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contract_id     BIGINT UNSIGNED NOT NULL,
    attachment_id   BIGINT UNSIGNED NULL,
    action          VARCHAR(32) NOT NULL COMMENT 'attach | delete | send_snapshot',
    file_type       VARCHAR(32) NULL,
    details         JSON NULL,
    performed_by    VARCHAR(64) NULL,
    performed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
```

If you prefer **not** to have a separate `contracts` table and only key by `deal_id + contract_type`, you can store `sent_to_signing_at` on the Deal in Zoho and keep only an `contract_attachments` table that references `deal_id + contract_type`. The schema above assumes a local `contracts` table for clarity.

**Alternative: attachments keyed by deal_id + contract_type only**

```sql
CREATE TABLE contract_attachments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    deal_id         VARCHAR(64) NOT NULL,
    contract_type   VARCHAR(32) NOT NULL,
    file_type       VARCHAR(32) NOT NULL,
    version         VARCHAR(32) NULL,
    file_name       VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(128) NOT NULL,
    storage_key     VARCHAR(512) NOT NULL,
    file_size       BIGINT UNSIGNED NOT NULL DEFAULT 0,
    created_by      VARCHAR(64) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_deal_type_file_version (deal_id, contract_type, file_type, COALESCE(version, ''))
);
-- Locking: store sent_to_signing_at in Zoho Deal or in a small table deal_contract_status(deal_id, contract_type, sent_at).
```

---

## 5. Storage Approach

- **Abstraction**: Define an interface (e.g. `AttachmentStorageInterface`) with methods: `put($key, $contents, $options)`, `get($key)`, `exists($key)`, `delete($key)`, `url($key)` (or signed URL).
- **Default implementation**: Local filesystem under a configured base path (e.g. `storage/app/contract-attachments`). Key = `{deal_id}/{contract_type}/{attachment_id}_{safe_filename}`.
- **Placeholder**: Azure Blob (or S3) implementation that implements the same interface; switch via config so no API or domain logic changes.

---

## 6. Security

| Concern | Measure |
|--------|---------|
| **Auth** | All attachment routes require authenticated user (session or API token). |
| **Permission** | Check that the user is allowed to manage this deal (e.g. same org, or role). |
| **Malware** | Placeholder: call a scanning service (e.g. ClamAV or cloud scanner) before saving; if not implemented, log and optionally block unknown types. |
| **MIME / type** | Allow list: `application/pdf`, `image/jpeg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`. Reject others. |
| **Max size** | Enforce per-file max (e.g. 20 MB). |
| **Audit** | Log attach, delete, and “send snapshot” in `contract_attachment_audit` with `performed_by` and timestamp. |

---

## 7. When Attachments Are Locked

- **Before “Send til signering”**: User can add and remove attachments (including auto-attach and Bilbasen doc). Backend allows list/upload/auto-attach/Bilbasen/delete.
- **When user clicks “Send til signering”**: Backend runs send flow (e.g. build PDF, send to Zoho/signer). Right before or as part of that:
  - Set `contract.sent_to_signing_at = now()` (or deal-level equivalent).
  - Persist an **immutable snapshot** of attachment metadata (and optionally copy files to a “sent” storage area) so the exact set of files sent is fixed.
- **After sending**: Any request to add or delete attachments for that contract must return **403** or **409** with a message like “Vedhæftninger er låst efter send til signering.” List and download can still be allowed.

---

## 8. API Endpoints (Summary)

| Method | Route | Purpose |
|--------|--------|---------|
| GET | `v1/contracts/api/deal/:recordId/attachments?contract_type=...` | List attachments for contract (deal + type). |
| POST | `v1/contracts/api/attachments/upload` | Upload one file (multipart: file, record_id, contract_type). |
| POST | `v1/contracts/api/attachments/auto-attach-defaults` | Idempotent attach TERMS + BUSINESS_TERMS. |
| POST | `v1/contracts/api/attachments/generate-bilbasen` | Generate Bilbasen PDF from deal’s Bilbasen URL and attach (idempotent). |
| DELETE | `v1/contracts/api/attachments/:id` | Delete attachment (only if contract not sent). |

---

## 9. PHP Implementation (Laravel)

### 9.1 Storage interface (placeholder for Azure Blob)

```php
// app/Contracts/AttachmentStorageInterface.php
namespace App\Contracts;

interface AttachmentStorageInterface
{
    public function put(string $key, $contents, array $options = []): bool;
    public function get(string $key): ?string;
    public function exists(string $key): bool;
    public function delete(string $key): bool;
    public function url(string $key): string;
}
```

```php
// app/Services/LocalAttachmentStorage.php
namespace App\Services;

use App\Contracts\AttachmentStorageInterface;
use Illuminate\Support\Facades\Storage;

class LocalAttachmentStorage implements AttachmentStorageInterface
{
    private string $disk = 'contract-attachments';

    public function put(string $key, $contents, array $options = []): bool
    {
        return Storage::disk($this->disk)->put($key, $contents, $options);
    }

    public function get(string $key): ?string
    {
        if (!Storage::disk($this->disk)->exists($key)) {
            return null;
        }
        return Storage::disk($this->disk)->get($key);
    }

    public function exists(string $key): bool
    {
        return Storage::disk($this->disk)->exists($key);
    }

    public function delete(string $key): bool
    {
        return Storage::disk($this->disk)->delete($key);
    }

    public function url(string $key): string
    {
        return Storage::disk($this->disk)->url($key);
    }
}
```

Register in `AppServiceProvider`: bind `AttachmentStorageInterface` to `LocalAttachmentStorage` (or `AzureBlobAttachmentStorage` when implemented).

---

### 9.2 Routes and controller (Laravel)

```php
// routes/api.php (or web.php under prefix)
Route::prefix('v1/contracts/api')->middleware(['auth:sanctum'])->group(function () {
    Route::get('deal/{recordId}/attachments', [AttachmentController::class, 'index'])
        ->name('contracts.attachments.index');
    Route::post('attachments/upload', [AttachmentController::class, 'upload'])
        ->name('contracts.attachments.upload');
    Route::post('attachments/auto-attach-defaults', [AttachmentController::class, 'autoAttachDefaults'])
        ->name('contracts.attachments.autoAttachDefaults');
    Route::post('attachments/generate-bilbasen', [AttachmentController::class, 'generateBilbasen'])
        ->name('contracts.attachments.generateBilbasen');
    Route::delete('attachments/{id}', [AttachmentController::class, 'destroy'])
        ->name('contracts.attachments.destroy');
});
```

---

### 9.3 List attachments

```php
// GET deal/:recordId/attachments?contract_type=purchase_agreement
public function index(Request $request, string $recordId): JsonResponse
{
    $contractType = $request->query('contract_type', 'purchase_agreement');
    $this->authorizeDeal($recordId);

    $contract = Contract::firstOrCreate(
        ['deal_id' => $recordId, 'contract_type' => $contractType],
        ['deal_id' => $recordId, 'contract_type' => $contractType]
    );

    if ($contract->sent_to_signing_at) {
        // Return snapshot if you store it; else still return current attachments read-only
        $attachments = $contract->snapshot_attachments ?? $contract->attachments;
    } else {
        $attachments = $contract->attachments;
    }

    $list = $attachments->map(fn ($a) => [
        'id'         => $a->id,
        'file_id'    => $a->id,
        'file_name'  => $a->file_name,
        'mime_type'  => $a->mime_type,
        'file_type'  => $a->file_type,
        'view_url'   => $this->storage->url($a->storage_key),
    ]);

    return response()->json(['attachments' => $list]);
}
```

---

### 9.4 Upload file (multipart): validation and save

```php
private const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
private const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

public function upload(Request $request): JsonResponse
{
    $request->validate([
        'record_id'      => 'required|string|max:64',
        'contract_type'  => 'required|in:purchase_agreement,sales_agreement',
        'file'           => 'required|file|max:' . (self::MAX_FILE_SIZE / 1024),
    ]);

    $file = $request->file('file');
    $mime = $file->getMimeType();
    if (!in_array($mime, self::ALLOWED_MIME_TYPES, true)) {
        return response()->json(['error' => 'Filtypen er ikke tilladt.'], 422);
    }

    $this->authorizeDeal($request->input('record_id'));
    $contract = Contract::firstOrCreate(
        [
            'deal_id'        => $request->input('record_id'),
            'contract_type'  => $request->input('contract_type'),
        ],
        ['deal_id' => $request->input('record_id'), 'contract_type' => $request->input('contract_type')]
    );

    if ($contract->sent_to_signing_at) {
        return response()->json(['error' => 'Vedhæftninger er låst efter send til signering.'], 403);
    }

    // Placeholder: malware scan
    // $this->malwareScanner->scan($file->getRealPath());

    $safeName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
        . '_' . time() . '.' . $file->getClientOriginalExtension();
    $storageKey = "{$contract->deal_id}/{$contract->contract_type}/{$safeName}";

    $this->storage->put($storageKey, $file->get());

    $attachment = $contract->attachments()->create([
        'file_type'   => 'MANUAL_UPLOAD',
        'version'     => null,
        'file_name'   => $file->getClientOriginalName(),
        'mime_type'   => $mime,
        'storage_key' => $storageKey,
        'file_size'   => $file->getSize(),
        'created_by'  => $request->user()?->id,
    ]);

    $this->audit($contract->id, $attachment->id, 'attach', ['file_type' => 'MANUAL_UPLOAD']);

    return response()->json([
        'success'    => true,
        'attachment' => [
            'id'        => $attachment->id,
            'file_id'   => $attachment->id,
            'file_name' => $attachment->file_name,
            'mime_type' => $attachment->mime_type,
            'view_url'  => $this->storage->url($attachment->storage_key),
        ],
    ]);
}
```

---

### 9.5 Auto-attach default docs (idempotent)

```php
// POST attachments/auto-attach-defaults
// Body: { "record_id": "...", "contract_type": "purchase_agreement" }
public function autoAttachDefaults(Request $request): JsonResponse
{
    $request->validate([
        'record_id'     => 'required|string|max:64',
        'contract_type' => 'required|in:purchase_agreement,sales_agreement',
    ]);

    $this->authorizeDeal($request->input('record_id'));
    $contract = Contract::firstOrCreate(
        [
            'deal_id'        => $request->input('record_id'),
            'contract_type'  => $request->input('contract_type'),
        ],
        ['deal_id' => $request->input('record_id'), 'contract_type' => $request->input('contract_type')]
    );

    if ($contract->sent_to_signing_at) {
        return response()->json(['error' => 'Vedhæftninger er låst.'], 403);
    }

    $termsVersion = config('contracts.terms_version', '2025-01');
    $added = [];

    foreach (['TERMS', 'BUSINESS_TERMS'] as $fileType) {
        $path = $fileType === 'TERMS'
            ? resource_path("contracts/terms_{$request->input('contract_type')}.pdf")
            : resource_path('contracts/business_terms.pdf');

        if (!file_exists($path)) {
            continue;
        }

        $exists = $contract->attachments()
            ->where('file_type', $fileType)
            ->where('version', $termsVersion)
            ->exists();

        if ($exists) {
            continue; // idempotent
        }

        $fileName = basename($path);
        $storageKey = "{$contract->deal_id}/{$contract->contract_type}/{$fileType}_{$termsVersion}_{$fileName}";
        $this->storage->put($storageKey, file_get_contents($path));

        $attachment = $contract->attachments()->create([
            'file_type'   => $fileType,
            'version'     => $termsVersion,
            'file_name'   => $fileName,
            'mime_type'   => 'application/pdf',
            'storage_key' => $storageKey,
            'file_size'   => filesize($path),
            'created_by'  => 'system',
        ]);

        $this->audit($contract->id, $attachment->id, 'attach', ['file_type' => $fileType]);
        $added[] = $attachment->id;
    }

    return response()->json([
        'success' => true,
        'added'   => $added,
        'message' => count($added) ? 'Vilkår tilføjet.' : 'Vilkår var allerede tilføjet.',
    ]);
}
```

---

### 9.6 Generate Bilbasen PDF and attach

```php
// POST attachments/generate-bilbasen
// Body: { "record_id": "...", "contract_type": "purchase_agreement" }
public function generateBilbasen(Request $request): JsonResponse
{
    $request->validate([
        'record_id'     => 'required|string|max:64',
        'contract_type' => 'required|in:purchase_agreement,sales_agreement',
    ]);

    $this->authorizeDeal($request->input('record_id'));
    $contract = Contract::firstOrCreate(
        [
            'deal_id'        => $request->input('record_id'),
            'contract_type'  => $request->input('contract_type'),
        ],
        ['deal_id' => $request->input('record_id'), 'contract_type' => $request->input('contract_type')]
    );

    if ($contract->sent_to_signing_at) {
        return response()->json(['error' => 'Vedhæftninger er låst.'], 403);
    }

    $deal = $this->getDealFromZoho($contract->deal_id);
    $bilbasenUrl = $deal['Bilbasen_Link'] ?? null;
    if (!$bilbasenUrl || !filter_var($bilbasenUrl, FILTER_VALIDATE_URL)) {
        return response()->json([
            'error' => 'Ingen gyldig Bilbasen-URL på dealen.',
            'code'  => 'MISSING_BILBASEN_URL',
        ], 422);
    }

    // Idempotent: already have a Bilbasen doc?
    $existing = $contract->attachments()->where('file_type', 'BILBASEN_DOC')->first();
    if ($existing) {
        return response()->json([
            'success'    => true,
            'attachment' => $this->formatAttachment($existing),
            'message'    => 'Bilbasen-dokument findes allerede.',
        ]);
    }

    $pdfPath = $this->bilbasenPdfService->generateFromUrl($bilbasenUrl);
    if (!$pdfPath || !file_exists($pdfPath)) {
        return response()->json(['error' => 'Kunne ikke generere Bilbasen-PDF.'], 502);
    }

    $fileName = 'bilbasen_listing_' . $contract->deal_id . '.pdf';
    $storageKey = "{$contract->deal_id}/{$contract->contract_type}/BILBASEN_DOC_{$fileName}";
    $contents = file_get_contents($pdfPath);
    $fileSize = filesize($pdfPath);
    $this->storage->put($storageKey, $contents);
    @unlink($pdfPath);

    $attachment = $contract->attachments()->create([
        'file_type'   => 'BILBASEN_DOC',
        'version'     => null,
        'file_name'   => $fileName,
        'mime_type'   => 'application/pdf',
        'storage_key' => $storageKey,
        'file_size'   => $fileSize,
        'created_by'  => $request->user()?->id ?? 'system',
    ]);

    $this->audit($contract->id, $attachment->id, 'attach', ['file_type' => 'BILBASEN_DOC']);

    return response()->json([
        'success'    => true,
        'attachment' => $this->formatAttachment($attachment),
    ]);
}
```

**BilbasenPdfService** (wkhtmltopdf or headless Chrome):

```php
// app/Services/BilbasenPdfService.php
namespace App\Services;

class BilbasenPdfService
{
    public function generateFromUrl(string $url): ?string
    {
        $outPath = sys_get_temp_dir() . '/bilbasen_' . uniqid() . '.pdf';
        // Option A: wkhtmltopdf
        $cmd = sprintf(
            'wkhtmltopdf --quiet %s %s 2>&1',
            escapeshellarg($url),
            escapeshellarg($outPath)
        );
        exec($cmd, $out, $code);
        if ($code !== 0 || !file_exists($outPath)) {
            return null;
        }
        return $outPath;

        // Option B: headless Chrome (e.g. Browsershot or puppeteer via node)
        // Browsershot::url($url)->save($outPath); return file_exists($outPath) ? $outPath : null;
    }
}
```

---

### 9.7 Delete attachment (only if not sent)

```php
public function destroy(Request $request, int $id): JsonResponse
{
    $attachment = ContractAttachment::findOrFail($id);
    $contract = $attachment->contract;
    $this->authorizeDeal($contract->deal_id);

    if ($contract->sent_to_signing_at) {
        return response()->json([
            'error' => 'Vedhæftninger er låst efter send til signering.',
        ], 403);
    }

    $this->storage->delete($attachment->storage_key);
    $this->audit($contract->id, $attachment->id, 'delete', ['file_type' => $attachment->file_type]);
    $attachment->delete();

    return response()->json(['success' => true]);
}
```

---

### 9.8 Locking on “Send til signering”

In your existing send job (e.g. when building the final package and calling Zoho/signer):

```php
// When sending:
$contract = Contract::where('deal_id', $recordId)->where('contract_type', $contractType)->first();
if (!$contract) {
    return response()->json(['error' => 'Kontrakt ikke fundet.'], 404);
}

$contract->sent_to_signing_at = now();
$contract->snapshot_attachments = $contract->attachments->map(fn ($a) => [
    'id' => $a->id, 'file_name' => $a->file_name, 'mime_type' => $a->mime_type,
    'storage_key' => $a->storage_key, 'file_type' => $a->file_type,
])->toArray();
$contract->save();

// Then proceed with PDF merge, Zoho, etc.
```

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| **Missing Bilbasen URL** | `generate-bilbasen` returns 422 with `code: MISSING_BILBASEN_URL`; UI can hide “Generer Bilbasen-dokument” or show message. |
| **Re-open Vedhæftede multiple times** | Auto-attach default docs is idempotent (by file_type + version). List attachments each time; no duplicate terms. |
| **Retry auto-attach** | Same as above; no duplicate TERMS/BUSINESS_TERMS. |
| **Concurrency: two tabs upload same contract** | Use DB unique key on (contract_id, file_type, version) for auto-attach; for manual uploads, allow multiple (different file names/timestamps). Optional: optimistic lock on `contract.updated_at` when adding/removing. |
| **Bilbasen URL unreachable (timeout)** | Catch exception in `BilbasenPdfService::generateFromUrl`; return 502 “Kunne ikke generere Bilbasen-PDF”; log and optionally retry once. |
| **File type TERMS/BUSINESS_TERMS missing on disk** | In `autoAttachDefaults`, skip that type and log; do not fail the whole request. |
| **Delete attachment that was already sent** | Check `sent_to_signing_at`; return 403 and do not delete. |
| **List attachments after send** | Return snapshot (or current read-only list); no add/delete. |

---

## 11. References

- **Frontend**: `components/features/contract-flow/VedhaeftedeStep.tsx` — “Filer fra dealen”, “Tilføj fil”.
- **API spec**: `docs/contracts-endpoints.md` — existing upload and send; extend with list, auto-attach, generate-bilbasen, delete.
- **PHP reference**: `reference/contracts/process_purchase_agreement_job.php` — `Bilbasen_Link`, terms merge, extra vedhæftninger.
