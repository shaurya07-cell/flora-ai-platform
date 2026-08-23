# FLORA AI Product Intelligence Engine — Backend Integration Specification

This document defines the interface, data contracts, execution workflow, and security boundaries for integrating the standalone Python **Flora Intelligence Engine** with the main **FLORA AI Platform** Node.js/Express backend.

---

## 1. Primary Python Integration Entry Point

The engine provides a single, stateless, deterministic entry point:

```python
from pipeline import run_pipeline

# Public Execution API
result = run_pipeline(product, catalog=None)
```

- **`product`**: `dict` representing a single product record (raw or normalized).
- **`catalog`**: Optional `list` of dicts representing candidate reference products for similarity matching.

---

## 2. Security & Data Isolation Architecture

> [!IMPORTANT]
> **Zero Database Access in Python Engine**
> The Python Intelligence Engine is strictly **stateless and isolated**. It contains **no database connection drivers** (MongoDB, Mongoose) and **no direct database access**.
>
> **Security Boundaries**:
> 1. The **Node.js backend** authenticates users, verifies authorization, and queries MongoDB for the user's accessible product catalog.
> 2. Node.js serializes the target product and permitted catalog records into JSON.
> 3. Node.js passes these payloads to the Python engine (via CLI invocation or a lightweight internal IPC/service bridge).
> 4. The Python engine processes the input deterministically and returns a structured JSON intelligence result.
> 5. Node.js saves or renders the result.

---

## 3. Pipeline Stages & Output Contract

The pipeline executes 5 sequential stages:

1. **`validation`**: Checks input against `schemas/product_schema.json` rules (required fields: `id`, `name`, `brand`, `model`, `category`). Returns `is_valid: bool` and `errors: List[str]`.
2. **`normalization`**: Returns a sanitized, normalized product object (whitespace stripped, title-cased categories, snake_cased spec keys) without mutating input in-place.
3. **`classification`**: Classifies product into taxonomy categories (`taxonomy/categories.json`), returning `canonical_category`, `category_id`, `subcategory`, `confidence` (0.0 to 1.0), and `matched_by`.
4. **`quality`**: Evaluates completeness score (0-100%), required field coverage (0.0-1.0), taxonomy expected specification coverage (0.0-1.0), schema validity score (0.0-1.0), overall `quality_score` (0.0-100.0), and actionable `issues`.
5. **`similarity`**: Compares target product against candidate `catalog` products across model, brand, name, category, and specifications to return `candidates_compared`, `top_match`, and `candidate_duplicates`.

---

## 4. Input & Output Contract Examples

### Example Input Product Payload (`product`)
```json
{
  "id": "FLSV200",
  "name": "Flora Smart Valve",
  "brand": "FloraGrow",
  "model": "FLSV200",
  "category": "Smart Valve",
  "specifications": {
    "pressure": "10 bar",
    "weight": "2 kg"
  }
}
```

### Example Output Contract (`result`)
```json
{
  "input": {
    "id": "FLSV200",
    "name": "Flora Smart Valve",
    "brand": "FloraGrow",
    "model": "FLSV200",
    "category": "Smart Valve",
    "specifications": {
      "pressure": "10 bar",
      "weight": "2 kg"
    }
  },
  "validation": {
    "is_valid": true,
    "errors": []
  },
  "normalization": {
    "id": "FLSV200",
    "name": "Flora Smart Valve",
    "brand": "FloraGrow",
    "model": "FLSV200",
    "category": "Smart Valve",
    "specifications": {
      "pressure": "10 bar",
      "weight": "2 kg"
    }
  },
  "classification": {
    "canonical_category": "Smart Valve",
    "category_id": "CAT_VALVE",
    "subcategory": null,
    "confidence": 1.0,
    "matched_by": "category_exact"
  },
  "quality": {
    "quality_score": 85.83,
    "completeness_score": 75.0,
    "required_field_coverage": 1.0,
    "expected_spec_coverage": 0.6667,
    "validity_score": 1.0,
    "is_valid_schema": true,
    "issues": [
      {
        "field": "subcategory",
        "severity": "info",
        "message": "Product subcategory is not specified."
      },
      {
        "field": "specifications.flow_rate",
        "severity": "warning",
        "message": "Expected specification 'flow_rate' for category 'Smart Valve' is missing."
      }
    ]
  },
  "similarity": {
    "candidates_compared": 10,
    "top_match": {
      "product_a_id": "FLSV200",
      "product_b_id": "P010",
      "overall_similarity": 0.275,
      "model_similarity": 0.5,
      "name_similarity": 0.2,
      "brand_similarity": 0.0,
      "category_similarity": 0.0,
      "specifications_similarity": 0.5,
      "is_candidate_duplicate": false
    },
    "candidate_duplicates": []
  }
}
```

---

## 5. Error Behavior & Non-Crashing Contract

The engine guarantees structured output even when inputs are malformed or invalid:
- **Non-dict Input**: Returns `validation.is_valid = false` with descriptive error message rather than throwing exception.
- **Invalid Schema / Missing Fields**: Validation stage captures errors, quality score adjusts proportionally, and process completes smoothly.
- **Unknown Category**: Classification returns `canonical_category: null`, `confidence: 0.0`, `matched_by: "unknown"`.
- **`catalog=None` or Empty Catalog**: Similarity stage sets `candidates_compared: 0`, `top_match: null`, `candidate_duplicates: []`.

---

## 6. Recommended Node.js Integration Patterns

### Option A: Child Process Invocation (CLI Bridge)
Node.js executes `main.py` via `child_process.execFile` or `spawn`:
```javascript
const { execFile } = require('child_process');

function analyzeProduct(product, catalog) {
  return new Promise((resolve, reject) => {
    const inputPath = '/tmp/input_product.json';
    const catalogPath = '/tmp/catalog.json';
    
    // Save temporary JSON payloads...
    execFile('python', ['main.py', '--input', inputPath, '--catalog', catalogPath], (error, stdout, stderr) => {
      if (error) return reject(stderr);
      resolve(JSON.parse(stdout));
    });
  });
}
```

### Option B: Internal REST Service (FastAPI / Flask Bridge)
For high-frequency processing, wrap `run_pipeline` in a lightweight Python HTTP microservice:
```python
from fastapi import FastAPI
from pipeline import run_pipeline

app = FastAPI()

@app.post("/analyze")
def analyze(payload: dict):
    product = payload.get("product")
    catalog = payload.get("catalog")
    return run_pipeline(product, catalog=catalog)
```
