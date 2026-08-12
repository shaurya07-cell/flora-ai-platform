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
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';
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

            if (code !== 0) {
                // If there's an error from the CLI, try to parse stdout/stderr for details
                let errorMessage = `Python OCR process exited with code ${code}`;
                if (stderrData) {
                    errorMessage += `: ${stderrData.trim()}`;
                }
                return reject(new Error(errorMessage));
            }

            try {
                // Parse stdout JSON
                const cleanStdout = stdoutData.trim();
                if (!cleanStdout) {
                    return reject(new Error('Python OCR process returned empty output'));
                }

                const result = JSON.parse(cleanStdout);

                // Handle invalid JSON or error from within the python script
                if (result.error) {
                    return reject(new Error(`OCR error: ${result.error}`));
                }

                // Handle missing cleanText
                if (!result.cleanText) {
                    return reject(new Error('OCR result is missing cleanText'));
                }

                resolve(result);
            } catch (err) {
                reject(new Error(`Failed to parse Python OCR output as JSON: ${err.message}. Raw output: ${stdoutData}`));
            }
        });
    });
}
