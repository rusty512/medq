# MedQ Backend (Supabase + Express + Prisma)

This backend uses Supabase for authentication and PostgreSQL, with Prisma as the ORM. It exposes a public `/health` endpoint and a protected `/me` endpoint that returns the current user (creating it on first access).

## Prerequisites
- Node.js >= 18.18
- A Supabase project (Postgres + Auth)

## Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` from example and fill values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL`: Get from Supabase project settings (Connection string - Node/Prisma works). Make sure to include `?pgbouncer=true&connection_limit=1` if using pooled connection.
   - `SUPABASE_URL`: Your project URL (e.g., `https://xyzcompany.supabase.co`).
   - `SUPABASE_SERVICE_KEY`: Service role key from Supabase (server-side only).
   - `PORT`: Optional (default 4000).

3. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Start the server:
   ```bash
   npm run dev
   # or
   npm start
   ```

## Endpoints
- Public health check:
  ```bash
  curl -i http://localhost:4000/health
  # => { "ok": true }
  ```

- Protected current user:
  ```bash
  # obtain a Supabase JWT (access token) from your frontend login
  curl -i http://localhost:4000/me \
    -H "Authorization: Bearer <SUPABASE_ACCESS_TOKEN>"
  ```
  - First call creates a minimal user record if missing.

## Notes
- No Clerk references; uses Supabase Auth exclusively.
- Prisma models are in `prisma/schema.prisma`.
- Edit `.env` for your Supabase credentials.

## Acceptance Tests
1. `GET /health` returns 200 `{ ok: true }`.
2. `GET /me` without token returns 401.
3. `GET /me` with valid Supabase JWT returns the user (and upserts if needed).
4. `prisma migrate dev` successfully creates tables on Supabase.
