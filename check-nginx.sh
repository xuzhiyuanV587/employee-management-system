#!/bin/bash

# Nginx 配置诊断脚本

echo "========================================="
echo "Nginx 配置诊断"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "\n${YELLOW}1. 检查 Nginx 是否安装${NC}"
if command -v nginx &> /dev/null; then
  echo -e "${GREEN}✓ Nginx 已安装${NC}"
  nginx -v
else
  echo -e "${RED}✗ Nginx 未安装${NC}"
  exit 1
fi

echo -e "\n${YELLOW}2. 检查 Nginx 主配置文件${NC}"
if [ -f /etc/nginx/nginx.conf ]; then
  echo -e "${GREEN}✓ /etc/nginx/nginx.conf 存在${NC}"
  echo -e "\n主配置文件前 20 行："
  head -20 /etc/nginx/nginx.conf
else
  echo -e "${RED}✗ /etc/nginx/nginx.conf 不存在${NC}"
fi

echo -e "\n${YELLOW}3. 检查 http 块和 include 指令${NC}"
if grep -q "http {" /etc/nginx/nginx.conf; then
  echo -e "${GREEN}✓ 找到 http 块${NC}"
else
  echo -e "${RED}✗ 未找到 http 块${NC}"
fi

if grep -q "include.*sites-enabled" /etc/nginx/nginx.conf; then
  echo -e "${GREEN}✓ 找到 sites-enabled include 指令${NC}"
  grep "include.*sites-enabled" /etc/nginx/nginx.conf
else
  echo -e "${YELLOW}⚠ 未找到 sites-enabled include 指令${NC}"
fi

echo -e "\n${YELLOW}4. 检查目录结构${NC}"
for dir in /etc/nginx/sites-available /etc/nginx/sites-enabled /etc/nginx/conf.d; do
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✓ $dir 存在${NC}"
    echo "  文件列表:"
    ls -la "$dir" 2>/dev/null | head -10
  else
    echo -e "${YELLOW}⚠ $dir 不存在${NC}"
  fi
done

echo -e "\n${YELLOW}5. 检查员工系统配置文件${NC}"
if [ -f /etc/nginx/sites-available/employee-system ]; then
  echo -e "${GREEN}✓ /etc/nginx/sites-available/employee-system 存在${NC}"
  echo -e "\n配置文件内容："
  cat /etc/nginx/sites-available/employee-system
else
  echo -e "${YELLOW}⚠ /etc/nginx/sites-available/employee-system 不存在${NC}"
fi

if [ -L /etc/nginx/sites-enabled/employee-system ]; then
  echo -e "${GREEN}✓ /etc/nginx/sites-enabled/employee-system 软链接存在${NC}"
  ls -l /etc/nginx/sites-enabled/employee-system
else
  echo -e "${YELLOW}⚠ /etc/nginx/sites-enabled/employee-system 软链接不存在${NC}"
fi

echo -e "\n${YELLOW}6. 测试 Nginx 配置${NC}"
nginx -t 2>&1

echo -e "\n${YELLOW}7. 检查 Nginx 进程状态${NC}"
systemctl status nginx --no-pager -l

echo -e "\n========================================="
echo -e "诊断完成"
echo -e "========================================="
