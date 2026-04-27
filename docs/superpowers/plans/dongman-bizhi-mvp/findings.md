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

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `brainstorming` 指向的 `writing-plans` 技能不可用 | 改用当前环境可用的 `planning-with-files`。 |

## Resources

- 设计文档：`docs/superpowers/specs/2026-04-27-dongman-bizhi-design.md`
- 计划目录：`docs/superpowers/plans/dongman-bizhi-mvp/`
- API 约定：`docs/api-conventions.md`

## Visual/Browser Findings

- 用户选择不使用视觉 companion，因此本轮没有浏览器视觉材料。
