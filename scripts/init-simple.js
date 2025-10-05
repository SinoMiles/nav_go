const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft';

// 用户Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
  avatar: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LinkItem' }],
}, { timestamps: true });

// 主题Schema
const ThemeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  version: { type: String, default: '1.0.0' },
  author: String,
  installed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: false },
  configSchema: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

// 设置Schema
const SettingsSchema = new mongoose.Schema({
  activeTheme: { type: String, default: 'default' },
  siteName: { type: String, default: 'NavCraft' },
  siteDescription: String,
  siteKeywords: String,
  logo: String,
  favicon: String,
  themeConfigs: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Theme = mongoose.model('Theme', ThemeSchema);
const Settings = mongoose.model('Settings', SettingsSchema);

async function init() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 创建默认管理员账号
    const adminEmail = 'admin@navcraft.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 12);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
      });
      console.log('✅ 默认管理员账号已创建');
      console.log('   邮箱: admin@navcraft.com');
      console.log('   密码: admin');
    } else {
      console.log('ℹ️  管理员账号已存在');
    }

    // 安装默认主题
    const defaultTheme = await Theme.findOne({ name: 'default' });
    if (!defaultTheme) {
      await Theme.create({
        name: 'default',
        title: '默认主题',
        description: '简洁优雅的默认导航主题',
        version: '1.0.0',
        author: 'NavCraft',
        installed: true,
        enabled: false,
      });
      console.log('✅ 默认主题已安装');
    } else {
      console.log('ℹ️  默认主题已存在');
    }

    // 安装现代主题
    const modernTheme = await Theme.findOne({ name: 'modern' });
    if (!modernTheme) {
      await Theme.create({
        name: 'modern',
        title: '现代主题',
        description: '现代简约风格的导航主题',
        version: '1.0.0',
        author: 'NavCraft',
        installed: true,
        enabled: false,
      });
      console.log('✅ 现代主题已安装');
    } else {
      console.log('ℹ️  现代主题已存在');
    }

    // 初始化设置
    const existingSettings = await Settings.findOne({});
    if (!existingSettings) {
      await Settings.create({
        activeTheme: 'default',
        siteName: 'NavCraft',
        siteDescription: '基于Next.js的可切换主题导航系统',
        themeConfigs: {},
      });
      console.log('✅ 默认设置已创建');
    } else {
      console.log('ℹ️  设置已存在');
    }

    console.log('');
    console.log('🎉 数据库初始化完成！');
    console.log('');
    console.log('📝 管理员登录信息:');
    console.log('   登录地址: http://localhost:3001/admin/login');
    console.log('   邮箱: admin@navcraft.com');
    console.log('   密码: admin');
    console.log('');
    console.log('💡 登录后请在后台添加分类和链接，然后切换主题查看效果');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

init();
