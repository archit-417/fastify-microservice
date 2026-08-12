import { userController } from '../controllers/user.controller.js';
import { createUserSchema, updateUserSchema, verifyCredentialsSchema } from '../models/user.model.js';

export default async function userRoutes(fastify) {
  fastify.post('/', { schema: createUserSchema }, userController.create);
  fastify.get('/', userController.getAll);
  fastify.get('/:id', userController.getOne);
  fastify.patch('/:id', { schema: updateUserSchema }, userController.update);
  fastify.delete('/:id', userController.remove);

  // Internal-only endpoint, meant to be called by auth-service, not
  // by external clients through the gateway.
  fastify.post('/verify-credentials', { schema: verifyCredentialsSchema }, userController.verifyCredentials);
}
