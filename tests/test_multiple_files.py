print("🚀 MULTI-FILE TEST FILE RUNNING")

from processors.main_processor import process_file

print("🚀 IMPORT SUCCESS")

files = [
    "input/pdf/product_manual_01.pdf",
    "input/images/sample1.png",
    "input/pdf/scanned_sample.pdf"
]

for file in files:
    print("\n==============================")
    print(f"Testing file: {file}")

    result = process_file(file)

    if result and isinstance(result, dict):
        print("✅ SUCCESS")
        print("Tables:", result.get("tables"))
    else:
        print("⚠️ No valid result")