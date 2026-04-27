# API Server

Express + TypeScript API Server for the anime wallpaper MVP.

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
```

Create the local MySQL schema:

```bash
mysql -u root -p < apps/api/database/schema.sql
```

Start the API:

```bash
pnpm dev:api
```

## Scripts

```bash
pnpm --filter @dongman-bizhi/api test
pnpm --filter @dongman-bizhi/api typecheck
pnpm --filter @dongman-bizhi/api build
```

## Current Routes

- `GET /health`
