import re


def clean_text(raw_text):
    print("[CLEANER] Cleaning text...")

    if not raw_text:
        return ""

    text = raw_text

    # 🔹 Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    # 🔹 Remove duplicate sentences
    parts = text.split(". ")
    parts = list(dict.fromkeys(parts))
    text = ". ".join(parts)

    # 🔹 Fix broken words (basic)
    text = re.sub(r'(\w)\s+(\w)', r'\1\2', text)

    # 🔹 Remove page numbers
    text = re.sub(r'Page \d+', '', text, flags=re.IGNORECASE)

    # 🔹 Remove non-ASCII characters
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)

    # 🔹 Final cleanup
    text = text.strip()

    print("[CLEANER] Cleaning complete")

    return text