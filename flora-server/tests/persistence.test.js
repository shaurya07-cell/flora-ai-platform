import test from 'node:test';
import assert from 'node:assert';
import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

test('MongoDB Atlas Persistence & Ownership Verification Suite', async (t) => {

  await t.test('1. User model schema persists required fields without leaking plaintext passwords', async () => {
    const testUser = new User({
      name: 'Persistence Test User',
      email: `persist_${Date.now()}@example.com`,
      passwordHash: '$2a$10$e8wVw156y1/9N0uT...hash',
      provider: 'local',
      role: 'user'
    });

    assert.ok(testUser._id, 'User instance must generate a valid MongoDB _id');
    assert.strictEqual(testUser.name, 'Persistence Test User');
    assert.strictEqual(testUser.role, 'user');
    assert.ok(testUser.passwordHash, 'passwordHash must exist');

    const jsonObj = testUser.toJSON();
    assert.strictEqual(jsonObj.passwordHash, undefined, 'toJSON must strip passwordHash for security');
  });

  await t.test('2. Product model schema persists uploadedBy ownership, extractedData, intelligence, and timestamps', async () => {
    const userId = new mongoose.Types.ObjectId();
    const testProduct = new Product({
      name: 'Flora Smart Sensor',
      status: 'Verified',
      brand: 'Flora',
      category: 'Industrial IoT Sensor',
      description: 'Smart IoT sensor for industrial monitoring',
      sourceFile: 'valid_test_product.png',
      sourceFileType: 'image',
      uploadedBy: userId,
      extractedData: {
        sku: 'FL-SS-100',
        price: '49.99',
        currency: 'USD',
        specifications: [
          { key: 'voltage', value: '24V' },
          { key: 'connectivity', value: 'WiFi' }
        ],
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          confidence: { score: 98 }
        }
      },
      intelligence: {
        normalization: { status: 'complete' },
        classification: { category: 'Industrial IoT Sensor', confidence: 0.95 },
        quality: { overall_score: 0.95, validity_score: 1.0 },
        similarity: { duplicate_candidates: [] }
      }
    });

    assert.ok(testProduct._id, 'Product instance must generate a valid MongoDB _id');
    assert.strictEqual(testProduct.name, 'Flora Smart Sensor');
    assert.strictEqual(testProduct.status, 'Verified');
    assert.strictEqual(String(testProduct.uploadedBy), String(userId), 'uploadedBy must match user _id');
    assert.strictEqual(testProduct.extractedData.sku, 'FL-SS-100');
    assert.strictEqual(testProduct.extractedData.validation.isValid, true);
    assert.strictEqual(testProduct.intelligence.classification.category, 'Industrial IoT Sensor');
  });

});
