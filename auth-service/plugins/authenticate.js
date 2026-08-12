import { verifyToken } from '../utils/jwt.js';

// Use as a preHandler on any route that requires a valid JWT.
export async function authenticate(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    request.user = verifyToken(token);
  } catch {
    return reply.code(401).send({ message: 'Invalid or expired token' });
  }
}
