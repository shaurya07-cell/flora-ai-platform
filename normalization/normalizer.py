"""
Normalizer module for Flora Product Data Intelligence Engine.

Provides deterministic text cleaning, whitespace collapsing, and field-level
normalization for product dictionaries without mutating input in-place.
"""

import copy
import re
from typing import Any, Dict, Optional


def clean_text(text: Optional[str]) -> Optional[str]:
    """
    Safely clean a text string by stripping leading/trailing whitespace
    and collapsing multiple consecutive internal spaces.

    Returns None if input is None or non-string.
    """
    if not isinstance(text, str):
        return text
    return re.sub(r"\s+", " ", text).strip()


def normalize_spec_key(key: str) -> str:
    """
    Normalize a specification key consistently:
    - Trim leading/trailing whitespace
    - Convert to lowercase
    - Replace spaces and hyphens with underscores
    - Collapse multiple consecutive underscores
    """
    if not isinstance(key, str):
        return str(key)
    cleaned = key.strip().lower()
    cleaned = re.sub(r"[\s\-]+", "_", cleaned)
    cleaned = re.sub(r"_+", "_", cleaned)
    return cleaned.strip("_")


def normalize_category(category: Optional[str]) -> Optional[str]:
    """
    Normalize a category or subcategory string by cleaning whitespace
    and standardizing title case presentation.
    """
    cleaned = clean_text(category)
    if not cleaned:
        return cleaned
    return cleaned.title()


def normalize_product(product: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize a product dictionary.

    Returns a new normalized dictionary without modifying the input object.
    - Cleans whitespace in name, brand, model, id, category, subcategory.
    - Normalizes specification keys and cleans string specification values.
    - Preserves non-string values (numbers, booleans, nulls) and unknown fields.
    """
    if not isinstance(product, dict):
        raise TypeError(f"Expected dict input, got {type(product).__name__}")

    normalized = copy.deepcopy(product)

    # Standard top-level text fields
    for field in ("id", "name", "brand", "model"):
        if field in normalized and isinstance(normalized[field], str):
            normalized[field] = clean_text(normalized[field])

    for field in ("category", "subcategory"):
        if field in normalized and isinstance(normalized[field], str):
            normalized[field] = normalize_category(normalized[field])

    # Specifications normalization
    if "specifications" in normalized and isinstance(normalized["specifications"], dict):
        raw_specs = normalized["specifications"]
        norm_specs: Dict[str, Any] = {}
        for key, val in raw_specs.items():
            norm_key = normalize_spec_key(key)
            if isinstance(val, str):
                norm_val = clean_text(val)
            elif isinstance(val, dict):
                norm_val = {
                    normalize_spec_key(k): clean_text(v) if isinstance(v, str) else copy.deepcopy(v)
                    for k, v in val.items()
                }
            else:
                norm_val = copy.deepcopy(val)
            norm_specs[norm_key] = norm_val
        normalized["specifications"] = norm_specs

    # Source metadata normalization
    if "source" in normalized and isinstance(normalized["source"], dict):
        norm_source: Dict[str, Any] = {}
        for k, v in normalized["source"].items():
            norm_k = clean_text(k) if isinstance(k, str) else k
            norm_v = clean_text(v) if isinstance(v, str) else copy.deepcopy(v)
            norm_source[norm_k] = norm_v
        normalized["source"] = norm_source

    return normalized
