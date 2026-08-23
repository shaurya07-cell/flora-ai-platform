"""
Integration tests for Flora Product Data Intelligence Engine Pipeline.
Compatible with pytest and standard unittest runner.
"""

import json
import unittest
from pathlib import Path

from pipeline import FloraIntelligencePipeline, run_pipeline


class TestFloraIntelligencePipeline(unittest.TestCase):
    def setUp(self):
        """Initialize pipeline instance and load reference catalog."""
        self.pipeline = FloraIntelligencePipeline()
        base_dir = Path(__file__).resolve().parents[1]
        catalog_path = base_dir / "data" / "raw" / "mock_products.json"
        if catalog_path.exists():
            with open(catalog_path, "r", encoding="utf-8") as f:
                self.catalog = json.load(f)
        else:
            self.catalog = []

    def test_normal_product_pipeline(self):
        """Test full pipeline processing for a standard complete product."""
        product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Motor",
            "specifications": {
                "power": "0.5 kW",
                "voltage": "0.22 kV",
                "weight": "2500 g"
            }
        }
        res = self.pipeline.analyze_product(product, catalog=self.catalog)

        self.assertTrue(res["validation"]["is_valid"])
        self.assertEqual(res["normalization"]["category"], "Motor")
        self.assertEqual(res["classification"]["canonical_category"], "Industrial Motor")
        self.assertGreaterEqual(res["quality"]["quality_score"], 80.0)
        self.assertGreater(res["similarity"]["candidates_compared"], 0)
        # Should identify P002 as top duplicate match
        top_match = res["similarity"]["top_match"]
        self.assertIsNotNone(top_match)
        self.assertEqual(top_match["product_b_id"], "P002")
        self.assertTrue(top_match["is_candidate_duplicate"])

    def test_flora_smart_valve_product(self):
        """Test Phase 4 requirement: Flora Smart Valve product intelligence processing."""
        flora_product = {
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
        res = run_pipeline(flora_product, catalog=self.catalog)

        # 1. Validation
        self.assertTrue(res["validation"]["is_valid"])

        # 2. Normalization
        self.assertEqual(res["normalization"]["id"], "FLSV200")
        self.assertEqual(res["normalization"]["name"], "Flora Smart Valve")

        # 3. Classification into taxonomy
        self.assertEqual(res["classification"]["canonical_category"], "Smart Valve")
        self.assertEqual(res["classification"]["category_id"], "CAT_VALVE")
        self.assertEqual(res["classification"]["confidence"], 1.0)

        # 4. Quality evaluation
        self.assertGreaterEqual(res["quality"]["quality_score"], 80.0)
        self.assertEqual(res["quality"]["required_field_coverage"], 1.0)

        # 5. Similarity comparison against catalog
        self.assertEqual(res["similarity"]["candidates_compared"], 10)
        self.assertFalse(res["similarity"]["top_match"]["is_candidate_duplicate"])

    def test_incomplete_product_pipeline(self):
        """Test pipeline behavior with missing fields and empty specifications."""
        incomplete_product = {
            "id": "P008",
            "name": "Precision Temparature Sensr Probe",
            "brand": "SensTech",
            "model": "",  # missing model
            "category": "Temperature Sensor",
            "specifications": {}
        }
        res = run_pipeline(incomplete_product, catalog=self.catalog)

        self.assertTrue(res["validation"]["is_valid"])
        self.assertLess(res["quality"]["required_field_coverage"], 1.0)
        self.assertGreater(len(res["quality"]["issues"]), 0)

    def test_invalid_product_pipeline(self):
        """Test pipeline handling of schema-violating product input."""
        invalid_product = {
            "id": "ERR01",
            "name": "Corrupted Record",
            "brand": 12345,  # non-string type error
            "model": "ERR01"
            # missing category
        }
        res = run_pipeline(invalid_product, catalog=self.catalog)

        self.assertFalse(res["validation"]["is_valid"])
        self.assertGreater(len(res["validation"]["errors"]), 0)
        self.assertLess(res["quality"]["validity_score"], 1.0)

    def test_unknown_category_fallback(self):
        """Test pipeline handling of unknown/unlisted product category."""
        unknown_product = {
            "id": "UNK99",
            "name": "Experimental Quantum Teleporter QT-100",
            "brand": "TechCorp",
            "model": "QT-100",
            "category": "Quantum Hardware",
            "specifications": {
                "frequency": "5 GHz"
            }
        }
        res = run_pipeline(unknown_product, catalog=self.catalog)

        self.assertTrue(res["validation"]["is_valid"])
        self.assertIsNone(res["classification"]["canonical_category"])
        self.assertEqual(res["classification"]["confidence"], 0.0)
        self.assertEqual(res["classification"]["matched_by"], "unknown")

    def test_error_handling_non_dict_input(self):
        """Test robust error handling for non-dict input."""
        res = run_pipeline("invalid string input", catalog=self.catalog)

        self.assertFalse(res["validation"]["is_valid"])
        self.assertIn("Expected product to be a dict", res["validation"]["errors"][0])
        self.assertFalse(res["quality"]["is_valid_schema"])

    def test_catalog_none_and_empty_catalog(self):
        """Test pipeline behavior when catalog is None or empty list."""
        product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Motor"
        }
        res_none = run_pipeline(product, catalog=None)
        self.assertEqual(res_none["similarity"]["candidates_compared"], 0)
        self.assertIsNone(res_none["similarity"]["top_match"])

        res_empty = run_pipeline(product, catalog=[])
        self.assertEqual(res_empty["similarity"]["candidates_compared"], 0)
        self.assertIsNone(res_empty["similarity"]["top_match"])

    def test_malformed_catalog_handling(self):
        """Test pipeline behavior when malformed catalog type is passed."""
        product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Motor"
        }
        res_str = run_pipeline(product, catalog="invalid catalog string")
        self.assertEqual(res_str["similarity"]["candidates_compared"], 0)

        res_int = run_pipeline(product, catalog=12345)
        self.assertEqual(res_int["similarity"]["candidates_compared"], 0)

    def test_json_serializability(self):
        """Verify that complete pipeline output contract is strictly JSON serializable."""
        flora_product = {
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
        res = run_pipeline(flora_product, catalog=self.catalog)
        json_str = json.dumps(res)
        self.assertIsInstance(json_str, str)
        reloaded = json.loads(json_str)
        self.assertEqual(reloaded["input"]["id"], "FLSV200")


if __name__ == "__main__":
    unittest.main()
