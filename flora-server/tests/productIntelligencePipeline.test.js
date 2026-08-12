import test from 'node:test';
import assert from 'node:assert/strict';

import {
    processProductDocument
} from '../services/ai/productIntelligencePipeline.js';

test('Pipeline exports processProductDocument', () => {
    assert.equal(typeof processProductDocument, 'function');
});

test('Pipeline rejects empty document content', async () => {
    await assert.rejects(
        () => processProductDocument(''),
        {
            name: 'TypeError',
            message: 'documentText must be a non-empty string'
        }
    );
});

test('Pipeline rejects non-string document content', async () => {
    await assert.rejects(
        () => processProductDocument(null),
        {
            name: 'TypeError',
            message: 'documentText must be a non-empty string'
        }
    );
});