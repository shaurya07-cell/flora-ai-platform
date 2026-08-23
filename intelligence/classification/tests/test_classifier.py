"""
Unit tests for Product Classification Module.
Compatible with pytest and standard unittest runner.
"""

import json
import unittest
from pathlib import Path

from classification.classifier import CategoryClassifier, classify_product


class TestCategoryClassifier(unittest.TestCase):
    def setUp(self):
        """Initialize classifier and load normalized dataset."""
        self.classifier = CategoryClassifier()
        base_dir = Path(__file__).resolve().parents[2]
        norm_path = base_dir / "data" / "normalized" / "normalized_products.json"
        if norm_path.exists():
            with open(norm_path, "r", encoding="utf-8") as f:
                self.dataset = json.load(f)
        else:
            self.dataset = []

    def test_exact_category_match(self):
        """Test exact matching against canonical category name."""
        prod = {"id": "P001", "name": "ABC Motor M500", "category": "Industrial Motor"}
        res = self.classifier.classify_product(prod)

        self.assertEqual(res["canonical_category"], "Industrial Motor")
        self.assertEqual(res["category_id"], "CAT_MOTOR")
        self.assertEqual(res["matched_by"], "category_exact")
        self.assertEqual(res["confidence"], 1.0)

    def test_alias_category_match(self):
        """Test matching against category alias ('Motor' -> 'Industrial Motor')."""
        prod = {"id": "P001", "name": "ABC Motor M500", "category": "Motor"}
        res = self.classifier.classify_product(prod)

        self.assertEqual(res["canonical_category"], "Industrial Motor")
        self.assertEqual(res["category_id"], "CAT_MOTOR")
        self.assertEqual(res["matched_by"], "category_alias")
        self.assertEqual(res["confidence"], 0.95)

    def test_typo_alias_match(self):
        """Test alias matching with spelling variation alias ('Temparature Sensr')."""
        prod = {
            "id": "P008",
            "name": "Precision Probe",
            "category": "Temparature Sensr"
        }
        res = self.classifier.classify_product(prod)

        self.assertEqual(res["canonical_category"], "Temperature Sensor")
        self.assertEqual(res["category_id"], "CAT_TEMP_SENSOR")

    def test_name_keyword_fallback(self):
        """Test fallback classification based on product name keywords when category is missing."""
        prod = {
            "id": "P006",
            "name": "Vortex Hydraulic Pump HP-50",
            "category": ""  # Missing category
        }
        res = self.classifier.classify_product(prod)

        self.assertEqual(res["canonical_category"], "Pump")
        self.assertEqual(res["category_id"], "CAT_PUMP")
        self.assertEqual(res["matched_by"], "name_keyword")
        self.assertEqual(res["confidence"], 0.85)

    def test_subcategory_detection(self):
        """Test detection of subcategory from product name ('Centrifugal Pump')."""
        prod = {
            "id": "P003",
            "name": "FlowTech Centrifugal Pump FP-100",
            "category": "Pump"
        }
        res = self.classifier.classify_product(prod)

        self.assertEqual(res["canonical_category"], "Pump")
        self.assertEqual(res["subcategory"], "Centrifugal Pump")

    def test_dataset_classification(self):
        """Test that all 10 mock products classify into valid canonical categories."""
        self.assertTrue(len(self.dataset) > 0, "Mock dataset must not be empty")

        canonical_categories = {"Industrial Motor", "Pump", "Temperature Sensor"}

        for prod in self.dataset:
            res = classify_product(prod)
            self.assertIn(
                res["canonical_category"],
                canonical_categories,
                f"Product {prod['id']} failed to classify into taxonomy: {res}"
            )
            self.assertGreater(res["confidence"], 0.0)


if __name__ == "__main__":
    unittest.main()
