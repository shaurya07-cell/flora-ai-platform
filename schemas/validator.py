"""
Product Schema Validator Module for Flora Product Data Intelligence Engine.

Provides zero-dependency validation of product dictionaries against the
Flora product schema specification (schemas/product_schema.json).
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple, Union

# Path to standard JSON schema
SCHEMA_PATH = Path(__file__).parent / "product_schema.json"

ALLOWED_TOP_LEVEL_FIELDS = {
    "id",
    "name",
    "brand",
    "model",
    "category",
    "subcategory",
    "specifications",
    "source",
}

REQUIRED_FIELDS = {"id", "name", "brand", "model", "category"}

ALLOWED_SPEC_VALUE_TYPES = (str, int, float, bool, type(None))


def validate_product(product: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate a single product dictionary against Flora product schema rules.

    Args:
        product: Dictionary representing a single product.

    Returns:
        Tuple of (is_valid: bool, error_messages: List[str])
    """
    errors: List[str] = []

    if not isinstance(product, dict):
        return False, [f"Expected product to be a dict, got {type(product).__name__}"]

    # 1. Validate required fields and string type constraint
    for field in REQUIRED_FIELDS:
        if field not in product:
            errors.append(f"Missing required top-level field: '{field}'")
        elif not isinstance(product[field], str):
            errors.append(f"Field '{field}' must be a string, got {type(product[field]).__name__}")

    # 2. Check for unexpected top-level fields (additionalProperties: false)
    for field in product.keys():
        if field not in ALLOWED_TOP_LEVEL_FIELDS:
            errors.append(f"Unexpected top-level field not allowed by schema: '{field}'")

    # 3. Optional subcategory validation
    if "subcategory" in product and product["subcategory"] is not None:
        if not isinstance(product["subcategory"], str):
            errors.append(
                f"Field 'subcategory' must be a string, got {type(product['subcategory']).__name__}"
            )

    # 4. Optional specifications validation
    if "specifications" in product and product["specifications"] is not None:
        specs = product["specifications"]
        if not isinstance(specs, dict):
            errors.append(f"Field 'specifications' must be a dict, got {type(specs).__name__}")
        else:
            for k, v in specs.items():
                if not isinstance(k, str):
                    errors.append(f"Specification key must be a string, got {type(k).__name__}")
                if not isinstance(v, ALLOWED_SPEC_VALUE_TYPES):
                    errors.append(
                        f"Specification value for key '{k}' has invalid type {type(v).__name__}"
                    )

    # 5. Optional source metadata validation
    if "source" in product and product["source"] is not None:
        source = product["source"]
        if not isinstance(source, dict):
            errors.append(f"Field 'source' must be a dict, got {type(source).__name__}")
        else:
            if "fileName" in source and not isinstance(source["fileName"], str):
                errors.append("Source metadata 'fileName' must be a string")
            if "fileType" in source and not isinstance(source["fileType"], str):
                errors.append("Source metadata 'fileType' must be a string")
            if "extractedBy" in source and not isinstance(source["extractedBy"], str):
                errors.append("Source metadata 'extractedBy' must be a string")
            if "page" in source and not isinstance(source["page"], (int, float, str)):
                errors.append("Source metadata 'page' must be integer, number, or string")

    return len(errors) == 0, errors


def validate_product_batch(products: List[Dict[str, Any]]) -> Tuple[bool, Dict[int, List[str]]]:
    """
    Validate a batch list of product dictionaries.

    Args:
        products: List of product dictionaries.

    Returns:
        Tuple of (all_valid: bool, errors_by_index: Dict[int, List[str]])
    """
    if not isinstance(products, list):
        raise TypeError(f"Expected list of products, got {type(products).__name__}")

    all_errors: Dict[int, List[str]] = {}
    for idx, product in enumerate(products):
        valid, errs = validate_product(product)
        if not valid:
            all_errors[idx] = errs

    return len(all_errors) == 0, all_errors


if __name__ == "__main__":
    # Self-check against raw and normalized datasets
    raw_path = Path("data/raw/mock_products.json")
    norm_path = Path("data/normalized/normalized_products.json")

    for path in (raw_path, norm_path):
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            valid, errs = validate_product_batch(data)
            print(f"File {path}: valid={valid}, errors={errs}")
