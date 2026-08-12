import sys
import os
import json

# Ensure we redirect stdout to stderr during imports and processing,
# so print statements inside main_processor and dependencies write to stderr instead of stdout.
class StdoutRedirector:
    def __init__(self, target):
        self.target = target
    def write(self, message):
        self.target.write(message)
    def flush(self):
        self.target.flush()

# Save original stdout
original_stdout = sys.stdout
sys.stdout = StdoutRedirector(sys.stderr)

from processors.main_processor import process_file

def main():
    if len(sys.argv) < 2:
        print("[CLI ERROR] Missing file path argument.", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"[CLI ERROR] File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    try:
        # Process file using the existing OCR pipeline function
        result = process_file(file_path)

        # Write JSON response to original stdout
        sys.stdout = original_stdout
        if result is None:
            json.dump({"error": "Unsupported file type or extraction returned None"}, sys.stdout)
        else:
            json.dump(result, sys.stdout)
        sys.stdout.write("\n")
        sys.stdout.flush()
    except Exception as e:
        sys.stdout = original_stdout
        json.dump({"error": str(e)}, sys.stdout)
        sys.stdout.write("\n")
        sys.stdout.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
