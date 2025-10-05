#!/bin/bash

# NavCraft 初始化脚本
# 用于初始化数据库和默认主题

echo "🚀 NavCraft 初始化脚本"
echo "======================="

# 等待MongoDB连接
echo "⏳ 等待MongoDB连接..."
sleep 3

# 安装默认主题
echo "📦 安装默认主题..."

curl -X POST http://localhost:3000/api/themes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "default",
    "title": "默认主题",
    "description": "简洁优雅的默认导航主题",
    "version": "1.0.0",
    "author": "NavCraft"
  }'

echo ""

curl -X POST http://localhost:3000/api/themes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "modern",
    "title": "现代主题",
    "description": "现代简约风格的导航主题",
    "version": "1.0.0",
    "author": "NavCraft"
  }'

echo ""
echo "✅ 默认主题安装完成"

# 激活默认主题
echo "🎨 激活默认主题..."

curl -X POST http://localhost:3000/api/themes/activate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "themeName": "default"
  }'

echo ""
echo "✅ 初始化完成!"
echo ""
echo "📝 下一步:"
echo "1. 访问 http://localhost:3000/admin/register 注册管理员账号"
echo "2. 登录后在后台添加分类和链接"
echo "3. 在主题管理中切换主题"
echo ""
