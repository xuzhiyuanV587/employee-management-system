#!/bin/bash

# 部署脚本 - 用于生产环境部署

set -e

echo "========================================="
echo "员工管理系统 - 部署脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
FRONTEND_DIR="frontend"
BACKEND_DIR="server"
DEPLOY_DIR="/var/www/employee-system"
NGINX_CONF="/etc/nginx/sites-available/employee-system"
PM2_APP_NAME="employee-system-api"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 步骤 1: 构建前端
echo -e "\n${YELLOW}[1/6] 构建前端...${NC}"
cd $FRONTEND_DIR
npm install
npm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"

# 步骤 2: 部署前端静态文件
echo -e "\n${YELLOW}[2/6] 部署前端静态文件...${NC}"
mkdir -p $DEPLOY_DIR/frontend
cp -r dist/* $DEPLOY_DIR/frontend/
echo -e "${GREEN}✓ 前端文件已复制到 $DEPLOY_DIR/frontend${NC}"

# 步骤 3: 部署后端
echo -e "\n${YELLOW}[3/6] 部署后端...${NC}"
cd ../$BACKEND_DIR
npm install --production
mkdir -p $DEPLOY_DIR/backend
cp -r ./* $DEPLOY_DIR/backend/
echo -e "${GREEN}✓ 后端文件已复制到 $DEPLOY_DIR/backend${NC}"

# 步骤 4: 配置环境变量
echo -e "\n${YELLOW}[4/6] 配置环境变量...${NC}"
if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
  cat > $DEPLOY_DIR/backend/.env << EOF
PORT=3001
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
DB_PATH=./data/database.sqlite
EOF
  echo -e "${GREEN}✓ 环境变量文件已创建${NC}"
else
  echo -e "${YELLOW}环境变量文件已存在，跳过${NC}"
fi

# 步骤 5: 启动后端服务
echo -e "\n${YELLOW}[5/6] 启动后端服务...${NC}"
cd $DEPLOY_DIR/backend

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 未安装，正在安装...${NC}"
  npm install -g pm2
fi

# 停止旧进程（如果存在）
pm2 stop $PM2_APP_NAME 2>/dev/null || true
pm2 delete $PM2_APP_NAME 2>/dev/null || true

# 启动新进程
pm2 start app.js --name $PM2_APP_NAME
pm2 save
echo -e "${GREEN}✓ 后端服务已启动${NC}"

# 步骤 6: 配置 Nginx
echo -e "\n${YELLOW}[6/6] 配置 Nginx...${NC}"
if [ ! -f "$NGINX_CONF" ]; then
  cat > $NGINX_CONF << 'EOF'
server {
  listen 80;
  server_name _;

  # 二级目录部署 /admSystem
  location /admSystem {
    alias /var/www/employee-system/frontend;
    index index.html;
    try_files $uri $uri/ /admSystem/index.html;
  }

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

  location ~* ^/admSystem/.*\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    alias /var/www/employee-system/frontend;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

  ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
  echo -e "${GREEN}✓ Nginx 配置已创建${NC}"
else
  echo -e "${YELLOW}Nginx 配置已存在，跳过${NC}"
fi

# 测试并重启 Nginx
nginx -t
systemctl restart nginx
echo -e "${GREEN}✓ Nginx 已重启${NC}"

# 完成
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n访问地址："
echo -e "  前端: http://your-server-ip/admSystem"
echo -e "  后端 API: http://your-server-ip/api"
echo -e "  Swagger 文档: http://your-server-ip/api-docs"
echo -e "\n查看后端日志: ${YELLOW}pm2 logs $PM2_APP_NAME${NC}"
echo -e "查看进程状态: ${YELLOW}pm2 status${NC}"
echo -e "重启后端: ${YELLOW}pm2 restart $PM2_APP_NAME${NC}"
