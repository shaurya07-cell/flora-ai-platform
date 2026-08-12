# AI and Validation Specification | Flora – AI Powered Product Intelligence Platform

This document defines the AI extraction, normalization, validation, confidence
classification, and failure-handling rules for Flora.

The specification provides the integration boundary between OCR/document
processing, Gemini, the Validation Engine, MongoDB persistence, and API consumers.

---

## 1. Responsibility

The AI and Validation layer is responsible for:

1. Receiving normalized document/product content.
2. Extracting structured product information using Gemini.
3. Normalizing extracted values into Flora's canonical product structure.
4. Validating required fields and business rules.
5. Calculating Flora's confidence score.
6. Classifying confidence as High, Medium, or Low.
7. Producing a deterministic validation result.
8. Providing traceable validation information for persistence and review.

Gemini is an extraction/intelligence component.

Gemini does not determine Flora's final confidence classification.

---

## 2. Processing Pipeline

The expected processing flow is:

```text
Input Document
      |
      v
OCR / File Parsing
      |
      v
Normalized Document Content
      |
      v
Gemini Extraction
      |
      v
Structured Product Data
      |
      v
Normalization
      |
      v
API / Schema Validation
      |
      v
Business Validation
      |
      v
Flora Confidence Calculation
      |
      +----------------------+
      |                      |
      v                      v
   Verified              Needs Review
      |                      |
      +----------+-----------+
                 |
                 v
             Persistence    