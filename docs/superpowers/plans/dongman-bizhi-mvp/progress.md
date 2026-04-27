# Progress Log

## Session: 2026-04-27

### Phase 1: Project Scaffold & Shared Conventions

- **Status:** complete
- **Started:** 2026-04-27
- Actions taken:
  - 收集并确认 MVP 需求范围。
  - 创建设计文档并提交到 git。
  - 用户确认设计文档可以继续。
  - 创建持久化实现计划文件。
  - 创建 pnpm workspace 和根目录脚本。
  - 创建 `apps/api`、`apps/admin`、`apps/miniprogram` 目录。
  - 为三个应用添加 `.env.example` 或占位说明。
  - 先写 API 响应约定测试并确认失败。
  - 实现最小 `http-response` helper 后确认测试通过。
  - 更新 README 和 API 约定文档。
- Files created/modified:
  - `.gitignore`
  - `package.json`
  - `pnpm-workspace.yaml`
  - `pnpm-lock.yaml`
  - `README.md`
  - `apps/api/package.json`
  - `apps/api/tsconfig.json`
  - `apps/api/.env.example`
  - `apps/api/src/shared/http-response.test.ts`
  - `apps/api/src/shared/http-response.ts`
  - `apps/admin/README.md`
  - `apps/admin/.env.example`
  - `apps/miniprogram/README.md`
  - `apps/miniprogram/.env.example`
  - `docs/api-conventions.md`
  - `docs/superpowers/specs/2026-04-27-dongman-bizhi-design.md`
  - `docs/superpowers/plans/dongman-bizhi-mvp/task_plan.md`
  - `docs/superpowers/plans/dongman-bizhi-mvp/findings.md`
  - `docs/superpowers/plans/dongman-bizhi-mvp/progress.md`

### Phase 2: API Server Foundation

- **Status:** complete
- Actions taken:
  - 为 Express app、环境变量解析、MySQL pool 参数生成写失败测试。
  - 实现 `createApp`、`server.ts`、统一错误处理中间件、`AppError`、Zod 请求体验证。
  - 实现环境变量解析和 MySQL pool options 构造。
  - 为 CORS 配置写失败测试，并实现 `corsOrigin` 选项。
  - 创建 `apps/api/database/schema.sql` 初始化 SQL。
  - 创建 `apps/api/README.md`，补充 API setup 和 schema 初始化说明。
  - 启动开发服务并用真实 HTTP 请求验证 `GET /health`。
- Files created/modified:
  - `README.md`
  - `apps/api/README.md`
  - `apps/api/package.json`
  - `apps/api/database/schema.sql`
  - `apps/api/src/app.test.ts`
  - `apps/api/src/app.ts`
  - `apps/api/src/config/env.test.ts`
  - `apps/api/src/config/env.ts`
  - `apps/api/src/config/database.test.ts`
  - `apps/api/src/config/database.ts`
  - `apps/api/src/server.ts`
  - `apps/api/src/shared/app-error.ts`
  - `apps/api/src/shared/error-handler.ts`
  - `apps/api/src/shared/validate-request.ts`
  - `pnpm-lock.yaml`

### Phase 3: Category & Wallpaper APIs

- **Status:** complete
- Actions taken:
  - 为内容接口写失败测试，覆盖后台分类 CRUD、后台壁纸 CRUD、分类删除保护、小程序精选、分类最新、分类分页和壁纸详情。
  - 实现内容模块类型、service、router 和测试用内存 repository。
  - 为 MySQL repository 写失败测试，覆盖分类行映射、壁纸分类筛选和分页参数。
  - 实现 MySQL repository，并在 `server.ts` 中注册真实内容接口。
  - 更新 API README 的当前路由列表。
  - 启动 API 并验证 `GET /health` 在内容接口注册后仍正常。
- Files created/modified:
  - `apps/api/README.md`
  - `apps/api/src/server.ts`
  - `apps/api/src/modules/content/content-routes.test.ts`
  - `apps/api/src/modules/content/content-router.ts`
  - `apps/api/src/modules/content/content-service.ts`
  - `apps/api/src/modules/content/content-types.ts`
  - `apps/api/src/modules/content/mysql-content-repositories.test.ts`
  - `apps/api/src/modules/content/mysql-content-repositories.ts`
  - `apps/api/src/modules/content/test-utils/in-memory-content-repositories.ts`
  - `docs/superpowers/plans/dongman-bizhi-mvp/task_plan.md`
  - `docs/superpowers/plans/dongman-bizhi-mvp/findings.md`
  - `docs/superpowers/plans/dongman-bizhi-mvp/progress.md`

