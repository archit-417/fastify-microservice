import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.USER_SERVICE_URL = 'http://user-service.test';
process.env.INTERNAL_API_KEY = 'test-internal-key';
const { authService } = await import('../services/auth.service.js');

let originalFetch;

beforeEach(() => {
  originalFetch = global.fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

test('register() forwards the payload to user-service and returns the created user', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, 'http://user-service.test/api/users');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret123',
    });
    return {
      ok: true,
      status: 201,
      json: async () => ({ _id: '1', name: 'Ada', email: 'ada@example.com' }),
    };
  };

  const user = await authService.register({ name: 'Ada', email: 'ada@example.com', password: 'secret123' });
  assert.equal(user.email, 'ada@example.com');
});

test('register() throws with the upstream status code and message on failure', async () => {
  global.fetch = async () => ({
    ok: false,
    status: 409,
    json: async () => ({ message: 'Email already in use' }),
  });

  await assert.rejects(
    () => authService.register({ name: 'Ada', email: 'ada@example.com', password: 'secret123' }),
    (err) => {
      assert.equal(err.statusCode, 409);
      assert.equal(err.message, 'Email already in use');
      return true;
    },
  );
});

test('login() sends the internal API key and returns null on a 401', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, 'http://user-service.test/api/users/verify-credentials');
    assert.equal(options.headers['X-Internal-Api-Key'], 'test-internal-key');
    return { ok: false, status: 401, json: async () => ({}) };
  };

  const result = await authService.login({ email: 'ada@example.com', password: 'wrong' });
  assert.equal(result, null);
});

test('login() returns the verified user on success', async () => {
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ _id: '1', email: 'ada@example.com' }),
  });

  const result = await authService.login({ email: 'ada@example.com', password: 'correct' });
  assert.equal(result.email, 'ada@example.com');
});