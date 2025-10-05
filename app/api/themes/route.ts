import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';
import { withAdminAuth } from '@/lib/middleware';

const ALLOWED_THEMES = ['fullscreen-section', 'sidebar-nav'] as const;
type AllowedTheme = (typeof ALLOWED_THEMES)[number];

type ThemeDefinition = {
  title: string;
  description: string;
  version: string;
  author: string;
  previewUrl: string;
  configSchema: Record<string, any>;
};

const THEME_DEFINITIONS: Record<AllowedTheme, ThemeDefinition> = {
  'fullscreen-section': {
    title: '全屏分屏',
    description: '全屏分屏展示，支持左右切换和自动播放，适合演示和展示场景',
    version: '1.0.0',
    author: 'NavGo',
    previewUrl: '/themes/fullscreen-section/preview.png',
    configSchema: {},
  },
  'sidebar-nav': {
    title: '侧边栏导航',
    description:
      '集成搜索、收藏、评分、热门推荐、夜间模式等高级功能的完整导航系统',
    version: '2.0.0',
    author: 'NavGo Team',
    previewUrl: '/themes/sidebar-nav/preview.png',
    configSchema: {
      primaryColor: {
        type: 'color',
        label: '主色调',
        default: '#2563eb',
      },
      surfaceColor: {
        type: 'color',
        label: '内容色',
        default: '#f8fafc',
      },
      backgroundColor: {
        type: 'color',
        label: '背景色',
        default: '#e2e8f0',
      },
    },
  },
};

function isAllowedTheme(name: string): name is AllowedTheme {
  return (ALLOWED_THEMES as readonly string[]).includes(name);
}

export async function GET(_req: NextRequest) {
  try {
    await connectDB();

    await Theme.deleteMany({ name: { $nin: ALLOWED_THEMES } });

    const themes = await Theme.find({ name: { $in: ALLOWED_THEMES } }).sort({
      name: 1,
    });

    const themed = themes.map(theme => {
      const themeObj = theme.toObject();
      if (isAllowedTheme(themeObj.name)) {
        const defaults = THEME_DEFINITIONS[themeObj.name].configSchema ?? {};
        const current = themeObj.configSchema ?? {};
        const merged: Record<string, any> = {};

        Object.entries(defaults).forEach(([key, field]) => {
          const currentField = current?.[key];
          merged[key] = currentField
            ? { ...field, ...currentField }
            : field;
        });

        themeObj.configSchema = merged;
      }
      return themeObj;
    });

    return NextResponse.json({ themes: themed });
  } catch (error: any) {
    console.error('获取主题错误:', error);
    return NextResponse.json(
      { error: '获取主题失败' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async innerReq => {
    try {
      await connectDB();

      const body = await innerReq.json();
      const {
        name,
        title,
        description,
        previewUrl,
        version,
        author,
        configSchema,
      } = body;

      if (!name) {
        return NextResponse.json(
          { error: '主题名称为必填项' },
          { status: 400 }
        );
      }

      if (!isAllowedTheme(name)) {
        return NextResponse.json(
          { error: '当前仅支持官方主题：全屏分屏、侧边栏导航' },
          { status: 400 }
        );
      }

      const existingTheme = await Theme.findOne({ name });
      if (existingTheme) {
        return NextResponse.json(
          { error: '该主题已存在' },
          { status: 409 }
        );
      }

      const defaults = THEME_DEFINITIONS[name];

      const theme = new Theme({
        name,
        title: title || defaults.title,
        description: description || defaults.description,
        previewUrl: previewUrl || defaults.previewUrl,
        version: version || defaults.version || '1.0.0',
        author: author || defaults.author,
        configSchema: configSchema ?? defaults.configSchema ?? {},
        installed: true,
        enabled: false,
      });

      await theme.save();

      return NextResponse.json(
        { message: '主题安装成功', theme },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('安装主题错误:', error);
      return NextResponse.json(
        { error: '安装主题失败' },
        { status: 500 }
      );
    }
  });
}
