# MongoDB Data Model Design | Flora – AI Powered Product Intelligence Platform

This document describes the persistence architecture and database schemas for **Flora – AI Powered Product Intelligence Platform**. It outlines the schema designs, index definitions, data integrity rules, and tracing relationships for the database **`flora_db`**.

---

## 1. Database Architecture & Design Decisions

### A. Referencing vs. Embedding
To support high performance and scalability in a 15-day hackathon, we utilize a **Referencing (Normalized)** approach for audit data while keeping the product inventory fast and lightweight:
* **Separation of Audit Logs**: Raw OCR text, tables, and raw Gemini responses are stored in a dedicated `processing_logs` collection instead of being embedded in `documents` or `products`. Documents with heavy raw text/markdown catalog structures can easily size up to several megabytes. Storing this raw audit data inside `products` would clutter indexes and risk hitting MongoDB's 16MB document size limit during query operations.
* **Separation of Validation Analysis**: Validation errors and warnings are kept in a separate `validation_logs` collection. This decouples business validation outputs from the canonical product data and allows auditing changes over time.
* **Traceability Links**: The `products` collection maintains three foreign key references (`documentId`, `processingLogId`, `validationLogId`) to link back to the exact ingestion pipeline audit trail.

### B. Decoupled Validation Engine
The Validation Engine operates on in-memory JSON objects and returns validation results. The Backend Persistence Layer in `flora-server` is responsible for saving these results to the `validation_logs` and `products` collections. This ensures that the Validation Engine is fully testable in isolation without database dependencies.

---

## 2. Ingestion & Processing Tracing Flow

The database structure supports end-to-end traceability of the document ingestion lifecycle:

```
[documents] 1 ─── 0..* [processing_logs] 1 ─── 0..* [validation_logs]
     │                           │                         │
     │ 1                         │ 1                       │ 1
     └────────────────── 0..* [products] ◄─────────────────┘
```

### Collection Cardinality and Referencing
1. **`documents` 1 ─── 0..* `processing_logs`**:
   * *Cardinality*: One document may undergo multiple processing attempts or reprocessing runs (e.g., if a retry is triggered, or if a user requests a reprocessing of an existing catalog document with updated parameters).
2. **`processing_logs` 1 ─── 0..* `validation_logs`**:
   * *Cardinality*: Each processing log attempt that successfully yields structured data is passed to the Validation Engine. To maintain an immutable audit trail, a new validation log record is created for each validation run (and for each subsequent manual override/correction session), preserving history rather than overwriting.
3. **`documents` 1 ─── 0..* `products`**:
   * *Cardinality*: A single document (such as a multi-page PDF catalogue) can contain and result in multiple extracted product records.
4. **`products` 1 ─── 1 `validation_logs`**:
   * *Cardinality*: A product record maintains a reference to its latest active `validation_log` to show the current validity status.
5. **`products` 1 ─── 1 `processing_logs`**:
   * *Cardinality*: A product record maintains a reference to the specific processing attempt that extracted it.

### Three-Reference Audit Traceability
The `products` collection stores references to `documentId`, `processingLogId`, and `validationLogId`. All three references are necessary for complete audit traceability:
* **`documentId`**: Identifies the original source file uploaded by the user, providing immediate access to the raw file name, size, type, and binary storage location.
* **`processingLogId`**: Identifies the exact processing attempt, linking the product to the specific OCR engine version, the raw extracted text, table structures, and the raw Gemini response content (`rawGeminiResponse`).
* **`validationLogId`**: Identifies the specific validation rules run (Level A and Level B) and the exact errors/warnings generated at the time of extraction or subsequent manual correction.

### Processing Failure & API Contract Status Conflict
If OCR extraction or Gemini processing completely fails and no canonical product data can be extracted:
* The file metadata remains represented in the `documents` collection (with a status of `"Failed"`).
* The failure details and stage are recorded in the `processing_logs` collection.
* **No record is created in the `products` collection.** A failed processing attempt must never be represented as a dummy or placeholder product record.

> [!IMPORTANT]
> **Integration Conflict & Recommendation**:
> The current API contract (`docs/api-contract.md`) lists `"Processing Failed"` as a product status. However, the MongoDB design intentionally does not create a product record when extraction completely fails, meaning a product document will never exist to hold the `"Processing Failed"` status.
> 
> * **Recommended Architecture**: 
>   * `products` status: `"Verified"` | `"Needs Review"`
>   * `documents` / processing lifecycle: `"Processing Failed"` (represented in the files list dashboard rather than the product catalogue).
> 
> This is a known integration design decision that **still requires a future update to the API contract documentation** to resolve the mismatch. The API contract has not yet been modified in this task.

