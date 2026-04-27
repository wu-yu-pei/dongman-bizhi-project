# 动漫壁纸库 MVP 设计

日期：2026-04-27

## 目标

开发一个动漫壁纸库微信小程序，配套后台管理系统和 Node API Server。第一版聚焦内容浏览、分类展示、壁纸预览和下载，不做搜索、登录、收藏、上架/下架、审核、广告、会员或运营统计。

## 项目结构

采用单仓库三应用结构：

```text
dongman-bizhi-project/
  apps/
    miniprogram/   # uniapp 微信小程序
    admin/         # Vue 3 + Vite + Element Plus 后台
    api/           # Express + MySQL API Server
```

## 技术栈

- 小程序：uniapp，发布到微信小程序。
- 后台管理：Vue 3、Vite、Element Plus。
- API Server：Node.js、Express。
- 数据库：MySQL。
- 图片存储：阿里云 OSS + CDN。
- 图片上传：后台前端直传 OSS，API 负责生成直传签名并保存元数据。
- 缩略图：不单独存储缩略图文件，列表图通过 OSS 图片处理参数生成。

## 用户端小程序

小程序第一版只有两个底部 Tab：`首页` 和 `动漫`。

### 首页

首页只展示精选壁纸，不放搜索和分类列表。

功能：

- 展示后台标记为精选的壁纸。
- 推荐使用双列瀑布流或等宽图片网格。
- 每张壁纸卡片展示缩略图和标题。
- 点击壁纸进入预览。
- 预览页或预览弹层显示原图，并提供保存到相册能力。

### 动漫页

动漫页按动漫名称展示分类。

功能：

- 展示所有动漫分类。
- 每个分类区块展示动漫名称、最新几张壁纸和“更多”入口。
- 最新壁纸数量建议为 3 到 6 张。
- 点击壁纸进入预览。
- 点击“更多”进入该动漫分类的完整壁纸列表。

### 分类壁纸列表页

功能：

- 页面标题为动漫名称。
- 展示该动漫分类下所有壁纸。
- 默认按创建时间倒序排列。
- 支持分页或触底加载更多。
- 点击壁纸进入预览并可保存原图。

### 预览与保存

功能：

- 预览使用原图 URL。
- 保存前处理微信相册权限。
- 保存失败时给出清晰提示，例如授权失败、图片下载失败或保存失败。
- 第一版不记录下载历史，不需要用户登录。

## 后台管理系统

后台第一版不做登录、不做上架/下架。进入后台后可直接管理分类和壁纸。

### 动漫分类管理

功能：

- 分类列表：展示动漫名称、壁纸数量、创建时间和操作。
- 新增分类：填写动漫名称。
- 编辑分类：修改动漫名称。
- 删除分类：如果分类下已有壁纸，禁止删除并提示先处理壁纸。

### 壁纸管理

功能：

- 壁纸列表：展示缩略图、标题、所属动漫、是否精选、创建时间和操作。
- 支持按动漫分类筛选。
- 新增壁纸：选择所属动漫分类、填写标题、上传手机竖屏图片、可勾选设为精选。
- 编辑壁纸：修改标题、所属分类、图片、精选状态。
- 删除壁纸：删除数据库记录，并同步删除 OSS 文件。

## OSS 上传流程

后台采用前端直传 OSS。

流程：

1. 后台选择图片后，向 API 请求 OSS 直传签名。
2. API 返回上传地址、policy、signature、objectKey 和最终 CDN URL。
3. 后台前端将图片直接上传到 OSS。
4. OSS 上传成功后，后台提交壁纸表单到 API。
5. API 保存标题、分类 ID、原图 URL、OSS objectKey 和精选状态。

约束：

- OSS 上传失败时，不保存数据库记录。
- API 只保存已上传成功的图片元数据。
- CDN 域名和 OSS bucket 信息通过环境变量配置。

## API 设计

API 分为后台接口和小程序公开接口。第一版不做身份认证。

### 后台接口

