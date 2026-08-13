"""
Unit tests for Product Similarity Matcher Engine.
Compatible with pytest and standard unittest runner.
"""

import json
import unittest
from pathlib import Path

from similarity.matcher import (
    compare_brands,
    compare_models,
    compare_products,
)


class TestSimilarityMatcher(unittest.TestCase):
    def setUp(self):
        """Load classified mock dataset for test assertions."""
        classified_path = Path("data/output/classified_products.json")
        if not classified_path.exists():
            classified_path = Path("data/normalized/normalized_products.json")

        if classified_path.exists():
            with open(classified_path, "r", encoding="utf-8") as f:
                products_list = json.load(f)
                self.products = {p["id"]: p for p in products_list}
        else:
            self.products = {}

    def test_duplicate_pair_p001_p002(self):
        """Test similarity score for intentional duplicate pair (P001 & P002)."""
        p1 = self.products["P001"]
        p2 = self.products["P002"]

        result = compare_products(p1, p2)

        self.assertEqual(result["product_a_id"], "P001")
        self.assertEqual(result["product_b_id"], "P002")
        self.assertGreaterEqual(result["overall_similarity"], 0.85)
        self.assertTrue(result["is_candidate_duplicate"])
        self.assertEqual(result["model_similarity"], 1.0)

    def test_similar_variant_pair_p003_p004(self):
        """Test similarity score for similar but non-identical variant pair (P003 & P004)."""
        p3 = self.products["P003"]
        p4 = self.products["P004"]

        result = compare_products(p3, p4)

        self.assertGreaterEqual(result["overall_similarity"], 0.60)
        self.assertLess(result["overall_similarity"], 0.85)
        self.assertFalse(result["is_candidate_duplicate"])

    def test_different_products_p001_p005(self):
        """Test similarity score for completely different products (Motor vs Temp Sensor)."""
        p1 = self.products["P001"]
        p5 = self.products["P005"]

        result = compare_products(p1, p5)

        self.assertLess(result["overall_similarity"], 0.45)
        self.assertFalse(result["is_candidate_duplicate"])

    def test_model_formatting_normalization(self):
        """Test model comparison handling hyphen and space formatting differences."""
        self.assertEqual(compare_models("M500", "M-500"), 1.0)
        self.assertEqual(compare_models("FP100", "FP-100"), 1.0)
        self.assertEqual(compare_models("TS-10", "TS 10"), 1.0)

    def test_brand_formatting_variations(self):
        """Test brand comparison handling suffix variations ('ABC' vs 'ABC Motors')."""
        self.assertGreaterEqual(compare_brands("ABC", "ABC Motors"), 0.90)
        self.assertEqual(compare_brands("FlowTech", "FlowTech"), 1.0)


if __name__ == "__main__":
    unittest.main()
