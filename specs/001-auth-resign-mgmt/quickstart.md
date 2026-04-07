# Quickstart: 用户登录/注册与离职员工管理

**Feature**: 001-auth-resign-mgmt
**Date**: 2026-04-08

## 环境准备

```bash
# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../server && npm install

# 安装测试依赖（如尚未安装）
cd ../frontend && npm install -D vitest @vue/test-utils jsdom
cd ../server && npm install -D jest supertest
```

## 启动开发环境

```bash
# 终端 1: 启动后端
cd server && npm run dev

# 终端 2: 启动前端
cd frontend && npm run dev
```

## 验证功能

### 1. 用户注册
- 访问 http://localhost:5173/register
- 填写用户名、密码、显示名称
- 点击注册，应自动登录并跳转至首页

### 2. 用户登录
- 访问 http://localhost:5173/login
- 输入 superadmin / superadmin 登录
- 勾选"记住我"可延长 Token 有效期至 7 天

### 3. 用户管理
- 登录后访问"账号管理"页面
- 可创建新账号、重置密码、启用/禁用、删除账号

### 4. 离职员工管理
- 在员工列表中选择在职员工办理离职
- 访问"离职员工"页面查看、筛选离职员工
- 点击"打印证明"生成离职证明

## 运行测试

```bash
# 前端测试
cd frontend && npx vitest run

# 前端测试覆盖率
cd frontend && npx vitest run --coverage

# 后端测试
cd server && npx jest

# 后端测试覆盖率
cd server && npx jest --coverage
```

## 测试场景清单

| 场景 | 端 | 描述 |
|------|-----|------|
| 注册成功 | 前+后 | 填写合法信息完成注册 |
| 注册-用户名已存在 | 前+后 | 提示用户名已被占用 |
| 注册-密码太短 | 前+后 | 密码少于6位时拒绝 |
| 登录成功 | 前+后 | 正确凭证登录 |
| 登录-密码错误 | 前+后 | 错误密码提示 |
| 登录-账号禁用 | 前+后 | 禁用账号无法登录 |
| 登录-记住我 | 后 | Token 有效期延长 |
| Token 过期跳转 | 前 | 过期后跳转登录页 |
| 账号管理 CRUD | 前+后 | 管理员操作账号 |
| 离职办理 | 后 | 员工离职状态变更 |
| 离职列表查询 | 后 | 分页、筛选、排序 |
