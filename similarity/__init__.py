"""
Similarity package for Flora Product Data Intelligence Engine.
"""

from similarity.matcher import (
    compare_brands,
    compare_models,
    compare_products,
    compare_specifications,
    string_similarity,
    token_similarity,
)

__all__ = [
    "compare_products",
    "compare_models",
    "compare_brands",
    "compare_specifications",
    "string_similarity",
    "token_similarity",
]
