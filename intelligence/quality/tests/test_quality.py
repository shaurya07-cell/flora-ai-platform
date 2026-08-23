"""
Unit tests for Product Quality Evaluator Engine.
Compatible with pytest and standard unittest runner.
"""

import json
import unittest
from pathlib import Path

from quality.evaluator import QualityEvaluator, evaluate_product_quality


class TestQualityEvaluator(unittest.TestCase):
    def setUp(self):
        """Initialize evaluator and sample product payloads."""
        self.evaluator = QualityEvaluator()

        self.complete_product = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Industrial Motor",
            "subcategory": "AC Motor",
            "specifications": {
                "power": "0.5 kW",
                "voltage": "0.22 kV",
                "weight": "2500 g",
                "speed_rpm": "1500 RPM"
            },
            "source": {
                "fileName": "catalog.json",
                "extractedBy": "Manual"
            }
        }

        self.incomplete_product = {
            "id": "P008",
            "name": "Precision Temparature Sensr Probe",
            "brand": "SensTech",
            "model": "",  # Missing model value
            "category": "Temperature Sensor",
            "specifications": {}  # Empty specs
        }

        self.invalid_product = {
            "id": "P099",
            "name": "Invalid Component Payload",
            # missing brand, model, category
            "unauthorized_field": "invalid"
        }

    def test_complete_product_quality_score(self):
        """Test quality scoring for a complete, fully-specified product."""
        res = self.evaluator.evaluate(self.complete_product)

        self.assertTrue(res["is_valid_schema"])
        self.assertEqual(res["required_field_coverage"], 1.0)
        self.assertEqual(res["completeness_score"], 100.0)
        self.assertEqual(res["expected_spec_coverage"], 1.0)
        self.assertGreaterEqual(res["quality_score"], 95.0)
        self.assertEqual(len([i for i in res["issues"] if i["severity"] == "error"]), 0)

    def test_incomplete_product_quality(self):
        """Test quality metrics and warning flags for an incomplete product."""
        res = self.evaluator.evaluate(self.incomplete_product)

        self.assertLess(res["required_field_coverage"], 1.0)
        self.assertLess(res["quality_score"], 80.0)
        self.assertTrue(any(i["field"] == "model" for i in res["issues"]))
        self.assertTrue(any("specifications" in i["field"] for i in res["issues"]))

    def test_invalid_schema_product_quality(self):
        """Test that schema validation errors lower the validity and overall quality score."""
        res = self.evaluator.evaluate(self.invalid_product)

        self.assertFalse(res["is_valid_schema"])
        self.assertLess(res["validity_score"], 1.0)
        self.assertGreater(len(res["issues"]), 0)
        self.assertTrue(any(i["severity"] == "error" for i in res["issues"]))

    def test_expected_spec_coverage_with_classification(self):
        """Test expected specification coverage calculation using classification result."""
        classification_result = {
            "canonical_category": "Industrial Motor",
            "category_id": "CAT_MOTOR",
            "confidence": 1.0
        }
        # Product missing speed_rpm spec expected for Industrial Motor
        prod = {
            "id": "P001",
            "name": "ABC Industrial Motor M500",
            "brand": "ABC",
            "model": "M500",
            "category": "Motor",
            "specifications": {
                "power": "0.5 kW",
                "voltage": "0.22 kV",
                "weight": "2.5 kg"
            }
        }
        res = evaluate_product_quality(prod, classification_result)

        # Expected specs for Industrial Motor: power, voltage, weight, speed_rpm (3 out of 4 present)
        self.assertEqual(res["expected_spec_coverage"], 0.75)
        self.assertTrue(any("speed_rpm" in i["field"] for i in res["issues"]))


if __name__ == "__main__":
    unittest.main()
