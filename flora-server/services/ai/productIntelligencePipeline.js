const { extractProduct } = require('./geminiExtractor');
const { validateExtractedData } = require('../validationEngine');

/**
 * Runs Flora's complete AI product intelligence pipeline.
 *
 * Flow:
 * normalized document text
 *        ↓
 * Gemini extraction
 *        ↓
 * canonical product JSON
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

    const validationResult = validateExtractedData(rawGeminiText);

    return validationResult;
}

module.exports = {
    processProductDocument
};