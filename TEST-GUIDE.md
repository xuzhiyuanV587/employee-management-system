# 二级目录部署测试指南

## 已完成的修改

✅ **Vite 配置** - 添加了 `base: '/admSystem/'`
✅ **Vue Router 配置** - 使用 `import.meta.env.BASE_URL` 作为 base path
✅ **Nginx 配置** - 更新为支持 `/admSystem` 路径
✅ **前端构建** - 已成功构建，所有资源路径正确

## 快速测试方法

### 方法一：使用测试服务器（推荐）

```bash
# 1. 安装 express（如果还没安装）
npm install express

# 2. 启动测试服务器
node test-server.js

# 3. 访问地址
# http://localhost:8080/admSystem
```

### 方法二：使用 Docker

```bash
# 1. 构建并启动
./deploy-docker.sh

# 2. 访问地址
# http://localhost:8080/admSystem
```

### 方法三：使用 Python 简单服务器

```bash
# 进入构建目录
cd frontend/dist

# 启动服务器（Python 3）
python3 -m http.server 8080

# 访问地址
# http://localhost:8080/admSystem/
# 注意：这种方式不支持前端路由，刷新会 404
```

### 方法四：使用 Nginx（生产环境）

```bash
# 1. 复制构建文件
sudo mkdir -p /var/www/employee-system/frontend
sudo cp -r frontend/dist/* /var/www/employee-system/frontend/

# 2. 配置 Nginx（参考 docs/subdirectory-deployment.md）
sudo nano /etc/nginx/sites-available/employee-system

# 3. 启用并重启
sudo ln -s /etc/nginx/sites-available/employee-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 验证清单

访问 `http://localhost:8080/admSystem` 后，检查以下内容：

- [ ] 页面正常显示（不是空白页）
- [ ] 浏览器控制台没有 404 错误
- [ ] 静态资源（JS、CSS）正确加载
- [ ] 点击导航链接，路由正常跳转
- [ ] 刷新页面后仍然正常显示
- [ ] 登录功能正常（需要后端服务运行）

## 常见问题排查

### 1. 页面空白

**检查浏览器控制台**：
- 如果看到 404 错误，说明资源路径不对
- 检查 Vite 配置中的 `base` 是否为 `/admSystem/`
- 重新构建：`cd frontend && npm run build`

### 2. 路由刷新后 404

**原因**：服务器没有正确配置 SPA 路由回退

**解决方案**：
- 确保 Nginx 配置了 `try_files $uri $uri/ /admSystem/index.html`
- 或使用 test-server.js，它已经配置了路由回退

### 3. API 请求失败

**原因**：后端服务未启动或 CORS 配置问题

**解决方案**：
```bash
# 启动后端服务
cd server
npm install
npm run dev
```

### 4. 静态资源 404

**检查**：
- 打开浏览器开发者工具 → Network 标签
- 查看失败的资源请求路径
- 确认路径是否包含 `/admSystem/` 前缀

**解决方案**：
- 确认 `frontend/vite.config.ts` 中 `base: '/admSystem/'`
- 重新构建前端

## 构建产物检查

构建后的 `frontend/dist/index.html` 应该包含：

```html
<link rel="icon" type="image/svg+xml" href="/admSystem/favicon.svg" />
<script type="module" crossorigin src="/admSystem/assets/index-xxx.js"></script>
<link rel="stylesheet" crossorigin href="/admSystem/assets/index-xxx.css">
```

所有资源路径都应该有 `/admSystem/` 前缀。

## 后端服务配置

如果需要测试完整功能（登录、API 调用），需要启动后端服务：

```bash
# 终端 1：启动后端
cd server
npm run dev

# 终端 2：启动前端测试服务器
node test-server.js
```

访问：http://localhost:8080/admSystem

## 生产环境部署

完整的生产环境部署步骤请参考：
- `docs/subdirectory-deployment.md` - 二级目录部署详细说明
- `docs/deployment.md` - 通用部署指南

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 检查 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`
3. 检查后端日志：`pm2 logs` 或查看终端输出
4. 参考 `docs/subdirectory-deployment.md` 中的常见问题章节
