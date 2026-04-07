# Research: 用户登录/注册与离职员工管理

**Feature**: 001-auth-resign-mgmt
**Date**: 2026-04-08

## 1. 用户注册流程设计

**Decision**: 采用管理员创建 + 用户自注册双通道模式

**Rationale**:
- 管理员创建账号（已有功能）适合批量初始化和受控环境
- 用户自注册（新增）降低管理员操作负担，提升用户体验
- 注册用户默认为 user 角色，安全性可控

**Alternatives considered**:
- 仅管理员创建：操作负担大，不适合中小规模团队
- 仅用户自注册：缺乏管控，可能产生垃圾账号
- 邀请码注册：复杂度高，内部系统不需要

## 2. "记住我"功能实现

**Decision**: 使用延长 Token 有效期的方式（24h → 7d）

**Rationale**:
- JWT Token 已有成熟的过期机制，只需调整 expiresIn 参数
- 客户端传递 remember 布尔值，后端根据此值决定有效期
- 无需引入 Refresh Token 机制，降低复杂度

**Alternatives considered**:
- Refresh Token 双 Token 模式：安全但复杂，内部系统不必要
- 永久 Token：安全隐患大
- Cookie 持久化：与现有 localStorage 方案不一致

## 3. 前端测试框架选择

**Decision**: 使用 Vitest + @vue/test-utils

**Rationale**:
- Vitest 与 Vite 原生集成，零配置
- 与 Jest API 兼容，学习成本低
- @vue/test-utils 是 Vue 官方测试库
- 宪章明确指定 Vitest 作为前端测试框架

**Alternatives considered**:
- Jest：配置繁琐，与 Vite 集成需要额外适配
- Cypress：更适合 E2E 测试，不适合单元测试

## 4. 后端测试框架选择

**Decision**: 使用 Jest + supertest

**Rationale**:
- 宪章指定 Jest 兼容模式用于后端
- supertest 是 Express 应用测试的事实标准
- 可以测试完整的 HTTP 请求/响应周期

**Alternatives considered**:
- Vitest：后端 Node.js 环境更成熟的是 Jest
- Mocha + Chai：较老，配置分散

## 5. 后端代码分层策略

**Decision**: 将 authRoutes.js 中的业务逻辑提取到 authController.js 和 userModel.js

**Rationale**:
- 现有 authRoutes.js 包含了路由定义 + 业务逻辑 + 数据库操作，违反 MVC 分层
- 提取后与 employeeController/employeeModel 保持一致的架构风格
- 便于编写单元测试，可以独立测试 controller 和 model 层

**Alternatives considered**:
- 保持现有结构直接加测试：测试困难，难以 mock 数据库
- 完全重构为 TypeScript：改动范围太大，不在本次需求范围

## 6. 注册接口安全策略

**Decision**: 基础防护（验证码 + 频率限制）

**Rationale**:
- 内部系统用户量小（<100），不需要复杂防护
- 前端表单验证 + 后端参数校验足以应对正常场景
- 可通过 IP 频率限制防止暴力注册

**Alternatives considered**:
- 邮箱验证：内部系统不必要
- 手机短信验证：增加成本和复杂度
- 图形验证码：用户体验差，且内部系统风险低
