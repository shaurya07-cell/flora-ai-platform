"""
Test Suite Runner for Flora Product Data Intelligence Engine.

Executes all unit and integration tests across all modules.
"""

import sys
import unittest

def run_all_tests() -> int:
    """Discover and execute all test cases in workspace."""
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=".", pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
