#!/bin/bash

# Nginx 配置脚本 - 用于配置员工管理系统的 Nginx 反向代理

set -e

echo "========================================="
echo "员工管理系统 - Nginx 配置"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
DEPLOY_DIR="/root/var/www/code"
NGINX_CONF="/etc/nginx/sites-available/employee-system"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
  echo -e "${RED}Nginx 未安装，请先安装 Nginx${NC}"
  exit 1
fi

# 配置 Nginx
echo -e "\n${YELLOW}配置 Nginx...${NC}"
if [ ! -f "$NGINX_CONF" ]; then
  cat > $NGINX_CONF << 'EOF'
server {
  listen 80;
  server_name _;

  # 二级目录部署 /admSystem
  location /admSystem {
    alias /root/var/www/code/frontend;
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
    alias /root/var/www/code/frontend;
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
  echo -e "${YELLOW}Nginx 配置已存在，是否覆盖？(y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    cat > $NGINX_CONF << 'EOF'
server {
  listen 80;
  server_name _;

  # 二级目录部署 /admSystem
  location /admSystem {
    alias /root/var/www/code/frontend;
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
    alias /root/var/www/code/frontend;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF
    echo -e "${GREEN}✓ Nginx 配置已更新${NC}"
  else
    echo -e "${YELLOW}跳过配置更新${NC}"
  fi
fi

# 测试并重启 Nginx
echo -e "\n${YELLOW}测试 Nginx 配置...${NC}"
nginx -t

echo -e "\n${YELLOW}重启 Nginx...${NC}"
systemctl restart nginx
echo -e "${GREEN}✓ Nginx 已重启${NC}"

# 完成
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}Nginx 配置完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n访问地址："
echo -e "  前端: http://your-server-ip/admSystem"
echo -e "  后端 API: http://your-server-ip/api"
echo -e "  Swagger 文档: http://your-server-ip/api-docs"
