"""
Tests for normalization package in Flora Product Data Intelligence Engine.
Fully compatible with pytest and Python standard library unittest.
"""

import copy
import unittest

from normalization.normalizer import (
    clean_text,
    normalize_category,
    normalize_product,
    normalize_spec_key,
)


class TestProductNormalizer(unittest.TestCase):
    def test_whitespace_cleanup(self):
        """Test trimming of leading and trailing whitespace across product fields."""
        raw_product = {
            "id": "  P001  ",
            "name": "\tABC Industrial Motor M500  ",
            "brand": "  ABC  ",
            "model": " M500 \n",
            "category": " Motor  ",
            "specifications": {
                " power ": " 0.5 kW ",
                "voltage": "  0.22 kV  "
            }
        }
        normalized = normalize_product(raw_product)

        self.assertEqual(normalized["id"], "P001")
        self.assertEqual(normalized["name"], "ABC Industrial Motor M500")
        self.assertEqual(normalized["brand"], "ABC")
        self.assertEqual(normalized["model"], "M500")
        self.assertEqual(normalized["category"], "Motor")
        self.assertEqual(normalized["specifications"]["power"], "0.5 kW")
        self.assertEqual(normalized["specifications"]["voltage"], "0.22 kV")

    def test_repeated_whitespace(self):
        """Test collapsing of internal repeated whitespace in text fields."""
        raw_product = {
            "id": "P002",
            "name": "ABC   M-500    Industrial   Motor",
            "brand": "ABC   Motors",
            "model": "M-500",
            "category": "industrial    motor",
            "specifications": {
                "weight": "2.5    kg"
            }
        }
        normalized = normalize_product(raw_product)

        self.assertEqual(normalized["name"], "ABC M-500 Industrial Motor")
        self.assertEqual(normalized["brand"], "ABC Motors")
        self.assertEqual(normalized["category"], "Industrial Motor")
        self.assertEqual(normalized["specifications"]["weight"], "2.5 kg")

    def test_missing_fields(self):
        """Test safe handling of missing, empty, or None fields."""
        raw_product = {
            "id": "P007",
            "name": "Indusrial Elec Motor X-200",
            "brand": "",
            "model": "X-200",
            "category": "Motor",
            "specifications": {
                "power": "1.5 kW",
                "notes": None
            }
        }
        normalized = normalize_product(raw_product)

        self.assertEqual(normalized["id"], "P007")
        self.assertEqual(normalized["brand"], "")
        self.assertNotIn("subcategory", normalized)
        self.assertIsNone(normalized["specifications"]["notes"])

        empty_specs_product = {
            "id": "P008",
            "name": "Precision Temparature Sensr Probe",
            "brand": "SensTech",
            "model": "",
            "category": "Temperature Sensor",
            "specifications": {}
        }
        norm_empty = normalize_product(empty_specs_product)
        self.assertEqual(norm_empty["specifications"], {})

    def test_specification_key_normalization(self):
        """Test consistent normalization of specification keys to lowercase snake_case."""
        raw_product = {
            "id": "P003",
            "name": "FlowTech Centrifugal Pump FP-100",
            "brand": "FlowTech",
            "model": "FP-100",
            "category": "Pump",
            "specifications": {
                " Flow Rate ": "50 L/min",
                "Max-Pressure": "5 bar",
                "POWER_RATING": "0.75 kW",
                "OPERATING--VOLTAGE": "220V"
            }
        }
        normalized = normalize_product(raw_product)
        specs = normalized["specifications"]

        self.assertIn("flow_rate", specs)
        self.assertEqual(specs["flow_rate"], "50 L/min")

        self.assertIn("max_pressure", specs)
        self.assertEqual(specs["max_pressure"], "5 bar")

        self.assertIn("power_rating", specs)
        self.assertEqual(specs["power_rating"], "0.75 kW")

        self.assertIn("operating_voltage", specs)
        self.assertEqual(specs["operating_voltage"], "220V")

    def test_input_immutability(self):
        """Test that input dictionary is not modified in-place."""
        raw_product = {
            "id": "  P001  ",
            "name": "  ABC   Industrial  Motor ",
            "brand": " ABC ",
            "model": " M500 ",
            "category": " motor ",
            "specifications": {
                " Power Rating ": " 0.5 kW "
            }
        }
        original_copy = copy.deepcopy(raw_product)

        normalized = normalize_product(raw_product)

        # Input dictionary must be completely unchanged
        self.assertEqual(raw_product, original_copy)
        self.assertIsNot(raw_product, normalized)
        self.assertIsNot(raw_product["specifications"], normalized["specifications"])

    def test_already_normalized_data(self):
        """Test that already-normalized product data remains unchanged."""
        clean_product = {
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
        normalized = normalize_product(clean_product)
        self.assertEqual(normalized, clean_product)


if __name__ == "__main__":
    unittest.main()
