# 二级目录部署配置

本文档说明如何将前端部署到二级目录 `/admSystem`。

## 配置说明

### 1. Vite 配置

`frontend/vite.config.ts` 已配置 `base: '/admSystem/'`，这会：
- 自动为所有资源路径添加 `/admSystem/` 前缀
- 确保路由和静态资源正确加载

### 2. Nginx 配置

#### 生产环境 Nginx 配置

创建或修改 `/etc/nginx/sites-available/employee-system`：

```nginx
server {
  listen 80;
  server_name your-domain.com;

  # 二级目录部署 /admSystem
  location /admSystem {
    alias /var/www/employee-system/frontend;
    index index.html;
    try_files $uri $uri/ /admSystem/index.html;
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

  # 静态资源缓存（注意路径匹配）
  location ~* ^/admSystem/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    alias /var/www/employee-system/frontend;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Gzip 压缩
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### HTTPS 配置

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

  # 二级目录部署 /admSystem
  location /admSystem {
    alias /var/www/employee-system/frontend;
    index index.html;
    try_files $uri $uri/ /admSystem/index.html;
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
  location ~* ^/admSystem/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    alias /var/www/employee-system/frontend;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. Docker 部署配置

`frontend/nginx.conf` 已更新为支持二级目录部署。

使用 Docker Compose 部署时，访问地址为：
- 前端：http://localhost:8080/admSystem
- 后端 API：http://localhost:3001/api

## 部署步骤

### 方式一：Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 访问地址
# http://localhost:8080/admSystem
```

### 方式二：生产环境部署

```bash
# 1. 构建前端
cd frontend
npm install
npm run build

# 2. 部署到服务器
sudo cp -r dist/* /var/www/employee-system/frontend/

# 3. 配置 Nginx（使用上面的配置）
sudo nano /etc/nginx/sites-available/employee-system

# 4. 启用并重启 Nginx
sudo ln -s /etc/nginx/sites-available/employee-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 5. 访问地址
# http://your-domain.com/admSystem
```

## 重要注意事项

### 1. 路由配置

Vue Router 会自动处理二级目录路径，无需额外配置。所有路由都会基于 `/admSystem/` 前缀。

例如：
- 登录页：`/admSystem/login`
- 员工列表：`/admSystem/employees`
- 员工详情：`/admSystem/employees/1`

### 2. API 请求

API 请求路径保持不变，仍然使用 `/api` 前缀：
- `POST /api/auth/login`
- `GET /api/employees`

Nginx 会将 `/api` 请求代理到后端服务。

### 3. 静态资源

所有静态资源（JS、CSS、图片）会自动添加 `/admSystem/` 前缀，无需手动修改。

### 4. 本地开发

本地开发时不受影响，仍然使用：
```bash
cd frontend
npm run dev
# 访问 http://localhost:5001
```

构建时会自动应用 `/admSystem/` 前缀。

## 验证部署

部署完成后，检查以下内容：

1. **访问首页**：`http://your-domain.com/admSystem`
2. **检查静态资源**：打开浏览器开发者工具，确认 JS/CSS 文件正确加载
3. **测试路由**：点击导航链接，确认路由跳转正常
4. **测试 API**：登录系统，确认 API 请求正常

## 常见问题

### 1. 页面空白或 404

检查 Nginx 配置中的 `alias` 路径是否正确，以及 `try_files` 是否配置为 `/admSystem/index.html`。

### 2. 静态资源 404

确认 Vite 配置中的 `base` 设置为 `/admSystem/`，并重新构建前端。

### 3. 路由刷新后 404

确保 Nginx 配置了 `try_files $uri $uri/ /admSystem/index.html`。

### 4. API 请求失败

检查 Nginx 的 `/api` location 配置，确认代理到正确的后端地址。

## 切换回根目录部署

如果需要切换回根目录部署：

1. 修改 `frontend/vite.config.ts`，将 `base: '/admSystem/'` 改为 `base: '/'`
2. 修改 Nginx 配置，将 `location /admSystem` 改为 `location /`
3. 重新构建前端：`npm run build`
4. 重新部署
