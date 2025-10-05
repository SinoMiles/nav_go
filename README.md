<div align="center">

# NavGo 导航系统 · NavGo Navigation Hub

**高效、优雅、可定制的现代化网址导航解决方案 | A polished, configurable navigation experience**

![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%2FServer-47a248?logo=mongodb&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-blue.svg)

<p align="center">
  <img src="img/priview.png" alt="NavGo 预览图 / NavGo Preview" width="900" />
</p>

</div>

## 📌 概览 | Overview

- **中文**：NavGo 是一款面向团队与创作者的导航管理平台，内置多套主题、丰富的后台功能与可扩展的搜索引擎配置，帮助你快速打造风格统一、层次清晰的导航站。
- **English**: NavGo empowers teams and curators to launch beautiful navigation portals with theming, structured categorisation, powerful search routing, and a refined admin console.

---

## ✨ 项目亮点 | Key Highlights

- 🎯 **分级目录 / Hierarchical Categories**：支持一、二级分类，自动聚合展示，提升内容可达性。
- 🔍 **智能搜索 / Smart Search**：站内检索与自定义搜索引擎切换无缝衔接，支持外部跳转。
- 🎨 **主题定制 / Theme Customisation**：多主题模板配色可配置，轻松匹配品牌视觉。
- 🛠️ **后台管理 / Admin Console**：涵盖分类、链接、主题、搜索引擎、系统设置等模块。
- 🌐 **国际化文案 / Refined Copywriting**：前后台统一中文体验，并保留英文文档说明。

---

## 🚀 快速上手 | Getting Started

### 1. 环境准备 | Prerequisites

- Node.js ≥ 18
- npm / pnpm / yarn （默认使用 npm）
- MongoDB 实例（本地或云端）

### 2. 克隆与安装 | Clone & Install

```bash
git clone https://github.com/SinoMiles/nav_go.git
cd nav_go
npm install
```

### 3. 配置环境 | Configure Environment

```bash
cp .env.example .env.local   # 如果没有，可手动创建
# 编辑 .env.local 填写 MongoDB、JWT 等信息
```

### 4. 初始化数据 | Seed Initial Data

```bash
npm run init-db    # 创建默认主题、分类、链接、系统设置
# 可选：npm run seed-data  # 注入更多示例数据
```

### 5. 启动项目 | Run the App

```bash
npm run dev
# Frontend: http://localhost:3000
# Admin Console: http://localhost:3000/admin
```

默认管理员账号、初始密码等可在 `scripts/init-db.ts` 中调整后重新执行初始化脚本。

---

## 🗂️ 目录结构 | Project Structure

```text
nav_go/
├─ app/                    # Next.js App Router 页面与 API Route
├─ models/                 # Mongoose 数据模型定义
├─ themes/                 # 可插拔主题（Sidebar / Fullscreen 等）
├─ scripts/                # 初始化、迁移、测试脚本
├─ img/                    # 资源预览图（README 引用）
├─ lib/                    # 业务工具与数据库封装
└─ …                       # 其余配置文件
```

---

## ⚙️ 环境变量 | Environment Variables

在 `.env.local` 中配置以下关键变量：

| 变量 Variable | 描述 Description |
| ------------- | ---------------- |
| `MONGODB_URI` | MongoDB 连接字符串，支持 `authSource` 等参数 |
| `NEXTAUTH_SECRET` | NextAuth 会话密钥（如启用认证模块） |
| `NEXTAUTH_URL` | NextAuth 对外访问地址 |
| `JWT_SECRET` | 自定义 JWT 加密密钥 |

建议同时配置 `SITE_URL`、`EMAIL_FROM` 等与部署相关的变量，以满足通知或第三方登录场景需要。

---

## 📦 常用命令 | Useful Scripts

| 命令 Command        | 作用 Purpose |
| ------------------- | ------------ |
| `npm run dev`       | 启动本地开发服务器（含热更新） |
| `npm run build`     | 生产构建，输出 `.next` 目录 |
| `npm run start`     | 以生产模式启动服务 |
| `npm run init-db`   | 初始化 MongoDB 基础数据 |
| `npm run seed-data` | 注入丰富示例数据（可选） |
| `npm run lint`      | 运行 ESLint 规范检查 |

---

## 🧑‍💻 贡献指南 | Contributing

欢迎提交 Issue / Pull Request：

1. Fork 仓库并创建分支（`feature/your-feature`）。
2. 保持代码遵循 ESLint / Prettier 规范。
3. 配置 `.env.local` 并通过 `npm run build`、`npm run lint` 验证。
4. 提交 PR 时附上改动说明与必要的截图或测试结论。

---

## 📄 许可证 | License

- **中文**：本项目基于 [MIT License](LICENSE) 开源，可免费用于个人及商业项目，但需保留版权信息。
- **English**: Released under [MIT License](LICENSE). Feel free to fork, modify, and deploy as long as the license notice remains.

---

<div align="center">

**NavGo — 精选优质站点，点亮灵感地图 · Curate the web, navigate with confidence.**

</div>