---

## 3. Detailed Collection Specifications

### 1. `users` Collection
* **Purpose**: Authenticates platform users and defines access permissions (RBAC) in a lightweight schema.
* **Ownership**: Backend Engineer (`flora-server` authentication middleware).

#### Schema Fields
| Field Name | BSON Type | Required | Mutable | Description / Validation Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | No | MongoDB unique identifier. |
| `email` | String | Yes | Yes | Login email. Must be lowercase, unique, and match standard email regex. |
| `passwordHash`| String | Yes | Yes | Bcrypt-hashed password. |
| `fullName` | String | Yes | Yes | User's full name. |
| `role` | String | Yes | Yes | RBAC Role. Enum: `["ProductManager", "Admin"]`. |
| `isActive` | Boolean | Yes | Yes | Allows disabling user access. Default: `true`. |
| `createdAt` | Date | Yes | No | Auto-generated creation timestamp. |
| `updatedAt` | Date | Yes | Yes | Auto-generated update timestamp. |

#### Recommended Indexes
* `{ email: 1 }` (Unique) - Speeds up authentication lookups and guarantees email uniqueness.

#### Example MongoDB Document
```json
{
  "_id": { "$oid": "64d2a1535cf84f3e30d17101" },
  "email": "manager@flora-grow.com",
  "passwordHash": "$2b$10$eFzR3nJK9B8C5G9F2d8Z3e2W1hY9kRt6mZp1x6jQ9z8uG5h2Y6qFe",
  "fullName": "Jane Doe",
  "role": "ProductManager",
  "isActive": true,
  "createdAt": { "$date": "2026-08-09T02:00:00.000Z" },
  "updatedAt": { "$date": "2026-08-09T02:00:00.000Z" }
}
```

---

### 2. `documents` Collection
* **Purpose**: Tracks metadata of uploaded catalog source documents.
* **Ownership**: Backend Engineer (`flora-server` file upload router).

#### Schema Fields
| Field Name | BSON Type | Required | Mutable | Description / Validation Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | No | MongoDB unique identifier. |
| `filename` | String | Yes | No | Original name of the uploaded file. Immutable. |
| `fileSize` | Number | Yes | No | Size in bytes. Max limit: 10MB. Immutable. |
| `mimeType` | String | Yes | No | Checked file type. Enum: `["application/pdf", "image/png", "image/jpeg", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]`. Immutable. |
| `storagePath` | String | Yes | No | Server storage disk path or cloud storage URI. Immutable. |
| `uploadedBy` | ObjectId | Yes | No | Reference to `users._id`. Immutable. |
| `status` | String | Yes | Yes | Ingestion status. Enum: `["Uploaded", "Processing", "Processed", "Failed"]`. |
| `createdAt` | Date | Yes | No | Date/time document was uploaded. Immutable. |
| `updatedAt` | Date | Yes | Yes | Last status change timestamp. |

#### Recommended Indexes
* `{ uploadedBy: 1 }` - Supports retrieving upload history by user.
* `{ status: 1 }` - Supports loading actively processing document queues.

#### Example MongoDB Document
```json
{
  "_id": { "$oid": "64d2b2745cf84f3e30d17201" },
  "filename": "flora_grow_catalog.pdf",
  "fileSize": 450210,
  "mimeType": "application/pdf",
  "storagePath": "uploads/2026-08/64d2b2745cf84f3e30d17201.pdf",
  "uploadedBy": { "$oid": "64d2a1535cf84f3e30d17101" },
  "status": "Processed",
  "createdAt": { "$date": "2026-08-09T02:15:00.000Z" },
  "updatedAt": { "$date": "2026-08-09T02:16:30.000Z" }
}
```

---

### 3. `processing_logs` Collection
* **Purpose**: Tracks explicit execution runs of the processing pipeline, saving OCR text and raw Gemini responses for audits.
* **Ownership**: OCR Engineer (OCR step tracking) and Team Leader (Gemini SDK step tracking).

