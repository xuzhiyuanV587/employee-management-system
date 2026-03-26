# 员工管理系统 API 文档

## 基础信息
- **Base URL**: `http://localhost:3000/api`
- **数据格式**: JSON
- **编码**: UTF-8

## 响应格式
```json
{
  "code": 200,
  "data": {},
  "message": "操作成功"
}
```

---

## 员工接口

### 1. GET /api/employees — 获取员工列表（支持分页、筛选）
**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10，最大100 |
| keyword | string | 否 | 关键词搜索（姓名/工号/手机号） |
| department | string | 否 | 按部门筛选：技术部/产品部/市场部/财务部/人事部/运营部 |
| status | string | 否 | 按状态筛选：在职/离职/试用期 |
| hireDateStart | date | 否 | 入职日期范围-开始 |
| hireDateEnd | date | 否 | 入职日期范围-结束 |

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "employeeId": "EMP-20260324-001",
        "name": "张三",
        "department": "技术部",
        "position": "高级工程师",
        "phone": "13800138000",
        "email": "zhangsan@company.com",
        "hireDate": "2024-01-15",
        "status": "在职",
        "gender": "男",
        "birthday": "1990-05-20",
        "address": "北京市朝阳区",
        "remark": ""
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "message": "查询成功"
}
```

### 2. GET /api/employees/:id — 获取员工详情

### 3. POST /api/employees — 创建员工
**说明**: 工号（employeeId）由系统自动生成，格式为 `EMP-YYYYMMDD-XXX`

**请求体**:
```json
{
  "name": "张三",
  "department": "技术部",
  "position": "高级工程师",
  "phone": "13800138000",
  "email": "zhangsan@company.com",
  "hireDate": "2024-01-15",
  "status": "在职",
  "gender": "男",
  "birthday": "1990-05-20",
  "address": "北京市朝阳区",
  "remark": ""
}
```
**必填字段**: name, department, position, phone, email, hireDate

**字段验证**:
- phone: 11位手机号（1开头）
- email: 邮箱格式
- department: 必须为有效部门名称
- status: 在职/离职/试用期
- gender: 男/女

### 4. PUT /api/employees/:id — 更新员工信息
**说明**: 工号（employeeId）不可修改，其余字段均可选更新

### 5. DELETE /api/employees/:id — 删除员工
**说明**: 使用软删除机制，数据可恢复

### 6. POST /api/employees/batch-delete — 批量删除
**请求体**:
```json
{
  "ids": [1, 2, 3]
}
```

### 7. POST /api/employees/import — 批量导入
**请求体**:
```json
{
  "employees": [
    {
      "name": "张三",
      "department": "技术部",
      "position": "高级工程师",
      "phone": "13800138000",
      "email": "zhangsan@company.com",
      "hireDate": "2024-01-15"
    }
  ]
}
```
**说明**: 工号由系统自动生成

**响应**:
```json
{
  "code": 200,
  "data": {
    "success": 2,
    "failed": 0,
    "errors": []
  },
  "message": "导入完成：成功 2 条，失败 0 条"
}
```

### 8. GET /api/employees/export — 导出员工数据
**说明**: 导出当前筛选结果为 CSV 文件（支持与列表相同的筛选参数）
**查询参数**: 同列表接口（keyword, department, status, hireDateStart, hireDateEnd）
**响应**: CSV 文件下载

### 9. POST /api/employees/import/csv — CSV文件导入
**Content-Type**: `multipart/form-data`
**参数**: file (CSV文件，最大5MB)
**CSV列名支持**: 中文（姓名/部门/职位/手机号/邮箱/入职日期/状态/性别/生日/地址/备注）和英文

### 10. GET /api/employees/stats — 获取统计数据

---

## 部门接口

### GET /api/departments — 获取所有部门（含各部门员工数量）
### GET /api/departments/:id — 获取单个部门
### POST /api/departments — 创建部门
### PUT /api/departments/:id — 更新部门
### DELETE /api/departments/:id — 删除部门

---

## 数据模型

### 员工字段（12个字段，与PRD对齐）
| 字段 | 标识 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| 姓名 | name | string | 是 | 员工真实姓名 |
| 工号 | employeeId | string | 自动 | 系统自动生成: EMP-YYYYMMDD-XXX |
| 部门 | department | enum | 是 | 技术部/产品部/市场部/财务部/人事部/运营部 |
| 职位 | position | string | 是 | 员工职位名称 |
| 手机号 | phone | string | 是 | 11位手机号 |
| 邮箱 | email | string | 是 | 工作邮箱 |
| 入职日期 | hireDate | date | 是 | 入职时间 |
| 状态 | status | enum | 是 | 在职/离职/试用期 |
| 性别 | gender | enum | 否 | 男/女 |
| 生日 | birthday | date | 否 | 出生日期 |
| 地址 | address | string | 否 | 居住地址 |
| 备注 | remark | string | 否 | 附加信息 |

### 软删除机制
- 删除操作设置 `deleted_at` 时间戳，不物理删除数据
- 所有查询自动过滤已删除记录
- 数据可恢复

---

## 错误码
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 验证错误响应
```json
{
  "code": 400,
  "message": "数据验证失败",
  "errors": [
    { "field": "phone", "message": "手机号格式无效（需为11位手机号）" },
    { "field": "email", "message": "邮箱格式无效" }
  ]
}
```
