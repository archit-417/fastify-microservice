import { userController } from '../controllers/user.controller.js';
import { createUserSchema, updateUserSchema, verifyCredentialsSchema } from '../models/user.model.js';
import { authenticate } from '../plugins/authenticate.js';

export default async function userRoutes(fastify) {
  fastify.post('/', { schema: createUserSchema }, userController.create);

  // Protected: require a valid JWT (issued by auth-service on login/register).
  fastify.get('/', { preHandler: authenticate }, userController.getAll);
  fastify.get('/:id', { preHandler: authenticate }, userController.getOne);
  fastify.patch('/:id', { schema: updateUserSchema, preHandler: authenticate }, userController.update);
  fastify.delete('/:id', { preHandler: authenticate }, userController.remove);

  // Internal-only endpoint, meant to be called by auth-service, not
  // by external clients through the gateway.
  fastify.post('/verify-credentials', { schema: verifyCredentialsSchema }, userController.verifyCredentials);
}
