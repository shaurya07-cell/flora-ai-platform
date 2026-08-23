"""
Quality Engine Module for Flora Product Data Intelligence Engine.

Provides deterministic data quality evaluation including completeness metrics,
required field coverage, schema validity indicators, taxonomy expected-specification
coverage, overall quality scoring, and actionable issue extraction.
"""

import copy
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from schemas.validator import validate_product, REQUIRED_FIELDS, ALLOWED_TOP_LEVEL_FIELDS

TAXONOMY_PATH = Path(__file__).parent.parent / "taxonomy" / "categories.json"


def _load_expected_specs_map(taxonomy_file: Path = TAXONOMY_PATH) -> Dict[str, List[str]]:
    """Load taxonomy and map canonical category names & aliases to expected specifications."""
    specs_map: Dict[str, List[str]] = {}
    if not taxonomy_file.exists():
        return specs_map

    try:
        with open(taxonomy_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        for cat in data.get("categories", []):
            expected = cat.get("expected_specifications", [])
            canonical = cat.get("canonical_name", "").strip().lower()
            if canonical:
                specs_map[canonical] = expected

            for alias in cat.get("aliases", []):
                alias_clean = alias.strip().lower()
                if alias_clean and alias_clean not in specs_map:
                    specs_map[alias_clean] = expected
    except Exception:
        pass

    return specs_map


class QualityEvaluator:
    """
    Evaluator engine for scoring product data quality and identifying actionable quality issues.
    """

    def __init__(self, taxonomy_file: Path = TAXONOMY_PATH):
        self.taxonomy_file = taxonomy_file
        self.expected_specs_map = _load_expected_specs_map(taxonomy_file)

    def evaluate(
        self,
        product: Dict[str, Any],
        classification_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate quality of a product record.

        Args:
            product: Product dictionary (raw or normalized).
            classification_result: Optional result from CategoryClassifier.classify_product().

        Returns:
            Dictionary containing quality metrics and actionable issues:
            {
                "quality_score": float (0.0 to 100.0),
                "completeness_score": float (0.0 to 100.0),
                "required_field_coverage": float (0.0 to 1.0),
                "expected_spec_coverage": float (0.0 to 1.0),
                "validity_score": float (0.0 to 1.0),
                "is_valid_schema": bool,
                "issues": List[Dict[str, str]]
            }
        """
        if not isinstance(product, dict):
            return {
                "quality_score": 0.0,
                "completeness_score": 0.0,
                "required_field_coverage": 0.0,
                "expected_spec_coverage": 0.0,
                "validity_score": 0.0,
                "is_valid_schema": False,
                "issues": [
                    {
                        "field": "product",
                        "severity": "error",
                        "message": f"Expected dict input, got {type(product).__name__}"
                    }
                ]
            }

        issues: List[Dict[str, str]] = []

        # 1. Schema Validation
        is_valid_schema, schema_errors = validate_product(product)
        if is_valid_schema:
            validity_score = 1.0
        else:
            validity_score = max(0.0, round(1.0 - (len(schema_errors) * 0.2), 4))
            for err in schema_errors:
                issues.append({
                    "field": "schema",
                    "severity": "error",
                    "message": err
                })

        # 2. Required Field Coverage
        covered_required = 0
        for field in sorted(REQUIRED_FIELDS):
            val = product.get(field)
            if val is not None and isinstance(val, str) and val.strip() != "":
                covered_required += 1
            else:
                if not any(i["field"] == field for i in issues):
                    issues.append({
                        "field": field,
                        "severity": "error",
                        "message": f"Required top-level field '{field}' is missing or empty."
                    })

        req_coverage = round(covered_required / len(REQUIRED_FIELDS), 4)

        # 3. Overall Field Completeness
        eval_fields = ["id", "name", "brand", "model", "category", "subcategory", "specifications", "source"]
        populated_count = 0

        for field in eval_fields:
            val = product.get(field)
            if val is None:
                continue
            if isinstance(val, str) and val.strip() != "":
                populated_count += 1
            elif isinstance(val, dict) and len(val) > 0:
                populated_count += 1
            elif isinstance(val, (int, float, bool)):
                populated_count += 1

        completeness_ratio = populated_count / len(eval_fields)
        completeness_score = round(completeness_ratio * 100.0, 2)

        # Additional field warnings
        if not product.get("specifications"):
            issues.append({
                "field": "specifications",
                "severity": "warning",
                "message": "Product specifications dictionary is missing or empty."
            })
        if not product.get("subcategory"):
            issues.append({
                "field": "subcategory",
                "severity": "info",
                "message": "Product subcategory is not specified."
            })

        # 4. Expected Specification Coverage from Taxonomy
        canonical_category = None
        if classification_result and isinstance(classification_result, dict):
            canonical_category = classification_result.get("canonical_category")

        if not canonical_category and product.get("category"):
            canonical_category = str(product.get("category")).strip()

        expected_specs: List[str] = []
        if canonical_category:
            expected_specs = self.expected_specs_map.get(canonical_category.lower(), [])

        specs_dict = product.get("specifications") or {}
        if not isinstance(specs_dict, dict):
            specs_dict = {}

        present_spec_keys: Set[str] = {
            str(k).strip().lower().replace(" ", "_").replace("-", "_")
            for k, v in specs_dict.items()
            if v is not None and str(v).strip() != ""
        }

        if expected_specs:
            found_specs = 0
            for exp in expected_specs:
                exp_norm = exp.strip().lower().replace(" ", "_").replace("-", "_")
                if exp_norm in present_spec_keys:
                    found_specs += 1
                else:
                    issues.append({
                        "field": f"specifications.{exp}",
                        "severity": "warning",
                        "message": f"Expected specification '{exp}' for category '{canonical_category}' is missing."
                    })
            spec_coverage = round(found_specs / len(expected_specs), 4)
        else:
            spec_coverage = 1.0 if len(present_spec_keys) > 0 else 0.5

        # 5. Aggregate Quality Score (0.0 to 100.0)
        overall_score = (
            (40.0 * req_coverage) +
            (0.30 * completeness_score) +
            (20.0 * spec_coverage) +
            (10.0 * validity_score)
        )
        quality_score = round(min(100.0, max(0.0, overall_score)), 2)

        return {
            "quality_score": quality_score,
            "completeness_score": completeness_score,
            "required_field_coverage": req_coverage,
            "expected_spec_coverage": spec_coverage,
            "validity_score": validity_score,
            "is_valid_schema": is_valid_schema,
            "issues": issues
        }


# Default singleton instance
_default_evaluator: Optional[QualityEvaluator] = None


def get_evaluator() -> QualityEvaluator:
    """Get or create default QualityEvaluator singleton instance."""
    global _default_evaluator
    if _default_evaluator is None:
        _default_evaluator = QualityEvaluator()
    return _default_evaluator


def evaluate_product_quality(
    product: Dict[str, Any],
    classification_result: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluate quality of a single product record using default evaluator instance.
    """
    return get_evaluator().evaluate(product, classification_result)
