const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://NavCraft:3afnijdxHaMrJHsT@39.98.161.189:27017/navcraft';

// Schema定义
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

// 分类数据
const categories = [
  { title: '搜索引擎', slug: 'search', description: '主流搜索引擎和垂直搜索', order: 1 },
  { title: '社交媒体', slug: 'social', description: '社交平台和即时通讯', order: 2 },
  { title: '视频平台', slug: 'video', description: '视频网站和直播平台', order: 3 },
  { title: '电商购物', slug: 'shopping', description: '电商平台和购物网站', order: 4 },
  { title: '新闻资讯', slug: 'news', description: '新闻门户和资讯平台', order: 5 },
  { title: '开发工具', slug: 'developer', description: '开发者常用工具和平台', order: 6 },
  { title: '设计资源', slug: 'design', description: '设计工具和素材网站', order: 7 },
  { title: '在线教育', slug: 'education', description: '在线学习和教育平台', order: 8 },
  { title: '生活服务', slug: 'life', description: '生活服务类网站', order: 9 },
  { title: '金融理财', slug: 'finance', description: '金融和理财平台', order: 10 },
];

// 链接数据
const links = [
  // 搜索引擎 (15个)
  { title: '百度', url: 'https://www.baidu.com', description: '全球最大的中文搜索引擎', category: '搜索引擎', tags: ['搜索', '百度'] },
  { title: '搜狗搜索', url: 'https://www.sogou.com', description: '腾讯旗下搜索引擎', category: '搜索引擎', tags: ['搜索', '腾讯'] },
  { title: '360搜索', url: 'https://www.so.com', description: '安全可信赖的搜索引擎', category: '搜索引擎', tags: ['搜索', '360'] },
  { title: '必应中国', url: 'https://cn.bing.com', description: '微软旗下搜索引擎', category: '搜索引擎', tags: ['搜索', '微软'] },
  { title: '谷歌', url: 'https://www.google.com', description: '全球最大搜索引擎', category: '搜索引擎', tags: ['搜索', 'Google'] },
  { title: '知乎搜索', url: 'https://www.zhihu.com/search', description: '知识问答搜索', category: '搜索引擎', tags: ['搜索', '知识'] },
  { title: '微信搜一搜', url: 'https://weixin.sogou.com', description: '微信内容搜索', category: '搜索引擎', tags: ['搜索', '微信'] },
  { title: '头条搜索', url: 'https://www.toutiao.com/search', description: '今日头条搜索引擎', category: '搜索引擎', tags: ['搜索', '资讯'] },
  { title: 'Yandex', url: 'https://yandex.com', description: '俄罗斯搜索引擎', category: '搜索引擎', tags: ['搜索', '国际'] },
  { title: '夸克搜索', url: 'https://quark.sm.cn', description: 'UC浏览器搜索', category: '搜索引擎', tags: ['搜索', '移动'] },
  { title: '秘塔搜索', url: 'https://metaso.cn', description: 'AI驱动的搜索引擎', category: '搜索引擎', tags: ['搜索', 'AI'] },
  { title: '虫部落快搜', url: 'https://search.chongbuluo.com', description: '聚合搜索引擎', category: '搜索引擎', tags: ['搜索', '聚合'] },
  { title: 'Magi', url: 'https://magi.com', description: '基于AI的信息抽取搜索', category: '搜索引擎', tags: ['搜索', 'AI'] },
  { title: '多吉搜索', url: 'https://www.dogedoge.com', description: '不追踪隐私的搜索', category: '搜索引擎', tags: ['搜索', '隐私'] },
  { title: '神马搜索', url: 'https://m.sm.cn', description: '移动搜索引擎', category: '搜索引擎', tags: ['搜索', '移动'] },

  // 社交媒体 (15个)
  { title: '微信', url: 'https://weixin.qq.com', description: '国民级即时通讯应用', category: '社交媒体', tags: ['社交', '即时通讯'] },
  { title: 'QQ', url: 'https://im.qq.com', description: '腾讯即时通讯软件', category: '社交媒体', tags: ['社交', 'QQ'] },
  { title: '微博', url: 'https://weibo.com', description: '中国最大微博客平台', category: '社交媒体', tags: ['社交', '微博'] },
  { title: '知乎', url: 'https://www.zhihu.com', description: '中文互联网知识分享平台', category: '社交媒体', tags: ['社交', '知识'] },
  { title: '豆瓣', url: 'https://www.douban.com', description: '文艺青年聚集地', category: '社交媒体', tags: ['社交', '文艺'] },
  { title: '小红书', url: 'https://www.xiaohongshu.com', description: '生活方式分享平台', category: '社交媒体', tags: ['社交', '种草'] },
  { title: '抖音', url: 'https://www.douyin.com', description: '短视频社交平台', category: '社交媒体', tags: ['社交', '短视频'] },
  { title: '快手', url: 'https://www.kuaishou.com', description: '短视频分享平台', category: '社交媒体', tags: ['社交', '短视频'] },
  { title: 'B站', url: 'https://www.bilibili.com', description: '年轻人的文化社区', category: '社交媒体', tags: ['社交', '视频'] },
  { title: '贴吧', url: 'https://tieba.baidu.com', description: '百度旗下兴趣社区', category: '社交媒体', tags: ['社交', '论坛'] },
  { title: '虎扑', url: 'https://www.hupu.com', description: '体育和男性话题社区', category: '社交媒体', tags: ['社交', '体育'] },
  { title: '即刻', url: 'https://www.jike.com', description: '基于兴趣的社交平台', category: '社交媒体', tags: ['社交', '兴趣'] },
  { title: '脉脉', url: 'https://maimai.cn', description: '职场社交平台', category: '社交媒体', tags: ['社交', '职场'] },
  { title: '人人网', url: 'http://www.renren.com', description: '校园社交网络', category: '社交媒体', tags: ['社交', '校园'] },
  { title: '钉钉', url: 'https://www.dingtalk.com', description: '企业协同办公平台', category: '社交媒体', tags: ['社交', '办公'] },

  // 视频平台 (12个)
  { title: '腾讯视频', url: 'https://v.qq.com', description: '腾讯旗下视频平台', category: '视频平台', tags: ['视频', '影视'] },
  { title: '爱奇艺', url: 'https://www.iqiyi.com', description: '综合视频平台', category: '视频平台', tags: ['视频', '影视'] },
  { title: '优酷', url: 'https://www.youku.com', description: '阿里旗下视频平台', category: '视频平台', tags: ['视频', '影视'] },
  { title: '芒果TV', url: 'https://www.mgtv.com', description: '湖南卫视视频平台', category: '视频平台', tags: ['视频', '综艺'] },
  { title: '咪咕视频', url: 'https://www.miguvideo.com', description: '中国移动视频平台', category: '视频平台', tags: ['视频', '体育'] },
  { title: '西瓜视频', url: 'https://www.ixigua.com', description: '字节跳动视频平台', category: '视频平台', tags: ['视频', '短视频'] },
  { title: '搜狐视频', url: 'https://tv.sohu.com', description: '搜狐旗下视频网站', category: '视频平台', tags: ['视频', '影视'] },
  { title: 'PPTV', url: 'http://www.pptv.com', description: '苏宁旗下视频平台', category: '视频平台', tags: ['视频', '体育'] },
  { title: '斗鱼', url: 'https://www.douyu.com', description: '游戏直播平台', category: '视频平台', tags: ['视频', '直播'] },
  { title: '虎牙', url: 'https://www.huya.com', description: '游戏直播平台', category: '视频平台', tags: ['视频', '直播'] },
  { title: '哔哩哔哩', url: 'https://www.bilibili.com', description: 'B站视频平台', category: '视频平台', tags: ['视频', '弹幕'] },
  { title: '好看视频', url: 'https://haokan.baidu.com', description: '百度旗下短视频', category: '视频平台', tags: ['视频', '短视频'] },

  // 电商购物 (15个)
  { title: '淘宝', url: 'https://www.taobao.com', description: '亚洲最大购物网站', category: '电商购物', tags: ['购物', '电商'] },
  { title: '天猫', url: 'https://www.tmall.com', description: '品牌商城', category: '电商购物', tags: ['购物', '品牌'] },
  { title: '京东', url: 'https://www.jd.com', description: '综合电商平台', category: '电商购物', tags: ['购物', '3C'] },
  { title: '拼多多', url: 'https://www.pinduoduo.com', description: '社交电商平台', category: '电商购物', tags: ['购物', '拼团'] },
  { title: '苏宁易购', url: 'https://www.suning.com', description: '家电3C购物', category: '电商购物', tags: ['购物', '家电'] },
  { title: '唯品会', url: 'https://www.vip.com', description: '品牌特卖平台', category: '电商购物', tags: ['购物', '特卖'] },
  { title: '考拉海购', url: 'https://www.kaola.com', description: '跨境电商平台', category: '电商购物', tags: ['购物', '海淘'] },
  { title: '当当', url: 'http://www.dangdang.com', description: '图书购物网站', category: '电商购物', tags: ['购物', '图书'] },
  { title: '小米商城', url: 'https://www.mi.com', description: '小米官方商城', category: '电商购物', tags: ['购物', '小米'] },
  { title: '网易严选', url: 'https://you.163.com', description: '网易自营电商', category: '电商购物', tags: ['购物', 'ODM'] },
  { title: '得物', url: 'https://www.dewu.com', description: '潮流网购社区', category: '电商购物', tags: ['购物', '潮流'] },
  { title: '闲鱼', url: 'https://www.xianyu.com', description: '二手交易平台', category: '电商购物', tags: ['购物', '二手'] },
  { title: '1688', url: 'https://www.1688.com', description: '阿里巴巴批发网', category: '电商购物', tags: ['购物', '批发'] },
  { title: '亚马逊中国', url: 'https://www.amazon.cn', description: '亚马逊中国站', category: '电商购物', tags: ['购物', '海淘'] },
  { title: '蘑菇街', url: 'https://www.mogujie.com', description: '女性时尚购物', category: '电商购物', tags: ['购物', '女装'] },

  // 新闻资讯 (12个)
  { title: '新浪新闻', url: 'https://news.sina.com.cn', description: '综合新闻门户', category: '新闻资讯', tags: ['新闻', '资讯'] },
  { title: '网易新闻', url: 'https://news.163.com', description: '网易新闻中心', category: '新闻资讯', tags: ['新闻', '资讯'] },
  { title: '腾讯新闻', url: 'https://news.qq.com', description: '腾讯新闻频道', category: '新闻资讯', tags: ['新闻', '资讯'] },
  { title: '今日头条', url: 'https://www.toutiao.com', description: '个性化资讯推荐', category: '新闻资讯', tags: ['新闻', 'AI推荐'] },
  { title: '搜狐新闻', url: 'https://news.sohu.com', description: '搜狐新闻中心', category: '新闻资讯', tags: ['新闻', '资讯'] },
  { title: '凤凰网', url: 'https://www.ifeng.com', description: '凤凰新媒体', category: '新闻资讯', tags: ['新闻', '资讯'] },
  { title: '澎湃新闻', url: 'https://www.thepaper.cn', description: '专业新闻平台', category: '新闻资讯', tags: ['新闻', '深度'] },
  { title: '新华网', url: 'http://www.xinhuanet.com', description: '新华通讯社官网', category: '新闻资讯', tags: ['新闻', '官方'] },
  { title: '人民网', url: 'http://www.people.com.cn', description: '人民日报官网', category: '新闻资讯', tags: ['新闻', '官方'] },
  { title: '央视网', url: 'https://www.cctv.com', description: '中央电视台官网', category: '新闻资讯', tags: ['新闻', '官方'] },
  { title: '36氪', url: 'https://36kr.com', description: '科技创投媒体', category: '新闻资讯', tags: ['新闻', '科技'] },
  { title: '虎嗅', url: 'https://www.huxiu.com', description: '科技财经资讯', category: '新闻资讯', tags: ['新闻', '科技'] },

  // 开发工具 (15个)
  { title: 'GitHub', url: 'https://github.com', description: '全球最大代码托管平台', category: '开发工具', tags: ['开发', '代码'] },
  { title: 'Gitee', url: 'https://gitee.com', description: '国内代码托管平台', category: '开发工具', tags: ['开发', '代码'] },
  { title: 'CSDN', url: 'https://www.csdn.net', description: '中文IT技术社区', category: '开发工具', tags: ['开发', '技术'] },
  { title: '博客园', url: 'https://www.cnblogs.com', description: '开发者技术博客', category: '开发工具', tags: ['开发', '博客'] },
  { title: '掘金', url: 'https://juejin.cn', description: '技术内容分享平台', category: '开发工具', tags: ['开发', '前端'] },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: '程序员问答社区', category: '开发工具', tags: ['开发', '问答'] },
  { title: 'V2EX', url: 'https://www.v2ex.com', description: '创意工作者社区', category: '开发工具', tags: ['开发', '社区'] },
  { title: 'SegmentFault', url: 'https://segmentfault.com', description: '技术问答社区', category: '开发工具', tags: ['开发', '问答'] },
  { title: '开源中国', url: 'https://www.oschina.net', description: '中文开源技术社区', category: '开发工具', tags: ['开发', '开源'] },
  { title: '菜鸟教程', url: 'https://www.runoob.com', description: '编程入门教程', category: '开发工具', tags: ['开发', '教程'] },
  { title: 'MDN', url: 'https://developer.mozilla.org/zh-CN/', description: 'Web开发文档', category: '开发工具', tags: ['开发', '文档'] },
  { title: 'NPM', url: 'https://www.npmjs.com', description: 'JavaScript包管理', category: '开发工具', tags: ['开发', 'npm'] },
  { title: 'CodePen', url: 'https://codepen.io', description: '前端代码演示', category: '开发工具', tags: ['开发', '前端'] },
  { title: 'LeetCode', url: 'https://leetcode.cn', description: '算法题库', category: '开发工具', tags: ['开发', '算法'] },
  { title: '牛客网', url: 'https://www.nowcoder.com', description: 'IT求职面试平台', category: '开发工具', tags: ['开发', '面试'] },

  // 设计资源 (12个)
  { title: '站酷', url: 'https://www.zcool.com.cn', description: '设计师互动平台', category: '设计资源', tags: ['设计', '作品'] },
  { title: 'UI中国', url: 'https://www.ui.cn', description: 'UI设计师社区', category: '设计资源', tags: ['设计', 'UI'] },
  { title: '花瓣网', url: 'https://huaban.com', description: '图片采集分享', category: '设计资源', tags: ['设计', '灵感'] },
  { title: 'Dribbble', url: 'https://dribbble.com', description: '设计师作品展示', category: '设计资源', tags: ['设计', '作品'] },
  { title: 'Behance', url: 'https://www.behance.net', description: 'Adobe设计社区', category: '设计资源', tags: ['设计', '作品'] },
  { title: 'Figma', url: 'https://www.figma.com', description: '在线UI设计工具', category: '设计资源', tags: ['设计', '工具'] },
  { title: '即时设计', url: 'https://js.design', description: '国产UI设计工具', category: '设计资源', tags: ['设计', '工具'] },
  { title: 'Canva', url: 'https://www.canva.cn', description: '在线平面设计', category: '设计资源', tags: ['设计', '工具'] },
  { title: '千图网', url: 'https://www.58pic.com', description: '免费素材下载', category: '设计资源', tags: ['设计', '素材'] },
  { title: '包图网', url: 'https://ibaotu.com', description: '原创素材网站', category: '设计资源', tags: ['设计', '素材'] },
  { title: 'IconFont', url: 'https://www.iconfont.cn', description: '阿里图标库', category: '设计资源', tags: ['设计', '图标'] },
  { title: '优设网', url: 'https://www.uisdc.com', description: '设计师学习平台', category: '设计资源', tags: ['设计', '教程'] },

  // 在线教育 (10个)
  { title: '中国大学MOOC', url: 'https://www.icourse163.org', description: '优质中文慕课平台', category: '在线教育', tags: ['教育', 'MOOC'] },
  { title: '网易云课堂', url: 'https://study.163.com', description: '实用技能学习平台', category: '在线教育', tags: ['教育', '技能'] },
  { title: '腾讯课堂', url: 'https://ke.qq.com', description: '在线职业教育', category: '在线教育', tags: ['教育', '职业'] },
  { title: 'B站大学', url: 'https://www.bilibili.com/cheese/', description: 'B站知识区', category: '在线教育', tags: ['教育', '视频'] },
  { title: '学堂在线', url: 'https://www.xuetangx.com', description: '清华大学慕课', category: '在线教育', tags: ['教育', '大学'] },
  { title: '慕课网', url: 'https://www.imooc.com', description: 'IT技能学习', category: '在线教育', tags: ['教育', '编程'] },
  { title: '极客时间', url: 'https://time.geekbang.org', description: '技术学习平台', category: '在线教育', tags: ['教育', '技术'] },
  { title: '百词斩', url: 'https://www.baicizhan.com', description: '英语单词学习', category: '在线教育', tags: ['教育', '英语'] },
  { title: '有道精品课', url: 'https://ke.youdao.com', description: '网易有道教育', category: '在线教育', tags: ['教育', '学科'] },
  { title: '知乎知学堂', url: 'https://www.zhihu.com/xen/market/remix', description: '知乎教育平台', category: '在线教育', tags: ['教育', '知识'] },

  // 生活服务 (12个)
  { title: '美团', url: 'https://www.meituan.com', description: '生活服务平台', category: '生活服务', tags: ['生活', '外卖'] },
  { title: '饿了么', url: 'https://www.ele.me', description: '外卖订餐平台', category: '生活服务', tags: ['生活', '外卖'] },
  { title: '大众点评', url: 'https://www.dianping.com', description: '本地生活服务', category: '生活服务', tags: ['生活', '点评'] },
  { title: '携程', url: 'https://www.ctrip.com', description: '在线旅游服务', category: '生活服务', tags: ['生活', '旅游'] },
  { title: '去哪儿', url: 'https://www.qunar.com', description: '旅游搜索平台', category: '生活服务', tags: ['生活', '旅游'] },
  { title: '飞猪', url: 'https://www.fliggy.com', description: '阿里旅行平台', category: '生活服务', tags: ['生活', '旅游'] },
  { title: '12306', url: 'https://www.12306.cn', description: '铁路购票官网', category: '生活服务', tags: ['生活', '火车票'] },
  { title: '滴滴出行', url: 'https://www.didiglobal.com', description: '移动出行平台', category: '生活服务', tags: ['生活', '出行'] },
  { title: '高德地图', url: 'https://www.amap.com', description: '地图导航服务', category: '生活服务', tags: ['生活', '地图'] },
  { title: '百度地图', url: 'https://map.baidu.com', description: '百度地图服务', category: '生活服务', tags: ['生活', '地图'] },
  { title: '58同城', url: 'https://www.58.com', description: '生活分类信息', category: '生活服务', tags: ['生活', '分类'] },
  { title: '链家', url: 'https://www.lianjia.com', description: '房产服务平台', category: '生活服务', tags: ['生活', '房产'] },

  // 金融理财 (10个)
  { title: '支付宝', url: 'https://www.alipay.com', description: '数字生活开放平台', category: '金融理财', tags: ['金融', '支付'] },
  { title: '微信支付', url: 'https://pay.weixin.qq.com', description: '微信支付服务', category: '金融理财', tags: ['金融', '支付'] },
  { title: '招商银行', url: 'https://www.cmbchina.com', description: '招商银行官网', category: '金融理财', tags: ['金融', '银行'] },
  { title: '中国工商银行', url: 'https://www.icbc.com.cn', description: '工商银行官网', category: '金融理财', tags: ['金融', '银行'] },
  { title: '中国建设银行', url: 'http://www.ccb.com', description: '建设银行官网', category: '金融理财', tags: ['金融', '银行'] },
  { title: '天天基金', url: 'https://fund.eastmoney.com', description: '基金理财平台', category: '金融理财', tags: ['金融', '基金'] },
  { title: '同花顺', url: 'http://www.10jqka.com.cn', description: '股票软件平台', category: '金融理财', tags: ['金融', '股票'] },
  { title: '雪球', url: 'https://xueqiu.com', description: '投资者社区', category: '金融理财', tags: ['金融', '投资'] },
  { title: '东方财富', url: 'http://www.eastmoney.com', description: '财经资讯平台', category: '金融理财', tags: ['金融', '财经'] },
  { title: '蚂蚁财富', url: 'https://www.fund123.cn', description: '理财服务平台', category: '金融理财', tags: ['金融', '理财'] },
];

async function seedData() {
  try {
    console.log('🔗 连接数据库...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 清空现有数据（可选）
    console.log('🗑️  清理旧数据...');
    await LinkItem.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ 旧数据清理完成\n');

    // 创建分类
    console.log('📁 创建分类...');
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
      console.log(`  ✓ ${cat.title}`);
    }
    console.log(`✅ 创建了 ${categories.length} 个分类\n`);

    // 创建链接
    console.log('🔗 创建链接...');
    let count = 0;
    for (const link of links) {
      const categoryId = categoryMap[link.category];
      if (!categoryId) {
        console.log(`  ⚠️  跳过 ${link.title}: 分类不存在`);
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
        console.log(`  已创建 ${count} 个链接...`);
      }
    }
    console.log(`✅ 创建了 ${count} 个链接\n`);

    // 统计信息
    const categoryCount = await Category.countDocuments();
    const linkCount = await LinkItem.countDocuments();

    console.log('📊 数据统计:');
    console.log(`  分类总数: ${categoryCount}`);
    console.log(`  链接总数: ${linkCount}`);
    console.log('');
    console.log('🎉 数据初始化完成!');
    console.log('');
    console.log('📝 现在可以访问前台查看效果:');
    console.log('   http://localhost:3001');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

seedData();
