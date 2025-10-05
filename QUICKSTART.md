# NavCraft 快速启动指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置数据库

确保 `.env.local` 文件中的数据库连接正确:

```env
MONGODB_URI=mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft?authSource=admin
```

## 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

## 4. 注册管理员账号

1. 打开浏览器访问: http://localhost:3000/admin/register
2. 填写注册表单:
   - 姓名: Admin
   - 邮箱: admin@example.com
   - 密码: ******

3. 注册成功后会自动跳转到管理后台

## 5. 添加内容

### 添加分类
1. 在左侧菜单点击"分类管理"
2. 点击"+ 添加分类"按钮
3. 填写分类信息:
   - 分类名称: 开发工具
   - Slug: dev-tools
   - 描述: 开发相关工具和资源
4. 点击"创建"

### 添加链接
1. 在左侧菜单点击"链接管理"
2. 点击"+ 添加链接"按钮
3. 填写链接信息:
   - 标题: GitHub
   - URL: https://github.com
   - 描述: 全球最大的代码托管平台
   - 图标URL: https://github.com/favicon.ico
   - 分类: 选择刚创建的分类
4. 点击"创建"

## 6. 切换主题

1. 在左侧菜单点击"主题管理"
2. 查看可用主题列表
3. 点击"预览"按钮预览主题效果
4. 点击"使用"按钮激活主题
5. 访问首页查看新主题效果

## 7. 访问前台

在管理后台点击左下角"访问前台"链接,或直接访问:
http://localhost:3000

## 常见问题

### 数据库连接失败
- 检查MongoDB服务是否运行
- 检查 `.env.local` 中的连接字符串是否正确
- 检查网络连接和防火墙设置

### 首页没有内容
- 确保已添加分类和链接
- 确保分类和链接的"启用"状态为开启
- 刷新页面重新加载数据

### 主题切换没有生效
- 刷新页面
- 清除浏览器缓存
- 检查主题是否已正确安装

## 生产部署

### 使用Docker部署

```bash
# 构建镜像
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 http://localhost:3000

## 技术支持

如有问题,请查看项目README.md或提交Issue
