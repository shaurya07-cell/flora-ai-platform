import pytesseract
from PIL import Image

# ✅ Set correct path to Tesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image(file_path):
    print(f"[LOG] Starting OCR for: {file_path}")

    try:
        img = Image.open(file_path)
        print("[DEBUG] Image opened")

        text = pytesseract.image_to_string(img)
        print("[DEBUG] OCR done")

        print(f"[DEBUG] Text length: {len(text)}")

        return text

    except Exception as e:
        print("[ERROR]:", e)
        return None