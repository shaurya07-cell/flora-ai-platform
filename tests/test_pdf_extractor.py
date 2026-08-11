from extractors.pdf_extractor import extract_text_from_pdf

print("🚀 TEST STARTED")

text = extract_text_from_pdf("input/pdf/product_manual_01.pdf")

print("\n--- EXTRACTED TEXT ---\n")

if text:
    print(text[:500])
else:
    print("❌ No text extracted")   