#### Schema Fields
| Field Name | BSON Type | Required | Mutable | Description / Validation Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | No | MongoDB unique identifier. |
| `documentId` | ObjectId | Yes | No | Reference to `documents._id`. |
| `stage` | String | Yes | No | Pipeline step currently running or where execution failed. Enum: `["OCR", "GeminiProcessing", "Validation"]`. |
| `status` | String | Yes | No | Run status. Enum: `["Started", "Completed", "Failed"]`. |
| `ocrEngine` | String | Yes | No | Library used. Enum: `["pdf-parse", "tesseract.js", "xlsx"]`. |
| `rawOcrText` | String | Yes | No | Cleaned UTF-8 string extracted from the document by OCR. |
| `tableMarkdown`| String | No | No | Extracted markdown tables (empty string if none). |
| `geminiModel` | String | Yes | No | The model configured via environment variable `GEMINI_MODEL`. |
| `rawGeminiResponse`| String | No | No | Exact raw JSON string response returned by Gemini API. Null if fails. |
| `retryCount` | Number | Yes | No | Number of retries performed during this run. |
| `startedAt` | Date | Yes | No | Timestamp when the pipeline execution started. |
| `completedAt` | Date | No | No | Timestamp when execution ended (null if failed). |
| `durationMs` | Number | No | No | Run duration in milliseconds (null if failed). |
| `error` | Object | No | No | Details of processing errors if status is `"Failed"`. |

#### Difference Between Stage and Status
* **`stage`**: Refers to the physical step or component in the processing pipeline where the log is currently active or encountered an issue. 
  * `"OCR"`: Document is undergoing text/table layout extraction.
  * `"GeminiProcessing"`: Unstructured extracted text is being structured by the Gemini AI interface.
  * `"Validation"`: Structured data is being checked against schema and business validation rules.
* **`status`**: Refers to the execution outcome of that step or the overall run.
  * `"Started"`: The pipeline stage has initiated.
  * `"Completed"`: The pipeline completed all stages successfully.
  * `"Failed"`: The pipeline stopped execution due to a fatal error at the designated stage.

#### Recommended Indexes
* `{ documentId: 1 }` - Fast lookup of all processing attempts associated with a document.

#### Example MongoDB Document
```json
{
  "_id": { "$oid": "64d2b2aa5cf84f3e30d17302" },
  "documentId": { "$oid": "64d2b2745cf84f3e30d17201" },
  "stage": "Validation",
  "status": "Completed",
  "ocrEngine": "pdf-parse",
  "rawOcrText": "FloraGrow Brand Grow Tent SKU: FLORA-GT-100 Price: $120.00 Currency: USD",
  "tableMarkdown": "",
  "geminiModel": "gemini-1.5-flash",
  "rawGeminiResponse": "{\n  \"productName\": \"Grow Tent\",\n  \"sku\": \"FLORA-GT-100\",\n  \"description\": \"Premium grow tent\",\n  \"brand\": \"FloraGrow\",\n  \"price\": 120.00,\n  \"currency\": \"USD\"\n}",
  "retryCount": 0,
  "startedAt": { "$date": "2026-08-09T02:15:10.000Z" },
  "completedAt": { "$date": "2026-08-09T02:15:15.000Z" },
  "durationMs": 5000
}
```

---

### 4. `validation_logs` Collection
* **Purpose**: Stores immutable audit records of Level A and Level B validation results for processed data.
* **Ownership**: Team Leader (Validation Engine design).

#### Schema Fields
| Field Name | BSON Type | Required | Mutable | Description / Validation Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | No | MongoDB unique identifier. |
| `documentId` | ObjectId | Yes | No | Reference to `documents._id`. |
| `processingLogId`| ObjectId | Yes | No | Reference to `processing_logs._id`. |
| `isValid` | Boolean | Yes | No | `true` if Level A and Level B validations contain zero errors. |
| `errors` | Array[Object]| Yes | No | Immutable list of error structures (defined below). |
| `warnings` | Array[Object]| Yes | No | Immutable list of warning structures (defined below). |
| `confidence` | Object | No | No | Confidence details (defined below). |
| `confidence.score`| Number | Yes | No | Integer from `0` to `100`. |
| `confidence.evidenceLevel`| String | Yes | No | Strength of extraction match. Enum: `["High", "Medium", "Low"]`. |
| `confidence.evidence`| Array[Str] | Yes | No | Array of strings verifying data placement in text. |
| `validatedAt` | Date | Yes | No | Timestamp of the validation run. |

#### Error/Warning Field Schema
* `field` (String, Required): Field name from Canonical Product (e.g. `"price"`).
* `message` (String, Required): Text describing the validation failure.
* `value` (Mixed, Optional): The rejected value.

#### Audit Immutability Rules
* All field attributes in this collection are strictly **Immutable**. If a user submits a manual correction to a product, the validation engine re-runs and the backend saves a *new* validation log record referencing the updated document state, maintaining the audit history.

#### Recommended Indexes
* `{ processingLogId: 1 }` - Maps validation results to a specific processing attempt.

