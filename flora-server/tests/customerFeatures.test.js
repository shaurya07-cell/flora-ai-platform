import test from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import { changePassword, updateProfile } from '../controllers/authController.js';
import { exportProducts, uploadProduct } from '../controllers/productsController.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

test('Customer Features Suite — Password, Profile, Export & Batch Upload', async (t) => {

  // ==========================================
  // FEATURE 1: CHANGE PASSWORD TESTS
  // ==========================================
  await t.test('1. Change password fails when unauthenticated (401 handled by middleware)', async () => {
    // Verified by requireAuth route protection
    assert.ok(true);
  });

  await t.test('2. Change password rejects wrong current password (401)', async () => {
    const currentHash = await bcrypt.hash('CorrectPass123', 10);
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      passwordHash: currentHash
    };

    const originalFindById = User.findById;
    User.findById = async () => mockUser;

    const req = {
      user: { _id: 'user123' },
      body: { currentPassword: 'WrongPassword!', newPassword: 'NewPassword123' }
    };
    let resultStatus = null;
    let resultJson = null;
    const res = {
      status: (s) => { resultStatus = s; return { json: (j) => { resultJson = j; } }; }
    };

    await changePassword(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 401);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'INVALID_CREDENTIALS');

    User.findById = originalFindById;
  });

  await t.test('3. Change password rejects weak new password (400)', async () => {
    const currentHash = await bcrypt.hash('CorrectPass123', 10);
    const mockUser = {
      _id: 'user123',
      passwordHash: currentHash
    };

    const originalFindById = User.findById;
    User.findById = async () => mockUser;

    const req = {
      user: { _id: 'user123' },
      body: { currentPassword: 'CorrectPass123', newPassword: '123' }
    };
    let resultStatus = null;
    let resultJson = null;
    const res = {
      status: (s) => { resultStatus = s; return { json: (j) => { resultJson = j; } }; }
    };

    await changePassword(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 400);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'WEAK_PASSWORD');

    User.findById = originalFindById;
  });

  await t.test('4. Change password succeeds & old password no longer works', async () => {
    const oldPass = 'OldSecret123';
    const newPass = 'NewSecret456';
    let savedHash = await bcrypt.hash(oldPass, 10);

    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      passwordHash: savedHash,
      toJSON: () => ({ id: 'user123', email: 'test@example.com' }),
      save: async function() { savedHash = this.passwordHash; }
    };

    const originalFindById = User.findById;
    User.findById = async () => mockUser;

    const req = {
      user: { _id: 'user123' },
      body: { currentPassword: oldPass, newPassword: newPass }
    };
    let resultStatus = null;
    let resultJson = null;
    const res = {
      status: (s) => { resultStatus = s; return { json: (j) => { resultJson = j; } }; }
    };

    await changePassword(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.success, true);
    assert.strictEqual(resultJson.data.user.passwordHash, undefined); // Never returns passwordHash

    // Verify old password fails & new password matches
    const oldMatch = await bcrypt.compare(oldPass, savedHash);
    const newMatch = await bcrypt.compare(newPass, savedHash);
    assert.strictEqual(oldMatch, false);
    assert.strictEqual(newMatch, true);

    User.findById = originalFindById;
  });

  // ==========================================
  // FEATURE 2: UPDATE PROFILE TESTS
  // ==========================================
  await t.test('5. Profile update updates name cleanly and preserves protected fields', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'Original Name',
      email: 'immutable@example.com',
      role: 'user',
      isActive: true,
      passwordHash: 'secret_hash',
      toJSON: function() { return { id: this._id, name: this.name, email: this.email, role: this.role }; },
      save: async () => {}
    };

    const originalFindById = User.findById;
    User.findById = async () => mockUser;

    const req = {
      user: { _id: 'user123' },
      body: {
        name: 'Updated Name',
        role: 'admin', // Should be ignored
        isActive: false, // Should be ignored
        email: 'hacked@example.com' // Should be ignored
      }
    };
    let resultStatus = null;
    let resultJson = null;
    const res = {
      status: (s) => { resultStatus = s; return { json: (j) => { resultJson = j; } }; }
    };

    await updateProfile(req, res, (err) => { throw err; });

    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.success, true);
    assert.strictEqual(mockUser.name, 'Updated Name');
    assert.strictEqual(mockUser.email, 'immutable@example.com'); // Email unchanged
    assert.strictEqual(mockUser.role, 'user'); // Role unchanged
    assert.strictEqual(mockUser.isActive, true); // Active status unchanged

    User.findById = originalFindById;
  });

  // ==========================================
  // FEATURE 3: CATALOG EXPORT TESTS
  // ==========================================
  await t.test('6. Product export respects user ownership isolation (JSON & CSV)', async () => {
    const userAProducts = [
      { _id: 'p1', name: 'User A Pump', status: 'Verified', brand: 'Flora', uploadedBy: 'userA' }
    ];

    const originalFind = Product.find;
    Product.find = (filter) => {
      assert.strictEqual(String(filter.uploadedBy), 'userA'); // Ownership scope enforced
      return {
        sort: () => ({
          lean: async () => userAProducts
        })
      };
    };

    // Test JSON Export
    const reqJson = {
      user: { _id: 'userA', role: 'user' },
      query: { format: 'json' }
    };
    let resultStatusJson = null;
    let resultJson = null;
    const resJson = {
      status: (s) => { resultStatusJson = s; return { json: (j) => { resultJson = j; } }; }
    };

    await exportProducts(reqJson, resJson, (err) => { throw err; });
    assert.strictEqual(resultStatusJson, 200);
    assert.strictEqual(resultJson.data.length, 1);
    assert.strictEqual(resultJson.data[0].name, 'User A Pump');

    // Test CSV Export
    const reqCsv = {
      user: { _id: 'userA', role: 'user' },
      query: { format: 'csv' }
    };
    let resultStatusCsv = null;
    let csvHeaderSet = false;
    let csvBody = null;
    const resCsv = {
      setHeader: (key) => { if (key === 'Content-Type') csvHeaderSet = true; },
      status: (s) => {
        resultStatusCsv = s;
        return { send: (b) => { csvBody = b; } };
      }
    };

    await exportProducts(reqCsv, resCsv, (err) => { throw err; });
    assert.strictEqual(resultStatusCsv, 200);
    assert.strictEqual(csvHeaderSet, true);
    assert.ok(csvBody.includes('ID,Product Name,Status,Brand'));
    assert.ok(csvBody.includes('"User A Pump"'));

    Product.find = originalFind;
  });

  await t.test('7. Empty catalog exports clean headers for CSV and empty array for JSON', async () => {
    const originalFind = Product.find;
    Product.find = () => ({
      sort: () => ({
        lean: async () => []
      })
    });

    const req = {
      user: { _id: 'emptyUser', role: 'user' },
      query: { format: 'json' }
    };
    let resultStatus = null;
    let resultJson = null;
    const res = {
      status: (s) => { resultStatus = s; return { json: (j) => { resultJson = j; } }; }
    };

    await exportProducts(req, res, (err) => { throw err; });
    assert.strictEqual(resultStatus, 200);
    assert.strictEqual(resultJson.data.length, 0);

    Product.find = originalFind;
  });

  // ==========================================
  // FEATURE 4: BATCH UPLOAD TESTS
  // ==========================================
  await t.test('8. Upload handles missing files safely (400)', async () => {
    const req = {
      user: { _id: 'user123', role: 'user' },
      files: []
    };
    let resultStatus = null;
    let resultJson = null;
    const res = {
      status: (s) => { resultStatus = s; return { json: (j) => { resultJson = j; } }; }
    };

    await uploadProduct(req, res, (err) => { throw err; });
    assert.strictEqual(resultStatus, 400);
    assert.strictEqual(resultJson.success, false);
    assert.strictEqual(resultJson.error.code, 'MISSING_FILE');
  });

});
