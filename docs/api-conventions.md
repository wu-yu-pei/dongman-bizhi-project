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
