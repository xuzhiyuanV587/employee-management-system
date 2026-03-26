# Swagger API 文档 - 完整设置指南

## ✅ 已修复的问题

1. **Swagger 配置路径问题** - 已修复为绝对路径
2. **Swagger UI 路由配置** - 已优化路由顺序

## 🚀 快速启动

### 1. 启动后端服务

```bash
cd /Users/macbook/employee-management-system/server
npm run dev
```

你会看到类似的输出：
```
员工管理系统后端服务已启动: http://localhost:3001
API 文档: http://localhost:3001/api-docs
健康检查: http://localhost:3001/api/health
```

### 2. 在浏览器中打开 Swagger UI

访问以下地址：
```
http://localhost:3001/api-docs
```

## 📋 可用的 API 端点

### 员工管理
- `GET /api/employees` - 获取员工列表
- `POST /api/employees` - 创建员工
- `GET /api/employees/{id}` - 获取员工详情
- `PUT /api/employees/{id}` - 更新员工
- `DELETE /api/employees/{id}` - 删除员工
- `GET /api/employees/stats` - 获取统计数据
- `GET /api/employees/export` - 导出员工数据
- `POST /api/employees/batch-delete` - 批量删除
- `POST /api/employees/import` - 批量导入
- `POST /api/employees/import/csv` - CSV导入

### 部门管理
- `GET /api/departments` - 获取部门列表
- `POST /api/departments` - 创建部门
- `GET /api/departments/{id}` - 获取部门详情
- `PUT /api/departments/{id}` - 更新部门
- `DELETE /api/departments/{id}` - 删除部门

### 系统
- `GET /api/health` - 健康检查

## 🔍 在 Swagger UI 中测试 API

1. 打开 http://localhost:3001/api-docs
2. 选择要测试的 API 端点
3. 点击 "Try it out" 按钮
4. 填写必要的参数
5. 点击 "Execute" 执行请求
6. 查看响应结果

## 📝 文件变更

- `server/config/swagger.js` - Swagger 配置（已修复路径）
- `server/app.js` - Express 应用（已集成 Swagger UI）
- `server/routes/employeeRoutes.js` - 员工路由（已添加 Swagger 注释）
- `server/routes/departmentRoutes.js` - 部门路由（已添加 Swagger 注释）

## ✨ 功能特性

✅ 完整的 OpenAPI 3.0 规范
✅ 交互式 API 文档
✅ 在线测试功能
✅ 请求/响应示例
✅ 参数验证说明
✅ 错误响应文档
