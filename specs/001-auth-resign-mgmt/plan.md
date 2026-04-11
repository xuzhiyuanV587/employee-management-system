# Implementation Plan: 用户登录/注册与离职员工管理

**Branch**: `001-auth-resign-mgmt` | **Date**: 2026-04-08 | **Spec**: spec.md
**Input**: Feature specification from `/specs/001-auth-resign-mgmt/spec.md`

## Summary

为员工管理系统完善用户认证（登录/注册）、用户管理和离职员工管理功能。
现有代码库已包含登录、账号 CRUD、离职列表等基础实现，本计划聚焦于：
1. 新增用户自注册功能（前后端）
2. 补充"记住我"功能
3. 添加全面的单元测试（覆盖率达到 ≥80%）
4. 完善错误处理和用户体验

## Technical Context

**Language/Version**: TypeScript 5.x (前端) / Node.js + Express.js 5.x (后端)
**Primary Dependencies**: Vue 3, Element Plus, Pinia, Axios (前端); Express, better-sqlite3, jsonwebtoken, bcryptjs (后端)
**Storage**: SQLite (better-sqlite3, WAL 模式)
**Testing**: Vitest (前端), Jest (后端)
**Target Platform**: Web 浏览器 (现代浏览器)
**Project Type**: Web application (前后端分离)
**Performance Goals**: API 响应 <500ms, 页面加载 <2s
**Constraints**: Token 有效期 24h (普通) / 7d (记住我)
**Scale/Scope**: 内部系统, 预计 <100 用户

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript + Vue 3 强类型驱动 | ✅ PASS | 前端使用 TS + Vue 3 Composition API; 后端为已有 JS 代码，新增代码应逐步迁移 |
| II. 单元测试强制覆盖 (≥80%) | ⚠️ TODO | 当前无测试代码，计划在 Phase 2 全量补充 |
| III. RESTful API 规范 | ✅ PASS | 现有 API 已遵循 RESTful 设计，新增注册接口符合规范 |
| IV. ESLint + Prettier 代码规范 | ✅ PASS | 项目已配置，新增代码需通过检查 |

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-resign-mgmt/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth.md
│   └── resigned-employees.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── api/
│   │   ├── auth.ts              # 认证 API（新增 register）
│   │   ├── employee.ts          # 员工 API
│   │   └── index.ts             # Axios 实例
│   ├── views/
│   │   ├── LoginView.vue        # 登录页（改造：增加注册切换）
│   │   ├── RegisterView.vue     # 注册页（新增）
│   │   ├── AccountList.vue      # 账号管理页（已有）
│   │   └── ResignedList.vue     # 离职员工页（已有）
│   ├── stores/
│   │   ├── auth.ts              # 认证 Store（增强）
│   │   └── employee.ts          # 员工 Store
│   ├── components/
│   │   └── PageHeader.vue       # 通用页头
│   ├── types/
│   │   └── employee.ts          # 类型定义
│   ├── utils/
│   │   └── printCertificate.ts  # 打印工具
│   └── router/
│       └── index.ts             # 路由（增加注册路由）
└── __tests__/                   # 前端测试目录（新增）
    ├── stores/
    │   └── auth.test.ts
    ├── views/
    │   └── LoginView.test.ts
    └── api/
        └── auth.test.ts

server/
├── routes/
│   ├── authRoutes.js            # 认证路由（新增 register）
│   └── employeeRoutes.js        # 员工路由（已有）
├── controllers/
│   ├── authController.js        # 认证控制器（提取自路由，新增）
│   └── employeeController.js    # 员工控制器（已有）
├── models/
│   ├── userModel.js             # 用户模型（新增）
│   └── employeeModel.js         # 员工模型（已有）
├── middleware/
│   ├── auth.js                  # 认证中间件（已有）
│   ├── validators.js            # 验证器（增加注册验证）
│   └── errorHandler.js          # 错误处理（已有）
├── config/
│   └── database.js              # 数据库配置（已有）
└── __tests__/                   # 后端测试目录（新增）
    ├── routes/
    │   └── auth.test.js
    ├── controllers/
    │   └── authController.test.js
    └── models/
        └── userModel.test.js
```

**Structure Decision**: Web application 结构，前端 frontend/ + 后端 server/。
遵循现有目录布局，新增测试目录 __tests__/。

## Complexity Tracking

> 无宪章违规需要记录。
