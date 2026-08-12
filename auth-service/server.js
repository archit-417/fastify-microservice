import 'dotenv/config';
import Fastify from 'fastify';
import authRoutes from './routes/auth.routes.js';

const app = Fastify({ logger: true });

app.register(authRoutes, { prefix: '/api/auth' });

app.get('/health', async () => ({ status: 'ok', service: 'auth-service' }));

app.setErrorHandler((err, request, reply) => {
  const statusCode = err.statusCode || 500;
  request.log.error(err);
  reply.code(statusCode).send({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3002;

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`auth-service listening on port: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
