# API Conventions

## Success Response

普通成功响应：

```json
{
  "success": true,
  "data": {}
}
```

## Paginated Response

分页响应：

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## Error Response

错误响应：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "分类名称不能为空",
    "details": {}
  }
}
```

`details` 可选，只在前端需要额外定位错误时返回。

## Pagination Rules

- `page` 从 1 开始。
- `pageSize` 第一版默认 20。
- `totalPages` 由 `Math.ceil(total / pageSize)` 得出。
- 当 `total` 为 0 时，`totalPages` 返回 0。

## OSS Upload Policy Response

后台上传图片前调用 `POST /admin/uploads/oss-policy`：

```json
{
  "success": true,
  "data": {
    "host": "https://bucket.oss-cn-hangzhou.aliyuncs.com",
    "objectKey": "wallpapers/2026/04/27/example.jpg",
    "imageUrl": "https://cdn.example.com/wallpapers/2026/04/27/example.jpg",
    "expireAt": "2026-04-27T12:44:56.000Z",
    "formData": {
      "key": "wallpapers/2026/04/27/example.jpg",
      "policy": "...",
      "x-oss-credential": "...",
      "x-oss-date": "20260427T123456Z",
      "x-oss-signature-version": "OSS4-HMAC-SHA256",
      "signature": "...",
      "success_action_status": "200"
    }
  }
}
```

后台前端应把 `formData` 中的字段连同文件字段一起提交到 `host`。