#### Example MongoDB Document
```json
{
  "_id": { "$oid": "64d2b2ba5cf84f3e30d17403" },
  "documentId": { "$oid": "64d2b2745cf84f3e30d17201" },
  "processingLogId": { "$oid": "64d2b2aa5cf84f3e30d17302" },
  "isValid": true,
  "errors": [],
  "warnings": [],
  "confidence": {
    "score": 95,
    "evidenceLevel": "High",
    "evidence": ["SKU matches format pattern", "Price matched currency structure"]
  },
  "validatedAt": { "$date": "2026-08-09T02:15:20.000Z" }
}
```

---

### 5. `products` Collection
* **Purpose**: Contains the inventory catalog of extracted and corrected products.
* **Ownership**: Team Leader (Schema definitions) and Backend Engineer (Product Inventory endpoints).

#### Schema Fields
| Field Name | BSON Type | Required | Mutable | Description / Validation Constraints |
| :--- | :--- | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | No | MongoDB unique identifier. |
| `documentId` | ObjectId | Yes | No | Reference to `documents._id` (source file track). |
| `processingLogId`| ObjectId | Yes | No | Reference to `processing_logs._id` (source run track). |
| `validationLogId`| ObjectId | Yes | Yes | Reference to latest active `validation_logs._id` audit record. |
| `status` | String | Yes | Yes | Product review state. Enum: `["Verified", "Needs Review"]`. |
| `productData` | Object | Yes | Yes | Nested object enclosing **Canonical Product Object** fields. |
| `productData.productName`| String| Yes | Yes | Product name. Cannot be empty. Truncated if > 255 chars. |
| `productData.sku` | String | Yes | Yes | Stock Keeping Unit. Must match: `/^[A-Z0-9\-_]{3,50}$/i`. |
| `productData.description`| String| No | Yes | Text description. Default to empty string. |
| `productData.brand` | String | Yes | Yes | Brand. Evaluated against configurable whitelist. |
| `productData.price` | Number | Yes | Yes | Positive decimal price (`price > 0.0`). |
| `productData.currency` | String | Yes | Yes | 3-letter currency code (ISO 4217). |
| `productData.dimensions`| String | No | Yes | Physical dimensions string. |
| `productData.specifications`| Object| No | Yes | Flat object of key-value string specifications. |
| `productData.complianceFlags`| Array[Str]| No | Yes | Certifications and safety standard flags. |
| `lastModifiedBy`| ObjectId | Yes | Yes | Reference to `users._id` (tracks who updated/uploaded the item). |
| `createdAt` | Date | Yes | No | Product creation date. |
| `updatedAt` | Date | Yes | Yes | Tracked timestamp of last override/change. |

#### Product Status Alignment
* The `products` collection only houses records where parsing was successful enough to produce a canonical product shape. Thus, its status is either `"Verified"` or `"Needs Review"`. 
* If document parsing or AI extraction fails completely, no record is added to this collection. The status `"Processing Failed"` is tracked at the `documents` and `processing_logs` level and served directly to the client API response.

#### Recommended Indexes
* `{ "productData.sku": 1, "productData.brand": 1 }` (Unique) - Enforces SKU uniqueness within a single Brand. This compound unique index is a Flora business rule ensuring brands cannot duplicate SKUs within their catalogues, while allowing different brands to utilize identical SKU values.
* `{ status: 1 }` - Optimizes listing filtering on the dashboard review page.
* `{ "productData.productName": 1, "productData.sku": 1 }` - Compound index to speed up the dashboard's basic searches which are primarily on productName or SKU.

#### Example MongoDB Document
```json
{
  "_id": { "$oid": "64d2b2c45cf84f3e30d17505" },
  "documentId": { "$oid": "64d2b2745cf84f3e30d17201" },
  "processingLogId": { "$oid": "64d2b2aa5cf84f3e30d17302" },
  "validationLogId": { "$oid": "64d2b2ba5cf84f3e30d17403" },
  "status": "Verified",
  "productData": {
    "productName": "Flora Grow Tent",
    "sku": "FLORA-GT-100",
    "description": "Premium grow tent",
    "brand": "FloraGrow",
    "price": 120.00,
    "currency": "USD",
    "dimensions": "100 x 100 x 200 cm",
    "specifications": {},
    "complianceFlags": []
  },
  "lastModifiedBy": { "$oid": "64d2a1535cf84f3e30d17101" },
  "createdAt": { "$date": "2026-08-09T02:15:25.000Z" },
  "updatedAt": { "$date": "2026-08-09T02:15:25.000Z" }
}
```

---

## 4. Indexing Strategy

