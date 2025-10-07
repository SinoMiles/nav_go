import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Theme from '@/models/Theme';
import { withAdminAuth } from '@/lib/middleware';
import { getThemeManifests, getThemeManifest, getAvailableThemeNames } from '@/lib/theme-registry';
import { syncThemesWithFilesystem, installTheme } from '@/lib/theme';

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    await syncThemesWithFilesystem();

    const manifests = getThemeManifests();
    const manifestNames = manifests.map(manifest => manifest.name);
    const themeDocs = await Theme.find({ name: { $in: manifestNames } }).sort({ name: 1 });

    const themes = manifests.map(manifest => {
      const doc = themeDocs.find(item => item.name === manifest.name);
      const docData = doc ? (doc.toObject() as Record<string, any>) : {};
      const schemaFromDoc = docData.configSchema && typeof docData.configSchema === 'object'
        ? (docData.configSchema as Record<string, any>)
        : {};
      const configSchema = {
        ...(manifest.configSchema ?? {}),
        ...schemaFromDoc,
      };

      return {
        ...manifest,
        ...docData,
        configSchema,
        installed: docData.installed ?? true,
        enabled: docData.enabled ?? false,
      };
    });

    return NextResponse.json({ themes });
  } catch (error) {
    console.error('获取主题列表失败:', error);
    return NextResponse.json({ error: '获取主题失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return withAdminAuth(req, async innerReq => {
    try {
      await connectDB();

      const body = await innerReq.json();
      const { name } = body;

      if (!name) {
        return NextResponse.json({ error: '主题名称为必填项' }, { status: 400 });
      }

      const availableThemes = getAvailableThemeNames();
      if (!availableThemes.includes(name)) {
        return NextResponse.json({ error: '当前主题目录中不存在该主题' }, { status: 400 });
      }

      const theme = await installTheme(name);
      const manifest = getThemeManifest(name);

      return NextResponse.json(
        {
          message: '主题已同步',
          theme: {
            ...manifest,
            ...(theme?.toObject?.() ?? {}),
            configSchema: {
              ...(manifest?.configSchema ?? {}),
              ...((theme as any)?.configSchema ?? {}),
            },
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error('同步主题失败:', error);
      return NextResponse.json({ error: '同步主题失败' }, { status: 500 });
    }
  });
}


