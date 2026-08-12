import { userService } from '../services/user.service.js';
import { COLLECTION_NAME, toPublicUser } from '../models/user.model.js';

function getCollection(request) {
  return request.server.mongo.db.collection(COLLECTION_NAME);
}

export const userController = {
  async create(request, reply) {
    const user = await userService.create(getCollection(request), request.body);
    reply.code(201).send(toPublicUser(user));
  },

  async getAll(request, reply) {
    const users = await userService.findAll(getCollection(request));
    reply.send(users.map(toPublicUser));
  },

  async getOne(request, reply) {
    const { ObjectId } = request.server.mongo;
    const user = await userService.findById(getCollection(request), new ObjectId(request.params.id));
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    reply.send(toPublicUser(user));
  },

  async update(request, reply) {
    const { ObjectId } = request.server.mongo;
    const user = await userService.update(
      getCollection(request),
      new ObjectId(request.params.id),
      request.body,
    );
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    reply.send(toPublicUser(user));
  },

  async remove(request, reply) {
    const { ObjectId } = request.server.mongo;
    const user = await userService.delete(getCollection(request), new ObjectId(request.params.id));
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    reply.code(204).send();
  },

  // Internal-only route: called by auth-service (or other trusted
  // services) to check a login attempt. Protected by an internal API key.
  async verifyCredentials(request, reply) {
    const internalKey = request.headers['x-internal-api-key'];
    if (process.env.INTERNAL_API_KEY && internalKey !== process.env.INTERNAL_API_KEY) {
      return reply.code(403).send({ message: 'Forbidden' });
    }

    const { email, password } = request.body;
    const user = await userService.verifyCredentials(getCollection(request), email, password);
    if (!user) {
      return reply.code(401).send({ message: 'Invalid email or password' });
    }
    reply.send(toPublicUser(user));
  },
};
