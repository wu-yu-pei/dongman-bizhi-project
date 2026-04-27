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

For OSS upload policy and object deletion, configure:

```bash
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_BUCKET=your-bucket
ALIYUN_OSS_ACCESS_KEY_ID=your-access-key-id
ALIYUN_OSS_ACCESS_KEY_SECRET=your-access-key-secret
ALIYUN_OSS_CDN_BASE_URL=https://your-cdn-domain
ALIYUN_OSS_UPLOAD_DIR=wallpapers
```

`ALIYUN_OSS_REGION` uses the OSS endpoint region format, such as `oss-cn-hangzhou`.
The upload policy response uses V4 form fields and can be sent directly as OSS
`multipart/form-data` fields by the admin frontend.

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
- `POST /admin/uploads/oss-policy`
- `GET /public/featured-wallpapers`
- `GET /public/categories-with-latest`
- `GET /public/categories/:id/wallpapers`
- `GET /public/wallpapers/:id`
