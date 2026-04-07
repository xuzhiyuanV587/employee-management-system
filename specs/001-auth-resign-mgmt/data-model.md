# Data Model: 用户登录/注册与离职员工管理

**Feature**: 001-auth-resign-mgmt
**Date**: 2026-04-08

## Entities

### User (users 表)

用户账号实体，用于系统认证和授权。

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PK, AUTOINCREMENT | 主键 |
| username | TEXT | UNIQUE, NOT NULL | 用户名（≥3字符） |
| password | TEXT | NOT NULL | 密码（bcrypt 加密存储） |
| displayName | TEXT | NOT NULL | 显示名称 |
| role | TEXT | NOT NULL, DEFAULT 'user' | 角色：admin / user |
| status | TEXT | NOT NULL, DEFAULT 'active' | 状态：active / disabled |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**Validation Rules**:
- username: 长度 ≥ 3, 字母数字下划线
- password: 长度 ≥ 6, 明文传入后 bcrypt 加密存储
- displayName: 非空
- role: 枚举值 ['admin', 'user']
- status: 枚举值 ['active', 'disabled']
- username 唯一约束

**State Transitions**:
```
active ←→ disabled  (管理员操作)
新注册 → active
```

**Business Rules**:
- superadmin 账号不可删除、不可禁用
- 新注册用户默认角色为 user
- 密码使用 bcrypt salt rounds=10 加密

### Employee (employees 表)

员工实体（已有，本次不修改表结构）。

### ResignedEmployee

复用 Employee 实体，通过 status='resigned' 标识，额外使用以下字段：
- resignDate: 离职日期
- resignReason: 离职原因
- deleted_at: 软删除时间戳（已有字段，离职时设置）

## Relationships

- User 与 Employee 无直接关联（当前设计中用户和员工是独立实体）
- Employee 自关联：一个员工有且仅有一个状态（active / resigned）

## Indexes (已有)

- users: username UNIQUE index
- employees: employeeId UNIQUE index
