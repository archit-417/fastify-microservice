import 'dotenv/config';
import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';

const app = Fastify({ logger: true });

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

// Every request under /api/users is forwarded as-is to user-service.
app.register(fastifyHttpProxy, {
  upstream: USER_SERVICE_URL,
  prefix: '/api/users',
  rewritePrefix: '/api/users',
});

// Every request under /api/auth is forwarded as-is to auth-service.
app.register(fastifyHttpProxy, {
  upstream: AUTH_SERVICE_URL,
  prefix: '/api/auth',
  rewritePrefix: '/api/auth',
});

//Endpoint to healthcheck the gateway
app.get('/health', async () => (
  { 
    status: 'ok', 
    service: 'api-gateway' 
  }
));

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`api-gateway listening on port: ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
