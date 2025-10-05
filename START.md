# NavGo - 快速开始

## 安装依赖

```bash
npm install
```

## 初始化数据库

```bash
node scripts/init-simple.js
```

这将创建：
- ✅ 默认管理员账号
- ✅ 默认主题和现代主题
- ✅ 系统设置

## 启动项目

```bash
npm run dev
```

访问: http://localhost:3000

## 登录管理后台

- 登录地址: http://localhost:3000/admin/login
- 邮箱: **admin@NavGo.com**
- 密码: **admin**

## 使用步骤

1. 登录后台
2. 在"分类管理"中创建分类
3. 在"链接管理"中添加链接
4. 在"主题管理"中切换主题
5. 访问前台查看效果

## Docker部署

```bash
docker-compose up -d
```

## 功能特性

- ✅ 多主题切换（默认主题 + 现代主题）
- ✅ 主题预览功能
- ✅ 分类和链接管理
- ✅ 用户认证系统
- ✅ SSR服务端渲染
- ✅ 完整的后台管理

## 技术栈

- Next.js 15
- TypeScript
- MongoDB
- Tailwind CSS
- JWT认证
