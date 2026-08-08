# Flora – Validation Test Cases

This document defines the validation scenarios that must be used to verify
Flora's API validation, business validation, confidence classification,
processing status handling, and persistence behavior.

The test cases are derived from the current API and MongoDB contracts.

---

## 1. Validation Levels

Flora uses two validation levels:

1. API / Schema Validation
2. Business Validation

API / Schema validation protects the backend from malformed requests,
invalid payload types, unsupported MIME types, and oversized uploads.

Business validation verifies whether the processed product data satisfies
Flora's business rules before persistence.

---

## 2. Confidence Classification

| Confidence Score | Classification |
|---|---|
| >= 90 | High |
| >= 70 and < 90 | Medium |
| < 70 | Low |

Confidence is calculated by Flora's Validation Engine.

Gemini/provider confidence metadata is not required.

---

## 3. Product Status Rules

| Scenario | Expected Product Status |
|---|---|
| Product passes business validation | Verified |
| Product requires manual review | Needs Review |
| Processing fails | No placeholder product is created |

---

## 4. Processing Lifecycle

Expected document/processing lifecycle:

```text
Uploaded
   ↓
Processing
   ↓
Processed
   ↓
Business Validation
   ↓
Verified / Needs Review