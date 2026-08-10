const test = require('node:test');
const assert = require('node:assert/strict');

const {
    buildExtractionPrompt,
    extractProduct
} = require('../services/ai/geminiExtractor');

const {
    CANONICAL_PRODUCT_SCHEMA
} = require('../services/ai/geminiContract');

test('Gemini extractor module exports required functions', () => {
    assert.equal(typeof buildExtractionPrompt, 'function');
    assert.equal(typeof extractProduct, 'function');
});

test('Canonical product schema is available to the AI layer', () => {
    assert.equal(CANONICAL_PRODUCT_SCHEMA.type, 'object');

    assert.deepEqual(
        CANONICAL_PRODUCT_SCHEMA.required,
        ['productName', 'sku', 'brand', 'price', 'currency']
    );
});

test('Extraction prompt contains supplied document content', () => {
    const documentText =
        'FloraGrow 200W LED, SKU FG-200, price 149.99 USD';

    const prompt = buildExtractionPrompt(documentText);

    assert.match(prompt, /FloraGrow 200W LED/);
    assert.match(prompt, /FG-200/);
    assert.match(prompt, /149\.99 USD/);
});

test('Extraction prompt contains anti-hallucination instructions', () => {
    const prompt = buildExtractionPrompt('Sample product');

    assert.match(
        prompt,
        /Do not invent missing product information/
    );

    assert.match(
        prompt,
        /Return only the requested structured JSON object/
    );
});

test('Extractor rejects empty document content', async () => {
    await assert.rejects(
        () => extractProduct(''),
        {
            name: 'TypeError',
            message: 'documentText must be a non-empty string'
        }
    );
});

test('Extractor rejects non-string document content', async () => {
    await assert.rejects(
        () => extractProduct(null),
        {
            name: 'TypeError',
            message: 'documentText must be a non-empty string'
        }
    );
});