### Phase 4: Aliyun OSS Direct Upload

- **Status:** complete
- Actions taken:
  - 查询阿里云 OSS 官方文档，确认 POST 直传使用 V4 签名字段，删除对象可用 Node SDK `delete`。
  - 为 OSS policy service 写失败测试，覆盖 V4 policy 字段、objectKey 规则、签名和不支持的文件类型。
  - 为上传路由写失败测试，覆盖 `POST /admin/uploads/oss-policy`。
  - 为删除壁纸写失败测试，确认删除数据库记录前调用 OSS object 删除。
  - 实现 OSS policy service、upload router、OSS object storage adapter。
  - 为 `ali-oss` 添加局部 TypeScript 声明，并让 OSS client 懒加载。
  - 用假 OSS 环境变量启动 API，验证 `/health` 和 `/admin/uploads/oss-policy`。
- Files created/modified:
  - `apps/api/README.md`
  - `docs/api-conventions.md`
  - `apps/api/package.json`
  - `pnpm-lock.yaml`
  - `apps/api/src/server.ts`
  - `apps/api/src/types/ali-oss.d.ts`
  - `apps/api/src/modules/content/content-router.ts`
  - `apps/api/src/modules/content/content-routes.test.ts`
  - `apps/api/src/modules/content/content-service.ts`
  - `apps/api/src/modules/content/content-types.ts`
  - `apps/api/src/modules/uploads/oss-policy-service.test.ts`
  - `apps/api/src/modules/uploads/oss-policy-service.ts`
  - `apps/api/src/modules/uploads/upload-routes.test.ts`
  - `apps/api/src/modules/uploads/upload-router.ts`
  - `apps/api/src/modules/uploads/oss-object-storage.test.ts`
  - `apps/api/src/modules/uploads/oss-object-storage.ts`

## Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| Design review | 用户确认 `ok` | 可进入实现计划 | 已进入实现计划 | Pass |
| API response RED | `pnpm --filter @dongman-bizhi/api test` | 因缺少 `http-response` 实现失败 | 测试套件因模块不存在失败 | Pass |
| API response GREEN | `pnpm --filter @dongman-bizhi/api test` | 3 个响应约定测试通过 | 3 passed | Pass |
| API typecheck | `pnpm --filter @dongman-bizhi/api typecheck` | TypeScript 类型检查通过 | 通过 | Pass |
| Phase 1 full check | `pnpm check` | 全仓测试和类型检查通过 | 通过 | Pass |
| Phase 2 app/config RED | `pnpm --filter @dongman-bizhi/api test` | 因目标模块缺失失败 | app/env/database 模块不存在导致失败 | Pass |
| Phase 2 app/config GREEN | `pnpm --filter @dongman-bizhi/api test` | 新增 API 基础测试通过 | 11 passed | Pass |
| Phase 2 CORS RED | `pnpm --filter @dongman-bizhi/api test -- src/app.test.ts` | CORS 配置测试失败 | 期望配置 origin，实际为 `*` | Pass |
| Phase 2 CORS GREEN | `pnpm --filter @dongman-bizhi/api test -- src/app.test.ts` | CORS 配置测试通过 | 6 passed | Pass |
| Phase 2 full check | `pnpm check` | 全仓测试和类型检查通过 | 12 passed，类型检查通过 | Pass |
| Phase 2 API build | `pnpm --filter @dongman-bizhi/api build` | API TypeScript 构建通过 | 通过 | Pass |
| Phase 2 health HTTP | `curl -s http://localhost:3000/health` | 返回健康检查 success envelope | 返回 `success: true` 和 `status: ok` | Pass |
| Phase 3 content routes RED | `pnpm --filter @dongman-bizhi/api test -- src/modules/content/content-routes.test.ts` | 因内容路由未实现失败 | `content-router` 模块不存在 | Pass |
| Phase 3 content routes GREEN | `pnpm --filter @dongman-bizhi/api test -- src/modules/content/content-routes.test.ts` | 内容接口测试通过 | 9 passed | Pass |
| Phase 3 MySQL repo RED | `pnpm --filter @dongman-bizhi/api test -- src/modules/content/mysql-content-repositories.test.ts` | 因 MySQL repository 未实现失败 | 模块不存在 | Pass |
| Phase 3 MySQL repo GREEN | `pnpm --filter @dongman-bizhi/api test -- src/modules/content/mysql-content-repositories.test.ts` | MySQL repository 测试通过 | 2 passed | Pass |
| Phase 3 full check | `pnpm check` | 全仓测试和类型检查通过 | 23 passed，类型检查通过 | Pass |
| Phase 3 API build | `pnpm --filter @dongman-bizhi/api build` | API TypeScript 构建通过 | 通过 | Pass |
| Phase 3 health HTTP | `curl -s http://localhost:3000/health` | 内容路由注册后健康检查仍可用 | 返回 `success: true` 和 `status: ok` | Pass |
| Phase 4 OSS RED | `pnpm --filter @dongman-bizhi/api test -- src/modules/uploads/oss-policy-service.test.ts src/modules/uploads/upload-routes.test.ts src/modules/content/content-routes.test.ts` | 上传模块缺失、删除对象未接入导致失败 | 按预期失败 | Pass |
| Phase 4 OSS GREEN | 同上 | OSS policy、上传路由、删除对象测试通过 | 13 passed | Pass |
| Phase 4 full check | `pnpm check` | 全仓测试和类型检查通过 | 29 passed，类型检查通过 | Pass |
| Phase 4 API build | `pnpm --filter @dongman-bizhi/api build` | API TypeScript 构建通过 | 通过 | Pass |
| Phase 4 local health | `curl -s http://localhost:3000/health` | API 本地启动后健康检查正常 | 返回 `success: true` | Pass |
| Phase 4 local upload policy | `curl -s -X POST http://localhost:3000/admin/uploads/oss-policy ...` | 返回 host、objectKey、imageUrl、formData | 返回 V4 policy 结构 | Pass |