1. **`users` unique index (`{ email: 1 }`)**:
   * *Rationale*: Speeds up authentication lookups and prevents duplicate usernames.
2. **`products` Compound unique index (`{ "productData.sku": 1, "productData.brand": 1 }` - Unique)**:
   * *Rationale*: Enforces the Flora business rule that SKU values must be unique *within* the scope of a single Brand, avoiding global SKU conflicts across different suppliers.
3. **`products` Search index (`{ "productData.productName": 1, "productData.sku": 1 }`)**:
   * *Rationale*: Optimizes dashboard lookups matching the API contract search functionality (searching primarily on productName or SKU). Full-text description search is excluded.
4. **Status indexing (`{ status: 1 }` on `products` and `documents`)**:
   * *Rationale*: Prevents full collection scans when filtering processed products or processing queues.
5. **Foreign key lookup indexes (`documentId`, `processingLogId`, `validationLogId`)**:
   * *Rationale*: Speeds up MongoDB aggregation queries joining tracing logs and inventories.

---

## 5. Data Integrity Rules

1. **Strict Reference Validation**:
   * Every database operation creating links between files, processing tasks, validation results, and products must verify that the referenced `_id` is present and active in the target collection.
2. **Immutability of Source Metadata & Audits**:
   * Original source metadata in `documents` (filename, file size, mime-type, uploader) is immutable.
   * `processing_logs` and `validation_logs` are strictly read-only after creation. Any corrections or updates run a new verification session, creating new logs rather than updating old ones.
3. **Unique SKU Enforcements**:
   * Product overrides or creations are blocked if they duplicate a SKU within the same brand.

---

## 6. Security and Privacy Considerations

1. **Bcrypt Credentials Hashing**:
   * The `users` collection stores passwords using bcrypt hashes. Plaintext passwords must never enter the database.
2. **Endpoint RBAC Verification**:
   * Backend routers check users session/token roles (`"Admin"` or `"ProductManager"`) before running read or write queries on target collections.
3. **Parameter Sanitization**:
   * To prevent NoSQL injection, queries avoid using raw client inputs in evaluations or script functions, strictly passing values via parameter binding.
4. **Isolated Database URI**:
   * Connection URIs are stored in a server-side `.env` configuration, keeping production secrets isolated from the codebase.

---

## Revision Summary

Applied the following corrections to the MongoDB model design:
1. **Confidence Scale**: Set confidence scale values to range from `0` to `100` (`score`) with `evidenceLevel` and `evidence` fields, removing unsupported Gemini API metadata dependencies.
2. **Pipeline Log Expansion**: Added execution tracing fields (`stage`, `status`, `startedAt`, `completedAt`, `durationMs`, and `error`) to the `processing_logs` collection. Set `stage` enums strictly to `"OCR"`, `"GeminiProcessing"`, and `"Validation"`. Explained that `stage` represents the pipeline component while `status` represents the outcome.
3. **Reprocessing Cardinality**: Updated model to support a 1-to-many relationship between `documents` and `processing_logs`, enabling multiple processing runs per document.
4. **Validation Immutability**: Marked `validation_logs` as strictly immutable audit records. Any manual correction generates a new validation log instead of updating the previous record in place.
5. **Source File Immutability**: Marked core file metadata (`filename`, `fileSize`, `mimeType`, `uploadedBy`, `storagePath`) in the `documents` collection as immutable.
6. **Processing Failures & Product Creation**: Documented that failed pipeline executions do not produce dummy product entries in `products`. Instead, failure states are represented at the `documents` and `processing_logs` level.
7. **Canonical Products Collection**: Refined the `products` collection structure to strictly hold canonical product records (either `"Verified"` or `"Needs Review"`). Explicitly noted the status mismatch regarding `"Processing Failed"` in the API contract as an integration decision requiring a future API contract documentation update.
8. **Products Traceability References**: Added `processingLogId` back to the `products` collection fields. Documented why all three foreign keys (`documentId`, `processingLogId`, and `validationLogId`) are required for audit traceability.
9. **SKU Uniqueness Business Rule**: Described the SKU-Brand compound unique index as a specific Flora business rule to resolve conflicts between brands.
10. **Search Indices**: Realigned product search indexes to focus strictly on `productName` and `sku`, omitting the `description` search.
11. **Lightweight Users Model**: Cleaned up the `users` schema to keep it focused strictly on database field definitions rather than auth implementations.
12. **Cardinality Explanations**: Added a clear referencing map section detailing the exact cardinality relations between collections.
13. **Consistency Review**: Removed contradictory mutable definitions from the audit log collection field tables, marking validation outputs and raw logs as immutable.
