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
- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/:id`
- `DELETE /admin/categories/:id`
- `GET /admin/wallpapers`
- `POST /admin/wallpapers`
- `PUT /admin/wallpapers/:id`
- `DELETE /admin/wallpapers/:id`
- `GET /public/featured-wallpapers`
- `GET /public/categories-with-latest`
- `GET /public/categories/:id/wallpapers`
- `GET /public/wallpapers/:id`
