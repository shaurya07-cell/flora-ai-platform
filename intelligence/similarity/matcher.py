"""
Similarity & Duplicate Matcher Engine for Flora Product Data Intelligence Engine.

Provides deterministic pairwise product similarity scoring across brand, model,
name, category, and technical specifications without external dependencies.
"""

import difflib
import re
from typing import Any, Dict, Optional, Tuple


def normalize_alphanumeric(text: Optional[str]) -> str:
    """Strip non-alphanumeric characters and convert string to lowercase."""
    if not text or not isinstance(text, str):
        return ""
    return re.sub(r"[^a-zA-Z0-9]", "", text).lower()


def string_similarity(s1: Optional[str], s2: Optional[str]) -> float:
    """
    Calculate text similarity ratio between 0.0 and 1.0 using SequenceMatcher.
    """
    if s1 is None or s2 is None:
        return 1.0 if s1 is s2 else 0.0
    str1, str2 = s1.strip().lower(), s2.strip().lower()
    if not str1 and not str2:
        return 1.0
    if not str1 or not str2:
        return 0.0
    if str1 == str2:
        return 1.0
    return difflib.SequenceMatcher(None, str1, str2).ratio()


def token_similarity(s1: Optional[str], s2: Optional[str]) -> float:
    """
    Calculate Token Set Jaccard Similarity between two strings.
    """
    if not s1 or not s2:
        return 0.0
    tokens1 = set(re.findall(r"\w+", s1.lower()))
    tokens2 = set(re.findall(r"\w+", s2.lower()))
    if not tokens1 or not tokens2:
        return 0.0
    intersection = len(tokens1 & tokens2)
    union = len(tokens1 | tokens2)
    return intersection / union if union > 0 else 0.0


def compare_models(model1: Optional[str], model2: Optional[str]) -> float:
    """
    Compare two model strings.
    Ignores non-alphanumeric formatting differences (e.g., 'M500' vs 'M-500').
    """
    clean1 = normalize_alphanumeric(model1)
    clean2 = normalize_alphanumeric(model2)

    if not clean1 and not clean2:
        return 1.0
    if not clean1 or not clean2:
        return 0.0
    if clean1 == clean2:
        return 1.0
    
    sim = string_similarity(model1, model2)
    tok_sim = token_similarity(model1, model2)
    return round(max(sim, tok_sim), 4)


def compare_brands(brand1: Optional[str], brand2: Optional[str]) -> float:
    """
    Compare two brand strings.
    Handles brand prefix/suffix variations (e.g., 'ABC' vs 'ABC Motors').
    """
    clean1 = normalize_alphanumeric(brand1)
    clean2 = normalize_alphanumeric(brand2)

    if not clean1 and not clean2:
        return 1.0
    if not clean1 or not clean2:
        return 0.0
    if clean1 == clean2:
        return 1.0
    if clean1 in clean2 or clean2 in clean1:
        return 0.90
    return token_similarity(brand1, brand2)


def compare_specifications(
    specs1: Optional[Dict[str, Any]], specs2: Optional[Dict[str, Any]]
) -> float:
    """
    Compare technical specifications objects.
    """
    if specs1 is not None and not isinstance(specs1, dict):
        specs1 = None
    if specs2 is not None and not isinstance(specs2, dict):
        specs2 = None

    if specs1 is None and specs2 is None:
        return 1.0
    if not specs1 or not specs2:
        return 0.0 if (specs1 or specs2) else 1.0

    keys1 = set(specs1.keys())
    keys2 = set(specs2.keys())
    shared_keys = keys1 & keys2
    all_keys = keys1 | keys2

    if not all_keys:
        return 1.0

    key_overlap = len(shared_keys) / len(all_keys)

    if not shared_keys:
        return 0.0

    val_similarities = []
    for k in shared_keys:
        v1, v2 = str(specs1[k]), str(specs2[k])
        c1, c2 = normalize_alphanumeric(v1), normalize_alphanumeric(v2)
        if c1 == c2:
            val_similarities.append(1.0)
        else:
            val_similarities.append(token_similarity(v1, v2))

    avg_val_sim = sum(val_similarities) / len(val_similarities)
    return round((0.4 * key_overlap) + (0.6 * avg_val_sim), 4)


def compare_products(
    prod1: Dict[str, Any], prod2: Dict[str, Any], duplicate_threshold: float = 0.85
) -> Dict[str, Any]:
    """
    Compare two product dictionaries and compute overall similarity score.

    Returns breakdown dictionary:
    {
        "product_a_id": str,
        "product_b_id": str,
        "overall_similarity": float,
        "model_similarity": float,
        "name_similarity": float,
        "brand_similarity": float,
        "category_similarity": float,
        "specifications_similarity": float,
        "is_candidate_duplicate": bool
    }
    """
    if not isinstance(prod1, dict) or not isinstance(prod2, dict):
        return {
            "product_a_id": str(prod1.get("id")) if isinstance(prod1, dict) else None,
            "product_b_id": str(prod2.get("id")) if isinstance(prod2, dict) else None,
            "overall_similarity": 0.0,
            "model_similarity": 0.0,
            "name_similarity": 0.0,
            "brand_similarity": 0.0,
            "category_similarity": 0.0,
            "specifications_similarity": 0.0,
            "is_candidate_duplicate": False,
        }

    # 1. Model similarity
    model_score = compare_models(prod1.get("model"), prod2.get("model"))

    # 2. Brand similarity
    brand_score = compare_brands(prod1.get("brand"), prod2.get("brand"))

    # 3. Name similarity
    name1, name2 = prod1.get("name", ""), prod2.get("name", "")
    name_score = max(string_similarity(name1, name2), token_similarity(name1, name2))

    # 4. Category similarity
    cat1 = prod1.get("category") or prod1.get("_classification", {}).get("canonical_category")
    cat2 = prod2.get("category") or prod2.get("_classification", {}).get("canonical_category")
    if cat1 and cat2 and normalize_alphanumeric(cat1) == normalize_alphanumeric(cat2):
        category_score = 1.0
    elif cat1 and cat2:
        category_score = token_similarity(cat1, cat2)
    else:
        category_score = 0.5

    # 5. Specifications similarity
    spec_score = compare_specifications(
        prod1.get("specifications"), prod2.get("specifications")
    )

    # Weighted overall score
    overall = (
        (0.35 * model_score)
        + (0.25 * name_score)
        + (0.15 * brand_score)
        + (0.15 * category_score)
        + (0.10 * spec_score)
    )

    overall_rounded = round(overall, 4)

    return {
        "product_a_id": prod1.get("id"),
        "product_b_id": prod2.get("id"),
        "overall_similarity": overall_rounded,
        "model_similarity": round(model_score, 4),
        "name_similarity": round(name_score, 4),
        "brand_similarity": round(brand_score, 4),
        "category_similarity": round(category_score, 4),
        "specifications_similarity": round(spec_score, 4),
        "is_candidate_duplicate": overall_rounded >= duplicate_threshold,
    }
