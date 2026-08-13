"""
Batch Classifier Module for Flora Product Data Intelligence Engine.

Reads normalized product dataset from data/normalized/normalized_products.json,
applies CategoryClassifier to assign canonical categories and subcategories,
and writes the classified dataset to data/output/classified_products.json.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Union

from classification.classifier import get_classifier

DEFAULT_INPUT_PATH = Path("data/normalized/normalized_products.json")
DEFAULT_OUTPUT_PATH = Path("data/output/classified_products.json")


def classify_product_batch(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Apply category classification to a list of product dictionaries.

    Args:
        products: List of normalized product dictionaries.

    Returns:
        List of classified product dictionaries with canonical category and subcategory.
    """
    classifier = get_classifier()
    return [classifier.classify_and_update_product(p) for p in products]


def process_classification_file(
    input_path: Union[str, Path] = DEFAULT_INPUT_PATH,
    output_path: Union[str, Path] = DEFAULT_OUTPUT_PATH,
) -> int:
    """
    Read normalized JSON dataset, classify all products, and save output JSON.

    Args:
        input_path: Path to normalized JSON input file.
        output_path: Path to save classified JSON output file.

    Returns:
        Count of products processed.
    """
    in_file = Path(input_path)
    out_file = Path(output_path)

    if not in_file.exists():
        raise FileNotFoundError(f"Input dataset file not found: {in_file.resolve()}")

    out_file.parent.mkdir(parents=True, exist_ok=True)

    with open(in_file, "r", encoding="utf-8") as f:
        products = json.load(f)

    if not isinstance(products, list):
        raise TypeError(f"Expected list of products, got {type(products).__name__}")

    classified_products = classify_product_batch(products)

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(classified_products, f, indent=2)

    return len(classified_products)


if __name__ == "__main__":
    count = process_classification_file()
    print(f"Successfully classified {count} products to {DEFAULT_OUTPUT_PATH}")
