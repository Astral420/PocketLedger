# Railway Deployment Guide for This Backend

This guide is for the backend in [`server/`](/Users/apple/Desktop/DevWork/ReactNative/BudgetTracker/server) and its PostgreSQL database.

It is based on the current codebase:

- The API starts from [`server/src/server.ts`](/Users/apple/Desktop/DevWork/ReactNative/BudgetTracker/server/src/server.ts).
- Database migrations run automatically on boot.
- The database config reads `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME` from env vars.
- Google OAuth uses `/api/v1/auth/google/callback`.
- The root health route is `/`.

## 1. What You Will Deploy

You need two Railway services in one project:

1. A `PostgreSQL` service.
2. A `backend` service pointing to this repo, with its root directory set to `server`.

## 2. Before You Start

Prepare these values first:

- A production `JWT_SECRET`
- A production `JWT_SECRET_REFRESH`
- Cloudinary credentials
- Google OAuth credentials
- SMTP credentials for verification emails
- Your frontend success redirect URL for OAuth

Do not reuse local development secrets in production. Generate new production values.

## 3. Create the Railway Project

1. In Railway, create a new project.
2. Add a `PostgreSQL` service.
3. Add a new service from your GitHub repo.
4. For the backend service, set the root directory to `server`.

## 4. Connect Railway Postgres to Your Existing Env Names

Your code does **not** read `DATABASE_URL`. It reads these variables instead:

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`

In the backend service Variables tab, map them from the Railway Postgres service references:

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

If your Postgres service is named something other than `Postgres`, use that exact service name in the references.

## 5. Set Backend Environment Variables

Add these variables to the backend service.

### Required

```env
NODE_ENV=production
PORT=3000

JWT_SECRET=replace_me
JWT_SECRET_REFRESH=replace_me

CLOUDINARY_CLOUD_NAME=replace_me
CLOUDINARY_API_KEY=replace_me
CLOUDINARY_API_SECRET=replace_me

GOOGLE_CLIENT_ID=replace_me
GOOGLE_CLIENT_SECRET=replace_me
GOOGLE_CALLBACK_URL=https://your-backend-domain.up.railway.app/api/v1/auth/google/callback
OAUTH_SUCCESS_REDIRECT=https://your-frontend-domain.com/auth/callback

SMTP_USER=replace_me
SMTP_PASSWORD=replace_me
```

### Notes

- `GOOGLE_CALLBACK_URL` must match the callback URL configured in Google Cloud exactly.
- `OAUTH_SUCCESS_REDIRECT` is used after Google login succeeds.
- `PORT` should stay `3000` unless you have a reason to change it. Railway will route traffic to the internal port automatically.

## 6. Google OAuth Setup

In your Google Cloud OAuth client:

1. Add your Railway backend callback URL:
   `https://your-backend-domain.up.railway.app/api/v1/auth/google/callback`
2. Add your frontend domain to the authorized origins if your client flow needs it.

If this is wrong, Google login will fail even if the backend is running.

## 7. Deployment Behavior in This Repo

This repo already contains [`server/Dockerfile`](/Users/apple/Desktop/DevWork/ReactNative/BudgetTracker/server/Dockerfile).

Important: the current Dockerfile runs:

```dockerfile
CMD ["npm", "run", "dev"]
```

That will work, but it runs the API in development mode with `ts-node-dev`, which is not ideal for production.

### Quickest path

Deploy as-is and let Railway build from the existing Dockerfile.

### Recommended path

Change the Dockerfile before deploying so it builds TypeScript and runs the compiled app:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

If you keep the current Dockerfile, the rest of this guide still applies.

## 8. Migrations

Your backend automatically runs SQL migrations on startup from [`server/src/db/migrate.ts`](/Users/apple/Desktop/DevWork/ReactNative/BudgetTracker/server/src/db/migrate.ts).

That means:

- You do not need a separate Railway migration command for the current setup.
- On first deploy, the API will wait for Postgres, then create the `migrations` table, then run pending `.sql` files.

## 9. First Deploy Checklist

Before pressing deploy, verify:

1. Backend root directory is `server`.
2. Postgres service exists.
3. `DB_*` variables point to Railway Postgres references.
4. All non-database secrets are set.
5. `GOOGLE_CALLBACK_URL` uses your Railway backend domain.
6. `OAUTH_SUCCESS_REDIRECT` points to your client app.

## 10. Verify After Deployment

After Railway finishes deploying:

1. Open:
   `https://your-backend-domain.up.railway.app/`
2. You should get:
   `BudgetTracker API is running!`
3. Check Railway logs for:
   - database connection success
   - migration success
   - server listening on port `3000`

## 11. Common Problems

### App deploys but cannot connect to DB

Usually caused by missing or incorrect `DB_*` mappings. This backend does not use `DATABASE_URL`, so setting only `DATABASE_URL` is not enough.

### Google OAuth fails

Usually caused by a mismatch between:

- `GOOGLE_CALLBACK_URL` in Railway
- the callback URL configured in Google Cloud
- the actual Railway backend domain

### OAuth redirects to the wrong app

Check `OAUTH_SUCCESS_REDIRECT`.

### Email verification fails

Check `SMTP_USER` and `SMTP_PASSWORD`.

### Image upload fails

Check the three Cloudinary variables.

## 12. Recommended Next Cleanup

These are not required to deploy, but they are worth doing:

1. Update the Dockerfile to use `npm run build` and `npm run start`.
2. Add support for `DATABASE_URL` in [`server/src/config/DB.ts`](/Users/apple/Desktop/DevWork/ReactNative/BudgetTracker/server/src/config/DB.ts) so Railway setup becomes simpler.
3. Rotate any secrets that were previously stored in local `.env` files.
