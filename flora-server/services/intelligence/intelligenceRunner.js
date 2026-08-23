// flora-server/services/intelligence/intelligenceRunner.js

import { spawn } from 'child_process';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Run the standalone Intelligence Engine on a product payload.
 *
 * @param {Object} productData - Normalized product object for the engine.
 * @param {Array} [catalog] - Optional array of catalog products.
 * @returns {Promise<Object>} - { success: true, data: <engineOutput> } or { success: false, errorCode, message }
 */
export async function runIntelligence(productData, catalog = []) {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `${randomUUID()}.json`);
  const pythonPath = process.env.PYTHON_PATH || process.env.PYTHON_EXECUTABLE || 'python';
  // Resolve main.py relative to repository root (two levels up from this file).
  const engineMain = path.resolve(__dirname, '../../..', 'intelligence', 'main.py');

  try {
    // Serialize input safely.
    await fsPromises.writeFile(tempFile, JSON.stringify({ product: productData, catalog }, null, 2), { encoding: 'utf8' });

    const child = spawn(pythonPath, [engineMain, '--input', tempFile], {
      cwd: path.resolve(__dirname, '../../..'), // Ensure repo root as cwd.
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    const timeoutMs = 30_000; // 30 seconds
    const timeoutHandle = setTimeout(() => {
      child.kill();
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => (stdout += data));
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => (stderr += data));

    return await new Promise((resolve) => {
      child.on('error', (err) => {
        clearTimeout(timeoutHandle);
        resolve({
          success: false,
          errorCode: 'INTELLIGENCE_ENGINE_ERROR',
          message: `Failed to start intelligence process: ${err.message}`
        });
      });

      child.on('close', (code, signal) => {
        clearTimeout(timeoutHandle);
        // Normal termination
        if (code !== 0) {
          const msg = stderr.trim() || `Process exited with code ${code}${signal ? `, signal ${signal}` : ''}`;
          resolve({
            success: false,
            errorCode: 'INTELLIGENCE_ENGINE_ERROR',
            message: msg
          });
          return;
        }
        // Attempt to parse stdout as JSON
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve({ success: true, data: parsed });
        } catch (parseErr) {
          resolve({
            success: false,
            errorCode: 'INTELLIGENCE_INVALID_OUTPUT',
            message: 'Intelligence engine returned malformed JSON'
          });
        }
      });
    });
  } catch (err) {
    // Any unexpected error (e.g., file I/O)
    return {
      success: false,
      errorCode: 'INTELLIGENCE_ENGINE_ERROR',
      message: err.message || 'Unexpected error during intelligence execution'
    };
  } finally {
    // Cleanup temporary file irrespective of outcome.
    try {
      await fsPromises.unlink(tempFile);
    } catch (_) {
      // Ignore cleanup errors.
    }
  }
}
