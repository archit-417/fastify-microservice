import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
const { authenticate } = await import('../plugins/authenticate.js');

function fakeReply() {
  return {
    statusCode: null,
    body: null,
    code(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

test('authenticate() rejects a request with no authorization header', async () => {
  const request = { headers: {} };
  const reply = fakeReply();

  await authenticate(request, reply);

  assert.equal(reply.statusCode, 401);
});

test('authenticate() rejects a malformed/invalid token', async () => {
  const request = { headers: { authorization: 'Bearer not-a-real-token' } };
  const reply = fakeReply();

  await authenticate(request, reply);

  assert.equal(reply.statusCode, 401);
});

test('authenticate() attaches the decoded payload to request.user for a valid token', async () => {
  const token = jwt.sign({ sub: 'user-1', email: 'ada@example.com' }, process.env.JWT_SECRET);
  const request = { headers: { authorization: `Bearer ${token}` } };
  const reply = fakeReply();

  await authenticate(request, reply);

  assert.equal(reply.statusCode, null);
  assert.equal(request.user.email, 'ada@example.com');
});