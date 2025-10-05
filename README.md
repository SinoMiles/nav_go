# NavCraft - Next.js 导航站系统

基于 Next.js 的可切换主题导航系统，支持后台管理、主题切换、分类管理等功能。

## 功能特性

- ✅ **多主题支持**: 内置两个精美主题(default、modern),支持动态切换
- ✅ **主题预览**: 生成临时预览令牌,无需激活即可预览主题效果
- ✅ **后台管理**: 完整的管理后台,支持主题、分类、链接管理
- ✅ **用户系统**: JWT认证,支持管理员和普通用户角色
- ✅ **分类管理**: 灵活的分类系统,支持排序和启用/禁用
- ✅ **链接管理**: 完整的链接CRUD,支持图标、标签、描述等
- ✅ **SSR渲染**: 服务端渲染,SEO友好
- ✅ **MongoDB数据库**: 使用Mongoose ORM
- ✅ **Docker部署**: 容器化部署,开箱即用

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **数据库**: MongoDB
- **ORM**: Mongoose
- **认证**: JWT + bcrypt
- **样式**: Tailwind CSS
- **部署**: Docker

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd NavSite
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local` 文件并修改数据库连接信息:

```env
MONGODB_URI=mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft?authSource=admin
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-change-this-in-production
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看前台页面
访问 http://localhost:3000/admin/register 注册管理员账号

### 5. 初始化数据

1. 注册账号后登录管理后台
2. 在"分类管理"中创建分类
3. 在"链接管理"中添加链接
4. 在"主题管理"中切换主题

## Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 使用 Dockerfile

```bash
# 构建镜像
docker build -t navcraft .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  --name navcraft \
  navcraft
```

## 项目结构

```
NavSite/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── auth/         # 认证接口
│   │   ├── categories/   # 分类接口
│   │   ├── links/        # 链接接口
│   │   ├── themes/       # 主题接口
│   │   ├── settings/     # 设置接口
│   │   └── preview/      # 预览接口
│   ├── admin/            # 管理后台
│   │   ├── categories/   # 分类管理
│   │   ├── links/        # 链接管理
│   │   ├── themes/       # 主题管理
│   │   ├── settings/     # 设置管理
│   │   ├── login/        # 登录页
│   │   └── register/     # 注册页
│   ├── preview/          # 主题预览
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── lib/                   # 工具库
│   ├── mongodb.ts        # 数据库连接
│   ├── auth.ts           # 认证工具
│   ├── middleware.ts     # 中间件
│   └── theme.ts          # 主题工具
├── models/               # Mongoose模型
│   ├── User.ts
│   ├── Category.ts
│   ├── LinkItem.ts
│   ├── Theme.ts
│   ├── Settings.ts
│   └── PreviewToken.ts
├── themes/               # 主题目录
│   ├── default/         # 默认主题
│   │   ├── index.tsx
│   │   └── settings.json
│   └── modern/          # 现代主题
│       ├── index.tsx
│       └── settings.json
├── Dockerfile           # Docker配置
├── docker-compose.yml   # Docker Compose配置
└── package.json         # 依赖配置
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类 (需要管理员权限)
- `PUT /api/categories/:id` - 更新分类 (需要管理员权限)
- `DELETE /api/categories/:id` - 删除分类 (需要管理员权限)

### 链接接口
- `GET /api/links` - 获取链接列表
- `POST /api/links` - 创建链接 (需要管理员权限)
- `PUT /api/links/:id` - 更新链接 (需要管理员权限)
- `DELETE /api/links/:id` - 删除链接 (需要管理员权限)

### 主题接口
- `GET /api/themes` - 获取主题列表
- `POST /api/themes` - 安装主题 (需要管理员权限)
- `POST /api/themes/activate` - 激活主题 (需要管理员权限)
- `PUT /api/themes/config` - 更新主题配置 (需要管理员权限)

### 预览接口
- `POST /api/preview` - 生成预览令牌 (需要管理员权限)
- `GET /api/preview` - 验证预览令牌

## 主题开发

### 创建新主题

1. 在 `themes/` 目录创建新文件夹,例如 `themes/mytheme/`

2. 创建 `settings.json`:

```json
{
  "name": "mytheme",
  "title": "我的主题",
  "description": "主题描述",
  "version": "1.0.0",
  "author": "作者名",
  "configSchema": {
    "primaryColor": {
      "type": "color",
      "label": "主色调",
      "default": "#3b82f6"
    }
  }
}
```

3. 创建 `index.tsx`:

```tsx
import React from 'react';
import { ThemeProps } from '@/lib/types/theme';

export default function MyTheme({ children, categories, links, config, siteName }: ThemeProps) {
  return (
    <div>
      {/* 主题布局代码 */}
    </div>
  );
}
```

4. 在后台"主题管理"中安装并激活主题

## 生产部署建议

1. **环境变量**: 修改生产环境的密钥和数据库连接
2. **HTTPS**: 使用反向代理(Nginx)配置HTTPS
3. **性能优化**: 启用CDN加速静态资源
4. **数据备份**: 定期备份MongoDB数据库
5. **日志监控**: 配置日志收集和监控系统

## 许可证

MIT License

## 作者

NavCraft Team

## 贡献

欢迎提交 Issue 和 Pull Request!
