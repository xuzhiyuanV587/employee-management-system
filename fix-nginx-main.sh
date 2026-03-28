#!/bin/bash

# 修复 Nginx 主配置文件

set -e

echo "========================================="
echo "修复 Nginx 主配置文件"
echo "========================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

echo -e "\n${YELLOW}检查当前 nginx.conf 第一行...${NC}"
head -1 /etc/nginx/nginx.conf

if head -1 /etc/nginx/nginx.conf | grep -q "^server"; then
  echo -e "${RED}✗ 检测到 nginx.conf 被错误覆盖！${NC}"
  echo -e "${YELLOW}正在备份并修复...${NC}"

  # 备份错误的配置
  cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.broken.$(date +%Y%m%d_%H%M%S)

  # 创建标准的 nginx.conf
  cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # 包含其他配置文件
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

  echo -e "${GREEN}✓ nginx.conf 已修复${NC}"
else
  echo -e "${GREEN}✓ nginx.conf 结构正常${NC}"
fi

echo -e "\n${YELLOW}测试配置...${NC}"
nginx -t

echo -e "\n${GREEN}修复完成！${NC}"
