import { config } from 'dotenv';
import path from 'path';
import { Types } from 'mongoose';

const envPath = path.join(process.cwd(), '.env.local');
console.log('加载环境变量文件:', envPath);
const result = config({ path: envPath });
if (result.error) {
  console.error('加载环境变量失败:', result.error);
} else {
  console.log('环境变量加载成功');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设定' : '未设定');
}

import connectDB from '../lib/mongodb';
import Theme from '../models/Theme';
import Settings from '../models/Settings';
import Category from '../models/Category';
import LinkItem from '../models/LinkItem';
import { SAMPLE_CATEGORY_TREE } from '../lib/sample-data';

const ALLOWED_THEMES = ['fullscreen-section', 'sidebar-nav'] as const;
type AllowedTheme = (typeof ALLOWED_THEMES)[number];

const fullscreenSectionTheme = {
  name: 'fullscreen-section',
  title: '全屏分屏',
  description: '全屏分屏展示，支持左右切换和自动播放，适合演示和展示场景',
  version: '1.0.0',
  author: 'NavGo',
  previewUrl: '/themes/fullscreen-section/preview.png',
  installed: true,
  enabled: false,
  configSchema: {},
};

const sidebarNavTheme = {
  name: 'sidebar-nav',
  title: '侧边栏导航',
  description:
    '集成搜索、收藏、评分、热门推荐、夜间模式等高级功能的完整导航系统',
  version: '2.0.0',
  author: 'NavGo Team',
  previewUrl: '/themes/sidebar-nav/preview.png',
  installed: true,
  enabled: false,
  configSchema: {
    primaryColor: {
      type: 'color',
      label: '主色调',
      default: '#2563eb',
    },
    surfaceEmphasis: {
      type: 'color',
      label: '内容背景色',
      default: '#f8fafc',
    },
    borderMuted: {
      type: 'color',
      label: '边框辅助色',
      default: '#e2e8f0',
    },
    textSecondary: {
      type: 'color',
      label: '次要文字色',
      default: '#64748b',
    },
    outlineFocus: {
      type: 'color',
      label: '焦点高亮色',
      default: '#2563eb',
    },
    gradientStart: {
      type: 'color',
      label: '渐变起始色',
      default: '#ffffff',
    },
    gradientEnd: {
      type: 'color',
      label: '渐变结束色',
      default: '#e2e8f0',
    },
  },
};

async function seedSampleCategories() {
  const categoryCount = await Category.countDocuments();
  if (categoryCount > 0) {
    console.log('ℹ️  检测到现有分类，跳过示例分类创建');
    return;
  }

  const idMap = new Map<string, Types.ObjectId>();

  for (const root of SAMPLE_CATEGORY_TREE) {
    const rootDoc = await Category.create({
      title: root.title,
      slug: root.slug,
      description: root.description,
      order: root.order ?? 0,
      enabled: true,
    });
    const rootObjectId = rootDoc._id as Types.ObjectId;
    idMap.set(root.id, rootObjectId);

    for (const child of root.children ?? []) {
      const childDoc = await Category.create({
        title: child.title,
        slug: child.slug,
        description: child.description,
        order: child.order ?? 0,
        enabled: true,
        parentId: rootObjectId,
      });
      idMap.set(child.id, childDoc._id as Types.ObjectId);
    }
  }

  for (const root of SAMPLE_CATEGORY_TREE) {
    for (const link of root.links ?? []) {
      const categoryObjectId = idMap.get(link.categoryId ?? root.id);
      if (!categoryObjectId) continue;

      await LinkItem.create({
        title: link.title,
        url: link.url,
        description: link.description,
        iconUrl: link.iconUrl,
        categoryId: categoryObjectId,
        tags: link.tags,
        order: link.order ?? 0,
        enabled: true,
        clicks: 0,
        reviewStatus: 'approved',
        source: 'admin',
      });
    }
  }

  console.log('✅ 已创建示例的多级分类与链接');
}

async function initDatabase() {
  try {
    console.log('🔗  连接数据库...');
    await connectDB();

    console.log('📦  清理并检查主题...');
    await Theme.deleteMany({ name: { $nin: ALLOWED_THEMES } });

    for (const themeData of [fullscreenSectionTheme, sidebarNavTheme]) {
      const existing = await Theme.findOne({ name: themeData.name });
      if (!existing) {
        await Theme.create(themeData);
        console.log(`✅ ${themeData.title} 已安装`);
      } else {
        Object.assign(existing, themeData);
        await existing.save();
        console.log(`ℹ️  ${themeData.title} 已同步`);
      }
    }

    console.log('⚙️  检查站点设置...');
    const existingSettings = await Settings.findOne({});

    if (!existingSettings) {
      await Settings.create({
        activeTheme: 'fullscreen-section',
        siteName: 'NavGo',
        siteDescription: '基于 Next.js 的可切换主题导航系统',
        themeConfigs: {},
      });
      console.log('✅ 默认设置已创建');
    } else {
      const sanitizedConfigs = Object.fromEntries(
        Object.entries(existingSettings.themeConfigs || {}).filter(([key]) =>
          ALLOWED_THEMES.includes(key as AllowedTheme)
        )
      );

      const activeTheme = existingSettings.activeTheme as AllowedTheme;
      existingSettings.activeTheme = ALLOWED_THEMES.includes(activeTheme)
        ? activeTheme
        : 'fullscreen-section';
      existingSettings.themeConfigs = sanitizedConfigs;
      await existingSettings.save();
      console.log('ℹ️  设置已同步');
    }

    console.log('📂  检查分类与示例数据...');
    await seedSampleCategories();

    console.log('\n🎉 数据库初始化完成!');
    console.log('📝 下一步:');
    console.log('1. 访问 http://localhost:3000/admin/register 注册管理员账号');
    console.log('2. 登录后台管理分类与链接');
    console.log('3. 在主题管理中切换并预览主题');

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();

