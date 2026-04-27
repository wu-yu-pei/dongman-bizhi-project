# 动漫壁纸库 MVP 实现计划

## Goal

基于已确认的设计文档，完成 uniapp 微信小程序、Vue 3 后台管理系统和 Express API Server 的第一版动漫壁纸库 MVP。

## Current Phase

Phase 4

## Source Spec

- [设计文档](../../specs/2026-04-27-dongman-bizhi-design.md)

## Phases

### Phase 1: Project Scaffold & Shared Conventions

- [x] 创建 `apps/miniprogram`、`apps/admin`、`apps/api` 目录。
- [x] 确定根目录脚本、环境变量示例和 README 启动说明。
- [x] 为 API、后台和小程序统一基础配置命名。
- [x] 建立 API 返回格式、分页格式和错误格式约定。
- **Status:** complete

### Phase 2: API Server Foundation

- [x] 初始化 Express TypeScript 项目。
- [x] 配置 MySQL 连接、环境变量和启动脚本。
- [x] 创建数据库迁移或 SQL 初始化文件。
- [x] 实现统一错误处理、请求校验和响应封装。
- [x] 添加基础健康检查接口。
- **Status:** complete

### Phase 3: Category & Wallpaper APIs

- [x] 实现后台分类 CRUD。
- [x] 实现后台壁纸 CRUD。
- [x] 实现删除分类前检查壁纸依赖。
- [x] 实现小程序公开接口：精选、分类最新、分类分页、详情。
- [x] 添加 API 测试，覆盖主要成功和失败路径。
- **Status:** complete

### Phase 4: Aliyun OSS Direct Upload

- [ ] 配置 OSS 环境变量。
- [ ] 实现后台获取 OSS 直传签名接口。
- [ ] 实现 OSS objectKey 命名规则。
- [ ] 实现删除壁纸时同步删除 OSS 文件。
- [ ] 添加 OSS 签名参数测试；真实 OSS 调用保留为集成配置。
- **Status:** pending

### Phase 5: Admin App

- [ ] 初始化 Vue 3 + Vite + Element Plus 后台。
- [ ] 创建后台布局、路由和 API client。
- [ ] 实现动漫分类管理。
- [ ] 实现壁纸列表、筛选、新增、编辑、删除。
- [ ] 实现 OSS 直传上传流程和上传失败处理。
- [ ] 完成后台手工验收。
- **Status:** pending

### Phase 6: Uniapp Miniprogram

- [ ] 初始化 uniapp 微信小程序应用。
- [ ] 配置 2 个 Tab：`首页`、`动漫`。
- [ ] 实现首页精选壁纸列表。
- [ ] 实现动漫分类页，分类下展示最新壁纸和“更多”入口。
- [ ] 实现分类壁纸列表页，支持触底加载更多。
- [ ] 实现壁纸预览和保存到相册。
- [ ] 完成小程序手工验收。
- **Status:** pending

### Phase 7: End-to-End Verification & Delivery

- [ ] 使用测试数据跑通后台上传到小程序展示链路。
- [ ] 验证精选、分类最新、更多列表和保存图片。
- [ ] 更新 README：安装、环境变量、启动、部署注意事项。
- [ ] 记录剩余风险和后续扩展点。
- **Status:** pending

## Key Questions

1. API 是否使用 TypeScript？计划使用 TypeScript，便于 DTO、接口返回和后续维护。
2. MySQL 迁移工具用什么？优先选择轻量方案，第一版可用 SQL 初始化文件；如后续复杂再引入迁移工具。
3. 小程序保存原图是否依赖下载域名白名单？需要在部署说明中明确配置 CDN 域名到微信小程序合法下载域名。
4. 后台不做登录是否有安全风险？有。第一版只适合开发或内网/受控环境；上线前应至少增加后台登录或访问限制。

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| 单仓库三应用结构 | 和设计文档一致，便于统一管理小程序、后台和 API。 |
| API 使用 Express | 用户已选择 Express，第一版保持轻量。 |
| 数据库使用 MySQL | 分类和壁纸适合关系型建模，查询与分页清晰。 |
| 图片使用阿里云 OSS + CDN | 用户已选择阿里云 OSS，适合图片存储和访问加速。 |
| 后台前端直传 OSS | 减少 API 服务器带宽压力，适合大图上传。 |
| 第一版不做登录、搜索、上下架 | 和已确认 MVP 范围一致，优先跑通内容链路。 |
| 使用 pnpm workspace 管理 `apps/*` | 保持单仓库轻量管理，不引入额外 shared package。 |
| API 响应采用 `success/data/error/pagination` envelope | 前后端判断简单，分页和错误格式稳定。 |
| API app 使用 `createApp` factory | 测试可直接挂载 Express app，server 入口只负责读取环境并监听端口。 |
| SQL 初始化文件放在 `apps/api/database/schema.sql` | 第一版使用轻量 SQL 初始化，后续复杂时再引入迁移工具。 |
| MySQL 外键删除策略使用 `ON DELETE RESTRICT` | 与“分类下有壁纸时禁止删除分类”的业务规则一致。 |
| 内容接口通过 repository 接口隔离存储层 | 路由和业务规则可用内存 repository 测试，真实服务使用 MySQL repository。 |
| 分类列表返回 `wallpaperCount`，壁纸返回 `categoryName` | 后台和小程序可直接展示，不需要前端二次拼装分类信息。 |

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| 当前环境没有 `writing-plans` 技能 | 1 | 使用可用的 `planning-with-files` 技能创建持久化计划文件。 |
| Phase 2 TDD 红灯：新增 app/config/database 测试时目标模块不存在 | 1 | 按测试补齐 `app.ts`、配置、数据库和共享中间件模块。 |
| Phase 2 TDD 红灯：CORS 测试期望配置 origin，实际返回 `*` | 1 | 为 `createApp` 增加 `corsOrigin` 选项，并在 `server.ts` 传入环境配置。 |
| Phase 3 TDD 红灯：内容路由测试引用的 `content-router` 不存在 | 1 | 补齐内容路由、服务、类型和内存 repository。 |
| Phase 3 TDD 红灯：MySQL repository 测试引用的模块不存在 | 1 | 补齐 MySQL repository 和行映射逻辑。 |
| Phase 3 类型检查：Express params 类型和 mysql2 executor 类型不匹配 | 1 | 放宽参数读取为 `unknown`，并为 MySQL pool 增加 executor 适配器。 |

## Notes

- 设计文档已提交：`9a331d9 docs: add wallpaper MVP design`。
- 实现前应先创建 API 的测试框架和数据库结构，再开发具体接口。
- 上线前需要补后台访问控制；当前 MVP 明确不做登录，仅适合受控环境。
