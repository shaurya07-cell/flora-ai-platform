import re


def extract_key_value_pairs(text):
    print("[TABLE] Extracting key-value pairs...")

    data = {}

    if not text:
        return data

    pattern = re.findall(
        r'([A-Za-z ]+?)\s*[:\-]?\s*([\d\.]+\s*[A-Za-z%]+)',
        text
    )

    for key, value in pattern:
        key = key.strip()
        value = value.strip()

        if len(key) > 1:
            data[key] = value

    print(f"[TABLE] Extracted {len(data)} pairs")

    return data