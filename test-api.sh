#!/bin/bash

# API 测试脚本
BASE_URL="http://localhost:3001/api"

echo "=== 员工管理系统 API 测试 ==="
echo ""

# 测试健康检查
echo "1. 测试健康检查..."
curl -s "$BASE_URL/health" | jq . || echo "❌ 健康检查失败"
echo ""

# 测试获取员工列表
echo "2. 测试获取员工列表..."
curl -s "$BASE_URL/employees?page=1&pageSize=10" | jq . || echo "❌ 获取员工列表失败"
echo ""

# 测试获取统计数据
echo "3. 测试获取统计数据..."
curl -s "$BASE_URL/employees/stats" | jq . || echo "❌ 获取统计数据失败"
echo ""

# 测试创建员工
echo "4. 测试创建员工..."
curl -s -X POST "$BASE_URL/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试员工",
    "email": "test@example.com",
    "phone": "13800138000",
    "department": "技术部",
    "position": "工程师",
    "hireDate": "2024-01-01",
    "salary": 15000,
    "status": "active"
  }' | jq . || echo "❌ 创建员工失败"
echo ""

echo "=== 测试完成 ==="
