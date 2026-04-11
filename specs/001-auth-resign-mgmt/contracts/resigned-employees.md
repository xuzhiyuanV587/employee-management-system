# API Contract: 离职员工接口

**Feature**: 001-auth-resign-mgmt

## GET /api/employees/resigned

获取离职员工列表（已有接口，无变更）。

**Query Parameters**:
- `page`: 页码 (default: 1)
- `pageSize`: 每页数量 (default: 10)
- `keyword`: 搜索关键词（姓名/工号/手机号）
- `department`: 部门筛选
- `resignDateStart`: 离职日期起始
- `resignDateEnd`: 离职日期结束

**Response 200**:
```json
{
  "code": 200,
  "data": {
    "employees": [
      {
        "id": 1,
        "employeeId": "EMP-20260101-001",
        "name": "张三",
        "department": "技术部",
        "position": "工程师",
        "phone": "13800138000",
        "hireDate": "2026-01-01",
        "resignDate": "2026-03-01",
        "resignReason": "个人原因",
        "status": "resigned"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  },
  "message": "查询成功"
}
```

## POST /api/employees/resign/:id

办理员工离职（已有接口，无变更）。需要认证。

**Request**:
```json
{
  "resignDate": "2026-03-01",
  "resignReason": "个人原因"
}
```

**Response 200**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "status": "resigned",
    "resignDate": "2026-03-01",
    "resignReason": "个人原因"
  },
  "message": "离职办理成功"
}
```

**Response 404**:
```json
{
  "code": 404,
  "message": "员工不存在"
}
```
