"""
Product Classification Module for Flora Product Data Intelligence Engine.

Classifies product records into canonical taxonomy categories based on
taxonomy/categories.json using rule-based exact and alias matching.
"""

import copy
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

TAXONOMY_PATH = Path(__file__).parent.parent / "taxonomy" / "categories.json"


def _clean_str(text: Optional[str]) -> str:
    """Helper to lowercase and collapse whitespace for string matching."""
    if not text or not isinstance(text, str):
        return ""
    return re.sub(r"\s+", " ", text).strip().lower()


class CategoryClassifier:
    """
    Classifier engine that loads taxonomy rules and classifies products.
    """

    def __init__(self, taxonomy_file: Path = TAXONOMY_PATH):
        self.taxonomy_file = taxonomy_file
        self.categories: List[Dict[str, Any]] = []
        self._lookup_map: Dict[str, Dict[str, Any]] = {}
        self._load_taxonomy()

    def _load_taxonomy(self) -> None:
        """Load taxonomy rules from categories.json and build normalized lookup maps."""
        if not self.taxonomy_file.exists():
            raise FileNotFoundError(f"Taxonomy file not found: {self.taxonomy_file.resolve()}")

        with open(self.taxonomy_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.categories = data.get("categories", [])

        # Build lookup table mapping cleaned names/aliases to category dicts
        for cat in self.categories:
            canonical = cat["canonical_name"]
            cleaned_canonical = _clean_str(canonical)

            meta = {
                "category_id": cat["id"],
                "canonical_name": canonical,
                "subcategories": cat.get("subcategories", []),
                "expected_specifications": cat.get("expected_specifications", [])
            }

            self._lookup_map[cleaned_canonical] = meta

            for alias in cat.get("aliases", []):
                cleaned_alias = _clean_str(alias)
                if cleaned_alias and cleaned_alias not in self._lookup_map:
                    self._lookup_map[cleaned_alias] = meta

    def classify_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify a single product record into a canonical taxonomy category.

        Returns a dictionary with classification metrics:
        {
            "canonical_category": str or None,
            "category_id": str or None,
            "subcategory": str or None,
            "confidence": float,
            "matched_by": str  # 'category_exact', 'category_alias', 'name_keyword', 'unknown'
        }
        """
        raw_cat = product.get("category", "")
        raw_name = product.get("name", "")

        cleaned_cat = _clean_str(raw_cat)
        cleaned_name = _clean_str(raw_name)

        matched_meta: Optional[Dict[str, Any]] = None
        matched_by = "unknown"
        confidence = 0.0

        # 1. Match category string against canonical names or aliases
        if cleaned_cat in self._lookup_map:
            matched_meta = self._lookup_map[cleaned_cat]
            if cleaned_cat == _clean_str(matched_meta["canonical_name"]):
                matched_by = "category_exact"
                confidence = 1.0
            else:
                matched_by = "category_alias"
                confidence = 0.95

        # 2. If category not matched, search for alias/canonical keywords in product name
        if not matched_meta and cleaned_name:
            for term, meta in self._lookup_map.items():
                if term and term in cleaned_name:
                    matched_meta = meta
                    matched_by = "name_keyword"
                    confidence = 0.85
                    break

        if not matched_meta:
            return {
                "canonical_category": None,
                "category_id": None,
                "subcategory": product.get("subcategory"),
                "confidence": 0.0,
                "matched_by": "unknown"
            }

        # Subcategory detection from product name or category
        detected_sub: Optional[str] = product.get("subcategory")
        if not detected_sub:
            for sub in matched_meta.get("subcategories", []):
                cleaned_sub = _clean_str(sub)
                if cleaned_sub and (cleaned_sub in cleaned_name or cleaned_sub in cleaned_cat):
                    detected_sub = sub
                    break

        return {
            "canonical_category": matched_meta["canonical_name"],
            "category_id": matched_meta["category_id"],
            "subcategory": detected_sub,
            "confidence": confidence,
            "matched_by": matched_by
        }

    def classify_and_update_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Return a new copy of the product dictionary with category normalized to canonical_category
        and subcategory updated if detected.
        """
        updated = copy.deepcopy(product)
        result = self.classify_product(product)

        if result["canonical_category"]:
            updated["category"] = result["canonical_category"]
        if result["subcategory"]:
            updated["subcategory"] = result["subcategory"]

        updated["_classification"] = result
        return updated


# Default singleton instance
_default_classifier = None


def get_classifier() -> CategoryClassifier:
    """Get or create singleton classifier instance."""
    global _default_classifier
    if _default_classifier is None:
        _default_classifier = CategoryClassifier()
    return _default_classifier


def classify_product(product: Dict[str, Any]) -> Dict[str, Any]:
    """Classify a product dictionary using default classifier instance."""
    return get_classifier().classify_product(product)


def classify_batch(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Classify a list of product dictionaries."""
    classifier = get_classifier()
    return [classifier.classify_product(p) for p in products]
