# fastify-microservices


## Architecture

```
             client
                │
                ▼
         ┌─────────────┐
         │ api-gateway │  (3000)
         └──────┬──────┘
       ┌────────┴───────┐
       ▼                ▼
 ┌────────────┐   ┌────────────┐
 │user-service│   │auth-service│
 │  (3001)    │◄──┤  (3002)    │
 └─────┬──────┘   └────────────┘
       ▼
   MongoDB
```

- **api-gateway** is the single public entry point. It doesn't contain any
  business logic — it just proxies `/api/users/*` to `user-service` and
  `/api/auth/*` to `auth-service` (via `@fastify/http-proxy`).

- **user-service** owns all user data (MongoDB). It hashes passwords with
  `bcryptjs` and never returns the password field. It also exposes an
  **internal-only** route, `POST /api/users/verify-credentials`, protected
  by a shared `INTERNAL_API_KEY` header, used by `auth-service` during login.

- **auth-service** has no database of its own. It calls `user-service`
  directly (service-to-service, not through the gateway) to create users on
  register and to verify credentials on login, then issues a JWT.

Clients should only ever talk to the gateway (`:3000`). The direct ports
(`:3001`, `:3002`) are for local development/debugging and internal
service-to-service calls.

## Environment Configuration

Each service requires its own environment variables. Template files are provided as `.env.example` files inside each service directory.

Before running the application, create a `.env` file for each service using the corresponding template:

```bash
# API Gateway
cp api-gateway/.env.example api-gateway/.env

# Auth Service
cp auth-service/.env.example auth-service/.env

# User Service
cp user-service/.env.example user-service/.env
```

On Windows, you can also manually copy each `.env.example` file and rename the copy to `.env`.

After creating the `.env` files, update the required values, especially secrets such as `JWT_SECRET` and `INTERNAL_API_KEY`.


## Running locally

Each service is independent — install and run them separately (three
terminals):

```bash
# 1. user-service
cd user-service
npm install
npm run dev

# 2. auth-service
cd auth-service
npm install
npm run dev

# 3. api-gateway
cd api-gateway
npm install
npm run dev
```

Start `user-service` first, then `auth-service`, then `api-gateway`, since
the gateway and auth-service both depend on user-service being reachable.

## API (via the gateway, http://localhost:3000)

### Auth
| Method | Path              | Description                    |
|--------|-------------------|---------------------------------|
| POST   | /api/auth/register| Create a user, returns a JWT   |
| POST   | /api/auth/login    | Verify credentials, returns a JWT |
| GET    | /api/auth/me       | Requires `Authorization: Bearer <token>` |

### Users
| Method | Path             | Description         |
|--------|------------------|----------------------|
| POST   | /api/users       | Create a user directly |
| GET    | /api/users       | List all users      |
| GET    | /api/users/:id   | Get one user         |
| PATCH  | /api/users/:id   | Update a user        |
| DELETE | /api/users/:id   | Delete a user        |

## Notes / next steps

- `INTERNAL_API_KEY` must match between `user-service` and `auth-service`.
- `JWT_SECRET` in `auth-service` should be a long random string in
  production — swap it in your `.env`.
- `JWT_SECRET` must match between `user-service` and `auth-service`.
- No Docker Compose yet — each service is just a plain Node app for now.
