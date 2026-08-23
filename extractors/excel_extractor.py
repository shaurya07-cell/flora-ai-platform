"""
Excel/XLSX extractor for the FLORA OCR pipeline.

Converts spreadsheet data into a deterministic plain-text representation
suitable for downstream Gemini AI parsing.  Supports both .xlsx (openpyxl)
and gracefully handles empty/unreadable files with clear error messages.
"""

import os

try:
    import openpyxl
    _OPENPYXL_AVAILABLE = True
except ImportError:
    _OPENPYXL_AVAILABLE = False


def extract_text_from_excel(file_path: str) -> str:
    """
    Read an XLSX file and return a structured plain-text representation.

    The output format is:
        Sheet: <SheetName>
        Row 1: col1_value | col2_value | ...
        Row 2: col1_value | col2_value | ...
        ...

    Empty sheets are skipped.  Cells that are None or blank are represented
    as '-'.

    Args:
        file_path: Absolute path to an .xlsx / .xls file.

    Returns:
        A non-empty string containing the spreadsheet contents as text.

    Raises:
        ImportError:  If openpyxl is not installed.
        ValueError:   If the workbook has no sheets or every sheet is empty.
        RuntimeError: If openpyxl cannot open the file.
    """
    if not _OPENPYXL_AVAILABLE:
        raise ImportError(
            "openpyxl is required to process XLSX files. "
            "Install it with:  pip install openpyxl"
        )

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Excel file not found: {os.path.basename(file_path)}")

    try:
        # read_only=True + data_only=True for performance and raw cell values
        workbook = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to open Excel workbook '{os.path.basename(file_path)}': {exc}"
        ) from exc

    text_sections = []

    for sheet_name in workbook.sheetnames:
        sheet = workbook[sheet_name]
        sheet_lines = []

        for row in sheet.iter_rows(values_only=True):
            # Skip entirely blank rows
            if all(cell is None or str(cell).strip() == "" for cell in row):
                continue

            # Convert each cell to string; use '-' for None/blank
            cells = [str(cell).strip() if cell is not None else "-" for cell in row]
            # Remove trailing empty-ish cells to avoid noisy trailing delimiters
            while cells and cells[-1] == "-":
                cells.pop()
            if cells:
                sheet_lines.append(" | ".join(cells))

        if sheet_lines:
            text_sections.append(f"Sheet: {sheet_name}")
            text_sections.extend(sheet_lines)
            text_sections.append("")  # blank line between sheets

    workbook.close()

    if not text_sections:
        raise ValueError(
            "Excel workbook contains no readable data. "
            "All sheets appear to be empty."
        )

    return "\n".join(text_sections).strip()
