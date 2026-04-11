# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

员工管理系统 - 一个全栈应用，使用 Vue 3 前端和 Express.js 后端，用于管理员工记录、部门和身份认证。

## 技术栈

**前端：** Vue 3 + TypeScript, Vite, Element Plus, Pinia, Vue Router, Axios
**后端：** Express.js 5.x, SQLite (better-sqlite3), JWT 认证, Swagger 文档
**工具：** ESLint, Prettier, SheetJS (Excel 处理), Nodemon

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
│   ├── controllers/            # 业务逻辑控制器
│   ├── models/                 # 数据模型层 (employeeModel, departmentModel)
│   ├── middleware/             # 中间件 (认证, 错误处理, 数据验证)
│   ├── config/                 # 配置 (数据库, Swagger)
│   ├── scripts/                # 工具脚本 (seed-demo-data.js)
│   ├── data/                   # SQLite 数据库文件
│   ├── uploads/                # 文件上传临时目录
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

**认证路由 (`/api/auth`)：**
- `POST /api/auth/login` - 用户登录（支持 remember 参数延长 Token 至 7 天）
- `POST /api/auth/register` - 用户自注册（默认角色 user）

**员工路由 (`/api/employees`)：**
- `GET /api/employees` - 获取员工列表（支持分页、筛选、搜索）
- `POST /api/employees` - 创建员工（工号自动生成）
- `GET /api/employees/:id` - 获取员工详情
- `PUT /api/employees/:id` - 更新员工信息
- `DELETE /api/employees/:id` - 删除员工（软删除）
- `GET /api/employees/stats` - 获取统计数据
- `GET /api/employees/export` - 导出员工数据（CSV）
- `POST /api/employees/batch-delete` - 批量删除员工
- `POST /api/employees/import` - 批量导入员工（JSON）
- `POST /api/employees/import/csv` - CSV 文件导入
- `GET /api/employees/resigned` - 获取离职员工列表
- `POST /api/employees/resign/:id` - 办理员工离职

**部门路由 (`/api/departments`)：**
- `GET /api/departments` - 获取部门列表

**系统路由：**
- `GET /api/health` - 健康检查
- `GET /api-docs` - Swagger API 文档界面
- `GET /api-docs.json` - Swagger JSON 规范

## 重要说明

- 后端使用 SQLite 数据库（better-sqlite3）
- 前端使用 localStorage 进行客户端缓存
- 认证中间件保护员工/部门路由
- 通过 SheetJS (xlsx) 实现 Excel 导入/导出
- 后端错误处理中间件捕获并格式化错误
- 前后端均启用 TypeScript 严格模式

## 后端技术栈详解

### 核心依赖

**Web 框架：**
- `express` (5.2.1) - Node.js Web 应用框架
- `cors` (2.8.6) - 跨域资源共享中间件
- `morgan` (1.10.1) - HTTP 请求日志中间件
- `body-parser` (2.2.2) - 请求体解析中间件

**数据库：**
- `better-sqlite3` (12.8.0) - 同步 SQLite3 数据库驱动
  - 启用 WAL 模式提高并发性能
  - 启用外键约束
  - 支持事务操作

**身份认证：**
- `jsonwebtoken` (9.0.3) - JWT token 生成和验证
- `bcryptjs` (3.0.3) - 密码加密和验证

**数据验证：**
- `express-validator` (7.3.1) - 请求数据验证中间件
  - 支持链式验证规则
  - 自定义错误消息
  - 字段级验证（手机号、邮箱、日期等）

**文件处理：**
- `multer` (2.1.1) - 文件上传中间件（支持 CSV 导入）
- `csv-parser` (3.2.0) - CSV 文件解析

**API 文档：**
- `swagger-jsdoc` (6.2.8) - 从 JSDoc 注释生成 Swagger 规范
- `swagger-ui-express` (5.0.1) - Swagger UI 界面

**环境配置：**
- `dotenv` (17.3.1) - 环境变量管理

**开发工具：**
- `nodemon` (3.1.14) - 开发时自动重启服务器

### 后端架构设计

#### 1. 分层架构（MVC 模式）

```
请求流程：
Client → Routes → Middleware → Controller → Model → Database
                     ↓
                 Validators
                     ↓
              Error Handler
```

**Routes 层（路由层）：**
- 定义 API 端点和 HTTP 方法
- 绑定中间件和控制器
- Swagger 文档注释
- 文件位置：`routes/`

**Middleware 层（中间件层）：**
- `auth.js` - JWT 认证中间件、权限控制
- `validators.js` - 数据验证规则定义
- `errorHandler.js` - 统一错误处理和验证结果处理
- 文件位置：`middleware/`

**Controller 层（控制器层）：**
- 处理业务逻辑
- 调用 Model 层进行数据操作
- 返回统一格式的响应
- 文件位置：`controllers/`