- `GET /admin/categories`：分类列表。
- `POST /admin/categories`：新增分类。
- `PUT /admin/categories/:id`：编辑分类。
- `DELETE /admin/categories/:id`：删除分类。
- `GET /admin/wallpapers`：壁纸列表，支持按分类筛选。
- `POST /admin/wallpapers`：新增壁纸。
- `PUT /admin/wallpapers/:id`：编辑壁纸。
- `DELETE /admin/wallpapers/:id`：删除壁纸。
- `POST /admin/uploads/oss-policy`：获取 OSS 直传签名。

### 小程序公开接口

- `GET /public/featured-wallpapers`：首页精选壁纸。
- `GET /public/categories-with-latest`：动漫分类及每个分类下的最新壁纸。
- `GET /public/categories/:id/wallpapers`：某动漫分类下全部壁纸，分页返回。
- `GET /public/wallpapers/:id`：壁纸详情。

## 数据表设计

### anime_categories

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED PK | 分类 ID |
| name | VARCHAR(100) NOT NULL UNIQUE | 动漫名称 |
| created_at | DATETIME NOT NULL | 创建时间 |
| updated_at | DATETIME NOT NULL | 更新时间 |

### wallpapers

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | BIGINT UNSIGNED PK | 壁纸 ID |
| category_id | BIGINT UNSIGNED NOT NULL | 关联动漫分类 |
| title | VARCHAR(120) NOT NULL | 壁纸标题 |
| image_url | VARCHAR(500) NOT NULL | 原图 CDN URL |
| oss_object_key | VARCHAR(500) NOT NULL | OSS 对象 Key |
| is_featured | TINYINT(1) NOT NULL DEFAULT 0 | 是否精选 |
| created_at | DATETIME NOT NULL | 创建时间 |
| updated_at | DATETIME NOT NULL | 更新时间 |

建议索引：

- `anime_categories.name` 唯一索引。
- `wallpapers.category_id` 普通索引。
- `wallpapers.is_featured, wallpapers.created_at` 组合索引，用于首页精选。
- `wallpapers.category_id, wallpapers.created_at` 组合索引，用于分类列表和最新壁纸。

## 图片处理

只保存原图地址。小程序和后台列表展示时，根据 `image_url` 拼接 OSS 图片处理参数生成缩略图。

示例策略：

- 列表缩略图：限制宽度并按质量压缩。
- 预览和保存：使用原图 URL。

具体参数在实现时根据阿里云 OSS 图片处理规则配置。

## 校验与错误处理

API 校验：

- 分类名称不能为空。
- 分类名称不能重复。
- 壁纸标题不能为空。
- 壁纸必须绑定有效分类。
- 壁纸必须包含有效图片 URL 和 OSS objectKey。
- 删除分类前检查分类下是否存在壁纸。

小程序错误处理：

- 列表加载失败时提示重试。
- 图片预览失败时提示图片加载失败。
- 保存失败时区分相册权限、下载失败和保存失败。

后台错误处理：

- OSS 签名获取失败时提示重试。
- OSS 上传失败时提示重新上传。
- 表单保存失败时保留用户已填写内容。
- 删除失败时显示服务端返回原因。

## 测试范围

API 测试优先覆盖：

- 分类创建、编辑、删除。
- 分类下有壁纸时禁止删除。
- 壁纸创建、编辑、删除。
- 精选壁纸列表。
- 分类及最新壁纸列表。
- 分类壁纸分页。
- OSS 签名生成参数。

前端手工验收优先覆盖：

- 小程序首页精选壁纸展示。
- 动漫页分类和最新壁纸展示。
- 分类更多列表触底加载。
- 壁纸预览和保存到相册。
- 后台分类 CRUD。
- 后台壁纸上传、编辑、删除和精选切换。

## 非目标

第一版不做：

- 搜索。
- 用户登录。
- 收藏。
- 下载记录。
- 上架/下架。
- 内容审核流程。
- 浏览量和下载量统计。
- 广告、会员、积分或付费下载。
- 横屏、电脑壁纸或多设备筛选。

## 后续扩展

后续可以在当前结构上扩展：

- 微信登录和“我的”Tab。
- 收藏和下载记录。
- 壁纸浏览量、下载量和精选排序。
- 后台登录和权限。
- 审核流程。
- 广告位、会员或积分体系。
- 多尺寸壁纸和设备类型筛选。
