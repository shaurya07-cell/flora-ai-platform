"""
Unit tests for Product Schema Validator Module.
Compatible with pytest and standard unittest runner.
"""

import json
import unittest
from pathlib import Path

from schemas.validator import validate_product, validate_product_batch


class TestProductSchemaValidator(unittest.TestCase):
    def setUp(self):
        """Load normalized sample product dataset."""
        norm_path = Path("data/normalized/normalized_products.json")
        if norm_path.exists():
            with open(norm_path, "r", encoding="utf-8") as f:
                self.dataset = json.load(f)
        else:
            self.dataset = []

    def test_valid_normalized_dataset(self):
        """Test that all products in normalized_products.json pass schema validation."""
        self.assertTrue(len(self.dataset) > 0, "Normalized dataset must not be empty")
        all_valid, errors = validate_product_batch(self.dataset)
        self.assertTrue(all_valid, f"Validation failed with errors: {errors}")

    def test_missing_required_field(self):
        """Test failure when a required field like 'category' or 'id' is missing."""
        invalid_product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500"
            # 'category' is missing
        }
        valid, errors = validate_product(invalid_product)
        self.assertFalse(valid)
        self.assertTrue(any("category" in err for err in errors))

    def test_non_string_required_field(self):
        """Test failure when a required string field is given a non-string type."""
        invalid_product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": 123,  # Invalid type (integer)
            "model": "M500",
            "category": "Motor"
        }
        valid, errors = validate_product(invalid_product)
        self.assertFalse(valid)
        self.assertTrue(any("brand" in err for err in errors))

    def test_unexpected_top_level_field(self):
        """Test failure when an unknown top-level field is present."""
        invalid_product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Motor",
            "unauthorized_field": "test_value"
        }
        valid, errors = validate_product(invalid_product)
        self.assertFalse(valid)
        self.assertTrue(any("unauthorized_field" in err for err in errors))

    def test_invalid_specification_value_type(self):
        """Test failure when a specification value is an unsupported type (e.g. list)."""
        invalid_product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Motor",
            "specifications": {
                "tags": ["motor", "industrial"]  # Invalid value type (list)
            }
        }
        valid, errors = validate_product(invalid_product)
        self.assertFalse(valid)
        self.assertTrue(any("tags" in err for err in errors))


if __name__ == "__main__":
    unittest.main()
