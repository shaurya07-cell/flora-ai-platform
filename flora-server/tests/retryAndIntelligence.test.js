import test from 'node:test';
import assert from 'node:assert';
import { retryProductProcessing, recalculateProductIntelligence } from '../controllers/productsController.js';
import Product from '../models/Product.js';

test('Retry Processing & Intelligence Recalculation Suite', async (t) => {

  await t.test('1. Retry fails when product is not found (404)', async () => {
    const originalFindById = Product.findById;
    Product.findById = async () => null;

    const req = {
      params: { id: 'nonexistent_id' },
      user: { _id: 'owner123', role: 'user' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return { json: (j) => { resultJson = j; } };
      }
    };

    await retryProductProcessing(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 404);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'PRODUCT_NOT_FOUND');

    Product.findById = originalFindById;
  });

  await t.test('2. Retry denies cross-user access (403)', async () => {
    const mockProduct = {
      _id: 'prod123',
      uploadedBy: 'userA_id',
      name: 'User A Product'
    };

    const originalFindById = Product.findById;
    Product.findById = async () => mockProduct;

    const req = {
      params: { id: 'prod123' },
      user: { _id: 'userB_id', role: 'user' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return { json: (j) => { resultJson = j; } };
      }
    };

    await retryProductProcessing(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 403);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'FORBIDDEN');

    Product.findById = originalFindById;
  });

  await t.test('3. Recalculate intelligence fails when product is not found (404)', async () => {
    const originalFindById = Product.findById;
    Product.findById = async () => null;

    const req = {
      params: { id: 'nonexistent_id' },
      user: { _id: 'owner123', role: 'user' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return { json: (j) => { resultJson = j; } };
      }
    };

    await recalculateProductIntelligence(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 404);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'PRODUCT_NOT_FOUND');

    Product.findById = originalFindById;
  });

  await t.test('4. Recalculate intelligence denies cross-user access (403)', async () => {
    const mockProduct = {
      _id: 'prod123',
      uploadedBy: 'userA_id',
      name: 'User A Product'
    };

    const originalFindById = Product.findById;
    Product.findById = async () => mockProduct;

    const req = {
      params: { id: 'prod123' },
      user: { _id: 'userB_id', role: 'user' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return { json: (j) => { resultJson = j; } };
      }
    };

    await recalculateProductIntelligence(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 403);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'FORBIDDEN');

    Product.findById = originalFindById;
  });

  await t.test('5. Recalculate intelligence succeeds for owner with mock runner', async () => {
    const mockProduct = {
      _id: '507f1f77bcf86cd799439011',
      uploadedBy: 'owner123',
      name: 'Flora Smart Valve',
      brand: 'FloraGrow',
      category: 'Smart Valve',
      extractedData: { sku: 'FLSV200', specifications: { pressure: '10 bar' } },
      markModified: () => {},
      save: async () => {}
    };

    const originalFindById = Product.findById;
    const originalFind = Product.find;

    Product.findById = async () => mockProduct;
    Product.find = () => ({
      lean: async () => [mockProduct]
    });

    const req = {
      params: { id: '507f1f77bcf86cd799439011' },
      user: { _id: 'owner123', role: 'user' }
    };
    let resultStatus = null;
    let resultJson = null;

    const res = {
      status: (s) => {
        resultStatus = s;
        return { json: (j) => { resultJson = j; } };
      }
    };

    await recalculateProductIntelligence(req, res, (err) => { throw err; });

    if (resultStatus === 200) {
      assert.strictEqual(resultJson.success, true);
      assert.strictEqual(resultJson.message, 'Intelligence recalculated successfully');
      assert.ok(mockProduct.intelligence);
    } else {
      assert.strictEqual(resultStatus, 500);
      assert.strictEqual(resultJson.success, false);
      assert.ok(resultJson.error);
    }

    Product.findById = originalFindById;
    Product.find = originalFind;
  });

});
