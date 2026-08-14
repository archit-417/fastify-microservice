import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { userService } from '../services/user.service.js';

function mockCollection({ existingUser = null, insertedId = 'mock-id' } = {}) {
  return {
    findOne: async () => existingUser,
    insertOne: async () => ({ insertedId }),
  };
}

test('create() hashes the password and never returns it in plain text', async () => {
  const collection = mockCollection();

  const user = await userService.create(collection, {
    name: 'Archit',
    email: 'archit@example.com',
    password: 'password123',
  });

  assert.notEqual(user.password, 'password123');
  assert.equal(user.name, 'Archit');
  assert.equal(user._id, 'mock-id');
});

test('create() throws a 409 when the email is already taken', async () => {
  const collection = mockCollection({
    existingUser: { _id: '1', email: 'archit@example.com' },
  });

  await assert.rejects(
    () => userService.create(collection, { name: 'Archit', email: 'archit@example.com', password: 'password123' }),
    (err) => {
      assert.equal(err.statusCode, 409);
      return true;
    },
  );
});

test('verifyCredentials() returns null when no user matches the email', async () => {
  const collection = { findOne: async () => null };

  const result = await userService.verifyCredentials(collection, 'ghost@example.com', 'whatever');
  assert.equal(result, null);
});

test('verifyCredentials() returns null when the password does not match', async () => {
  const hashed = await bcrypt.hash('correct-password', 10);
  const collection = {
    findOne: async () => ({ _id: '1', email: 'archit@example.com', password: hashed }),
  };

  const result = await userService.verifyCredentials(collection, 'archit@example.com', 'wrong-password');
  assert.equal(result, null);
});

test('verifyCredentials() returns the user when the password matches', async () => {
  const hashed = await bcrypt.hash('correct-password', 10);
  const collection = {
    findOne: async () => ({ _id: '1', email: 'archit@example.com', password: hashed }),
  };

  const result = await userService.verifyCredentials(collection, 'archit@example.com', 'correct-password');
  assert.equal(result.email, 'archit@example.com');
});