## Error Log

| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-04-27 | 当前环境没有 `writing-plans` 技能 | 1 | 使用 `planning-with-files` 创建计划文件 |
| 2026-04-27 | TDD 红灯：app/config/database 模块不存在 | 1 | 创建 Express app、环境配置、数据库配置和共享中间件 |
| 2026-04-27 | TDD 红灯：CORS 配置未生效 | 1 | 为 `createApp` 增加 `corsOrigin` 选项 |
| 2026-04-27 | 手动停止 `pnpm dev:api` 后返回 exit 130 | 1 | 这是验证完成后的 Ctrl-C 停止，不属于产品错误 |
| 2026-04-27 | TDD 红灯：`content-router` 模块不存在 | 1 | 创建内容路由、服务和内存 repository |
| 2026-04-27 | TDD 红灯：`mysql-content-repositories` 模块不存在 | 1 | 创建 MySQL repository 和映射逻辑 |
| 2026-04-27 | TypeScript：mysql2 `Pool.execute` 不能直接匹配自定义 executor 泛型接口 | 1 | 增加 `MysqlExecutor` 适配器并显式转换 rows 类型 |
| 2026-04-27 | `chub` CLI 不存在，无法按 get-api-docs 技能通过 chub 获取文档 | 1 | 改用阿里云官方网页文档确认 OSS V4 表单上传和 Node SDK 删除对象 |
| 2026-04-27 | TypeScript：`ali-oss` 入口无声明文件 | 1 | 添加 `apps/api/src/types/ali-oss.d.ts` |
| 2026-04-27 | 手动停止 Phase 4 `pnpm dev:api` 后返回 exit 130 | 1 | 验证完成后 Ctrl-C 停止 watch，不属于产品错误 |

## 5-Question Reboot Check

| Question | Answer |
|----------|--------|
| Where am I? | Phase 5：Admin App 即将开始 |
| Where am I going? | API 基础、内容接口、OSS 上传、后台、小程序、端到端验收 |
| What's the goal? | 完成动漫壁纸库微信小程序、后台和 Express API Server 的 MVP |
| What have I learned? | 详见 `findings.md` |
| What have I done? | 设计文档已提交，计划文件已创建 |
