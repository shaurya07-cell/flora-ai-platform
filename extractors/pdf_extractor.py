import pymupdf as fitz

# PDF Extractor module
def extract_text_from_pdf(file_path):
    print(f"[LOG] Extracting text from PDF: {file_path}")

    text_data = ""

    try:
        # pyrefly: ignore [unknown-name]
        doc = fitz.open(file_path)

        print(f"[LOG] Total pages: {len(doc)}")

        for page_num, page in enumerate(doc):
            print(f"[LOG] Reading page {page_num + 1}")
            page_text = page.get_text()

            print(f"[DEBUG] Page text length: {len(page_text)}")

            text_data += page_text

        print(f"[FINAL TEXT LENGTH]: {len(text_data)}")

        return text_data

    except Exception as e:
        print(f"[ERROR] {e}")
        return None
        import pytesseract
from PIL import Image
import io


def extract_text_from_scanned_pdf(file_path):
    print(f"[OCR] Processing scanned PDF: {file_path}")

    text_data = ""

    try:
        doc = fitz.open(file_path)

        for page_num, page in enumerate(doc):
            print(f"[OCR] Converting page {page_num + 1} to image")

            # Convert page to image
            pix = page.get_pixmap()

            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            print("[OCR] Running Tesseract OCR")

            # pyrefly: ignore [unknown-name]
            page_text = pytesseract.image_to_string(img)

            print(f"[OCR] Extracted length: {len(page_text)}")

            text_data += page_text

        return text_data

    except Exception as e:
        print("[ERROR OCR]:", e)
        return None
        import fitz
import pytesseract
from PIL import Image
import io


def extract_text_from_scanned_pdf(file_path):
    print(f"[OCR] Processing scanned PDF: {file_path}")

    text_data = ""

    try:
        doc = fitz.open(file_path)

        for page_num, page in enumerate(doc):
            print(f"[OCR] Converting page {page_num + 1} to image")

            pix = page.get_pixmap()

            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            print("[OCR] Running Tesseract OCR")

            page_text = pytesseract.image_to_string(img)

            text_data += page_text

        return text_data

    except Exception as e:
        print("[ERROR OCR]:", e)
        return ""