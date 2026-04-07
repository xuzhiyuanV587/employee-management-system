# Tasks: 用户登录/注册与离职员工管理

**Input**: Design documents from `/specs/001-auth-resign-mgmt/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 宪章要求单元测试覆盖率 ≥80%，因此测试任务为必需。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `server/` for backend, `frontend/` for frontend
- Tests: `frontend/__tests__/` and `server/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 安装测试依赖、配置测试框架、创建测试目录结构

- [ ] T001 安装前端测试依赖: `cd frontend && npm install -D vitest @vue/test-utils @vitest/coverage-v8 jsdom happy-dom`
- [ ] T002 [P] 安装后端测试依赖: `cd server && npm install -D jest supertest`
- [ ] T003 [P] 创建前端 Vitest 配置文件 `frontend/vitest.config.ts`，配置 environment 为 happy-dom，coverage 目标 ≥80%
- [ ] T004 [P] 创建后端 Jest 配置文件 `server/jest.config.js`，配置 testEnvironment 为 node，coverage 目标 ≥80%
- [ ] T005 创建前端测试目录结构 `frontend/__tests__/stores/`、`frontend/__tests__/views/`、`frontend/__tests__/api/`
- [ ] T006 [P] 创建后端测试目录结构 `server/__tests__/routes/`、`server/__tests__/controllers/`、`server/__tests__/models/`
- [ ] T007 在 `frontend/package.json` 中添加 test 脚本: `"test": "vitest run"`, `"test:coverage": "vitest run --coverage"`
- [ ] T008 [P] 在 `server/package.json` 中添加 test 脚本: `"test": "jest"`, `"test:coverage": "jest --coverage"`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 重构现有后端认证代码为 MVC 分层架构，为所有用户故事提供基础

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 创建用户数据模型 `server/models/userModel.js`，从 authRoutes.js 提取所有数据库操作（getUserByUsername, createUser, getAllUsers, deleteUser, updatePassword, updateStatus）
- [ ] T010 创建认证控制器 `server/controllers/authController.js`，从 authRoutes.js 提取所有业务逻辑（login, getMe, getUsers, createUser, deleteUser, resetPassword, toggleStatus）
- [ ] T011 重构 `server/routes/authRoutes.js`，仅保留路由定义，调用 authController 中的方法
- [ ] T012 验证重构后所有现有功能正常：登录、获取用户信息、账号 CRUD

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 用户登录与自注册 (Priority: P1) 🎯 MVP

**Goal**: 用户可以自行注册账号并登录系统，支持"记住我"功能

**Independent Test**: 新用户通过注册页创建账号后自动登录并跳转首页；已注册用户使用正确凭证登录成功

### Tests for User Story 1

- [ ] T013 [P] [US1] 编写 userModel 单元测试 `server/__tests__/models/userModel.test.js`，覆盖 getUserByUsername、createUser（含重复用户名）、getAllUsers、deleteUser、updatePassword、updateStatus
- [ ] T014 [P] [US1] 编写 authController 单元测试 `server/__tests__/controllers/authController.test.js`，覆盖 login（成功、密码错误、账号禁用）、register（成功、用户名已存在、参数校验）、getMe、remember me 逻辑
- [ ] T015 [P] [US1] 编写 auth API 路由测试 `server/__tests__/routes/auth.test.js`，使用 supertest 测试 POST /api/auth/login、POST /api/auth/register、GET /api/auth/me 的完整 HTTP 响应
- [ ] T016 [P] [US1] 编写前端 auth store 测试 `frontend/__tests__/stores/auth.test.ts`，覆盖 login、register、logout、fetchUser、remember me 状态
- [ ] T017 [P] [US1] 编写前端 auth API 测试 `frontend/__tests__/api/auth.test.ts`，覆盖 login、register、getMe 的 API 调用
- [ ] T018 [P] [US1] 编写 LoginView 组件测试 `frontend/__tests__/views/LoginView.test.ts`，覆盖表单渲染、提交验证、错误提示、注册链接

### Implementation for User Story 1

- [ ] T019 [US1] 在 `server/models/userModel.js` 新增 register 方法，验证用户名唯一性和参数合法性，密码 bcrypt 加密后插入数据库
- [ ] T020 [US1] 在 `server/controllers/authController.js` 新增 register 方法，调用 userModel.register 并生成 JWT Token 返回
- [ ] T021 [US1] 在 `server/routes/authRoutes.js` 新增 POST /api/auth/register 路由
- [ ] T022 [US1] 修改 `server/controllers/authController.js` login 方法，支持 remember 参数：remember=true 时 expiresIn='7d'，默认 '24h'
- [ ] T023 [US1] 修改 `server/middleware/validators.js`，新增注册参数验证规则（username ≥3字符、password ≥6字符、displayName 非空）
- [ ] T024 [US1] 在 `frontend/src/api/auth.ts` 新增 register 接口调用和 RegisterParams 类型定义
- [ ] T025 [US1] 创建注册页面 `frontend/src/views/RegisterView.vue`，包含用户名、密码、确认密码、显示名称表单，带表单验证
- [ ] T026 [US1] 在 `frontend/src/stores/auth.ts` 新增 register action，调用 API 注册成功后自动登录
- [ ] T027 [US1] 修改 `frontend/src/views/LoginView.vue`，添加"记住我"复选框和"没有账号？去注册"链接
- [ ] T028 [US1] 修改 `frontend/src/router/index.ts`，新增 /register 路由指向 RegisterView
- [ ] T029 [US1] 修改 `frontend/src/api/auth.ts` login 方法，传递 remember 参数

