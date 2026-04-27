# Admin App

Vue 3 + Vite + Element Plus 后台管理系统。

## Setup

```bash
pnpm install
cp apps/admin/.env.example apps/admin/.env
pnpm dev:admin
```

默认访问地址：

```text
http://localhost:5173/
```

## Scripts

```bash
pnpm --filter @dongman-bizhi/admin test
pnpm --filter @dongman-bizhi/admin typecheck
pnpm --filter @dongman-bizhi/admin build
```

第一版后台范围：

- 动漫分类管理。
- 壁纸上传、编辑、删除。
- 精选状态切换。
- 不做登录和上架/下架。
