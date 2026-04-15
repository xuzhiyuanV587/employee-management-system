# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

员工管理系统 - 全栈应用，支持 Web 和 Electron 桌面端，用于管理员工记录、部门和身份认证。

**技术栈：** Vue 3 + TypeScript (前端), Express.js + SQLite (后端), Electron (桌面端)

## 项目结构

```
employee-management-system/          # pnpm monorepo
├── frontend/                        # Vue 3 SPA (端口 5001)
│   ├── src/
│   │   ├── api/                    # Axios API 客户端
│   │   ├── stores/                 # Pinia 状态管理
│   │   ├── views/                  # 页面组件
│   │   ├── router/                 # Vue Router (auth guard)
│   │   └── utils/                  # 工具函数 (validation, excel, print)
│   └── __tests__/                  # Vitest 测试
├── server/                          # Express 后端 (端口 6001)
│   ├── routes/                     # API 路由
│   ├── controllers/                # 业务逻辑
│   ├── models/                     # 数据模型 (SQLite)
│   ├── middleware/                 # 认证、验证、错误处理
│   ├── config/                     # 数据库、Swagger 配置
│   ├── utils/                      # 工具函数 (docx-parser 合同解析)
│   ├── data/                       # SQLite 数据库文件
│   └── __tests__/                  # Jest 测试
├── electron/                        # Electron 主进程
│   ├── main.js                     # 启动 Express + 前端窗口
│   └── preload.js                  # 上下文隔离
└── docs/                           # 详细文档
```

## 常用命令

```bash
# 开发（前后端同时启动）
pnpm dev

# 单独启动
cd frontend && pnpm dev          # 前端 (Vite, 端口 5001)
cd server && pnpm dev            # 后端 (Nodemon, 端口 6001)

# 构建
pnpm build                       # 构建前端

# 测试
cd frontend && pnpm test         # Vitest (happy-dom)
cd server && pnpm test           # Jest (80% 覆盖率阈值)

# 数据
cd server && pnpm seed           # 填充演示数据

# Electron 桌面端
pnpm electron:dev                # 开发模式运行
pnpm electron:build:m            # 打包 Apple Silicon
pnpm electron:build:intel        # 打包 Intel Mac
```

## 核心架构

**前端数据流：** Vue 组件 → Pinia store → API 层 (Axios) → 后端
**后端分层：** Routes → Middleware (auth/validation) → Controller → Model → SQLite
**认证：** JWT token (Bearer)，前端 localStorage 存储，路由守卫拦截未认证请求

**前端代理：** Vite 将 `/api` 代理到 `http://127.0.0.1:6001`（开发模式）
**Electron 模式：** main.js 动态分配端口启动 Express，加载前端构建产物

**数据库：**
- SQLite (better-sqlite3)，WAL 模式，外键约束
- 表：`employees`（软删除）、`departments`、`users`
- 工号自动生成格式：`EMP-YYYYMMDD-XXX`
- 默认管理员：`superadmin` / `superadmin`

**路由页面：** `/login`, `/register`, `/`(员工列表), `/resigned`(离职), `/accounts`(账户管理), `/files`(文件), `/contracts`(合同管理), `/contracts/:id`(合同详情), `/create`, `/edit/:id`, `/detail/:id`

## API 路由

- `POST /api/auth/login|register` - 认证
- `GET|POST /api/employees` - 列表（分页/筛选/搜索）、创建
- `GET|PUT|DELETE /api/employees/:id` - 详情、更新、删除（软删除）
- `GET /api/employees/stats|export` - 统计、CSV 导出
- `POST /api/employees/batch-delete|import|import/csv` - 批量操作
- `GET /api/employees/resigned` / `POST /api/employees/resign/:id` - 离职管理
- `GET /api/departments` - 部门列表
- `POST /api/contracts/upload` - 上传合同模板（.docx）
- `GET|DELETE /api/contracts` / `GET /api/contracts/:id` - 模板 CRUD
- `POST /api/contracts/:id/reparse` - 重新识别空白项
- `POST /api/contracts/:id/fill` - 填写空白项生成合同
- `GET /api/contracts/:id/records` - 使用记录
- `GET|DELETE /api/contracts/records/:recordId` - 记录详情/删除
- `GET /api/contracts/records/:recordId/download` - 下载已填写合同
- `GET /api-docs` - Swagger 文档

## 关键注意事项

- 使用 pnpm（非 npm）管理依赖
- 前端端口 5001，后端端口 6001（非默认的 5173/3001）
- 后端 `.env` 配置：PORT, DB_PATH, NODE_ENV, JWT_SECRET
- Electron 打包需先 `electron:prepare` 处理 better-sqlite3 原生模块
- CSV 导出使用 UTF-8 BOM 编码兼容 Excel
- express-validator 做请求验证，handleValidation 中间件处理结果
- 合同管理使用 pizzip + docxtemplater 处理 .docx，`server/utils/docx-parser.js` 负责空白项解析和填充
- Multer 的 `req.file.originalname` 对中文需 `Buffer.from(name, 'latin1').toString('utf8')` 解码
- docx XML 中文本可能拆分到多个 `<w:r>/<w:t>` 节点，解析和填充时需按段落聚合处理
