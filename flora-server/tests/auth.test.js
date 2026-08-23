import test from 'node:test';
import assert from 'assert';
import app from '../app.js';

test('Authentication & Role Authorization Suite', async (t) => {

  await t.test('1. Register fails with weak password', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Short Pass',
          email: 'short@example.com',
          password: '123'
        })
      });
      const data = await res.json();

      assert.strictEqual(res.status, 400);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'WEAK_PASSWORD');
    } finally {
      server.close();
    }
  });

  await t.test('2. OAuth endpoint reports configuration state cleanly when unconfigured', async () => {
    const server = app.listen(0);
    const port = server.address().port;

    try {
      const res = await fetch(`http://localhost:${port}/api/v1/auth/oauth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();

      assert.strictEqual(res.status, 501);
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error.code, 'OAUTH_NOT_CONFIGURED');
    } finally {
      server.close();
    }
  });

  await t.test('3. Production environment without JWT_SECRET fails fast with security error', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.JWT_SECRET;

    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    const { getJwtSecret } = await import('../middleware/auth.js');
    assert.throws(
      () => getJwtSecret(),
      (err) => err.message.includes('[FATAL SECURITY ERROR]')
    );

    process.env.NODE_ENV = origEnv;
    if (origSecret) process.env.JWT_SECRET = origSecret;
  });

  await t.test('4. Production environment with JWT_SECRET resolves configured secret', async () => {
    const origEnv = process.env.NODE_ENV;
    const origSecret = process.env.JWT_SECRET;

    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secure-prod-secret-1234567890!';

    const { getJwtSecret } = await import('../middleware/auth.js');
    const secret = getJwtSecret();
    assert.strictEqual(secret, 'super-secure-prod-secret-1234567890!');

    process.env.NODE_ENV = origEnv;
    if (origSecret) process.env.JWT_SECRET = origSecret;
    else delete process.env.JWT_SECRET;
  });

});
