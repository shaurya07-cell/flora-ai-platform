"""
Main Entry Point for Flora Product Data Intelligence Engine.

Provides CLI and Python API interface for executing the Flora Product Intelligence
pipeline against product records and catalog datasets.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from pipeline import run_pipeline, FloraIntelligencePipeline

DEFAULT_CATALOG_PATH = Path(__file__).parent / "data" / "raw" / "mock_products.json"

FLORA_SMART_VALVE_SAMPLE = {
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


def load_catalog(catalog_path: Path = DEFAULT_CATALOG_PATH) -> List[Dict[str, Any]]:
    """Load reference product catalog from JSON file."""
    if not catalog_path.exists():
        return []
    try:
        with open(catalog_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def process_product_payload(
    product: Dict[str, Any],
    catalog: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Process a single product payload through the Flora Intelligence Engine pipeline.

    Args:
        product: Input product payload dict.
        catalog: Optional reference catalog list. If None, default mock dataset is loaded.

    Returns:
        Structured intelligence result dict.
    """
    if catalog is None:
        catalog = load_catalog()
    return run_pipeline(product, catalog=catalog)


def main() -> int:
    """CLI execution handler."""
    parser = argparse.ArgumentParser(
        description="Flora Product Data Intelligence Engine CLI"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        help="Path to input product JSON file. If omitted, runs default Flora Smart Valve sample."
    )
    parser.add_argument(
        "--catalog", "-c",
        type=str,
        help="Path to catalog JSON file for similarity matching. Defaults to data/raw/mock_products.json."
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        help="Path to save output JSON result. If omitted, prints JSON to stdout."
    )

    args = parser.parse_args()

    # Load catalog
    if args.catalog:
        cat_path = Path(args.catalog)
        if not cat_path.exists():
            print(f"Error: Catalog file not found: {cat_path}", file=sys.stderr)
            return 1
        try:
            with open(cat_path, "r", encoding="utf-8") as f:
                catalog = json.load(f)
                if not isinstance(catalog, list):
                    print(f"Error: Catalog file must contain a JSON array/list, got {type(catalog).__name__}", file=sys.stderr)
                    return 1
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON format in catalog file '{cat_path}': {e}", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Error reading catalog file '{cat_path}': {e}", file=sys.stderr)
            return 1
    else:
        catalog = load_catalog(DEFAULT_CATALOG_PATH)

    # Load input product
    if args.input:
        in_path = Path(args.input)
        if not in_path.exists():
            print(f"Error: Input file not found: {in_path}", file=sys.stderr)
            return 1
        try:
            with open(in_path, "r", encoding="utf-8") as f:
                product_input = json.load(f)
                # Handle wrapped payload format from Node.js bridge: { product: {...}, catalog: [...] }
                if isinstance(product_input, dict) and "product" in product_input:
                    if "catalog" in product_input and not args.catalog:
                        catalog = product_input["catalog"]
                    product_input = product_input["product"]
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON format in input file '{in_path}': {e}", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"Error reading input file '{in_path}': {e}", file=sys.stderr)
            return 1
    else:
        product_input = FLORA_SMART_VALVE_SAMPLE

    result = process_product_payload(product_input, catalog=catalog)
    json_output = json.dumps(result, indent=2)

    if args.output:
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(json_output)
        print(f"Successfully processed product. Output saved to {out_path}")
    else:
        print(json_output)

    return 0


if __name__ == "__main__":
    sys.exit(main())
