# 部署指南

本文档提供员工管理系统的打包和部署方案。

## 目录

1. [本地构建部署](#本地构建部署)
2. [Docker 部署](#docker-部署)
3. [生产环境部署](#生产环境部署)
4. [Nginx 配置](#nginx-配置)

---

## 本地构建部署

### 前端打包

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建产物在 frontend/dist 目录
```

构建后的文件：
- `dist/index.html` - 入口 HTML
- `dist/assets/` - JS、CSS、图片等静态资源

### 后端准备

```bash
# 进入后端目录
cd server

# 安装依赖（仅生产依赖）
npm install --production

# 初始化数据库（如需要）
npm run seed
```

### 启动服务

```bash
# 启动后端服务
cd server
npm start

# 后端运行在 http://localhost:3001
```

前端静态文件需要通过 Web 服务器（如 Nginx）提供服务。

---

## Docker 部署

### 方式一：单容器部署（推荐用于开发/测试）

使用 Docker Compose 一键启动前后端服务。

```bash
# 在项目根目录执行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问地址：
- 前端：http://localhost:8080
- 后端 API：http://localhost:3001
- Swagger 文档：http://localhost:3001/api-docs

### 方式二：分离部署

分别构建前后端镜像，适合生产环境。

```bash
# 构建后端镜像
docker build -t employee-system-backend -f server/Dockerfile .

# 构建前端镜像
docker build -t employee-system-frontend -f frontend/Dockerfile .

# 运行后端
docker run -d -p 3001:3001 \
  -v $(pwd)/server/data:/app/data \
  --name backend \
  employee-system-backend

# 运行前端
docker run -d -p 8080:80 \
  --name frontend \
  employee-system-frontend
```

---

## 生产环境部署

### 服务器要求

- Node.js 18+
- Nginx
- PM2（进程管理）
- 至少 1GB RAM
- 至少 10GB 磁盘空间

### 部署步骤

#### 1. 上传代码到服务器

```bash
# 使用 git 克隆
git clone <your-repo-url>
cd employee-management-system

# 或使用 scp 上传
scp -r ./employee-management-system user@server:/var/www/
```

#### 2. 构建前端

```bash
cd frontend
npm install
npm run build

# 将 dist 目录复制到 Nginx 目录
sudo cp -r dist /var/www/employee-system-frontend
```

#### 3. 部署后端

```bash
cd server

# 安装依赖
npm install --production

# 安装 PM2
npm install -g pm2

# 使用 PM2 启动
pm2 start app.js --name employee-system-api

# 设置开机自启
pm2 startup
pm2 save
```

#### 4. 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/employee-system
```

参考下面的 [Nginx 配置](#nginx-配置) 章节。

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/employee-system /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## Nginx 配置

### 基础配置（HTTP）

```nginx
server {
  listen 80;
  server_name your-domain.com;

  # 前端静态文件
  location / {
    root /var/www/employee-system-frontend;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  # 后端 API 代理
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Gzip 压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### HTTPS 配置（推荐生产环境）

```nginx
server {
  listen 80;
  server_name your-domain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name your-domain.com;

  ssl_certificate /etc/ssl/certs/your-cert.crt;
  ssl_certificate_key /etc/ssl/private/your-key.key;

  # 前端静态文件
  location / {
    root /var/www/employee-system-frontend;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  # 后端 API 代理
  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # 静态资源缓存
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    root /var/www/employee-system-frontend;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Gzip 压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## 环境变量配置

### 后端环境变量

创建 `server/.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 数据库配置
DB_PATH=./data/database.sqlite

# CORS 配置
CORS_ORIGIN=https://your-domain.com
```

### 前端环境变量

创建 `frontend/.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-domain.com/api
```

---

## 常见问题

### 1. 前端路由 404 问题

确保 Nginx 配置了 `try_files $uri $uri/ /index.html`，这样所有路由都会回退到 index.html。

### 2. API 跨域问题

检查后端 CORS 配置，确保允许前端域名访问。

### 3. 静态资源加载失败

检查 Vite 构建配置中的 `base` 路径是否正确。

### 4. PM2 进程崩溃

查看日志：`pm2 logs employee-system-api`

### 5. 数据库文件权限问题

确保 Node.js 进程有权限读写数据库文件：

```bash
chmod 755 server/data
chmod 644 server/data/database.sqlite
```

---

## 性能优化建议

1. **启用 Gzip 压缩**：减少传输大小
2. **配置静态资源缓存**：减少重复请求
3. **使用 CDN**：加速静态资源加载
4. **数据库索引**：优化查询性能
5. **启用 HTTP/2**：提升并发性能
6. **使用 PM2 集群模式**：充分利用多核 CPU

```bash
# PM2 集群模式
pm2 start app.js -i max --name employee-system-api
```

---

## 监控和日志

### PM2 监控

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs

# 查看监控面板
pm2 monit
```

### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

---

## 备份策略

### 数据库备份

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp server/data/database.sqlite backups/database_$DATE.sqlite

# 保留最近 7 天的备份
find backups/ -name "database_*.sqlite" -mtime +7 -delete
```

### 定时备份（Crontab）

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup-script.sh
```
