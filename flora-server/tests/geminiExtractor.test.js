import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildExtractionPrompt,
    extractProduct
} from '../services/ai/geminiExtractor.js';

import {
    CANONICAL_PRODUCT_SCHEMA
} from '../services/ai/geminiContract.js';

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

    assert.equal(
        CANONICAL_PRODUCT_SCHEMA.properties.specifications.type,
        'array'
    );

    assert.deepEqual(
        CANONICAL_PRODUCT_SCHEMA.properties.specifications.items.required,
        ['name', 'value']
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
test('Extraction prompt preserves OCR table content', () => {
    const documentText = `
Product Catalogue

Product: FloraGrow 200W LED
SKU: FG-200

| Specification | Value |
|---|---|
| Power | 200W |
| Voltage | 24V |
| Dimensions | 20 x 15 x 12 cm |

Compliance: CE, RoHS
`;

    const prompt = buildExtractionPrompt(documentText);

    assert.match(prompt, /Specification/);
    assert.match(prompt, /Power/);
    assert.match(prompt, /200W/);
    assert.match(prompt, /Voltage/);
    assert.match(prompt, /24V/);
    assert.match(prompt, /Dimensions/);
    assert.match(prompt, /20 x 15 x 12 cm/);
});

test('Extractor times out when Gemini API call exceeds timeout', async () => {
    process.env.GEMINI_API_KEY = 'test_key';
    process.env.GEMINI_TIMEOUT_MS = '50';

    await assert.rejects(
        () => extractProduct('Sample product text for timeout test'),
        (err) => {
            return err.code === 'GEMINI_API_ERROR' || err.message.includes('timed out');
        }
    );

    delete process.env.GEMINI_TIMEOUT_MS;
});