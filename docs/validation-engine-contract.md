# Validation Engine Contract | Flora – AI Powered Product Intelligence Platform

This document defines the integration boundary and data contract for the standalone Validation Engine in the **Flora – AI Powered Product Intelligence Platform**.

---

## 1. Purpose

The **Validation Engine** serves as a decoupled component of `flora-server` that evaluates structured JSON outputs returned by Gemini. It validates data types, checks formats, normalizes data representations, and calculates confidence ratings in-memory.

To preserve separation of concerns and ensure independent testability, the Validation Engine:

- **Does not** connect to or interact with MongoDB.
- **Does not** call the Google Gemini API or manage prompting.
- **Does not** implement Express routing, requests, or controllers.
- **Does not** implement document text/table parsing (OCR).
- **Does not** implement frontend presentation code (`flora-web`).

---

## 2. Function Signature & Inputs

The engine exposes one primary function:

```javascript
/**
 * Safely parses and validates the structured JSON string returned by Gemini.
 * @param {string} rawGeminiText - The raw JSON string returned by the Gemini AI API.
 * @returns {ValidationResult} The validation result object.
 */
function validateExtractedData(rawGeminiText) { ... }