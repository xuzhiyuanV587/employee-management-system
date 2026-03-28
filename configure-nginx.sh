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

# 检查 Nginx 主配置文件
echo -e "\n${YELLOW}检查 Nginx 主配置...${NC}"
if ! grep -q "include.*sites-enabled" /etc/nginx/nginx.conf 2>/dev/null; then
  echo -e "${YELLOW}警告: /etc/nginx/nginx.conf 可能未包含 sites-enabled 目录${NC}"
  echo -e "${YELLOW}请确保 nginx.conf 的 http 块中有以下配置:${NC}"
  echo -e "  include /etc/nginx/sites-enabled/*;"
fi

# 确保目录存在
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# 配置 Nginx
echo -e "\n${YELLOW}配置 Nginx...${NC}"

# 备份现有配置
if [ -f "$NGINX_CONF" ]; then
  cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
  echo -e "${GREEN}✓ 已备份现有配置${NC}"
fi

# 写入配置
cat > $NGINX_CONF << 'EOF'
server {
  listen 80;
  server_name _;

  # 二级目录部署 /admSystem
  location /admSystem/ {
    alias /root/var/www/code/frontend/;
    index index.html;
    try_files $uri $uri/ /admSystem/index.html;
  }

  # 处理 /admSystem 不带斜杠的情况
  location = /admSystem {
    return 301 /admSystem/;
  }

  # API 代理
  location /api/ {
    proxy_pass http://localhost:3001/api/;
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
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
EOF

# 创建软链接
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/employee-system
echo -e "${GREEN}✓ Nginx 配置已创建/更新${NC}"

# 测试并重启 Nginx
echo -e "\n${YELLOW}测试 Nginx 配置...${NC}"
if nginx -t 2>&1 | tee /tmp/nginx-test.log; then
  echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"

  echo -e "\n${YELLOW}重启 Nginx...${NC}"
  systemctl restart nginx
  echo -e "${GREEN}✓ Nginx 已重启${NC}"
else
  echo -e "${RED}✗ Nginx 配置测试失败${NC}"
  echo -e "${YELLOW}错误信息：${NC}"
  cat /tmp/nginx-test.log
  echo -e "\n${YELLOW}提示：请检查以下内容${NC}"
  echo -e "1. 确认 /etc/nginx/nginx.conf 包含 http 块"
  echo -e "2. 确认 http 块中有: include /etc/nginx/sites-enabled/*;"
  echo -e "3. 检查配置文件: cat $NGINX_CONF"
  exit 1
fi

# 完成
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}Nginx 配置完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\n访问地址："
echo -e "  前端: http://your-server-ip/admSystem"
echo -e "  后端 API: http://your-server-ip/api"
echo -e "  Swagger 文档: http://your-server-ip/api-docs"
