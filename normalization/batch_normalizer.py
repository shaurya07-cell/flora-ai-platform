"""
Batch normalizer module for Flora Product Data Intelligence Engine.

Reads raw product dataset, normalizes each product using normalize_product(),
and outputs the resulting normalized dataset to data/normalized/.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Union
from normalization.normalizer import normalize_product

# Default workspace relative paths
DEFAULT_INPUT_PATH = Path("data/raw/mock_products.json")
DEFAULT_OUTPUT_PATH = Path("data/normalized/normalized_products.json")


def normalize_batch(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Normalize a list of product dictionaries.

    Args:
        products: List of raw product dictionaries.

    Returns:
        List of normalized product dictionaries.
    """
    return [normalize_product(product) for product in products]


def process_normalization_file(
    input_path: Union[str, Path] = DEFAULT_INPUT_PATH,
    output_path: Union[str, Path] = DEFAULT_OUTPUT_PATH
) -> int:
    """
    Read raw JSON dataset from input_path, normalize all products,
    and save the output to output_path.

    Args:
        input_path: Path to raw JSON input file.
        output_path: Path to save normalized JSON output.

    Returns:
        Count of products normalized.
    """
    in_file = Path(input_path)
    out_file = Path(output_path)

    if not in_file.exists():
        raise FileNotFoundError(f"Input dataset file not found: {in_file.resolve()}")

    # Ensure target output directory exists
    out_file.parent.mkdir(parents=True, exist_ok=True)

    with open(in_file, "r", encoding="utf-8") as f:
        raw_products = json.load(f)

    if not isinstance(raw_products, list):
        raise TypeError(f"Expected array of products in JSON, got {type(raw_products).__name__}")

    normalized_products = normalize_batch(raw_products)

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(normalized_products, f, indent=2)

    return len(normalized_products)


if __name__ == "__main__":
    count = process_normalization_file()
    print(f"Successfully batch-normalized {count} products to {DEFAULT_OUTPUT_PATH}")
