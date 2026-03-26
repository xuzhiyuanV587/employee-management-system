# Swagger API 文档已添加

## 访问 Swagger 文档

启动后端服务后，访问以下地址查看完整的 API 文档：

```
http://localhost:3001/api-docs
```

## 已添加的功能

✅ **Swagger UI 界面** - 可视化 API 文档
✅ **完整的 API 端点文档** - 包括所有员工和部门管理接口
✅ **请求/响应示例** - 每个端点都有详细的参数和响应说明
✅ **在线测试** - 可直接在 Swagger UI 中测试 API

## 文件变更

1. **新增文件**：`server/config/swagger.js` - Swagger 配置文件
2. **修改文件**：
   - `server/app.js` - 集成 Swagger UI
   - `server/routes/employeeRoutes.js` - 添加 Swagger 注释
   - `server/routes/departmentRoutes.js` - 添加 Swagger 注释

## 依赖包

已安装：
- `swagger-ui-express` - Swagger UI 中间件
- `swagger-jsdoc` - JSDoc 转 Swagger 规范

## 快速开始

```bash
# 启动后端
cd server
npm run dev

# 在浏览器中打开
http://localhost:3001/api-docs
```

现在你可以在 Swagger UI 中看到所有 API 端点的详细文档，并可以直接测试各个接口！
