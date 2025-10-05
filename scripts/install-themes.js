const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft';

const ThemeSchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  version: String,
  author: String,
  installed: Boolean,
  enabled: Boolean,
  configSchema: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Theme = mongoose.model('Theme', ThemeSchema);

const themes = [
  {
    name: 'modern-grid',
    title: '现代卡片网格',
    description: '时尚的卡片网格布局，适合展示大量网站',
    version: '1.0.0',
    author: 'NavCraft',
    installed: true,
    enabled: false,
  },
  {
    name: 'minimalist-list',
    title: '极简列表',
    description: '简洁的列表布局，注重内容和可读性',
    version: '1.0.0',
    author: 'NavCraft',
    installed: true,
    enabled: false,
  },
  {
    name: 'magazine-masonry',
    title: '杂志瀑布流',
    description: '类似Pinterest的瀑布流布局，视觉冲击力强',
    version: '1.0.0',
    author: 'NavCraft',
    installed: true,
    enabled: false,
  },
  {
    name: 'sidebar-nav',
    title: '侧边栏导航',
    description: '经典侧边栏布局，适合分类较多的网站',
    version: '1.0.0',
    author: 'NavCraft',
    installed: true,
    enabled: false,
  },
  {
    name: 'fullscreen-section',
    title: '全屏分屏',
    description: '全屏分屏展示，每个分类独占一屏',
    version: '1.0.0',
    author: 'NavCraft',
    installed: true,
    enabled: false,
  },
];

async function installThemes() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('📦 安装主题到数据库...\n');

    for (const themeData of themes) {
      const existing = await Theme.findOne({ name: themeData.name });

      if (existing) {
        await Theme.updateOne({ name: themeData.name }, themeData);
        console.log(`  ↻ 更新主题: ${themeData.title}`);
      } else {
        await Theme.create(themeData);
        console.log(`  ✓ 安装主题: ${themeData.title}`);
      }
    }

    console.log('\n🎉 所有主题安装完成！');
    console.log(`\n📊 共安装 ${themes.length} 个主题`);
    console.log('\n💡 现在可以在后台管理中切换主题了');
    console.log('   http://localhost:3000/admin/themes\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 安装失败:', error);
    process.exit(1);
  }
}

installThemes();
