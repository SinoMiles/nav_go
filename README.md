# NavGo

NavGo 是一个面向内容创作者与团队的导航管理平台，支持前台访问与后台管理两套界面。通过灵活的分类体系和可配置的主题样式，帮助你快速搭建精致的「网址导航」站点。

## 主要特性
- **分级分类**：支持一级/二级分类，呈现清晰的资源结构。
- **搜索增强**：整合站内检索与多搜索引擎切换，一键跳转外部搜素。
- **主题定制**：内置多套主题，可在后台一键切换并调整主色、背景等参数。
- **后台管理**：提供分类、链接、主题、系统配置、搜索引擎等模块的可视化管理界面。
- **用户友好**：前台支持收藏、评分、提交等互动组件（可按需启用）。

## 快速开始

### 环境准备
- Node.js 18+
- npm / pnpm / yarn（本项目默认使用 npm）
- MongoDB 数据库实例

### 本地运行
```bash
git clone https://github.com/SinoMiles/nav_go.git
cd NavGo
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 MongoDB、JWT 等信息

npm run dev
```
默认后台入口为 `http://localhost:3000/admin`，初始管理员账号可在 `scripts/init-db.ts` 中配置并执行。

### 常用脚本
```bash
npm run dev    # 启动本地开发服务
npm run build  # 生产构建
npm run start  # 启动生产服务
npm run lint   # 代码规范检查
```

## 目录结构
```
NavGo/
├── app/                 # Next.js App Router 页面与 API
├── models/              # Mongoose 数据模型
├── themes/              # 自定义主题
├── scripts/             # 初始化/迁移脚本
├── public/              # 静态资源
└── ...
```

## 环境变量

`.env.local` 中常用变量示例：

| 变量名           | 说明                             |
|------------------|----------------------------------|
| `MONGODB_URI`    | MongoDB 连接串                   |
| `JWT_SECRET`     | 用于签发后台登陆 Token 的密钥   |
| `NEXTAUTH_SECRET`| NextAuth 会话密钥（如启用认证） |
| `SITE_URL`       | 部署后站点访问地址              |

## 部署建议
- 生产环境建议通过 `npm run build && npm run start` 部署或使用容器化（已内置 `docker-compose.yml` 示例）。
- 确保在服务器上配置正确的环境变量，并启用 HTTPS 以保护账号信息。

## License

本项目基于 MIT License 发布，可自由用于个人或商业项目。欢迎提 issue 或提交 PR 改进 NavGo。
