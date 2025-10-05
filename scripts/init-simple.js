const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo';

// 鐢ㄦ埛Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
  avatar: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LinkItem' }],
}, { timestamps: true });

// 涓婚Schema
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

// 璁剧疆Schema
const SettingsSchema = new mongoose.Schema({
  activeTheme: { type: String, default: 'default' },
  siteName: { type: String, default: 'NavGo' },
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
    console.log('馃敆 杩炴帴鏁版嵁搴?..');
    await mongoose.connect(MONGODB_URI);
    console.log('鉁?鏁版嵁搴撹繛鎺ユ垚鍔?);

    // 鍒涘缓榛樿绠＄悊鍛樿处鍙?    const adminEmail = 'admin@NavGo.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 12);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
      });
      console.log('鉁?榛樿绠＄悊鍛樿处鍙峰凡鍒涘缓');
      console.log('   閭: admin@NavGo.com');
      console.log('   瀵嗙爜: admin');
    } else {
      console.log('鈩癸笍  绠＄悊鍛樿处鍙峰凡瀛樺湪');
    }

    // 瀹夎榛樿涓婚
    const defaultTheme = await Theme.findOne({ name: 'default' });
    if (!defaultTheme) {
      await Theme.create({
        name: 'default',
        title: '榛樿涓婚',
        description: '绠€娲佷紭闆呯殑榛樿瀵艰埅涓婚',
        version: '1.0.0',
        author: 'NavGo',
        installed: true,
        enabled: false,
      });
      console.log('鉁?榛樿涓婚宸插畨瑁?);
    } else {
      console.log('鈩癸笍  榛樿涓婚宸插瓨鍦?);
    }

    // 瀹夎鐜颁唬涓婚
    const modernTheme = await Theme.findOne({ name: 'modern' });
    if (!modernTheme) {
      await Theme.create({
        name: 'modern',
        title: '鐜颁唬涓婚',
        description: '鐜颁唬绠€绾﹂鏍肩殑瀵艰埅涓婚',
        version: '1.0.0',
        author: 'NavGo',
        installed: true,
        enabled: false,
      });
      console.log('鉁?鐜颁唬涓婚宸插畨瑁?);
    } else {
      console.log('鈩癸笍  鐜颁唬涓婚宸插瓨鍦?);
    }

    // 鍒濆鍖栬缃?    const existingSettings = await Settings.findOne({});
    if (!existingSettings) {
      await Settings.create({
        activeTheme: 'default',
        siteName: 'NavGo',
        siteDescription: '鍩轰簬Next.js鐨勫彲鍒囨崲涓婚瀵艰埅绯荤粺',
        themeConfigs: {},
      });
      console.log('鉁?榛樿璁剧疆宸插垱寤?);
    } else {
      console.log('鈩癸笍  璁剧疆宸插瓨鍦?);
    }

    console.log('');
    console.log('馃帀 鏁版嵁搴撳垵濮嬪寲瀹屾垚锛?);
    console.log('');
    console.log('馃摑 绠＄悊鍛樼櫥褰曚俊鎭?');
    console.log('   鐧诲綍鍦板潃: http://localhost:3001/admin/login');
    console.log('   閭: admin@NavGo.com');
    console.log('   瀵嗙爜: admin');
    console.log('');
    console.log('馃挕 鐧诲綍鍚庤鍦ㄥ悗鍙版坊鍔犲垎绫诲拰閾炬帴锛岀劧鍚庡垏鎹富棰樻煡鐪嬫晥鏋?);
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('鉂?鍒濆鍖栧け璐?', error);
    process.exit(1);
  }
}

init();

