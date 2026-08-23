import test from 'node:test';
import assert from 'node:assert';
import { getValidationQueue, approveProduct, rejectProduct } from '../controllers/productsController.js';
import Product from '../models/Product.js';

test('Validation Review Workflow Suite', async (t) => {

  await t.test('1. Validation queue returns only review-required products', async () => {
    // Mock Product.find
    const mockProducts = [
      { _id: '1', name: 'Valve', status: 'Needs Review' },
      { _id: '2', name: 'Pump', status: 'Needs Review' }
    ];

    const originalFind = Product.find;
    Product.find = () => ({
      sort: () => mockProducts
    });

    const req = { user: { _id: '000000000000', role: 'admin' } };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return {
          json: (j) => { resultJson = j; }
        };
      }
    };

    await getValidationQueue(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.success, true);
    assert.strictEqual(resultJson.data.length, 2);

    Product.find = originalFind;
  });

  await t.test('2. Empty validation queue works', async () => {
    const originalFind = Product.find;
    Product.find = () => ({
      sort: () => []
    });

    const req = { user: { _id: '000000000000', role: 'admin' } };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return {
          json: (j) => { resultJson = j; }
        };
      }
    };

    await getValidationQueue(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.success, true);
    assert.strictEqual(resultJson.data.length, 0);

    Product.find = originalFind;
  });

  await t.test('3. Approve succeeds for a valid review candidate', async () => {
    const mockProduct = {
      _id: 'prod123',
      name: 'Smart Motor',
      brand: 'FloraGrow',
      status: 'Needs Review',
      extractedData: { price: 100, sku: 'SKU123' },
      markModified: () => {},
      save: async () => {}
    };

    const originalFindById = Product.findById;
    Product.findById = async () => mockProduct;

    const req = {
      params: { id: 'prod123' },
      body: { name: 'Smart Motor V2', price: 150 },
      user: { _id: '000000000000', role: 'admin' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return {
          json: (j) => { resultJson = j; }
        };
      }
    };

    await approveProduct(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.success, true);
    assert.strictEqual(mockProduct.status, 'Verified');
    assert.strictEqual(mockProduct.name, 'Smart Motor V2');
    assert.strictEqual(mockProduct.extractedData.price, 150);

    Product.findById = originalFindById;
  });

  await t.test('4. Reject succeeds when supported', async () => {
    const mockProduct = {
      _id: 'prod123',
      name: 'Smart Motor',
      status: 'Needs Review',
      extractedData: {},
      markModified: () => {},
      save: async () => {}
    };

    const originalFindById = Product.findById;
    Product.findById = async () => mockProduct;

    const req = {
      params: { id: 'prod123' },
      body: { reason: 'Missing price field' },
      user: { _id: '000000000000', role: 'admin' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return {
          json: (j) => { resultJson = j; }
        };
      }
    };

    await rejectProduct(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.success, true);
    assert.strictEqual(mockProduct.status, 'Rejected');
    assert.strictEqual(mockProduct.extractedData.rejectionReason, 'Missing price field');

    Product.findById = originalFindById;
  });

  await t.test('5. Invalid product ID is handled safely', async () => {
    const originalFindById = Product.findById;
    Product.findById = async () => null;

    const req = { params: { id: 'invalid_id' }, body: {}, user: { _id: '000000000000', role: 'admin' } };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return {
          json: (j) => { resultJson = j; }
        };
      }
    };

    await approveProduct(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 404);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'PRODUCT_NOT_FOUND');

    Product.findById = originalFindById;
  });

  await t.test('6. Unsupported/invalid update fields are rejected', async () => {
    const mockProduct = {
      _id: 'prod123',
      name: 'Smart Motor',
      save: async () => {}
    };

    const originalFindById = Product.findById;
    Product.findById = async () => mockProduct;

    const req = {
      params: { id: 'prod123' },
      body: { price: -50 }, // Invalid negative price
      user: { _id: '000000000000', role: 'admin' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return {
          json: (j) => { resultJson = j; }
        };
      }
    };

    await approveProduct(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 400);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'INVALID_FIELD');

    Product.findById = originalFindById;
  });
});
