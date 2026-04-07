<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections:
  - Core Principles (4 principles)
  - 技术约束
  - 开发工作流
  - Governance
- Removed sections: N/A
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ 已验证一致
  - .specify/templates/spec-template.md ✅ 已验证一致
  - .specify/templates/tasks-template.md ✅ 已验证一致
- Follow-up TODOs: 无
-->

# 员工管理系统 Constitution

## Core Principles

### I. TypeScript + Vue 3 强类型驱动

- 所有前端代码 MUST 使用 TypeScript + Vue 3 Composition API（`<script setup>`）编写
- 禁止使用 JavaScript 编写前端逻辑代码
- 禁止使用 Options API
- Props、Emits、API 响应 MUST 定义明确的 TypeScript 类型/接口
- 优先使用 `interface` 而非 `type`（除非需要联合类型）
- 禁止使用 `any`，必须使用 `unknown` 或具体类型
- 函数参数和返回值 MUST 有类型注解

**理由**: 强类型系统在编译期捕获错误，减少运行时 bug，提高代码可维护性和团队协作效率。

### II. 单元测试强制覆盖（NON-NEGOTIABLE）

- 所有功能代码 MUST 编写对应的单元测试
- 测试覆盖率 MUST ≥ 80%（行覆盖率）
- 测试 MUST 在提交前全部通过
- 核心业务逻辑（数据验证、状态管理、API 调用）覆盖率目标 ≥ 90%
- 测试文件与源文件同目录或放置在 `__tests__/` 目录下
- 使用 Vitest 作为前端测试框架，Jest 兼容模式用于后端

**理由**: 单元测试是代码质量的底线保障，≥80% 的覆盖率确保核心逻辑被充分验证，
降低回归风险。

### III. RESTful API 规范

- 所有后端 API MUST 遵循 RESTful 设计原则
- 使用标准 HTTP 方法：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- URL 路径 MUST 使用复数名词表示资源集合（如 `/api/employees`）
- 使用标准 HTTP 状态码表示结果（200/201/400/401/404/500）
- 响应格式 MUST 为 JSON，包含统一的响应结构
- 支持分页、筛选、排序的列表接口 MUST 使用查询参数
- API 版本化通过 URL 路径前缀管理（如 `/api/v1/`）

**理由**: RESTful API 是行业标准，降低学习成本，提高前后端协作效率和 API 可理解性。

### IV. ESLint + Prettier 代码规范

- 所有代码 MUST 通过 ESLint 检查，无 error 级别违规
- 所有代码 MUST 通过 Prettier 格式化
- 提交前 MUST 运行 lint 检查并修复所有问题
- 使用 2 空格缩进（JavaScript/TypeScript/Vue/CSS）
- 单行代码不超过 100 字符
- 文件末尾保留一个空行
- 行尾不留空格
- 命名规范：
  - 文件名：kebab-case（如 `user-service.ts`）
  - 变量/函数：camelCase（如 `getUserInfo`）
  - 类名：PascalCase（如 `UserService`）
  - 常量：UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
  - 组件名：PascalCase（如 `UserProfile.vue`）

**理由**: 统一的代码风格消除格式争议，ESLint + Prettier 自动化保障规范落地，
提高代码可读性和团队协作体验。

## 技术约束

- 前端技术栈：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router + Axios
- 后端技术栈：Express.js + SQLite (better-sqlite3) + JWT 认证
- 数据库：SQLite（WAL 模式，启用外键约束）
- 认证方式：JWT Token（Bearer 认证）
- API 文档：Swagger/OpenAPI
- 编码：UTF-8
- 包管理器：npm

## 开发工作流

- 分支策略：基于 feature 分支开发，合并至 main 分支
- 提交规范：遵循 Conventional Commits 格式（feat/fix/chore/docs 等）
- 代码审查：所有合并 MUST 经过代码审查
- 测试要求：提交前 MUST 确保所有测试通过 + 覆盖率 ≥ 80%
- 构建验证：前端构建 MUST 无错误无警告

## Governance

- 本宪章优先级高于所有其他开发实践文档
- 宪章修订 MUST 提供文档说明、审批记录和迁移计划
- 所有 PR/代码审查 MUST 验证是否符合宪章原则
- 新增复杂性 MUST 提供充分理由
- 宪章版本遵循语义化版本规范：
  - MAJOR：原则移除或重新定义（不兼容变更）
  - MINOR：新增原则或实质性扩展
  - PATCH：措辞修正、错别字修复

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
