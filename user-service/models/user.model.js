export const COLLECTION_NAME = 'users';

export const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string', minLength: 6 },
    },
  },
};

export const updateUserSchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
    additionalProperties: false,
  },
};

export const verifyCredentialsSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string' },
      password: { type: 'string' },
    },
  },
};

// Strips sensitive fields (like the hashed password) before a user
// document ever leaves this service.
export function toPublicUser(user) {
  if (!user) return user;
  const { password, ...publicUser } = user;
  return publicUser;
}
