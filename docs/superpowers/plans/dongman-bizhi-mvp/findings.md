# Findings & Decisions

## Requirements

- 微信小程序使用 uniapp。
- 后台管理系统使用 Vue 3 + Vite + Element Plus。
- API Server 使用 Node.js + Express。
- 数据库使用 MySQL。
- 图片存储使用阿里云 OSS + CDN。
- 后台上传采用前端直传 OSS。
- 小程序底部 Tab 为 `首页` 和 `动漫`。
- 首页只展示精选壁纸。
- 动漫页展示动漫名称分类，每个分类下展示最新壁纸和“更多”入口。
- 分类更多页展示该分类下全部壁纸。
- 第一版聚焦手机竖屏壁纸。
- 每张壁纸有标题。
- 列表缩略图通过 OSS 图片处理参数生成。
- 第一版不做搜索、登录、上架/下架、收藏、下载记录、审核、广告、会员或统计。

## Research Findings

- 当前仓库是新项目，初始状态只有 `README.md` 和一次初始提交。
- 已创建并提交设计文档：`docs/superpowers/specs/2026-04-27-dongman-bizhi-design.md`。
- 本机工具链：Node.js `v22.22.0`，npm `10.9.4`，pnpm `9.9.0`，未安装 yarn。
- Phase 1 已创建轻量 pnpm workspace、三个应用目录、环境变量示例、README 启动说明和 API 约定文档。
- Phase 2 已建立 Express app factory、server 入口、环境变量解析、MySQL pool 参数构造、统一错误处理、Zod 请求体验证和健康检查接口。
- `GET /health` 本地真实 HTTP 验证通过，返回 `{"success":true,"data":{"status":"ok","service":"dongman-bizhi-api"}}`。
- 数据库初始化 SQL 位于 `apps/api/database/schema.sql`，包含 `anime_categories` 和 `wallpapers` 两张表。
- Phase 3 已实现后台分类 CRUD、后台壁纸 CRUD、小程序精选列表、分类最新壁纸、分类壁纸分页和壁纸详情接口。
- 内容模块位于 `apps/api/src/modules/content/`，由 router、service、repository 类型、MySQL repository 和测试用内存 repository 组成。
- 当前 API 测试数：23 个，通过分类/壁纸接口行为、MySQL 行映射、Express 基础层、环境配置和响应约定。
- Phase 4 已实现 `POST /admin/uploads/oss-policy`，返回 OSS V4 POST policy、objectKey、host、imageUrl 和 formData。
- 删除壁纸时会先通过 `WallpaperStorage.deleteObject(ossObjectKey)` 删除 OSS 对象，再删除数据库记录。
- 本地用假 OSS 环境变量启动 API 后，`/admin/uploads/oss-policy` 返回了可用结构；不需要真实访问 OSS。
- `ali-oss` 当前包没有被 TypeScript 自动识别的入口声明，项目添加了局部声明文件。
- Phase 5 已实现 Vue 3 + Vite + Element Plus 后台单页工作台，包含分类管理、壁纸管理、OSS 直传上传入口、编辑和删除。
- 后台 service 测试覆盖 API envelope、JSON payload、API 错误、OSS 直传表单上传；App 测试覆盖主要页面文案和数据渲染。
- 浏览器验收：`http://localhost:5173/` 可打开后台；窄屏下主界面和上传弹窗可用，保存/取消按钮可见。
- 后台构建已做 Vite manualChunks，主业务包约 12KB gzip 前，Element Plus 单独分包。

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| 单仓库三应用结构 | 项目包含小程序、后台、API，统一管理更适合第一版 MVP。 |
| Express API 模块化组织 | 用户选择 Express，但仍需要清晰模块边界，避免接口增多后散乱。 |
| API 分为 `/admin` 和 `/public` | 后台管理接口和小程序公开接口职责分明。 |
| 只保存原图 URL 和 OSS objectKey | 缩略图可由 OSS 图片处理动态生成，减少存储和同步复杂度。 |
| 删除壁纸时同步删除 OSS 文件 | 第一版避免无用图片残留，节省存储成本。 |
| 删除分类前禁止已有壁纸的分类删除 | 避免小程序数据关系断裂。 |
| 使用 pnpm workspace，但不创建 shared package | 兼顾根目录统一脚本和轻量单仓库方案。 |
| API 响应格式使用 `success` envelope | 小程序和后台可以用同一判断逻辑处理成功、分页和错误。 |
| Express app 使用 factory 而非直接监听 | 让测试可以直接使用 app 实例，server 入口保持薄。 |
| 使用 Zod 做请求体验证 | 后续分类和壁纸接口可复用同一套验证与错误返回。 |
| 数据库 SQL 使用外键约束 | 从数据层防止分类删除后壁纸变成孤儿数据。 |
| 内容模块使用 service 层集中业务规则 | 分类名重复、分类不存在、分类下有壁纸禁止删除等规则集中处理。 |
| MySQL repository 将 snake_case 映射为 camelCase | 前端和小程序接口保持 JavaScript 友好的字段命名。 |
| 上传策略使用 V4 签名字段 | 与阿里云 OSS 新接入建议一致，后台前端可直接用返回的 formData 上传。 |
| OSS SDK 删除对象包装为 `WallpaperStorage` | 内容模块不直接依赖 `ali-oss`，便于测试和以后替换存储实现。 |
| 后台使用 Element Plus 全量注册 | 第一版开发效率优先；通过 manualChunks 将 Element Plus 独立成供应商包。 |
| 后台弹窗在窄屏下使用受限高度和滚动 body | 避免上传表单底部按钮被挤出视口。 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `brainstorming` 指向的 `writing-plans` 技能不可用 | 改用当前环境可用的 `planning-with-files`。 |

## Resources

- 设计文档：`docs/superpowers/specs/2026-04-27-dongman-bizhi-design.md`
- 计划目录：`docs/superpowers/plans/dongman-bizhi-mvp/`
- API 约定：`docs/api-conventions.md`
- API README：`apps/api/README.md`
- 数据库 SQL：`apps/api/database/schema.sql`
- 内容接口测试：`apps/api/src/modules/content/content-routes.test.ts`
- MySQL repository：`apps/api/src/modules/content/mysql-content-repositories.ts`
- OSS 上传策略：`apps/api/src/modules/uploads/oss-policy-service.ts`
- OSS 上传路由：`apps/api/src/modules/uploads/upload-router.ts`
- OSS 删除 adapter：`apps/api/src/modules/uploads/oss-object-storage.ts`
- 阿里云 OSS PostObject/V4 表单上传文档：https://www.alibabacloud.com/help/en/oss/python-1
- 阿里云 OSS Node.js 删除对象文档：https://www.alibabacloud.com/help/en/oss/developer-reference/delete-objects-3
- 后台入口：`apps/admin/src/App.vue`
- 后台 API client：`apps/admin/src/services/adminApi.ts`
- 后台 OSS 上传服务：`apps/admin/src/services/ossUpload.ts`

## Visual/Browser Findings

- 用户选择不使用视觉 companion，因此本轮没有浏览器视觉材料。
