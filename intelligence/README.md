# Flora Product Data Intelligence Engine

Standalone product data intelligence, schema validation, normalization, taxonomy classification, quality scoring, and duplicate matching engine for the **FLORA AI Platform**.

---

## Purpose

The Flora Intelligence Engine receives structured or extracted product JSON objects and produces a unified intelligence output:
- Schema compliance validation
- Deterministic attribute and specification key normalization
- Rule-based product classification into Flora taxonomy categories
- Comprehensive quality scoring (completeness, coverage, validity)
- Pairwise fuzzy similarity scoring and candidate duplicate detection

---

## Architecture Overview

```
flora-ai-work/
├── main.py                     # CLI entry point
├── pipeline.py                 # Core pipeline orchestrator (run_pipeline)
├── run_tests.py                # Standalone test suite runner
├── INTELLIGENCE_INTEGRATION.md # Backend integration specification
├── schemas/                    # Zero-dependency schema validator & JSON schema
├── normalization/              # Non-mutating text cleaning & spec key normalizer
├── classification/             # Taxonomy-driven category & subcategory classifier
├── quality/                    # Data quality evaluator & issue extractor
├── similarity/                 # Fuzzy & token pairwise similarity matcher
├── taxonomy/                   # JSON taxonomy repository (categories.json)
├── data/                       # Mock raw & normalized product datasets
└── tests/                      # Pipeline integration test suite
```

---

## Installation & Setup

### Requirements
- Python 3.9+ (no mandatory external runtime dependencies required for core execution).

### Quick Setup
Clone or extract the module and verify execution:
```bash
python main.py
```

---

## Running the Pipeline

### Python API Usage
```python
from pipeline import run_pipeline

product = {
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

result = run_pipeline(product, catalog=None)
print(result["quality"]["quality_score"])
```

---

## CLI Usage

### Run Default Sample
```bash
python main.py
```

### Process Input File
```bash
python main.py --input data/raw/mock_products.json
```

### Process Input with Reference Catalog
```bash
python main.py --input input_product.json --catalog data/raw/mock_products.json --output result.json
```

---

## Running Tests

Execute the full test suite via `run_tests.py` or standard `unittest`:

```bash
python run_tests.py
```
or
```bash
python -m unittest discover -s . -p "test_*.py"
```

---

## Output Contract Structure

```json
{
  "input": { ... },
  "validation": {
    "is_valid": true,
    "errors": []
  },
  "normalization": { ... },
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
    "issues": []
  },
  "similarity": {
    "candidates_compared": 10,
    "top_match": { ... },
    "candidate_duplicates": []
  }
}
```

---

## Integration Boundary

> [!NOTE]
> This module is a **standalone, stateless engine**. It does not directly connect to MongoDB, Node.js Express servers, Gemini AI models, or OCR services. Node.js backend integration details are specified in [INTELLIGENCE_INTEGRATION.md](file:///c:/Users/SHAURYA/OneDrive/Desktop/flora-ai-platform-feature-flora-ai-work/INTELLIGENCE_INTEGRATION.md).