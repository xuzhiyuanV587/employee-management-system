# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

员工管理系统 - 一个全栈应用，使用 Vue 3 前端和 Express.js 后端，用于管理员工记录、部门和身份认证。

## 技术栈

**前端：** Vue 3 + TypeScript, Vite, Element Plus, Pinia, Vue Router, Axios
**后端：** Express.js, SQLite (better-sqlite3), JWT 认证, Swagger 文档
**工具：** ESLint, Prettier, SheetJS (Excel 处理)

## 目录结构

```
employee-management-system/
├── frontend/                    # Vue 3 单页应用
│   ├── src/
│   │   ├── api/                # API 客户端 (employee.ts, auth.ts)
│   │   ├── components/         # 可复用 Vue 组件
│   │   ├── stores/             # Pinia 状态管理 (employee, auth)
│   │   ├── views/              # 页面组件
│   │   ├── router/             # Vue Router 配置
│   │   ├── types/              # TypeScript 类型定义
│   │   ├── utils/              # 工具函数 (validation, excel, print)
│   │   └── main.ts
│   ├── vite.config.ts
│   └── package.json
├── server/                      # Express 后端
│   ├── routes/                 # API 路由 (auth, employees, departments)
│   ├── middleware/             # 中间件 (认证, 错误处理)
│   ├── config/                 # 配置 (数据库, Swagger)
│   ├── app.js                  # Express 应用入口
│   └── package.json
└── docs/
    ├── architecture.md         # 技术架构详情
    └── PRD.md                  # 产品需求文档
```

## 常用命令

**前端：**
- `cd frontend && npm run dev` - 启动开发服务器 (Vite, 端口 5173)
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

**后端：**
- `cd server && npm run dev` - 使用 nodemon 启动 (端口 3001)
- `npm start` - 启动生产服务器
- `npm run seed` - 填充演示数据

## 核心架构模式

**前端数据流：** Vue 组件 → Pinia store → API 层 → 后端
**API 层：** `src/api/` 中的 Axios 客户端处理所有 HTTP 请求
**状态管理：** `src/stores/` 中的 Pinia stores (employee, auth)
**身份认证：** JWT tokens，后端中间件，前端存储

## API 路由

- `POST /api/auth/login` - 用户登录
- `GET/POST/PUT/DELETE /api/employees` - 员工 CRUD 操作
- `GET /api/departments` - 获取部门列表
- `GET /api/health` - 健康检查
- Swagger 文档地址：`http://localhost:3001/api-docs`

## 重要说明

- 后端使用 SQLite 数据库（better-sqlite3）
- 前端使用 localStorage 进行客户端缓存
- 认证中间件保护员工/部门路由
- 通过 SheetJS (xlsx) 实现 Excel 导入/导出
- 后端错误处理中间件捕获并格式化错误
- 前后端均启用 TypeScript 严格模式

## 开发规范

### 代码风格
- 使用 2 空格缩进
- 使用 UTF-8 编码
- 文件末尾保留一个空行
- 单行代码不超过 100 字符

### 命名规范
- **文件名：** kebab-case（如 `user-service.ts`）
- **变量/函数：** camelCase（如 `getUserInfo`）
- **类名：** PascalCase（如 `UserService`）
- **常量：** UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- **组件名：** PascalCase（如 `UserProfile.vue`）

### TypeScript 规范
- 优先使用 `interface` 而非 `type`
- 避免使用 `any`，使用 `unknown` 或具体类型
- 函数参数和返回值必须有类型注解

### Vue 3 规范
- 使用 Composition API（`<script setup>`）
- Props 必须定义类型和默认值
