import jwt from 'jsonwebtoken';

// Use as a preHandler on any route that requires a valid JWT.
// Verifies independently against JWT_SECRET (shared with auth-service)
// rather than calling auth-service over the network for every request.
export async function authenticate(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return reply.code(401).send({ message: 'Invalid or expired token' });
  }
}