const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo';

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
    title: '鐜颁唬鍗＄墖缃戞牸',
    description: '鏃跺皻鐨勫崱鐗囩綉鏍煎竷灞€锛岄€傚悎灞曠ず澶ч噺缃戠珯',
    version: '1.0.0',
    author: 'NavGo',
    installed: true,
    enabled: false,
  },
  {
    name: 'minimalist-list',
    title: '鏋佺畝鍒楄〃',
    description: '绠€娲佺殑鍒楄〃甯冨眬锛屾敞閲嶅唴瀹瑰拰鍙鎬?,
    version: '1.0.0',
    author: 'NavGo',
    installed: true,
    enabled: false,
  },
  {
    name: 'magazine-masonry',
    title: '鏉傚織鐎戝竷娴?,
    description: '绫讳技Pinterest鐨勭€戝竷娴佸竷灞€锛岃瑙夊啿鍑诲姏寮?,
    version: '1.0.0',
    author: 'NavGo',
    installed: true,
    enabled: false,
  },
  {
    name: 'sidebar-nav',
    title: '渚ц竟鏍忓鑸?,
    description: '缁忓吀渚ц竟鏍忓竷灞€锛岄€傚悎鍒嗙被杈冨鐨勭綉绔?,
    version: '1.0.0',
    author: 'NavGo',
    installed: true,
    enabled: false,
  },
  {
    name: 'fullscreen-section',
    title: '鍏ㄥ睆鍒嗗睆',
    description: '鍏ㄥ睆鍒嗗睆灞曠ず锛屾瘡涓垎绫荤嫭鍗犱竴灞?,
    version: '1.0.0',
    author: 'NavGo',
    installed: true,
    enabled: false,
  },
];

async function installThemes() {
  try {
    console.log('馃敆 杩炴帴鏁版嵁搴?..');
    await mongoose.connect(MONGODB_URI);
    console.log('鉁?鏁版嵁搴撹繛鎺ユ垚鍔焅n');

    console.log('馃摝 瀹夎涓婚鍒版暟鎹簱...\n');

    for (const themeData of themes) {
      const existing = await Theme.findOne({ name: themeData.name });

      if (existing) {
        await Theme.updateOne({ name: themeData.name }, themeData);
        console.log(`  鈫?鏇存柊涓婚: ${themeData.title}`);
      } else {
        await Theme.create(themeData);
        console.log(`  鉁?瀹夎涓婚: ${themeData.title}`);
      }
    }

    console.log('\n馃帀 鎵€鏈変富棰樺畨瑁呭畬鎴愶紒');
    console.log(`\n馃搳 鍏卞畨瑁?${themes.length} 涓富棰榒);
    console.log('\n馃挕 鐜板湪鍙互鍦ㄥ悗鍙扮鐞嗕腑鍒囨崲涓婚浜?);
    console.log('   http://localhost:3000/admin/themes\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('鉂?瀹夎澶辫触:', error);
    process.exit(1);
  }
}

installThemes();

