import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';
import child_process from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import express from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import { runOcr } from '../services/ocr/ocrRunner.js';
import app from '../app.js';
import mongoose from 'mongoose';

// Setup mock environment variables
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'mock_api_key_for_testing';
process.env.PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || 'py';

// Generate a mock JWT for API tests — uses the same fallback secret as auth.js
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'flora-dev-fallback-secret-change-in-production';
const mockUserId = new mongoose.Types.ObjectId();
const mockAuthToken = jwt.sign(
  { id: mockUserId, email: 'testuser@flora.ai', role: 'user' },
  TEST_JWT_SECRET,
  { expiresIn: '1h' }
);
const mockAuthHeader = `Bearer ${mockAuthToken}`;

test('OCR Runner & API Integration Suite', async (t) => {

    t.afterEach(() => {
        mock.reset();
    });

    // ==========================================
    // OCR RUNNER TESTS
    // ==========================================

    await t.test('1. OCR runner success with mock spawn', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'invoice.png',
                                fileType: 'image',
                                cleanText: 'TANTeWEYSide1 Nv003281900229170',
                                tables: { test: 'val' },
                                metadata: { method: 'ocr' }
                            })));
                        }
                    }
                },
                stderr: {
                    on: (event, cb) => {}
                },
                on: (event, cb) => {
                    if (event === 'close') {
                        setTimeout(() => cb(0), 10);
                    }
                },
                kill: () => {}
            };
        });

        // Use .env.example since it always exists in the workspace to satisfy fs.access
        const result = await runOcr('.env.example');
        assert.strictEqual(result.fileName, 'invoice.png');
        assert.strictEqual(result.cleanText, 'TANTeWEYSide1 Nv003281900229170');
        assert.strictEqual(result.tables.test, 'val');
    });

    await t.test('2. OCR runner invalid path', async () => {
        await assert.rejects(
            () => runOcr('non-existent-file-path-xyz.png'),
            {
                name: 'Error',
                message: /File not found/
            }
        );
    });

    await t.test('3. OCR runner invalid JSON output', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from('not-a-json-string'));
                        }
                    }
                },
                stderr: {
                    on: (event, cb) => {}
                },
                on: (event, cb) => {
                    if (event === 'close') {
                        setTimeout(() => cb(0), 10);
                    }
                },
                kill: () => {}
            };
        });

        await assert.rejects(
            () => runOcr('.env.example'),
            {
                name: 'Error',
                message: /Failed to parse Python OCR output as JSON/
            }
        );
    });

    await t.test('4. OCR runner timeout or spawn failure', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {}
                },
                stderr: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from('Subprocess execution error description'));
                        }
                    }
                },
                on: (event, cb) => {
                    if (event === 'close') {
                        setTimeout(() => cb(1), 10);
                    }
                },
                kill: () => {}
            };
        });

        await assert.rejects(
            () => runOcr('.env.example'),
            {
                name: 'Error',
                message: /Python OCR process exited with code 1/
            }
        );
    });

    await t.test('5. OCR runner missing cleanText field', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'doc.xlsx',
                                fileType: 'excel',
                                rawText: '',
                                // cleanText intentionally omitted
                                tables: {},
                                metadata: {}
                            })));
                        }
                    }
                },
                stderr: { on: (event, cb) => {} },
                on: (event, cb) => {
                    if (event === 'close') { setTimeout(() => cb(0), 10); }
                },
                kill: () => {}
            };
        });

        await assert.rejects(
            () => runOcr('.env.example'),
            { name: 'Error', message: /OCR contract violation: cleanText is missing/ }
        );
    });

    await t.test('6. OCR runner empty cleanText field', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'empty.xlsx',
                                fileType: 'excel',
                                rawText: '',
                                cleanText: '',
                                tables: {},
                                metadata: {}
                            })));
                        }
                    }
                },
                stderr: { on: (event, cb) => {} },
                on: (event, cb) => {
                    if (event === 'close') { setTimeout(() => cb(0), 10); }
                },
                kill: () => {}
            };
        });

        await assert.rejects(
            () => runOcr('.env.example'),
            { name: 'Error', message: /OCR contract violation: cleanText is empty/ }
        );
    });

    await t.test('7. OCR runner blank (whitespace-only) cleanText', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'blank.xlsx',
                                fileType: 'excel',
                                rawText: '   ',
                                cleanText: '   ',
                                tables: {},
                                metadata: {}
                            })));
                        }
                    }
                },
                stderr: { on: (event, cb) => {} },
                on: (event, cb) => {
                    if (event === 'close') { setTimeout(() => cb(0), 10); }
                },
                kill: () => {}
            };
        });

        await assert.rejects(
            () => runOcr('.env.example'),
            { name: 'Error', message: /OCR contract violation: cleanText is blank/ }
        );
    });

    await t.test('8. OCR runner XLSX extraction success', async () => {
        const xlsxCleanText = [
            'Sheet: Products',
            'Product Name | SKU | Brand | Price | Currency',
            'Flora Smart Sensor | FL-SS-100 | Flora | 49.99 | USD',
        ].join('\n');

        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'products.xlsx',
                                fileType: 'excel',
                                rawText: xlsxCleanText,
                                cleanText: xlsxCleanText,
                                tables: {},
                                metadata: { extractionMethod: 'excel_parser' }
                            })));
                        }
                    }
                },
                stderr: { on: (event, cb) => {} },
                on: (event, cb) => {
                    if (event === 'close') { setTimeout(() => cb(0), 10); }
                },
                kill: () => {}
            };
        });

        const result = await runOcr('.env.example');
        assert.strictEqual(result.fileType, 'excel');
        assert.strictEqual(result.metadata.extractionMethod, 'excel_parser');
        assert.ok(result.cleanText.includes('Flora Smart Sensor'));
        assert.ok(result.cleanText.includes('Sheet: Products'));
    });

    await t.test('9. OCR runner Python-level error response', async () => {
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'corrupt.xlsx',
                                error: 'Excel workbook contains no readable data. All sheets appear to be empty.'
                            })));
                        }
                    }
                },
                stderr: { on: (event, cb) => {} },
                on: (event, cb) => {
                    if (event === 'close') { setTimeout(() => cb(0), 10); }
                },
                kill: () => {}
            };
        });

        await assert.rejects(
            () => runOcr('.env.example'),
            { name: 'Error', message: /OCR extraction error/ }
        );
    });

    // ==========================================
    // EXPRESS API TESTS
    // ==========================================


    await t.test('10. API missing file', async () => {
        const server = app.listen(0);
        const port = server.address().port;

        // Mock User.findById so requireAuth can resolve the mock token user
        mock.method(mongoose.Model, 'findById', async function(id) {
            if (String(id) === String(mockUserId)) {
                return { _id: mockUserId, email: 'testuser@flora.ai', role: 'user', isActive: true };
            }
            return null;
        });

        try {
            const response = await fetch(`http://localhost:${port}/api/v1/products/analyze`, {
                method: 'POST',
                headers: { Authorization: mockAuthHeader }
            });
            const data = await response.json();

            assert.strictEqual(response.status, 400);
            assert.strictEqual(data.success, false);
            assert.strictEqual(data.error.code, 'MISSING_FILE');
        } finally {
            server.close();
        }
    });

    await t.test('11. API unsupported file type', async () => {
        const server = app.listen(0);
        const port = server.address().port;

        mock.method(mongoose.Model, 'findById', async function(id) {
            if (String(id) === String(mockUserId)) {
                return { _id: mockUserId, email: 'testuser@flora.ai', role: 'user', isActive: true };
            }
            return null;
        });

        try {
            const form = new FormData();
            const blob = new Blob(['hello world'], { type: 'text/plain' });
            form.append('file', blob, 'test.txt');

            const response = await fetch(`http://localhost:${port}/api/v1/products/analyze`, {
                method: 'POST',
                headers: { Authorization: mockAuthHeader },
                body: form
            });
            const data = await response.json();

            assert.strictEqual(response.status, 400);
            assert.strictEqual(data.success, false);
            assert.ok(data.error.code === 'LIMIT_UNSUPPORTED_FILE_TYPE' || data.error.code === 'UNSUPPORTED_FILE_TYPE');
        } finally {
            server.close();
        }
    });

    await t.test('12. API successful OCR -> Gemini -> validation flow', async () => {
        mock.method(mongoose.Model, 'findById', async function(id) {
            if (String(id) === String(mockUserId)) {
                return { _id: mockUserId, email: 'testuser@flora.ai', role: 'user', isActive: true };
            }
            return null;
        });

        // Mock child_process.spawn inside OCR bridge
        mock.method(child_process, 'spawn', () => {
            return {
                stdout: {
                    on: (event, cb) => {
                        if (event === 'data') {
                            cb(Buffer.from(JSON.stringify({
                                fileName: 'label.png',
                                fileType: 'image',
                                cleanText: 'Product Name: Flora Smart Sensor SKU: FL-SS-100 Brand: Flora Price: 49.99 Currency: USD',
                                tables: {},
                                metadata: { processedAt: '2026-08-12 12:00:00' }
                            })));
                        }
                    }
                },
                stderr: {
                    on: (event, cb) => {}
                },
                on: (event, cb) => {
                    if (event === 'close') {
                        setTimeout(() => cb(0), 10);
                    }
                },
                kill: () => {}
            };
        });

        // Mock global fetch to intercept the Gemini API call made by @google/genai
        const originalFetch = globalThis.fetch;
        mock.method(globalThis, 'fetch', async (url, options) => {
            const urlStr = typeof url === 'string' ? url : (url && url.url) || '';
            if (urlStr.includes('generativelanguage.googleapis.com')) {
                return new Response(JSON.stringify({
                    candidates: [
                        {
                            content: {
                                parts: [
                                    {
                                        text: JSON.stringify({
                                            productName: "Flora Smart Sensor",
                                            sku: "FL-SS-100",
                                            brand: "Flora",
                                            price: 49.99,
                                            currency: "USD",
                                            description: "Smart soil humidity and temperature sensor.",
                                            dimensions: "10 x 2 x 2 cm",
                                            specifications: [
                                                { name: "type", value: "Capacitive" }
                                            ],
                                            complianceFlags: ["CE", "RoHS"]
                                        })
                                    }
                                ]
                            }
                        }
                    ]
                }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            }
            return originalFetch(url, options);
        });

        // Mock Product save method to prevent MongoDB save attempts during this unit test
        mock.method(Product.prototype, 'save', async function() {
            this._id = 'mocked_db_id_12345';
            return this;
        });

        const server = app.listen(0);
        const port = server.address().port;

        try {
            const form = new FormData();
            const blob = new Blob([Buffer.from([0,1,2,3])], { type: 'image/png' });
            form.append('file', blob, 'label.png');

            const response = await fetch(`http://localhost:${port}/api/v1/products/analyze`, {
                method: 'POST',
                headers: { Authorization: mockAuthHeader },
                body: form
            });
            const data = await response.json();

            assert.strictEqual(response.status, 201);
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.document.fileName, 'label.png');
            assert.strictEqual(data.data.ocr.cleanText, 'Product Name: Flora Smart Sensor SKU: FL-SS-100 Brand: Flora Price: 49.99 Currency: USD');
            assert.strictEqual(data.data.validation.isValid, true);
            assert.strictEqual(data.data.product.name, 'Flora Smart Sensor');
        } finally {
            server.close();
        }
    });
});
