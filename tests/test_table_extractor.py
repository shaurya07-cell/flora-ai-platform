print("🚀 TABLE TEST FILE IS RUNNING")

from utils.table_extractor import extract_key_value_pairs

print("🚀 IMPORT DONE")

text = """
Power: 450 W
Voltage: 220 V
Weight: 2.5 kg
Speed: 3000 RPM
"""

data = extract_key_value_pairs(text)

print("RESULT:", data)