import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';
import Settings from '@/models/Settings';

const ALLOWED_THEMES = ['fullscreen-section', 'sidebar-nav'] as const;
type AllowedTheme = (typeof ALLOWED_THEMES)[number];

const THEME_DEFINITIONS = [
  {
    name: 'fullscreen-section',
    title: '全屏分屏',
    description: '全屏分屏展示，支持左右切换和自动播放，适合演示和展示场景',
    version: '1.0.0',
    author: 'NavCraft',
    installed: true,
    enabled: false,
    configSchema: {},
  },
  {
    name: 'sidebar-nav',
    title: '侧边栏导航',
    description:
      '集成搜索、收藏、评分、热门推荐、夜间模式等高级功能的完整导航系统',
    version: '2.0.0',
    author: 'NavCraft Team',
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
  },
];


export async function POST(_req: NextRequest) {
  try {
    await connectDB();

    await Theme.deleteMany({ name: { $nin: ALLOWED_THEMES } });

    for (const themeData of THEME_DEFINITIONS) {
      const existing = await Theme.findOne({ name: themeData.name });
      if (!existing) {
        await Theme.create(themeData);
      } else {
        Object.assign(existing, themeData);
        await existing.save();
      }
    }

    const settings = await Settings.findOne({});
    if (!settings) {
      await Settings.create({
        activeTheme: 'fullscreen-section',
        siteName: 'NavCraft',
        siteDescription: '基于 Next.js 的可拔插导航系统',
        themeConfigs: {},
      });
    } else {
      const sanitizedConfigs = Object.fromEntries(
        Object.entries(settings.themeConfigs || {}).filter(([key]) =>
          ALLOWED_THEMES.includes(key as AllowedTheme)
        )
      );

      const activeTheme = settings.activeTheme as AllowedTheme;
      settings.activeTheme = ALLOWED_THEMES.includes(activeTheme)
        ? activeTheme
        : 'fullscreen-section';
      settings.themeConfigs = sanitizedConfigs;
      await settings.save();
    }

    return NextResponse.json({
      message: '官方主题已初始化',
      success: true,
    });
  } catch (error: any) {
    console.error('初始化失败:', error);
    return NextResponse.json(
      { error: error.message || '初始化失败' },
      { status: 500 }
    );
  }
}
