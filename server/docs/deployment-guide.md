# 员工管理系统 - 后端部署指南

## 1. 环境要求

| 依赖 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 16.x | 18.x 或 20.x | 运行时环境 |
| npm | 8.x | 9.x+ | 包管理器 |

> better-sqlite3 需要本地编译，请确保系统已安装 C++ 编译工具链：
> - **macOS**: `xcode-select --install`
> - **Linux**: `sudo apt install build-essential python3`
> - **Windows**: 安装 Visual Studio Build Tools

## 2. 快速启动

```bash
# 1. 进入后端项目目录
cd employee-management-system/server

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选，默认值已内置）
cp .env.example .env
# 编辑 .env 修改端口等配置

# 4. 启动服务（开发模式）
npm run dev

# 5. 启动服务（生产模式）
npm start
```

启动成功后将看到：
```
数据库初始化完成
员工管理系统后端服务已启动: http://localhost:3000
```

## 3. 环境配置

### .env 配置项

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | 服务端口 |
| DB_PATH | ./data/employee.db | SQLite 数据库文件路径 |
| NODE_ENV | development | 运行环境（development/production） |

### .env.example
```
PORT=3000
DB_PATH=./data/employee.db
NODE_ENV=development
```

## 4. 数据库

### 自动初始化
服务首次启动时会自动完成：
- 创建 `data/` 目录
- 创建 SQLite 数据库文件
- 创建 `employees` 和 `departments` 表
- 插入 6 个默认部门（技术部、产品部、市场部、财务部、人事部、运营部）

### 重置数据库
```bash
# 删除数据库文件，重启服务即可重建
rm -f data/employee.db
npm start
```

### 导入演示数据
```bash
# 使用预置脚本导入10条演示员工数据
node scripts/seed-demo-data.js
```

## 5. 服务验证

启动服务后，依次验证以下接口：

```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取部门列表（应返回6个部门）
curl http://localhost:3000/api/departments

# 获取员工列表
curl http://localhost:3000/api/employees

# 创建员工测试
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","department":"技术部","position":"工程师","phone":"13800000000","email":"test@test.com","hireDate":"2024-01-01"}'
```

## 6. 项目目录结构

```
server/
├── app.js                     # Express 主入口
├── package.json               # 项目配置和依赖
├── .env                       # 环境变量（不提交至版本库）
├── config/
│   └── database.js            # 数据库连接和初始化
├── models/
│   ├── employeeModel.js       # 员工数据模型
│   └── departmentModel.js     # 部门数据模型
├── controllers/
│   ├── employeeController.js  # 员工业务逻辑
│   └── departmentController.js # 部门业务逻辑
├── routes/
│   ├── employeeRoutes.js      # 员工路由
│   └── departmentRoutes.js    # 部门路由
├── middleware/
│   ├── validators.js          # 数据验证规则
│   └── errorHandler.js        # 错误处理中间件
├── scripts/
│   └── seed-demo-data.js      # 演示数据导入脚本
├── docs/
│   └── API.md                 # API 接口文档
├── data/                      # 数据库文件（自动创建）
└── uploads/                   # CSV上传临时目录（自动创建）
```

## 7. 常见问题排查

### Q: 启动报错 `better-sqlite3` 编译失败
```bash
# 重新安装原生模块
npm rebuild better-sqlite3
# 或完全清理后重装
rm -rf node_modules package-lock.json
npm install
```

### Q: 端口被占用
```bash
# 查看占用端口的进程
lsof -i :3000
# 修改 .env 中的 PORT 为其他端口，或终止占用进程
```

### Q: 数据库文件权限错误
```bash
# 确保 data 目录有写入权限
chmod 755 data/
```

### Q: CORS 跨域错误
后端已默认启用 CORS（允许所有来源）。如需限制来源，修改 `app.js` 中的 cors 配置：
```js
app.use(cors({ origin: 'http://localhost:5173' }));
```

### Q: 前端请求到后端的端口不匹配
确保前端的 API 请求地址（通常在 `vite.config.ts` 的 proxy 或 `.env` 中配置）指向后端服务实际运行的端口。

## 8. 技术栈说明

| 组件 | 版本 | 用途 |
|------|------|------|
| Express | 5.2.1 | Web 框架 |
| better-sqlite3 | 12.x | SQLite 数据库驱动 |
| express-validator | 7.x | 请求数据验证 |
| multer | 2.x | 文件上传处理 |
| csv-parser | 3.x | CSV 文件解析 |
| cors | 2.x | 跨域支持 |
| morgan | 1.x | HTTP 请求日志 |
| dotenv | 17.x | 环境变量管理 |
