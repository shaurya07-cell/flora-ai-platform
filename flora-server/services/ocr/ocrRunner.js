import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import child_process from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.resolve(__dirname, '../../../main.py');

/**
 * Runs the Python OCR pipeline for the given file.
 *
 * @param {string} absoluteFilePath - The absolute path of the file to process.
 * @returns {Promise<object>} The parsed JSON object representing OCR results.
 *
 * The returned object always contains:
 *   - cleanText  {string}  Readable text representation (non-empty)
 *   - rawText    {string}  Unprocessed extraction output
 *   - fileName   {string}  Basename of the processed file
 *   - fileType   {string}  Detected type: 'pdf' | 'image' | 'excel'
 *   - tables     {object}  Key-value pairs extracted from structured content
 *   - metadata   {object}  Processing metadata (method, timestamps)
 */
export async function runOcr(absoluteFilePath) {
    if (!absoluteFilePath) {
        throw new Error('File path is required');
    }

    // 1. Resolve and validate path exists
    const resolvedPath = path.resolve(absoluteFilePath);
    try {
        await fs.access(resolvedPath);
    } catch (err) {
        throw new Error(`File not found: ${path.basename(resolvedPath)}`);
    }

    // 2. Configure Python executable and timeout from environment variables
    const pythonExecutable = process.env.PYTHON_PATH || process.env.PYTHON_EXECUTABLE || 'python';
    const ocrTimeout = parseInt(process.env.OCR_TIMEOUT_MS, 10) || 60000;

    return new Promise((resolve, reject) => {
        // 3. Spawn process without shell context for safety
        const args = [pythonScriptPath, resolvedPath];
        const pyProcess = child_process.spawn(pythonExecutable, args);

        let stdoutData = '';
        let stderrData = '';
        let timer = null;

        // Set timeout
        timer = setTimeout(() => {
            pyProcess.kill('SIGTERM');
            reject(new Error(`OCR process timed out after ${ocrTimeout}ms`));
        }, ocrTimeout);

        pyProcess.stdout.on('data', (chunk) => {
            stdoutData += chunk.toString();
        });

        pyProcess.stderr.on('data', (chunk) => {
            stderrData += chunk.toString();
        });

        pyProcess.on('error', (err) => {
            clearTimeout(timer);
            reject(new Error(`Failed to spawn Python process: ${err.message}`));
        });

        pyProcess.on('close', (code) => {
            clearTimeout(timer);

            // Always surface stderr diagnostics to the server log (never to frontend)
            if (stderrData.trim()) {
                console.error('[OCR stderr]', stderrData.trim());
            }

            if (code !== 0) {
                const detail = stderrData.trim()
                    ? `: ${stderrData.trim().split('\n').pop()}` // last stderr line
                    : '';
                return reject(new Error(`Python OCR process exited with code ${code}${detail}`));
            }

            try {
                // Parse stdout JSON
                const cleanStdout = stdoutData.trim();
                if (!cleanStdout) {
                    return reject(new Error('Python OCR process returned empty output'));
                }

                const result = JSON.parse(cleanStdout);

                // Python-level extraction error
                if (result.error) {
                    return reject(new Error(`OCR extraction error: ${result.error}`));
                }

                // Contract validation: cleanText must be a non-empty string
                if (typeof result.cleanText !== 'string' || result.cleanText.trim() === '') {
                    return reject(new Error(
                        `OCR contract violation: cleanText is ${
                            result.cleanText === undefined ? 'missing' :
                            result.cleanText === null    ? 'null'    :
                            result.cleanText === ''      ? 'empty'   : 'blank'
                        } (fileType=${result.fileType ?? 'unknown'})`
                    ));
                }

                resolve(result);
            } catch (err) {
                // Truncate raw output in error message to avoid leaking file contents
                const preview = stdoutData.slice(0, 200).replace(/\n/g, ' ');
                reject(new Error(`Failed to parse Python OCR output as JSON: ${err.message}. Raw preview: ${preview}`));
            }
        });
    });
}
