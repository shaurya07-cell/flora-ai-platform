import os

# pyrefly: ignore [missing-import]
import pytesseract
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from PIL import Image

# Load environment variables from the project root
load_dotenv()

tesseract_cmd = os.getenv("TESSERACT_CMD")

if not tesseract_cmd:
    raise RuntimeError(
        "TESSERACT_CMD is not configured in the .env file."
    )

if not os.path.isfile(tesseract_cmd):
    raise RuntimeError(
        f"Tesseract executable not found at: {tesseract_cmd}"
    )

pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


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