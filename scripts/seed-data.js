const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://NavGo:3afnijdxHaMrJHsT@39.98.161.189:27017/NavGo';

// Schema瀹氫箟
const CategorySchema = new mongoose.Schema({
  title: String,
  slug: String,
  description: String,
  order: Number,
  enabled: Boolean,
}, { timestamps: true });

const LinkItemSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  iconUrl: String,
  categoryId: mongoose.Schema.Types.ObjectId,
  order: Number,
  enabled: Boolean,
  tags: [String],
  clicks: Number,
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const LinkItem = mongoose.model('LinkItem', LinkItemSchema);

// 鍒嗙被鏁版嵁
const categories = [
  { title: '鎼滅储寮曟搸', slug: 'search', description: '涓绘祦鎼滅储寮曟搸鍜屽瀭鐩存悳绱?, order: 1 },
  { title: '绀句氦濯掍綋', slug: 'social', description: '绀句氦骞冲彴鍜屽嵆鏃堕€氳', order: 2 },
  { title: '瑙嗛骞冲彴', slug: 'video', description: '瑙嗛缃戠珯鍜岀洿鎾钩鍙?, order: 3 },
  { title: '鐢靛晢璐墿', slug: 'shopping', description: '鐢靛晢骞冲彴鍜岃喘鐗╃綉绔?, order: 4 },
  { title: '鏂伴椈璧勮', slug: 'news', description: '鏂伴椈闂ㄦ埛鍜岃祫璁钩鍙?, order: 5 },
  { title: '寮€鍙戝伐鍏?, slug: 'developer', description: '寮€鍙戣€呭父鐢ㄥ伐鍏峰拰骞冲彴', order: 6 },
  { title: '璁捐璧勬簮', slug: 'design', description: '璁捐宸ュ叿鍜岀礌鏉愮綉绔?, order: 7 },
  { title: '鍦ㄧ嚎鏁欒偛', slug: 'education', description: '鍦ㄧ嚎瀛︿範鍜屾暀鑲插钩鍙?, order: 8 },
  { title: '鐢熸椿鏈嶅姟', slug: 'life', description: '鐢熸椿鏈嶅姟绫荤綉绔?, order: 9 },
  { title: '閲戣瀺鐞嗚储', slug: 'finance', description: '閲戣瀺鍜岀悊璐㈠钩鍙?, order: 10 },
];

// 閾炬帴鏁版嵁
const links = [
  // 鎼滅储寮曟搸 (15涓?
  { title: '鐧惧害', url: 'https://www.baidu.com', description: '鍏ㄧ悆鏈€澶х殑涓枃鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '鐧惧害'] },
  { title: '鎼滅嫍鎼滅储', url: 'https://www.sogou.com', description: '鑵捐鏃椾笅鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '鑵捐'] },
  { title: '360鎼滅储', url: 'https://www.so.com', description: '瀹夊叏鍙俊璧栫殑鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '360'] },
  { title: '蹇呭簲涓浗', url: 'https://cn.bing.com', description: '寰蒋鏃椾笅鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '寰蒋'] },
  { title: '璋锋瓕', url: 'https://www.google.com', description: '鍏ㄧ悆鏈€澶ф悳绱㈠紩鎿?, category: '鎼滅储寮曟搸', tags: ['鎼滅储', 'Google'] },
  { title: '鐭ヤ箮鎼滅储', url: 'https://www.zhihu.com/search', description: '鐭ヨ瘑闂瓟鎼滅储', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '鐭ヨ瘑'] },
  { title: '寰俊鎼滀竴鎼?, url: 'https://weixin.sogou.com', description: '寰俊鍐呭鎼滅储', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '寰俊'] },
  { title: '澶存潯鎼滅储', url: 'https://www.toutiao.com/search', description: '浠婃棩澶存潯鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '璧勮'] },
  { title: 'Yandex', url: 'https://yandex.com', description: '淇勭綏鏂悳绱㈠紩鎿?, category: '鎼滅储寮曟搸', tags: ['鎼滅储', '鍥介檯'] },
  { title: '澶稿厠鎼滅储', url: 'https://quark.sm.cn', description: 'UC娴忚鍣ㄦ悳绱?, category: '鎼滅储寮曟搸', tags: ['鎼滅储', '绉诲姩'] },
  { title: '绉樺鎼滅储', url: 'https://metaso.cn', description: 'AI椹卞姩鐨勬悳绱㈠紩鎿?, category: '鎼滅储寮曟搸', tags: ['鎼滅储', 'AI'] },
  { title: '铏儴钀藉揩鎼?, url: 'https://search.chongbuluo.com', description: '鑱氬悎鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '鑱氬悎'] },
  { title: 'Magi', url: 'https://magi.com', description: '鍩轰簬AI鐨勪俊鎭娊鍙栨悳绱?, category: '鎼滅储寮曟搸', tags: ['鎼滅储', 'AI'] },
  { title: '澶氬悏鎼滅储', url: 'https://www.dogedoge.com', description: '涓嶈拷韪殣绉佺殑鎼滅储', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '闅愮'] },
  { title: '绁為┈鎼滅储', url: 'https://m.sm.cn', description: '绉诲姩鎼滅储寮曟搸', category: '鎼滅储寮曟搸', tags: ['鎼滅储', '绉诲姩'] },

  // 绀句氦濯掍綋 (15涓?
  { title: '寰俊', url: 'https://weixin.qq.com', description: '鍥芥皯绾у嵆鏃堕€氳搴旂敤', category: '绀句氦濯掍綋', tags: ['绀句氦', '鍗虫椂閫氳'] },
  { title: 'QQ', url: 'https://im.qq.com', description: '鑵捐鍗虫椂閫氳杞欢', category: '绀句氦濯掍綋', tags: ['绀句氦', 'QQ'] },
  { title: '寰崥', url: 'https://weibo.com', description: '涓浗鏈€澶у井鍗氬骞冲彴', category: '绀句氦濯掍綋', tags: ['绀句氦', '寰崥'] },
  { title: '鐭ヤ箮', url: 'https://www.zhihu.com', description: '涓枃浜掕仈缃戠煡璇嗗垎浜钩鍙?, category: '绀句氦濯掍綋', tags: ['绀句氦', '鐭ヨ瘑'] },
  { title: '璞嗙摚', url: 'https://www.douban.com', description: '鏂囪壓闈掑勾鑱氶泦鍦?, category: '绀句氦濯掍綋', tags: ['绀句氦', '鏂囪壓'] },
  { title: '灏忕孩涔?, url: 'https://www.xiaohongshu.com', description: '鐢熸椿鏂瑰紡鍒嗕韩骞冲彴', category: '绀句氦濯掍綋', tags: ['绀句氦', '绉嶈崏'] },
  { title: '鎶栭煶', url: 'https://www.douyin.com', description: '鐭棰戠ぞ浜ゅ钩鍙?, category: '绀句氦濯掍綋', tags: ['绀句氦', '鐭棰?] },
  { title: '蹇墜', url: 'https://www.kuaishou.com', description: '鐭棰戝垎浜钩鍙?, category: '绀句氦濯掍綋', tags: ['绀句氦', '鐭棰?] },
  { title: 'B绔?, url: 'https://www.bilibili.com', description: '骞磋交浜虹殑鏂囧寲绀惧尯', category: '绀句氦濯掍綋', tags: ['绀句氦', '瑙嗛'] },
  { title: '璐村惂', url: 'https://tieba.baidu.com', description: '鐧惧害鏃椾笅鍏磋叮绀惧尯', category: '绀句氦濯掍綋', tags: ['绀句氦', '璁哄潧'] },
  { title: '铏庢墤', url: 'https://www.hupu.com', description: '浣撹偛鍜岀敺鎬ц瘽棰樼ぞ鍖?, category: '绀句氦濯掍綋', tags: ['绀句氦', '浣撹偛'] },
  { title: '鍗冲埢', url: 'https://www.jike.com', description: '鍩轰簬鍏磋叮鐨勭ぞ浜ゅ钩鍙?, category: '绀句氦濯掍綋', tags: ['绀句氦', '鍏磋叮'] },
  { title: '鑴夎剦', url: 'https://maimai.cn', description: '鑱屽満绀句氦骞冲彴', category: '绀句氦濯掍綋', tags: ['绀句氦', '鑱屽満'] },
  { title: '浜轰汉缃?, url: 'http://www.renren.com', description: '鏍″洯绀句氦缃戠粶', category: '绀句氦濯掍綋', tags: ['绀句氦', '鏍″洯'] },
  { title: '閽夐拤', url: 'https://www.dingtalk.com', description: '浼佷笟鍗忓悓鍔炲叕骞冲彴', category: '绀句氦濯掍綋', tags: ['绀句氦', '鍔炲叕'] },

  // 瑙嗛骞冲彴 (12涓?
  { title: '鑵捐瑙嗛', url: 'https://v.qq.com', description: '鑵捐鏃椾笅瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '褰辫'] },
  { title: '鐖卞鑹?, url: 'https://www.iqiyi.com', description: '缁煎悎瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '褰辫'] },
  { title: '浼橀叿', url: 'https://www.youku.com', description: '闃块噷鏃椾笅瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '褰辫'] },
  { title: '鑺掓灉TV', url: 'https://www.mgtv.com', description: '婀栧崡鍗瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '缁艰壓'] },
  { title: '鍜挄瑙嗛', url: 'https://www.miguvideo.com', description: '涓浗绉诲姩瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '浣撹偛'] },
  { title: '瑗跨摐瑙嗛', url: 'https://www.ixigua.com', description: '瀛楄妭璺冲姩瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '鐭棰?] },
  { title: '鎼滅嫄瑙嗛', url: 'https://tv.sohu.com', description: '鎼滅嫄鏃椾笅瑙嗛缃戠珯', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '褰辫'] },
  { title: 'PPTV', url: 'http://www.pptv.com', description: '鑻忓畞鏃椾笅瑙嗛骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '浣撹偛'] },
  { title: '鏂楅奔', url: 'https://www.douyu.com', description: '娓告垙鐩存挱骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '鐩存挱'] },
  { title: '铏庣墮', url: 'https://www.huya.com', description: '娓告垙鐩存挱骞冲彴', category: '瑙嗛骞冲彴', tags: ['瑙嗛', '鐩存挱'] },
  { title: '鍝斿摡鍝斿摡', url: 'https://www.bilibili.com', description: 'B绔欒棰戝钩鍙?, category: '瑙嗛骞冲彴', tags: ['瑙嗛', '寮瑰箷'] },
  { title: '濂界湅瑙嗛', url: 'https://haokan.baidu.com', description: '鐧惧害鏃椾笅鐭棰?, category: '瑙嗛骞冲彴', tags: ['瑙嗛', '鐭棰?] },

  // 鐢靛晢璐墿 (15涓?
  { title: '娣樺疂', url: 'https://www.taobao.com', description: '浜氭床鏈€澶ц喘鐗╃綉绔?, category: '鐢靛晢璐墿', tags: ['璐墿', '鐢靛晢'] },
  { title: '澶╃尗', url: 'https://www.tmall.com', description: '鍝佺墝鍟嗗煄', category: '鐢靛晢璐墿', tags: ['璐墿', '鍝佺墝'] },
  { title: '浜笢', url: 'https://www.jd.com', description: '缁煎悎鐢靛晢骞冲彴', category: '鐢靛晢璐墿', tags: ['璐墿', '3C'] },
  { title: '鎷煎澶?, url: 'https://www.pinduoduo.com', description: '绀句氦鐢靛晢骞冲彴', category: '鐢靛晢璐墿', tags: ['璐墿', '鎷煎洟'] },
  { title: '鑻忓畞鏄撹喘', url: 'https://www.suning.com', description: '瀹剁數3C璐墿', category: '鐢靛晢璐墿', tags: ['璐墿', '瀹剁數'] },
  { title: '鍞搧浼?, url: 'https://www.vip.com', description: '鍝佺墝鐗瑰崠骞冲彴', category: '鐢靛晢璐墿', tags: ['璐墿', '鐗瑰崠'] },
  { title: '鑰冩媺娴疯喘', url: 'https://www.kaola.com', description: '璺ㄥ鐢靛晢骞冲彴', category: '鐢靛晢璐墿', tags: ['璐墿', '娴锋窐'] },
  { title: '褰撳綋', url: 'http://www.dangdang.com', description: '鍥句功璐墿缃戠珯', category: '鐢靛晢璐墿', tags: ['璐墿', '鍥句功'] },
  { title: '灏忕背鍟嗗煄', url: 'https://www.mi.com', description: '灏忕背瀹樻柟鍟嗗煄', category: '鐢靛晢璐墿', tags: ['璐墿', '灏忕背'] },
  { title: '缃戞槗涓ラ€?, url: 'https://you.163.com', description: '缃戞槗鑷惀鐢靛晢', category: '鐢靛晢璐墿', tags: ['璐墿', 'ODM'] },
  { title: '寰楃墿', url: 'https://www.dewu.com', description: '娼祦缃戣喘绀惧尯', category: '鐢靛晢璐墿', tags: ['璐墿', '娼祦'] },
  { title: '闂查奔', url: 'https://www.xianyu.com', description: '浜屾墜浜ゆ槗骞冲彴', category: '鐢靛晢璐墿', tags: ['璐墿', '浜屾墜'] },
  { title: '1688', url: 'https://www.1688.com', description: '闃块噷宸村反鎵瑰彂缃?, category: '鐢靛晢璐墿', tags: ['璐墿', '鎵瑰彂'] },
  { title: '浜氶┈閫婁腑鍥?, url: 'https://www.amazon.cn', description: '浜氶┈閫婁腑鍥界珯', category: '鐢靛晢璐墿', tags: ['璐墿', '娴锋窐'] },
  { title: '铇戣弴琛?, url: 'https://www.mogujie.com', description: '濂虫€ф椂灏氳喘鐗?, category: '鐢靛晢璐墿', tags: ['璐墿', '濂宠'] },

  // 鏂伴椈璧勮 (12涓?
  { title: '鏂版氮鏂伴椈', url: 'https://news.sina.com.cn', description: '缁煎悎鏂伴椈闂ㄦ埛', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '璧勮'] },
  { title: '缃戞槗鏂伴椈', url: 'https://news.163.com', description: '缃戞槗鏂伴椈涓績', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '璧勮'] },
  { title: '鑵捐鏂伴椈', url: 'https://news.qq.com', description: '鑵捐鏂伴椈棰戦亾', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '璧勮'] },
  { title: '浠婃棩澶存潯', url: 'https://www.toutiao.com', description: '涓€у寲璧勮鎺ㄨ崘', category: '鏂伴椈璧勮', tags: ['鏂伴椈', 'AI鎺ㄨ崘'] },
  { title: '鎼滅嫄鏂伴椈', url: 'https://news.sohu.com', description: '鎼滅嫄鏂伴椈涓績', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '璧勮'] },
  { title: '鍑ゅ嚢缃?, url: 'https://www.ifeng.com', description: '鍑ゅ嚢鏂板獟浣?, category: '鏂伴椈璧勮', tags: ['鏂伴椈', '璧勮'] },
  { title: '婢庢箖鏂伴椈', url: 'https://www.thepaper.cn', description: '涓撲笟鏂伴椈骞冲彴', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '娣卞害'] },
  { title: '鏂板崕缃?, url: 'http://www.xinhuanet.com', description: '鏂板崕閫氳绀惧畼缃?, category: '鏂伴椈璧勮', tags: ['鏂伴椈', '瀹樻柟'] },
  { title: '浜烘皯缃?, url: 'http://www.people.com.cn', description: '浜烘皯鏃ユ姤瀹樼綉', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '瀹樻柟'] },
  { title: '澶缃?, url: 'https://www.cctv.com', description: '涓ぎ鐢佃鍙板畼缃?, category: '鏂伴椈璧勮', tags: ['鏂伴椈', '瀹樻柟'] },
  { title: '36姘?, url: 'https://36kr.com', description: '绉戞妧鍒涙姇濯掍綋', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '绉戞妧'] },
  { title: '铏庡梾', url: 'https://www.huxiu.com', description: '绉戞妧璐㈢粡璧勮', category: '鏂伴椈璧勮', tags: ['鏂伴椈', '绉戞妧'] },

  // 寮€鍙戝伐鍏?(15涓?
  { title: 'GitHub', url: 'https://github.com', description: '鍏ㄧ悆鏈€澶т唬鐮佹墭绠″钩鍙?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '浠ｇ爜'] },
  { title: 'Gitee', url: 'https://gitee.com', description: '鍥藉唴浠ｇ爜鎵樼骞冲彴', category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '浠ｇ爜'] },
  { title: 'CSDN', url: 'https://www.csdn.net', description: '涓枃IT鎶€鏈ぞ鍖?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '鎶€鏈?] },
  { title: '鍗氬鍥?, url: 'https://www.cnblogs.com', description: '寮€鍙戣€呮妧鏈崥瀹?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '鍗氬'] },
  { title: '鎺橀噾', url: 'https://juejin.cn', description: '鎶€鏈唴瀹瑰垎浜钩鍙?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '鍓嶇'] },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: '绋嬪簭鍛橀棶绛旂ぞ鍖?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '闂瓟'] },
  { title: 'V2EX', url: 'https://www.v2ex.com', description: '鍒涙剰宸ヤ綔鑰呯ぞ鍖?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '绀惧尯'] },
  { title: 'SegmentFault', url: 'https://segmentfault.com', description: '鎶€鏈棶绛旂ぞ鍖?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '闂瓟'] },
  { title: '寮€婧愪腑鍥?, url: 'https://www.oschina.net', description: '涓枃寮€婧愭妧鏈ぞ鍖?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '寮€婧?] },
  { title: '鑿滈笩鏁欑▼', url: 'https://www.runoob.com', description: '缂栫▼鍏ラ棬鏁欑▼', category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '鏁欑▼'] },
  { title: 'MDN', url: 'https://developer.mozilla.org/zh-CN/', description: 'Web寮€鍙戞枃妗?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '鏂囨。'] },
  { title: 'NPM', url: 'https://www.npmjs.com', description: 'JavaScript鍖呯鐞?, category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, 'npm'] },
  { title: 'CodePen', url: 'https://codepen.io', description: '鍓嶇浠ｇ爜婕旂ず', category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '鍓嶇'] },
  { title: 'LeetCode', url: 'https://leetcode.cn', description: '绠楁硶棰樺簱', category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '绠楁硶'] },
  { title: '鐗涘缃?, url: 'https://www.nowcoder.com', description: 'IT姹傝亴闈㈣瘯骞冲彴', category: '寮€鍙戝伐鍏?, tags: ['寮€鍙?, '闈㈣瘯'] },

  // 璁捐璧勬簮 (12涓?
  { title: '绔欓叿', url: 'https://www.zcool.com.cn', description: '璁捐甯堜簰鍔ㄥ钩鍙?, category: '璁捐璧勬簮', tags: ['璁捐', '浣滃搧'] },
  { title: 'UI涓浗', url: 'https://www.ui.cn', description: 'UI璁捐甯堢ぞ鍖?, category: '璁捐璧勬簮', tags: ['璁捐', 'UI'] },
  { title: '鑺辩摚缃?, url: 'https://huaban.com', description: '鍥剧墖閲囬泦鍒嗕韩', category: '璁捐璧勬簮', tags: ['璁捐', '鐏垫劅'] },
  { title: 'Dribbble', url: 'https://dribbble.com', description: '璁捐甯堜綔鍝佸睍绀?, category: '璁捐璧勬簮', tags: ['璁捐', '浣滃搧'] },
  { title: 'Behance', url: 'https://www.behance.net', description: 'Adobe璁捐绀惧尯', category: '璁捐璧勬簮', tags: ['璁捐', '浣滃搧'] },
  { title: 'Figma', url: 'https://www.figma.com', description: '鍦ㄧ嚎UI璁捐宸ュ叿', category: '璁捐璧勬簮', tags: ['璁捐', '宸ュ叿'] },
  { title: '鍗虫椂璁捐', url: 'https://js.design', description: '鍥戒骇UI璁捐宸ュ叿', category: '璁捐璧勬簮', tags: ['璁捐', '宸ュ叿'] },
  { title: 'Canva', url: 'https://www.canva.cn', description: '鍦ㄧ嚎骞抽潰璁捐', category: '璁捐璧勬簮', tags: ['璁捐', '宸ュ叿'] },
  { title: '鍗冨浘缃?, url: 'https://www.58pic.com', description: '鍏嶈垂绱犳潗涓嬭浇', category: '璁捐璧勬簮', tags: ['璁捐', '绱犳潗'] },
  { title: '鍖呭浘缃?, url: 'https://ibaotu.com', description: '鍘熷垱绱犳潗缃戠珯', category: '璁捐璧勬簮', tags: ['璁捐', '绱犳潗'] },
  { title: 'IconFont', url: 'https://www.iconfont.cn', description: '闃块噷鍥炬爣搴?, category: '璁捐璧勬簮', tags: ['璁捐', '鍥炬爣'] },
  { title: '浼樿缃?, url: 'https://www.uisdc.com', description: '璁捐甯堝涔犲钩鍙?, category: '璁捐璧勬簮', tags: ['璁捐', '鏁欑▼'] },

  // 鍦ㄧ嚎鏁欒偛 (10涓?
  { title: '涓浗澶уMOOC', url: 'https://www.icourse163.org', description: '浼樿川涓枃鎱曡骞冲彴', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', 'MOOC'] },
  { title: '缃戞槗浜戣鍫?, url: 'https://study.163.com', description: '瀹炵敤鎶€鑳藉涔犲钩鍙?, category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '鎶€鑳?] },
  { title: '鑵捐璇惧爞', url: 'https://ke.qq.com', description: '鍦ㄧ嚎鑱屼笟鏁欒偛', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '鑱屼笟'] },
  { title: 'B绔欏ぇ瀛?, url: 'https://www.bilibili.com/cheese/', description: 'B绔欑煡璇嗗尯', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '瑙嗛'] },
  { title: '瀛﹀爞鍦ㄧ嚎', url: 'https://www.xuetangx.com', description: '娓呭崕澶у鎱曡', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '澶у'] },
  { title: '鎱曡缃?, url: 'https://www.imooc.com', description: 'IT鎶€鑳藉涔?, category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '缂栫▼'] },
  { title: '鏋佸鏃堕棿', url: 'https://time.geekbang.org', description: '鎶€鏈涔犲钩鍙?, category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '鎶€鏈?] },
  { title: '鐧捐瘝鏂?, url: 'https://www.baicizhan.com', description: '鑻辫鍗曡瘝瀛︿範', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '鑻辫'] },
  { title: '鏈夐亾绮惧搧璇?, url: 'https://ke.youdao.com', description: '缃戞槗鏈夐亾鏁欒偛', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '瀛︾'] },
  { title: '鐭ヤ箮鐭ュ鍫?, url: 'https://www.zhihu.com/xen/market/remix', description: '鐭ヤ箮鏁欒偛骞冲彴', category: '鍦ㄧ嚎鏁欒偛', tags: ['鏁欒偛', '鐭ヨ瘑'] },

  // 鐢熸椿鏈嶅姟 (12涓?
  { title: '缇庡洟', url: 'https://www.meituan.com', description: '鐢熸椿鏈嶅姟骞冲彴', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '澶栧崠'] },
  { title: '楗夸簡涔?, url: 'https://www.ele.me', description: '澶栧崠璁㈤骞冲彴', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '澶栧崠'] },
  { title: '澶т紬鐐硅瘎', url: 'https://www.dianping.com', description: '鏈湴鐢熸椿鏈嶅姟', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鐐硅瘎'] },
  { title: '鎼虹▼', url: 'https://www.ctrip.com', description: '鍦ㄧ嚎鏃呮父鏈嶅姟', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鏃呮父'] },
  { title: '鍘诲摢鍎?, url: 'https://www.qunar.com', description: '鏃呮父鎼滅储骞冲彴', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鏃呮父'] },
  { title: '椋炵尓', url: 'https://www.fliggy.com', description: '闃块噷鏃呰骞冲彴', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鏃呮父'] },
  { title: '12306', url: 'https://www.12306.cn', description: '閾佽矾璐エ瀹樼綉', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鐏溅绁?] },
  { title: '婊存淮鍑鸿', url: 'https://www.didiglobal.com', description: '绉诲姩鍑鸿骞冲彴', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鍑鸿'] },
  { title: '楂樺痉鍦板浘', url: 'https://www.amap.com', description: '鍦板浘瀵艰埅鏈嶅姟', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鍦板浘'] },
  { title: '鐧惧害鍦板浘', url: 'https://map.baidu.com', description: '鐧惧害鍦板浘鏈嶅姟', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鍦板浘'] },
  { title: '58鍚屽煄', url: 'https://www.58.com', description: '鐢熸椿鍒嗙被淇℃伅', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鍒嗙被'] },
  { title: '閾惧', url: 'https://www.lianjia.com', description: '鎴夸骇鏈嶅姟骞冲彴', category: '鐢熸椿鏈嶅姟', tags: ['鐢熸椿', '鎴夸骇'] },

  // 閲戣瀺鐞嗚储 (10涓?
  { title: '鏀粯瀹?, url: 'https://www.alipay.com', description: '鏁板瓧鐢熸椿寮€鏀惧钩鍙?, category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '鏀粯'] },
  { title: '寰俊鏀粯', url: 'https://pay.weixin.qq.com', description: '寰俊鏀粯鏈嶅姟', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '鏀粯'] },
  { title: '鎷涘晢閾惰', url: 'https://www.cmbchina.com', description: '鎷涘晢閾惰瀹樼綉', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '閾惰'] },
  { title: '涓浗宸ュ晢閾惰', url: 'https://www.icbc.com.cn', description: '宸ュ晢閾惰瀹樼綉', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '閾惰'] },
  { title: '涓浗寤鸿閾惰', url: 'http://www.ccb.com', description: '寤鸿閾惰瀹樼綉', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '閾惰'] },
  { title: '澶╁ぉ鍩洪噾', url: 'https://fund.eastmoney.com', description: '鍩洪噾鐞嗚储骞冲彴', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '鍩洪噾'] },
  { title: '鍚岃姳椤?, url: 'http://www.10jqka.com.cn', description: '鑲＄エ杞欢骞冲彴', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '鑲＄エ'] },
  { title: '闆悆', url: 'https://xueqiu.com', description: '鎶曡祫鑰呯ぞ鍖?, category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '鎶曡祫'] },
  { title: '涓滄柟璐㈠瘜', url: 'http://www.eastmoney.com', description: '璐㈢粡璧勮骞冲彴', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '璐㈢粡'] },
  { title: '铓傝殎璐㈠瘜', url: 'https://www.fund123.cn', description: '鐞嗚储鏈嶅姟骞冲彴', category: '閲戣瀺鐞嗚储', tags: ['閲戣瀺', '鐞嗚储'] },
];

async function seedData() {
  try {
    console.log('馃敆 杩炴帴鏁版嵁搴?..');
    await mongoose.connect(MONGODB_URI);
    console.log('鉁?鏁版嵁搴撹繛鎺ユ垚鍔焅n');

    // 娓呯┖鐜版湁鏁版嵁锛堝彲閫夛級
    console.log('馃棏锔? 娓呯悊鏃ф暟鎹?..');
    await LinkItem.deleteMany({});
    await Category.deleteMany({});
    console.log('鉁?鏃ф暟鎹竻鐞嗗畬鎴怽n');

    // 鍒涘缓鍒嗙被
    console.log('馃搧 鍒涘缓鍒嗙被...');
    const categoryMap = {};
    for (const cat of categories) {
      const category = await Category.create({
        title: cat.title,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        enabled: true,
      });
      categoryMap[cat.title] = category._id;
      console.log(`  鉁?${cat.title}`);
    }
    console.log(`鉁?鍒涘缓浜?${categories.length} 涓垎绫籠n`);

    // 鍒涘缓閾炬帴
    console.log('馃敆 鍒涘缓閾炬帴...');
    let count = 0;
    for (const link of links) {
      const categoryId = categoryMap[link.category];
      if (!categoryId) {
        console.log(`  鈿狅笍  璺宠繃 ${link.title}: 鍒嗙被涓嶅瓨鍦╜);
        continue;
      }

      await LinkItem.create({
        title: link.title,
        url: link.url,
        description: link.description,
        iconUrl: `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`,
        categoryId: categoryId,
        order: count,
        enabled: true,
        tags: link.tags,
        clicks: Math.floor(Math.random() * 1000),
      });
      count++;
      if (count % 10 === 0) {
        console.log(`  宸插垱寤?${count} 涓摼鎺?..`);
      }
    }
    console.log(`鉁?鍒涘缓浜?${count} 涓摼鎺n`);

    // 缁熻淇℃伅
    const categoryCount = await Category.countDocuments();
    const linkCount = await LinkItem.countDocuments();

    console.log('馃搳 鏁版嵁缁熻:');
    console.log(`  鍒嗙被鎬绘暟: ${categoryCount}`);
    console.log(`  閾炬帴鎬绘暟: ${linkCount}`);
    console.log('');
    console.log('馃帀 鏁版嵁鍒濆鍖栧畬鎴?');
    console.log('');
    console.log('馃摑 鐜板湪鍙互璁块棶鍓嶅彴鏌ョ湅鏁堟灉:');
    console.log('   http://localhost:3001');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('鉂?鍒濆鍖栧け璐?', error);
    process.exit(1);
  }
}

seedData();

