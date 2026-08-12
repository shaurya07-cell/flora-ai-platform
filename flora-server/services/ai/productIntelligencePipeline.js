import { extractProduct } from './geminiExtractor.js';
import { normalizeGeminiProduct } from './productNormalizer.js';
import { validateExtractedData } from '../validationEngine.js';

/**
 * Runs Flora's complete AI product intelligence pipeline.
 *
 * Flow:
 * normalized document text
 *        ↓
 * Gemini extraction
 *        ↓
 * Gemini extraction format
 *        ↓
 * Canonical Product normalization
 *        ↓
 * Validation Engine
 *        ↓
 * ValidationResult
 *
 * @param {string} documentText - Normalized text produced by OCR/file parsing.
 * @returns {Promise<Object>} Flora ValidationResult.
 */
async function processProductDocument(documentText) {
    if (typeof documentText !== 'string' || !documentText.trim()) {
        throw new TypeError('documentText must be a non-empty string');
    }

    const rawGeminiText = await extractProduct(documentText);

    let geminiProduct;

    try {
        geminiProduct = JSON.parse(rawGeminiText);
    } catch (error) {
        // Pass malformed Gemini JSON to the Validation Engine.
        // The Validation Engine owns parsing-error classification.
        return validateExtractedData(rawGeminiText);
    }

    const canonicalProduct = normalizeGeminiProduct(geminiProduct);

    return validateExtractedData(
        JSON.stringify(canonicalProduct)
    );
}

export {
    processProductDocument
};