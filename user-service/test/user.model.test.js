import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toPublicUser } from '../models/user.model.js';

test('toPublicUser() strips the password field', () => {
  const user = { _id: '1', name: 'Archit', email: 'archit@example.com', password: 'hashed' };
  const publicUser = toPublicUser(user);

  assert.equal(publicUser.password, undefined);
  assert.equal(publicUser.name, 'Archit');
  assert.equal(publicUser.email, 'archit@example.com');
});

test('toPublicUser() passes through falsy input unchanged', () => {
  assert.equal(toPublicUser(null), null);
  assert.equal(toPublicUser(undefined), undefined);
});