**Checkpoint**: 用户注册、登录、记住我功能完整可用，所有测试通过

---

## Phase 4: User Story 2 - 用户管理 (Priority: P2)

**Goal**: 管理员可以完整管理系统用户账号（已有功能 + 测试覆盖）

**Independent Test**: 管理员可创建/禁用/启用/重置密码/删除用户账号，所有操作有对应测试

### Tests for User Story 2

- [ ] T030 [P] [US2] 编写用户管理 API 测试 `server/__tests__/routes/user-management.test.js`，覆盖 GET /users、POST /users、DELETE /users/:id、PUT /users/:id/reset-password、PUT /users/:id/status（含权限校验：非管理员拒绝）
- [ ] T031 [P] [US2] 编写 AccountList 组件测试 `frontend/__tests__/views/AccountList.test.ts`，覆盖用户列表渲染、新建账号、重置密码、启用/禁用、删除操作

### Implementation for User Story 2

- [ ] T032 [US2] 验证 `server/controllers/authController.js` 中 getUsers、createUser、deleteUser、resetPassword、toggleStatus 方法的参数校验完整性
- [ ] T033 [US2] 验证 `frontend/src/views/AccountList.vue` 所有功能正常，修复发现的 bug

**Checkpoint**: 用户管理功能完整且有测试覆盖

---

## Phase 5: User Story 3 - 离职员工管理 (Priority: P3)

**Goal**: 离职员工列表查询筛选、办理离职、打印证明功能完整且有测试覆盖

**Independent Test**: 员工可办理离职，离职员工出现在离职列表，可筛选和打印

### Tests for User Story 3

- [ ] T034 [P] [US3] 编写离职员工 API 测试 `server/__tests__/routes/resigned-employees.test.js`，覆盖 GET /employees/resigned（分页、筛选、排序）、POST /employees/resign/:id（成功、员工不存在、重复离职）
- [ ] T035 [P] [US3] 编写 ResignedList 组件测试 `frontend/__tests__/views/ResignedList.test.ts`，覆盖列表渲染、搜索筛选、分页、打印证明按钮

### Implementation for User Story 3

- [ ] T036 [US3] 验证 `server/controllers/employeeController.js` 中 getResigned 和 resign 方法的完整性和边界处理
- [ ] T037 [US3] 验证 `frontend/src/views/ResignedList.vue` 所有功能正常，修复发现的 bug

**Checkpoint**: 离职员工管理功能完整且有测试覆盖

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全局质量保障和最终验证

- [ ] T038 运行前端测试覆盖率 `cd frontend && npm run test:coverage`，确认 ≥80%，若不足则补充测试
- [ ] T039 [P] 运行后端测试覆盖率 `cd server && npm run test:coverage`，确认 ≥80%，若不足则补充测试
- [ ] T040 [P] 运行前端 ESLint + Prettier 检查 `cd frontend && npx eslint src/ --fix && npx prettier --write src/`
- [ ] T041 [P] 运行前端构建验证 `cd frontend && npm run build`，确认无错误无警告
- [ ] T042 根据 quickstart.md 执行端到端功能验证：注册→登录→用户管理→离职管理
- [ ] T043 更新 CLAUDE.md 中 API 路由文档，新增 POST /api/auth/register

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (test dependencies installed)
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion
  - US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) 可顺序执行
  - US2 和 US3 可并行（但建议顺序，因为 US2 先确保用户体系稳定）
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2. No dependencies on other stories.
- **US2 (P2)**: Depends on Phase 2. Uses auth system from US1 but independently testable.
- **US3 (P3)**: Depends on Phase 2. Uses employee system, independently testable.

### Within Each User Story

- Tests written first (T013-T018 before T019-T029)
- Backend before frontend (API ready before UI consumes it)
- Model before controller before route
- Store update before view update

### Parallel Opportunities

- T001-T002: Frontend and backend test deps (parallel)
- T003-T004: Vitest and Jest config (parallel)
- T005-T006: Test directory creation (parallel)
- T013-T018: All US1 test tasks (parallel)
- T030-T031: US2 test tasks (parallel)
- T034-T035: US3 test tasks (parallel)
- T038-T041: Coverage + lint checks (parallel)

---

## Parallel Example: User Story 1

```bash
# Launch all US1 backend tests together:
Task T013: "userModel 单元测试 in server/__tests__/models/userModel.test.js"
Task T014: "authController 单元测试 in server/__tests__/controllers/authController.test.js"
Task T015: "auth API 路由测试 in server/__tests__/routes/auth.test.js"

# Launch all US1 frontend tests together:
Task T016: "auth store 测试 in frontend/__tests__/stores/auth.test.ts"
Task T017: "auth API 测试 in frontend/__tests__/api/auth.test.ts"
Task T018: "LoginView 组件测试 in frontend/__tests__/views/LoginView.test.ts"

# Then backend implementation:
Task T019 → T020 → T021 (model → controller → route)

# Then frontend implementation:
Task T024 → T025 (API → View, parallel with T026-T028)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - MVC 重构)
3. Complete Phase 3: User Story 1 (注册 + 登录 + 记住我)
4. **STOP and VALIDATE**: 注册新用户、登录、记住我
5. Run coverage check

### Incremental Delivery

1. Setup + Foundational → MVC 架构就绪
2. Add US1 → 注册登录可用 → MVP!
3. Add US2 → 用户管理有测试覆盖
4. Add US3 → 离职管理有测试覆盖
5. Polish → 覆盖率验证 + lint + 构建验证

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- 后端现有 authRoutes.js 需重构为 MVC 分层，便于测试
