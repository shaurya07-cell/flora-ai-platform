import os
# pyrefly: ignore [missing-import]
import pymupdf as fitz


def is_pdf_searchable(file_path):
    print(f"[LOG] Checking if PDF is searchable: {file_path}")

    try:
        doc = fitz.open(file_path)
        first_page = doc[0]
        text = first_page.get_text()

        if text and len(text.strip()) > 50:
            return True
        else:
            return False

    except Exception as e:
        print(f"[ERROR] {e}")
        return False


def detect_file_type(file_path):
    print(f"[LOG] Checking file type for: {file_path}")

    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    if ext == ".pdf":
        searchable = is_pdf_searchable(file_path)

        return {
            "type": "pdf",
            "subtype": "searchable" if searchable else "scanned"
        }

    elif ext in [".jpg", ".jpeg", ".png"]:
        return {
            "type": "image",
            "subtype": "image"
        }

    elif ext in [".xlsx", ".xls"]:
        return {
            "type": "excel",
            "subtype": "spreadsheet"
        }

    else:
        return {
            "type": None,
            "subtype": None,
            "error": "Unsupported file type"
        }