import os
from datetime import datetime

from utils.file_detector import detect_file_type
from extractors.pdf_extractor import (
    extract_text_from_pdf,
    extract_text_from_scanned_pdf
)
from extractors.image_ocr import extract_text_from_image

from cleaners.text_cleaner import clean_text
from utils.table_extractor import extract_key_value_pairs


def process_file(file_path):
    print(f"[PIPELINE] Processing file: {file_path}")

    file_info = detect_file_type(file_path)

    file_type = file_info.get("type")
    subtype = file_info.get("subtype")

    file_name = os.path.basename(file_path)

    raw_text = ""
    clean_text_output = ""
    tables = {}
    extraction_method = ""

    try:
        # 🔹 PDF handling
        if file_type == "pdf":

            if subtype == "searchable":
                print("[PIPELINE] Using direct PDF extraction")
                extraction_method = "direct_text"
                raw_text = extract_text_from_pdf(file_path)

            elif subtype == "scanned":
                print("[PIPELINE] Using OCR for scanned PDF")
                extraction_method = "ocr"
                raw_text = extract_text_from_scanned_pdf(file_path)

        # 🔹 Image handling
        elif file_type == "image":
            print("[PIPELINE] Using OCR for image")
            extraction_method = "ocr"
            raw_text = extract_text_from_image(file_path)

        # 🔹 Excel (not implemented yet)
        elif file_type == "excel":
            print("[PIPELINE] Excel not implemented")
            extraction_method = "excel_parser"
            raw_text = ""

        else:
            print("[PIPELINE] Unsupported file type")
            return None

        # 🔹 CLEAN TEXT
        clean_text_output = clean_text(raw_text)

        # 🔹 TABLE EXTRACTION
        tables = extract_key_value_pairs(clean_text_output)

        # 🔹 METADATA
        metadata = {
            "processedAt": str(datetime.now()),
            "fileType": file_type,
            "subtype": subtype,
            "extractionMethod": extraction_method
        }

        # 🔥 FINAL OUTPUT (IMPORTANT — DICTIONARY)
        result = {
            "fileName": file_name,
            "fileType": file_type,
            "rawText": raw_text,
            "cleanText": clean_text_output,
            "tables": tables,
            "metadata": metadata
        }

        print("[PIPELINE] Processing complete")

        return result

    except Exception as e:
        print("[ERROR]:", e)

        return {
            "fileName": file_name,
            "error": str(e)
        }