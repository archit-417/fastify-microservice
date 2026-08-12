import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../plugins/authenticate.js';
import { registerSchema, loginSchema } from '../models/auth.model.js';

export default async function authRoutes(fastify) {
  fastify.post('/register', { schema: registerSchema }, authController.register);
  fastify.post('/login', { schema: loginSchema }, authController.login);
  fastify.get('/me', { preHandler: authenticate }, authController.me);
}