**Model 层（数据模型层）：**
- 封装数据库操作
- 提供数据访问接口
- 事务管理
- 文件位置：`models/`

#### 2. 数据库设计

**表结构：**
- `employees` - 员工表（支持软删除）
- `departments` - 部门表
- `users` - 用户表（认证）

**特性：**
- 自动生成工号（格式：EMP-YYYYMMDD-XXX）
- 软删除机制（deleted_at 字段）
- 自动时间戳（created_at, updated_at）
- 数据完整性约束（CHECK, UNIQUE）

#### 3. 认证与授权

**JWT 认证流程：**
1. 用户登录 → 验证用户名密码（bcrypt）
2. 生成 JWT token（包含用户信息）
3. 客户端存储 token
4. 后续请求携带 token（Authorization: Bearer <token>）
5. 中间件验证 token 有效性

**权限控制：**
- `authMiddleware` - 验证用户登录状态
- `adminOnly` - 限制管理员权限操作

#### 4. 数据验证

**验证规则：**
- 必填字段验证（name, department, position, phone, email, hireDate）
- 格式验证（手机号正则、邮箱格式、日期格式）
- 枚举值验证（部门、状态、性别）
- 分页参数验证（page, pageSize）

**验证流程：**
1. 路由绑定验证规则（employeeValidation.create）
2. express-validator 执行验证
3. handleValidation 中间件处理验证结果
4. 验证失败返回 400 错误和详细错误信息

#### 5. 错误处理

**统一错误响应格式：**
```json
{
  "code": 500,
  "message": "错误描述",
  "error": "详细错误信息（仅开发环境）"
}
```

**错误处理机制：**
- 全局错误处理中间件（errorHandler）
- 捕获所有未处理的异常
- 开发环境返回详细错误信息
- 生产环境隐藏敏感信息

#### 6. 文件上传与导入

**CSV 导入流程：**
1. Multer 中间件接收文件上传
2. 文件类型验证（仅支持 CSV）
3. csv-parser 解析 CSV 内容
4. 数据验证和清洗
5. 批量插入数据库（事务）
6. 返回导入结果（成功/失败统计）
7. 清理临时文件

**支持格式：**
- JSON 批量导入（POST /api/employees/import）
- CSV 文件导入（POST /api/employees/import/csv）

#### 7. 数据导出

**CSV 导出特性：**
- 支持筛选条件导出
- UTF-8 BOM 编码（Excel 兼容）
- 自动处理特殊字符（逗号、引号、换行）
- 流式响应（Content-Disposition: attachment）

#### 8. API 文档

**Swagger 集成：**
- 使用 JSDoc 注释定义 API 规范
- 自动生成交互式文档界面
- 支持在线测试 API
- 访问地址：`http://localhost:3001/api-docs`

#### 9. 性能优化

**数据库优化：**
- WAL 模式提高并发读写性能
- 索引优化（employeeId UNIQUE）
- 分页查询减少数据传输
- 事务批量操作

**查询优化：**
- 支持关键词搜索（name, employeeId, phone）
- 多条件筛选（department, status, hireDate）
- 排序和分页

#### 10. 安全特性

**安全措施：**
- 密码 bcrypt 加密存储（salt rounds: 10）
- JWT token 过期验证
- SQL 注入防护（参数化查询）
- CORS 跨域配置
- 请求体大小限制（文件上传 5MB）
- 输入数据验证和清洗

### 技术选型理由

**Express.js 5.x：**
- 成熟稳定的 Node.js Web 框架
- 中间件生态丰富
- 路由系统灵活
- 社区支持强大

**better-sqlite3：**
- 同步 API，代码简洁
- 性能优于异步 SQLite 驱动
- 无需额外数据库服务
- 适合中小型应用

**JWT 认证：**
- 无状态认证，易于扩展
- 跨域友好
- 客户端存储，减轻服务器压力

**express-validator：**
- 基于 validator.js，验证规则丰富
- 与 Express 深度集成
- 链式 API，代码可读性高

**Swagger：**
- 标准化 API 文档
- 自动生成，减少维护成本
- 支持在线测试，提高开发效率

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

## Active Technologies
- TypeScript 5.x (前端) / Node.js + Express.js 5.x (后端) + Vue 3, Element Plus, Pinia, Axios (前端); Express, better-sqlite3, jsonwebtoken, bcryptjs (后端) (001-auth-resign-mgmt)
- SQLite (better-sqlite3, WAL 模式) (001-auth-resign-mgmt)

## Recent Changes
- 001-auth-resign-mgmt: Added TypeScript 5.x (前端) / Node.js + Express.js 5.x (后端) + Vue 3, Element Plus, Pinia, Axios (前端); Express, better-sqlite3, jsonwebtoken, bcryptjs (后端)
