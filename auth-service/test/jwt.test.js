import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
const { signToken, verifyToken } = await import('../utils/jwt.js');

test('signToken() + verifyToken() round-trip the original payload', () => {
  const token = signToken({ sub: 'user-1', email: 'ada@example.com' });
  const decoded = verifyToken(token);

  assert.equal(decoded.sub, 'user-1');
  assert.equal(decoded.email, 'ada@example.com');
});

test('verifyToken() throws for a tampered token', () => {
  const token = signToken({ sub: 'user-1' });
  const tampered = `${token.slice(0, -2)}xx`;

  assert.throws(() => verifyToken(tampered));
});