const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const authService = {
  // Delegates user creation to user-service. auth-service holds no
  // user data of its own, it only issues tokens.
  async register({ name, email, password }) {
    const res = await fetch(`${USER_SERVICE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await parseJson(res);
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to register user');
      err.statusCode = res.status;
      throw err;
    }
    return data;
  },

  // Calls the internal-only verify-credentials endpoint on user-service.
  async login({ email, password }) {
    const res = await fetch(`${USER_SERVICE_URL}/api/users/verify-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Api-Key': process.env.INTERNAL_API_KEY || '',
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 401) return null;

    const data = await parseJson(res);
    if (!res.ok) {
      const err = new Error(data.message || 'Login failed');
      err.statusCode = res.status;
      throw err;
    }
    return data;
  },
};
