# 动漫壁纸库 MVP

这是一个动漫壁纸库项目，包含：

- `apps/miniprogram`：uniapp 微信小程序。
- `apps/admin`：Vue 3 + Vite + Element Plus 后台管理系统。
- `apps/api`：Node.js + Express + MySQL API Server。

## 第一版范围

- 小程序首页展示精选壁纸。
- 小程序动漫页按动漫名称分类展示最新壁纸。
- 分类更多页展示该分类下全部壁纸。
- 后台管理动漫分类和壁纸。
- 后台前端直传阿里云 OSS，API 保存壁纸元数据。
- 第一版不做搜索、登录、上架/下架、收藏、下载记录、审核和商业化。

## 开发环境

推荐使用：

- Node.js 22+
- pnpm 9+
- MySQL 8+

安装依赖：

```bash
pnpm install
```

运行 API：

```bash
cp apps/api/.env.example apps/api/.env
pnpm dev:api
```

运行检查：

```bash
pnpm check
```

## 文档

- [设计文档](docs/superpowers/specs/2026-04-27-dongman-bizhi-design.md)
- [实现计划](docs/superpowers/plans/dongman-bizhi-mvp/task_plan.md)
- [API 约定](docs/api-conventions.md)
