"""
Central Intelligence Pipeline Orchestrator for Flora Product Data Intelligence Engine.

Orchestrates input validation, normalization, classification, quality evaluation,
and similarity matching into a unified, structured intelligence result.
"""

import copy
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from schemas.validator import validate_product
from normalization.normalizer import normalize_product
from classification.classifier import classify_product
from quality.evaluator import evaluate_product_quality
from similarity.matcher import compare_products


class FloraIntelligencePipeline:
    """
    Modular intelligence pipeline that orchestrates Flora product analysis modules.
    """

    def __init__(self, catalog: Optional[List[Dict[str, Any]]] = None):
        self.catalog: List[Dict[str, Any]] = catalog or []

    def set_catalog(self, catalog: List[Dict[str, Any]]) -> None:
        """Update reference catalog dataset used for similarity matching."""
        if not isinstance(catalog, list):
            raise TypeError(f"Expected catalog to be a list, got {type(catalog).__name__}")
        self.catalog = catalog

    def analyze_product(
        self,
        product: Dict[str, Any],
        catalog: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Execute full intelligence pipeline on a single product object.

        Workflow:
        1. Schema Validation
        2. Data Normalization
        3. Category Classification
        4. Quality Evaluation
        5. Pairwise Similarity & Duplicate Analysis against Catalog

        Returns:
            Structured intelligence result dict matching Flora contract.
        """
        raw_input = copy.deepcopy(product)
        target_catalog = catalog if catalog is not None else self.catalog

        # Non-dict guard clause
        if not isinstance(raw_input, dict):
            val_err = f"Expected product to be a dict, got {type(raw_input).__name__}"
            return {
                "input": raw_input,
                "validation": {"is_valid": False, "errors": [val_err]},
                "normalization": raw_input,
                "classification": {
                    "canonical_category": None,
                    "category_id": None,
                    "subcategory": None,
                    "confidence": 0.0,
                    "matched_by": "unknown"
                },
                "quality": evaluate_product_quality(raw_input),
                "similarity": {
                    "candidates_compared": 0,
                    "top_match": None,
                    "candidate_duplicates": []
                }
            }

        # 1. Schema Validation (on raw input)
        is_valid_schema, validation_errors = validate_product(raw_input)
        validation_res = {
            "is_valid": is_valid_schema,
            "errors": validation_errors
        }

        # 2. Normalization
        try:
            normalized_product = normalize_product(raw_input)
        except Exception as e:
            normalized_product = raw_input
            validation_res["errors"].append(f"Normalization error: {str(e)}")

        # 3. Classification (on normalized product)
        classification_res = classify_product(normalized_product)

        # Build enriched product view for similarity matching
        similarity_input = copy.deepcopy(normalized_product)
        if classification_res.get("canonical_category"):
            similarity_input["category"] = classification_res["canonical_category"]
        if classification_res.get("subcategory"):
            similarity_input["subcategory"] = classification_res["subcategory"]
        similarity_input["_classification"] = classification_res

        # 4. Quality Evaluation (on normalized product & classification result)
        quality_res = evaluate_product_quality(normalized_product, classification_res)

        # 5. Similarity Analysis (against catalog)
        similarity_res = self._perform_similarity_analysis(similarity_input, target_catalog)

        return {
            "input": raw_input,
            "validation": validation_res,
            "normalization": normalized_product,
            "classification": classification_res,
            "quality": quality_res,
            "similarity": similarity_res
        }

    def _perform_similarity_analysis(
        self,
        target_product: Dict[str, Any],
        catalog: Any
    ) -> Dict[str, Any]:
        """Compare target product against candidate catalog products."""
        if not isinstance(catalog, list) or not catalog or not isinstance(target_product, dict):
            return {
                "candidates_compared": 0,
                "top_match": None,
                "candidate_duplicates": []
            }

        target_id = target_product.get("id")
        compared_results: List[Dict[str, Any]] = []
        candidate_duplicates: List[Dict[str, Any]] = []

        for candidate in catalog:
            if not isinstance(candidate, dict):
                continue

            cand_id = candidate.get("id")
            # Skip self-comparison if IDs match
            if target_id and cand_id and target_id == cand_id:
                continue

            cmp_res = compare_products(target_product, candidate)
            compared_results.append(cmp_res)
            if cmp_res.get("is_candidate_duplicate"):
                candidate_duplicates.append(cmp_res)

        if not compared_results:
            return {
                "candidates_compared": 0,
                "top_match": None,
                "candidate_duplicates": []
            }

        # Sort by overall similarity score descending
        compared_results.sort(key=lambda x: x.get("overall_similarity", 0.0), reverse=True)
        top_match = compared_results[0]

        return {
            "candidates_compared": len(compared_results),
            "top_match": top_match,
            "candidate_duplicates": candidate_duplicates
        }


# Global default pipeline instance
_default_pipeline: Optional[FloraIntelligencePipeline] = None


def get_pipeline() -> FloraIntelligencePipeline:
    """Get or create singleton FloraIntelligencePipeline instance."""
    global _default_pipeline
    if _default_pipeline is None:
        _default_pipeline = FloraIntelligencePipeline()
    return _default_pipeline


def run_pipeline(
    product: Dict[str, Any],
    catalog: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Run complete Flora Product Intelligence pipeline on a product record.
    """
    return get_pipeline().analyze_product(product, catalog=catalog)
