import 'dotenv/config';
import Fastify from 'fastify';
import fastifyMongodb from '@fastify/mongodb';
import { mongoConfig } from './config/db.js';
import userRoutes from './routes/user.routes.js';

const app = Fastify({ logger: true });

app.register(fastifyMongodb, mongoConfig);
app.register(userRoutes, { prefix: '/api/users' });

app.get('/health', async () => ({ status: 'ok', service: 'user-service' }));

app.setErrorHandler((err, request, reply) => {
  const statusCode = err.statusCode || 500;
  request.log.error(err);
  reply.code(statusCode).send({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`user-service listening on port: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
