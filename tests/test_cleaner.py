from cleaners.text_cleaner import clean_text

print("🚀 CLEANER TEST STARTED")

raw_text = """
Power : 450 W

Power : 450 W

Page 1

Vo ltage : 220 V
"""

print("\n--- RAW TEXT ---\n")
print(raw_text)

cleaned = clean_text(raw_text)

print("\n--- CLEANED TEXT ---\n")
print(cleaned)