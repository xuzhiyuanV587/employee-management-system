# API Contract: 认证接口

**Feature**: 001-auth-resign-mgmt

## POST /api/auth/register

用户自注册。

**Request**:
```json
{
  "username": "string (≥3字符)",
  "password": "string (≥6字符)",
  "displayName": "string (非空)"
}
```

**Response 201**:
```json
{
  "code": 201,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "zhangsan",
      "displayName": "张三",
      "role": "user"
    }
  },
  "message": "注册成功"
}
```

**Response 400** (参数错误/用户名已存在):
```json
{
  "code": 400,
  "message": "用户名已存在"
}
```

## POST /api/auth/login

用户登录（已有接口，增强 remember 参数）。

**Request**:
```json
{
  "username": "string",
  "password": "string",
  "remember": false
}
```

**Response 200**:
```json
{
  "code": 200,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "superadmin",
      "displayName": "超级管理员",
      "role": "admin"
    }
  },
  "message": "登录成功"
}
```

**Response 401**:
```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

**Response 403** (账号被禁用):
```json
{
  "code": 403,
  "message": "账号已被禁用"
}
```

**Notes**:
- `remember: true` 时 Token 有效期延长至 7 天，默认 24 小时

## GET /api/auth/me

获取当前登录用户信息（已有接口，无变更）。

**Headers**: `Authorization: Bearer <token>`

**Response 200**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "superadmin",
    "displayName": "超级管理员",
    "role": "admin",
    "status": "active",
    "created_at": "2026-01-01 00:00:00"
  },
  "message": "查询成功"
}
```

## POST /api/auth/logout

用户退出登录（前端清除 Token，无需后端接口）。

## GET /api/auth/users

获取用户列表（已有接口，无变更）。需要管理员权限。

## POST /api/auth/users

管理员创建子账号（已有接口，无变更）。需要管理员权限。

## PUT /api/auth/users/:id/reset-password

重置用户密码（已有接口，无变更）。需要管理员权限。

## PUT /api/auth/users/:id/status

启用/禁用用户（已有接口，无变更）。需要管理员权限。

## DELETE /api/auth/users/:id

删除用户（已有接口，无变更）。需要管理员权限。
