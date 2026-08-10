const { GoogleGenAI } = require('@google/genai');
const { CANONICAL_PRODUCT_SCHEMA } = require('./geminiContract');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function createGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    return new GoogleGenAI({ apiKey });
}

function buildExtractionPrompt(documentText) {
    return `
You are Flora's product information extraction engine.

Extract product information from the supplied document content.

Rules:

1. Extract only information supported by the document.
2. Do not invent missing product information.
3. Preserve numeric prices as numbers.
4. Normalize currency to a 3-letter uppercase ISO code.
5. Keep specifications as an array of name-value objects.
6. Keep complianceFlags as an array of strings.
7. Extract specification rows from tables and relevant specification text into the specifications array.
8. For every specification containing a name and value, create one object with exactly two fields: "name" and "value".
9. Preserve specification names and values as strings.
10. Do not omit supported specification rows.
11. Do not invent specification names or values that are not supported by the document.
12. Do not put dimensions into specifications when a dedicated dimensions field is available.
13. Put physical dimensions such as length, width, height, depth, or size into the dedicated dimensions field when clearly identified.
14. Keep compliance certifications or regulatory marks such as CE, RoHS, and UL in complianceFlags.
15. If an optional field is genuinely not present in the document, return an empty value according to the schema.
16. Return only the requested structured JSON object.

Document content:

${documentText}
`;
}

async function extractProduct(documentText) {
    if (typeof documentText !== 'string' || !documentText.trim()) {
        throw new TypeError('documentText must be a non-empty string');
    }

    const ai = createGeminiClient();

    const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: buildExtractionPrompt(documentText),
        config: {
            responseMimeType: 'application/json',
            responseSchema: CANONICAL_PRODUCT_SCHEMA,
        }
    });

    if (!response.text) {
        throw new Error('Gemini returned an empty response');
    }

    return response.text;
}

module.exports = {
    extractProduct,
    buildExtractionPrompt
};